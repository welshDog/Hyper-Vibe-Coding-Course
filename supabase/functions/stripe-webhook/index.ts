// =============================================================
// 🔥 STRIPE WEBHOOK — SUPABASE EDGE FUNCTION
// Listens for Stripe payment events → awards BROski$ tokens
// Deploy: supabase functions deploy stripe-webhook
// =============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

// Price ID → tier config (mirrors stripe/products.config.ts)
const PRICE_TO_TIER: Record<string, { tier: string; tokens: number; modules: number[] }> = {
  'price_1TXn1T2LoEeIEPVE2YULkFsI': { tier: 'starter',      tokens: 200,  modules: [1,2,3,4] },
  'price_1TXn1Z2LoEeIEPVEHSj3TDBF': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TXn1e2LoEeIEPVE00MmiaYj': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TXn1j2LoEeIEPVEjzzhcJny': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  'price_1TXn1o2LoEeIEPVEWICzEMHV': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
};

serve(async (req: Request) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  // ✓ Verify the webhook signature — rejects anything not from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return new Response('Webhook signature invalid', { status: 400 });
  }

  // ✓ Idempotency guard — skip already-processed events
  const { data: existingEvent } = await supabase
    .from('token_transactions')
    .select('id')
    .eq('source_id', event.id)
    .maybeSingle();
  if (existingEvent) {
    console.log(`⏭️ Skipping already-processed event: ${event.id}`);
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ✓ Handle successful one-time payment
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? (session as any).receipt_email;
    // Payment Links: set metadata.price_id on each link in Stripe dashboard
    const priceId = (session as any).line_items?.data?.[0]?.price?.id
      ?? (session as any).metadata?.price_id;
    const courseId = (session as any).client_reference_id
      ?? (session as any).metadata?.course_id
      ?? null;

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId, courseId, event.id);
    } else if (customerEmail && courseId) {
      await enrollVerifiedBuyer(supabase, customerEmail, courseId);
    } else {
      console.error('❌ Missing email or priceId — logging for manual review', { customerEmail, priceId, courseId, eventId: event.id });
      // Store failed event for manual admin review
      await supabase.from('token_transactions').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: 0,
        reason: `⚠️ WEBHOOK_UNMATCHED — no user found for payment`,
        source_id: event.id,
        created_at: new Date().toISOString(),
      });
    }
  }

  // ✓ Handle successful subscription creation (monthly plans)
  if (event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerEmail = invoice.customer_email;
    const priceId = invoice.lines?.data?.[0]?.price?.id;

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId, null, event.id);
    }
  }

  // ✓ Mission C — Revoke access on refund or dispute
  if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
    const charge = event.data.object as Stripe.Charge;
    const customerEmail = charge.billing_details?.email ?? charge.receipt_email;

    if (customerEmail) {
      await revokeAccess(supabase, customerEmail, event.type, event.id);
    } else {
      console.error('❌ Refund/dispute: no email on charge', { chargeId: charge.id, eventId: event.id });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// =============================================================
// CORE: Award BROski$ tokens + unlock modules for a user
// =============================================================
async function awardTokensAndUnlock(
  supabase: ReturnType<typeof createClient>,
  email: string,
  priceId: string,
  courseId: string | null,
  eventId: string
) {
  const config = PRICE_TO_TIER[priceId];
  if (!config) return;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, broski_tokens')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error('❌ User not found for email:', email, '| event:', eventId);
    // Dead-letter log so admin can manually fix
    await supabase.from('token_transactions').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      amount: 0,
      reason: `⚠️ WEBHOOK_USER_NOT_FOUND — email: ${email}`,
      source_id: eventId,
      created_at: new Date().toISOString(),
    });
    return;
  }

  const userId = profile.id;
  const currentTokens = profile.broski_tokens ?? 0;

  // 2️⃣ Award tokens + upgrade subscription tier
  const { error: updateError } = await supabase
    .from('users')
    .update({
      broski_tokens: currentTokens + config.tokens,
      subscription_tier: config.tier,
      subscription_status: 'active',
    })
    .eq('id', userId);

  if (updateError) {
    console.error('❌ Failed to update user:', updateError);
    return;
  }

  // 3️⃣ Log the transaction — FIXED column names: reason + source_id
  await supabase.from('token_transactions').insert({
    user_id: userId,
    amount: config.tokens,
    reason: `💰 ${config.tier} tier purchase — Stripe price ${priceId}`,
    source_id: eventId,
    created_at: new Date().toISOString(),
  });

  // 4️⃣ Enroll the buyer
  await enrollUser(supabase, userId, courseId);

  console.log(`✅ Awarded ${config.tokens} BROski$ to ${email} | Tier: ${config.tier} | Modules: ${config.modules.join(', ')}`);
}

// =============================================================
// REVOKE: Set enrollments.status = revoked on refund/dispute
// =============================================================
async function revokeAccess(
  supabase: ReturnType<typeof createClient>,
  email: string,
  eventType: string,
  eventId: string
) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !profile) {
    console.error('❌ Revoke: user not found for email:', email);
    return;
  }

  const { error: revokeError } = await supabase
    .from('enrollments')
    .update({ status: 'revoked' })
    .eq('user_id', profile.id)
    .eq('status', 'active');

  if (revokeError) {
    console.error('❌ Failed to revoke enrollments:', revokeError);
    return;
  }

  // Log the revoke
  await supabase.from('token_transactions').insert({
    user_id: profile.id,
    amount: 0,
    reason: `🚫 Access revoked — ${eventType}`,
    source_id: eventId,
    created_at: new Date().toISOString(),
  });

  console.log(`🚫 Revoked access for ${email} | Reason: ${eventType}`);
}

// =============================================================
// Enrollment — the single trusted grant path (post payment-verify)
// =============================================================
async function resolveCourseIds(
  supabase: ReturnType<typeof createClient>,
  courseId: string | null
): Promise<string[]> {
  if (courseId) return [courseId];
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('is_active', true);
  return (courses ?? []).map((c: { id: string }) => c.id);
}

async function enrollUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  courseId: string | null
) {
  const ids = await resolveCourseIds(supabase, courseId);
  if (ids.length === 0) return;

  const { error } = await supabase.from('enrollments').upsert(
    ids.map((cid) => ({ user_id: userId, course_id: cid, progress_percentage: 0 })),
    { onConflict: 'user_id,course_id' }
  );
  if (error) console.error('❌ Failed to upsert enrollments:', error);
  else console.log(`✅ Enrolled user ${userId} in ${ids.length} course(s)`);
}

// Verified single-course purchase with no tier mapping in PRICE_TO_TIER
async function enrollVerifiedBuyer(
  supabase: ReturnType<typeof createClient>,
  email: string,
  courseId: string
) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !profile) {
    console.error('❌ User not found for email:', email);
    return;
  }

  await enrollUser(supabase, profile.id, courseId);
}
