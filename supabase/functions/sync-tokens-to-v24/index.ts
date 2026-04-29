// supabase/functions/sync-tokens-to-v24/index.ts
// Supabase Edge Function — runs on Deno, --no-verify-jwt (called by DB webhook, not a user)
//
// Triggered by: Supabase Database Webhook on public.token_transactions INSERT
// Purpose: Mirror token awards from the Course (Supabase) into HyperCode V2.4 (FastAPI)
//          so the student's BROski$ wallet reflects their Course earnings in real time.
//
// Security:
//   - Auth uses a shared COURSE_SYNC_SECRET sent as X-Sync-Secret header
//   - V2.4 verifies it before awarding coins
//   - Idempotency is enforced on the V2.4 side via course_sync_events.source_id UNIQUE
//
// DB Webhook payload format (Supabase sends this automatically):
//   {
//     "type":   "INSERT",
//     "table":  "token_transactions",
//     "schema": "public",
//     "record": {
//       "id":         "<uuid>",
//       "user_id":    "<supabase-auth-uid>",
//       "discord_id": "<discord-snowflake-or-null>",
//       "amount":     123,
//       "reason":     "course_completion",
//       "created_at": "2026-04-16T12:00:00Z"
//     },
//     "old_record": null
//   }
//
// Setup:
//   supabase functions deploy sync-tokens-to-v24 --no-verify-jwt
//   supabase secrets set COURSE_SYNC_SECRET=<same-value-as-V2.4-COURSE_SYNC_SECRET>
//   supabase secrets set V24_API_URL=https://<your-public-v24-url>
//   Then register the Supabase DB Webhook in the Supabase dashboard:
//     - Source table: public.token_transactions
//     - Event: INSERT
//     - URL: https://<your-project>.supabase.co/functions/v1/sync-tokens-to-v24
//     - Headers: (none) — this edge function authenticates to V2.4 via X-Sync-Secret

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenTransactionRecord {
  id: string;           // UUID — used as idempotency key (source_id) in V2.4
  user_id: string;      // Supabase auth UID
  discord_id?: string | null; // Optional — resolved via discord_links if missing
  amount: number;       // Token delta — only positive amounts are forwarded
  reason: string | null;
  created_at: string;
}

interface DbWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: TokenTransactionRecord;
  old_record: TokenTransactionRecord | null;
}

interface V24AwardPayload {
  source_id: string;
  discord_id: string;
  tokens: number;
  reason: string;
}

// ── Response helpers ──────────────────────────────────────────────────────────

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, reason: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function resolveDiscordId(
  record: TokenTransactionRecord,
): Promise<{ discordId: string | null; reason: "in_record" | "discord_links" | "missing" }> {
  if (record.discord_id) {
    return { discordId: record.discord_id, reason: "in_record" };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL) {
    return { discordId: null, reason: "missing" };
  }

  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    return { discordId: null, reason: "missing" };
  }

  const supabase = createClient(SUPABASE_URL, supabaseKey);

  const { data, error } = await supabase
    .from("discord_links")
    .select("discord_id")
    .eq("user_id", record.user_id)
    .maybeSingle();

  if (error || !data?.discord_id) {
    return { discordId: null, reason: "missing" };
  }

  return { discordId: data.discord_id as string, reason: "discord_links" };
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Only process POST requests — Supabase DB webhooks always use POST
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  // ── 1. Parse the DB webhook payload ────────────────────────────────────────
  let payload: DbWebhookPayload;
  try {
    payload = await req.json() as DbWebhookPayload;
  } catch {
    console.error('sync-tokens-to-v24: Failed to parse webhook payload');
    return jsonError('Invalid JSON payload', 400);
  }

  const record = payload.record;

  if (payload.type !== "INSERT" || payload.table !== "token_transactions") {
    return jsonOk({ ok: true, skipped: true, reason: "unsupported_event" });
  }

  if (!record || typeof record !== 'object') {
    console.error('sync-tokens-to-v24: Missing record in payload');
    return jsonError('Missing record in payload', 400);
  }

  // ── 2. Guard: only forward positive amounts (skip refunds / deductions) ────
  const amount = typeof record.amount === "number"
    ? record.amount
    : Number((record as unknown as Record<string, unknown>)["tokens"] ?? 0);
  if (!amount || amount <= 0) {
    console.log(
      `sync-tokens-to-v24: Skipping non-positive amount=${amount} for id=${record.id}`,
    );
    return jsonOk({ ok: true, skipped: true, reason: 'non_positive_amount' });
  }

  // ── 3. Resolve discord_id ──────────────────────────────────────────────────
  const { discordId, reason: discordIdSource } = await resolveDiscordId(record);
  if (!discordId) {
    console.log(
      `sync-tokens-to-v24: Skipping id=${record.id} — discord_id missing (${discordIdSource})`,
    );
    return jsonOk({ ok: true, skipped: true, reason: 'no_discord_id' });
  }

  // ── 4. Read env vars ────────────────────────────────────────────────────────
  const v24ApiUrl      = Deno.env.get('V24_API_URL') ?? '';
  const courseSyncSecret = Deno.env.get('COURSE_SYNC_SECRET') ?? '';

  if (!v24ApiUrl) {
    console.error('sync-tokens-to-v24: V24_API_URL is not set');
    return jsonError('V24_API_URL not configured — token sync disabled', 503);
  }

  if (!courseSyncSecret) {
    console.error('sync-tokens-to-v24: COURSE_SYNC_SECRET is not set');
    return jsonError('COURSE_SYNC_SECRET not configured — token sync disabled', 503);
  }

  // ── 5. Build and send the award request to V2.4 ────────────────────────────
  const awardPayload: V24AwardPayload = {
    source_id:  record.id,
    discord_id: discordId,
    tokens:     amount,
    reason:     record.reason ?? 'Course reward',
  };

  const v24Endpoint = `${v24ApiUrl.replace(/\/$/, '')}/api/v1/economy/award-from-course`;

  const attemptDelaysMs = [0, 250, 750];
  let response: Response | null = null;
  let lastNetworkError: unknown = null;
  for (const delayMs of attemptDelaysMs) {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    try {
      const r = await fetch(v24Endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Secret': courseSyncSecret,
        },
        body: JSON.stringify(awardPayload),
      });
      if (r.status >= 500) {
        response = r;
        continue;
      }
      response = r;
      break;
    } catch (fetchErr) {
      lastNetworkError = fetchErr;
      continue;
    }
  }
  if (!response) {
    console.error(
      `sync-tokens-to-v24: Network error posting to V2.4 for source_id=${record.id}:`,
      lastNetworkError,
    );
    return jsonError("V2.4 network error", 502);
  }

  // ── 6. Handle V2.4 response ─────────────────────────────────────────────────
  if (response.ok) {
    const body = await response.json().catch(() => ({}));
    console.log(
      `sync-tokens-to-v24: ✅ Awarded ${amount} tokens to discord=${discordId} ` +
      `source_id=${record.id}`,
    );
    return jsonOk({ ok: true, source_id: record.id, ...body });
  }

  // 409 = already processed — idempotent, treat as success
  if (response.status === 409) {
    console.log(
      `sync-tokens-to-v24: source_id=${record.id} already processed in V2.4 — safe to ignore`,
    );
    return jsonOk({ ok: true, skipped: true, reason: 'already_processed' });
  }

  // 404 = user not linked in V2.4 yet — not fatal, log and move on
  if (response.status === 404) {
    console.warn(
      `sync-tokens-to-v24: discord_id=${discordId} not found in V2.4 ` +
      `(source_id=${record.id}) — user needs to /link-discord`,
    );
    return jsonOk({ ok: false, reason: 'v24_user_not_found' });
  }

  if (response.status === 401 || response.status === 403) {
    const errBody = await response.text().catch(() => '');
    console.error(
      `sync-tokens-to-v24: V2.4 auth failed (${response.status}) for source_id=${record.id}: ${errBody}`,
    );
    return jsonError("V2.4 auth failed", 502);
  }

  // Any other error — log but return non-2xx so delivery can be retried upstream
  const errBody = await response.text().catch(() => '');
  console.error(
    `sync-tokens-to-v24: V2.4 returned ${response.status} for source_id=${record.id}: ${errBody}`,
  );
  return jsonError(`V2.4 error ${response.status}`, 502);
});
