// supabase/functions/shop-purchase/index.ts
// Supabase Edge Function — runs on Deno, verify_jwt: true (default)
//
// POST { item_id: string }
//
// Why this function doesn't call purchase_shop_item() directly:
//   The DB function is SECURITY DEFINER and uses auth.uid(), which returns NULL
//   when invoked via the service_role client. The EXECUTE privilege is also
//   revoked from authenticated, so a user-scoped client can't call it either.
//   Instead this function reimplements the same logic using the admin client
//   (service_role bypasses RLS) with explicit user_id from the verified JWT.
//
// Logic mirrors purchase_shop_item() exactly:
//   1. Verify JWT → get user_id
//   2. Validate item exists and is available
//   3. Guard: already purchased
//   4. Spend tokens via spend_tokens() RPC (also service_role)
//   5. Record in shop_purchases (INSERT)
//   6. Unlock content if category = 'bonus_content'
//   7. Fulfil agent_access items → queue V2.4 provisioning
//      (Phase 3 stub — sets fulfillment_metadata.status = 'pending_provisioning'
//       until V2.4 provision-access endpoint is live)
//   8. Return { success, item_name, spent_tokens, new_balance, agent_access_pending? }
//
// Setup:
//   supabase functions deploy shop-purchase
//   (verify_jwt is ON by default — do NOT pass --no-verify-jwt)

import { createClient } from 'npm:@supabase/supabase-js@2';
import { resolveSupabaseAdminKey } from '../_shared/supabaseAdminKey.mjs';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const V24_API_URL       = Deno.env.get('V24_API_URL')  ?? '';
const SHOP_SYNC_SECRET  = Deno.env.get('SHOP_SYNC_SECRET') ?? '';

// ── Response helpers ────────────────────────────────────────────────────────…

// Every supabase-js client automatically attaches `apikey` and `x-client-info`
// on top of `authorization`/`content-type` — omitting any of them here means
// the preflight OPTIONS succeeds, but the browser then refuses to send the
// real request at all (it never reaches this function, not even as an
// error). Matches @supabase/supabase-js's own shipped `cors.ts` reference
// list and the other six hand-written Edge Functions in this repo.
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: CORS_HEADERS });
}

// Application-level errors (business logic) → always 200 so supabase.functions.invoke()
// populates `data` with the error message instead of a generic FunctionsHttpError.
// HTTP-level errors (auth, method) use proper status codes.
function jsonAppError(message: string): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status: 200, headers: CORS_HEADERS },
  );
}

function jsonHttpError(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: CORS_HEADERS },
  );
}

// ── Types ────────────────────────────────────────────────────────────…

type ShopItemMetadata = {
  type?: string;       // 'agent_access' triggers V2.4 provisioning
  v24_tier?: string;   // 'sandbox' | 'level4'
  content_url?: string;
  consumable?: boolean; // true → re-buyable, no one-per-user guard
};

type ShopItem = {
  id: string;
  name: string;
  price_tokens: number;
  category: string;
  is_available: boolean;
  metadata: ShopItemMetadata;
};

type SpendTokensResult = {
  ok: boolean;
  new_balance?: number;
  error?: string;
};

type ProvisionRequest = {
  purchase_id: string;
  user_id: string;
  discord_id: string | null;
  item_type: 'agent_access';
  v24_tier: string;
  idempotency_key: string;
};

type ProvisionResponse = {
  status: 'provisioned' | 'failed';
  api_key?: string;
  mission_control_url?: string;
  expires_at?: string | null;
  provision_event_id?: string;
};

// ── Loyalty tier discounts ────────────────────────────────────────────────────
// Server-authoritative: the charge is ALWAYS computed here from the user's
// tier (read from the user_loyalty_tier view), never trusted from the client.
// ⚠️ KEEP IN SYNC with TIER_DISCOUNT_PCT in frontend/src/pages/ShopPage.tsx —
//    the UI only previews this; this function is the source of truth.

const TIER_DISCOUNT_PCT: Record<string, number> = {
  bronze: 0,
  silver: 5,
  gold:   10,
  hyper:  15,
};

// Floor → never overcharge; rounding always favours the buyer.
function discountedPrice(base: number, tier: string | null | undefined): number {
  const pct = TIER_DISCOUNT_PCT[tier ?? 'bronze'] ?? 0;
  return Math.floor(base * (1 - pct / 100));
}

// ── Main handler ─────────────────────────────────────────────────────────…

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
      return jsonHttpError('Method not allowed', 405);
    }

    // Resolved per-request so a rotated/new named secret key takes effect
    // without a redeploy — mirrors stripe-webhook's resolver.
    const supabaseAdminKey = resolveSupabaseAdminKey(
      {
        SUPABASE_SECRET_KEYS: Deno.env.get('SUPABASE_SECRET_KEYS') ?? '',
        SUPABASE_SECRET_KEY: Deno.env.get('SUPABASE_SECRET_KEY') ?? '',
      },
      'shop_purchase',
    );
    const supabaseAdmin = createClient(SUPABASE_URL, supabaseAdminKey);

    // ── 1. Verify caller identity ─────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonHttpError('Missing or malformed Authorization header', 401);
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('JWT verification failed:', authError?.message);
      return jsonHttpError('Invalid or expired session — please sign in again.', 401);
    }

    const userId = user.id;

    // ── 2. Parse body ────────────────────────────────────────────────────────…
    let itemId: string;
    try {
      const body = await req.json() as Record<string, unknown>;
      if (!body.item_id || typeof body.item_id !== 'string') {
        return jsonHttpError('item_id must be a non-empty string', 400);
      }
      itemId = body.item_id;
    } catch {
      return jsonHttpError('Invalid JSON body', 400);
    }

    // ── 3. Fetch item (admin bypasses RLS) ────────────────────────────────────
    const { data: item, error: itemError } = await supabaseAdmin
      .from('shop_items')
      .select('id, name, price_tokens, category, is_available, metadata')
      .eq('id', itemId)
      .maybeSingle();

    if (itemError) {
      console.error('Item lookup failed:', itemError.message);
      return jsonAppError('Could not look up item — try again.');
    }
    if (!item) {
      return jsonAppError("This item doesn't exist.");
    }

    const shopItem = item as ShopItem;

    if (!shopItem.is_available) {
      return jsonAppError("This item isn't available right now.");
    }

    // Consumables (snacks / treats / boosters / toys / hygiene) are re-buyable;
    // everything else is one-per-user (enforced by the partial unique index).
    const isConsumable = shopItem.metadata?.consumable === true;

    // ── 4. Guard: already purchased (non-consumables only) ────────────────────
    if (!isConsumable) {
      const { data: existing, error: purchaseCheckError } = await supabaseAdmin
        .from('shop_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (purchaseCheckError) {
        console.error('Ownership check failed:', purchaseCheckError.message);
        return jsonAppError('Could not verify ownership — try again.');
      }
      if (existing) {
        return jsonAppError('You already own this item!');
      }
    }

    // ── 4b. Apply loyalty-tier discount (server-authoritative) ────────────────
    const { data: tierRow } = await supabaseAdmin
      .from('user_loyalty_tier')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = (tierRow as { tier?: string } | null)?.tier ?? 'bronze';
    const chargeTokens = discountedPrice(shopItem.price_tokens, tier);

    // ── 5. Spend tokens via spend_tokens() RPC ────────────────────────────────
    const { data: spendData, error: spendError } = await supabaseAdmin
      .rpc('spend_tokens', {
        p_user_id:   userId,
        p_amount:    chargeTokens,
        p_reason:    'shop_purchase',
        p_source_id: itemId,
      });

    if (spendError) {
      console.error('spend_tokens failed:', spendError.message);
      const msg = spendError.message ?? '';
      if (msg.includes('insufficient') || msg.includes('balance')) {
        return jsonAppError(
          "You don't have enough BROski$ for this. Keep learning to earn more!",
        );
      }
      return jsonAppError('Token deduction failed — your balance was not changed.');
    }

    // spend_tokens may return a JSONB result with an 'ok' field
    const spendResult = spendData as SpendTokensResult | null;
    if (spendResult && spendResult.ok === false) {
      const errMsg = spendResult.error ?? 'spend_failed';
      console.error('spend_tokens returned ok:false:', errMsg);
      if (errMsg.includes('insufficient') || errMsg.includes('balance')) {
        return jsonAppError(
          "You don't have enough BROski$ for this. Keep learning to earn more!",
        );
      }
      return jsonAppError('Token deduction failed — your balance was not changed.');
    }

    // ── 6. Record purchase ────────────────────────────────────────────────────
    const { data: purchaseRow, error: insertError } = await supabaseAdmin
      .from('shop_purchases')
      .insert({
        user_id:       userId,
        item_id:       itemId,
        spent_tokens:  chargeTokens,
        is_consumable: isConsumable,
      })
      .select('id')
      .single();

    if (insertError) {
      // UNIQUE violation means a race — treat as already_owned.
      // Tokens were spent but the duplicate purchase already exists, so the
      // user keeps the item they already own — no refund owed.
      if (insertError.code === '23505') {
        return jsonAppError('You already own this item!');
      }

      // Tokens were spent but the item could not be recorded → auto-refund.
      // Inverse of step 5: award_tokens() puts the spent amount straight back.
      console.error('shop_purchases insert failed — auto-refunding:', insertError.message);

      const { data: refundData, error: refundError } = await supabaseAdmin
        .rpc('award_tokens', {
          p_user_id:   userId,
          p_amount:    chargeTokens,
          p_reason:    'shop_purchase_refund',
          p_source_id: itemId,
        });

      const refundOk = !refundError && (refundData as { awarded?: boolean } | null)?.awarded === true;

      if (refundOk) {
        console.log(`↩️ Auto-refund OK: user=${userId} item=${itemId} amount=${chargeTokens}`);
        return jsonAppError(
          `Couldn't complete that purchase — your ${chargeTokens.toLocaleString()} BROski$ have been refunded. Give it another go.`,
        );
      }

      console.error(
        `🚨 Auto-refund FAILED: user=${userId} item=${itemId} amount=${chargeTokens} ` +
        `err=${refundError?.message ?? 'award_tokens returned awarded:false'}`,
      );
      return jsonAppError(
        'Purchase failed and the auto-refund did not go through — contact support, your balance was affected.',
      );
    }

    const purchaseId = (purchaseRow as { id: string } | null)?.id;
    if (!purchaseId) {
      return jsonAppError('Purchase recorded, but could not confirm purchase_id — contact support.');
    }

    // ── 7. Unlock content for bonus_content items ─────────────────────────────
    if (shopItem.category === 'bonus_content') {
      const contentRef = `shop_item:${itemId}`;
      const { error: unlockError } = await supabaseAdmin
        .from('content_unlocks')
        .insert({ user_id: userId, content_ref: contentRef });
      // ON CONFLICT is handled silently — not fatal if it fails
      if (unlockError && unlockError.code !== '23505') {
        console.warn('content_unlock insert failed (non-fatal):', unlockError.message);
      }
    }

    // ── 7b. Queue V2.4 provisioning for agent_access items ───────────────────
    let agentAccessPending = false;

    if (shopItem.metadata?.type === 'agent_access') {
      agentAccessPending = true;
      const v24Tier = shopItem.metadata.v24_tier ?? 'sandbox';
      const { data: discordLink } = await supabaseAdmin
        .from('discord_links')
        .select('discord_id')
        .eq('user_id', userId)
        .maybeSingle();

      const discordId = (discordLink as { discord_id: string } | null)?.discord_id ?? null;
      const idempotencyKey = `shop_purchase:${purchaseId}`;

      const { error: pendingError } = await supabaseAdmin
        .from('shop_purchases')
        .update({
          fulfillment_metadata: {
            provision_status: 'pending',
            mission_control_url: null,
            expires_at: null,
            provision_event_id: null,
            provisioned_at: null,
            queued_at: new Date().toISOString(),
            v24_tier: v24Tier,
            idempotency_key: idempotencyKey,
          },
        })
        .eq('id', purchaseId);

      if (pendingError) {
        console.warn('fulfillment_metadata update failed (non-fatal):', pendingError.message);
      }

      if (!discordId) {
        console.log(`⏳ Agent access pending: purchase=${purchaseId} user=${userId} (no discord_id linked)`);
      } else if (!V24_API_URL || !SHOP_SYNC_SECRET) {
        console.warn(`⏳ Agent access pending: purchase=${purchaseId} (missing V24_API_URL or SHOP_SYNC_SECRET)`);
      } else {
        const endpoint = `${V24_API_URL.replace(/\/$/, '')}/api/v1/access/provision`;
        const provisionPayload: ProvisionRequest = {
          purchase_id: purchaseId,
          user_id: userId,
          discord_id: discordId,
          item_type: 'agent_access',
          v24_tier: v24Tier,
          idempotency_key: idempotencyKey,
        };

        let provisionRes: Response | null = null;
        try {
          provisionRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-Secret': SHOP_SYNC_SECRET,
            },
            body: JSON.stringify(provisionPayload),
          });
        } catch (err) {
          console.warn('V2.4 provision network error:', err);
        }

        if (provisionRes?.ok) {
          const body = await provisionRes.json().catch(() => ({})) as ProvisionResponse;
          const apiKey = body.api_key ?? '';
          const apiKeyHint = apiKey ? (apiKey.startsWith('hc_') ? `hc_…${apiKey.slice(-4)}` : `…${apiKey.slice(-4)}`) : null;

          const { error: provisionedError } = await supabaseAdmin
            .from('shop_purchases')
            .update({
              fulfillment_metadata: {
                provision_status: 'provisioned',
                api_key_hint: apiKeyHint,
                mission_control_url: body.mission_control_url ?? null,
                expires_at: body.expires_at ?? null,
                provision_event_id: body.provision_event_id ?? null,
                provisioned_at: new Date().toISOString(),
              },
            })
            .eq('id', purchaseId);

          if (provisionedError) {
            console.warn('Provision success but fulfillment_metadata update failed:', provisionedError.message);
          } else {
            agentAccessPending = false;
          }
        } else if (provisionRes) {
          const errorText = await provisionRes.text().catch(() => '');
          await supabaseAdmin
            .from('shop_purchases')
            .update({
              fulfillment_metadata: {
                provision_status: 'failed',
                api_key_hint: null,
                mission_control_url: null,
                expires_at: null,
                provision_event_id: null,
                provisioned_at: null,
                failed_at: new Date().toISOString(),
                error: `v24_${provisionRes.status}`,
                detail: errorText.slice(0, 500),
              },
            })
            .eq('id', purchaseId);
        }
      }
    }

    // ── 8. Fetch the current balance for the response ─────────────────────────
    // Prefer the value from spend_tokens result; fall back to a DB read.
    let newBalance: number;
    if (spendResult?.new_balance != null) {
      newBalance = spendResult.new_balance;
    } else {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('broski_tokens')
        .eq('id', userId)
        .single();
      newBalance = (userData as { broski_tokens: number } | null)?.broski_tokens ?? 0;
    }

    console.log(
      `✅ Shop purchase: user=${userId} item=${itemId} ` +
      `item_name="${shopItem.name}" tier=${tier} list=${shopItem.price_tokens} ` +
      `spent=${chargeTokens} new_balance=${newBalance}`,
    );

    return jsonOk({
      success:              true,
      item_name:            shopItem.name,
      spent_tokens:         chargeTokens,
      new_balance:          newBalance,
      ...(agentAccessPending && { agent_access_pending: true }),
    });
  } catch (err) {
    console.error('shop-purchase unhandled exception:', err);
    return jsonAppError('Something went wrong on our end — your balance was not changed. Try again.');
  }
});
