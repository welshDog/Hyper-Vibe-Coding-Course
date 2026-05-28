// =============================================================
// 🔥 STRIPE WEBHOOK — SUPABASE EDGE FUNCTION
// Listens for Stripe payment events → awards BROski$ tokens
// Deploy: supabase functions deploy stripe-webhook
// =============================================================
import { serve } from 'https://deno.land/std@0.220.1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno';

// Price ID → tier config (mirrors stripe/products.config.ts)
const PRICE_TO_TIER: Record<string, { tier: string; tokens: number; modules: number[] }> = {
  'price_1TbUiz2LoEeIEPVE51tuHofX': { tier: 'starter',      tokens: 100,  modules: [1] },
  'price_1TbUjB2LoEeIEPVEa3AEQywy': { tier: 'pro',          tokens: 300,  modules: [1,2,3,4] },
  'price_1TbUjN2LoEeIEPVEEyy4FxrL': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9] },
  'price_1TbUjT2LoEeIEPVECfWtHePf': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9] },
  'price_1TbUjf2LoEeIEPVEyHtcTurh': { tier: 'architect',    tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TbUjl2LoEeIEPVEKKa17fza': { tier: 'architect',    tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TbUjw2LoEeIEPVEIU4LKdZp': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  'price_1TbUk22LoEeIEPVEB6hpSFZt': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
};

serve(async (req: Request) => {
  const stripeSecret = (Deno.env.get('STRIPE_SECRET_KEY') ?? '').trim()
  const webhookSecret = (Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '').trim()
  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  });
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const signature = req.headers.get('stripe-signature') ?? req.headers.get('Stripe-Signature');
  const body = await req.text();

  // ✓ Verify the webhook signature — rejects anything not from Stripe
  let event: Stripe.Event;
  try {
    if (!signature) {
      throw new Error('missing_stripe_signature_header')
    }
    if (!webhookSecret) {
      throw new Error('missing_stripe_webhook_secret')
    }
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    const error =
      message === 'missing_stripe_signature_header' || message === 'missing_stripe_webhook_secret'
        ? message
        : 'signature_verification_failed'
    console.error('❌ Webhook signature verification failed:', err);
    return new Response(
      JSON.stringify({
        error,
        has_signature: Boolean(signature),
        has_webhook_secret: Boolean(webhookSecret),
        has_stripe_secret_key: Boolean(stripeSecret),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const handledTypes = new Set([
    'checkout.session.completed',
    'payment_intent.succeeded',
    'customer.subscription.created',
    'invoice.payment_succeeded',
    'charge.refunded',
    'charge.dispute.created',
  ])

  if (!handledTypes.has(event.type)) {
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: existingEvent } = await supabase
    .from('token_transactions')
    .select('id')
    .eq('source_id', event.id)
    .maybeSingle();
  if (existingEvent) {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? (session as any).customer_email ?? (session as any).receipt_email;
    let priceId =
      (session as any).metadata?.price_id
      ?? (session as any).line_items?.data?.[0]?.price?.id;
    const courseId = (session as any).client_reference_id ?? (session as any).metadata?.course_id ?? null;

    if (!priceId && session.id) {
      try {
        const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        priceId = items.data?.[0]?.price?.id;
      } catch (_err) {
        priceId = priceId ?? null;
      }
    }

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId, courseId, event.id);
    } else {
      await logUnmatchedPayment(supabase, {
        userEmail: customerEmail ?? null,
        stripeSessionId: event.id,
        amountPence: session.amount_total ?? 0,
        currency: (session.currency ?? 'gbp').toLowerCase(),
        status: 'unmatched',
      })
      if (customerEmail && courseId) {
        await enrollVerifiedBuyer(supabase, customerEmail, courseId);
      }
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const customerEmail =
      (intent as any).receipt_email
      ?? (intent as any).charges?.data?.[0]?.billing_details?.email
      ?? null;
    const priceId = (intent as any).metadata?.price_id ?? null;
    const courseId = (intent as any).metadata?.course_id ?? null;

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId, courseId, event.id);
    } else {
      await logUnmatchedPayment(supabase, {
        userEmail: customerEmail ?? null,
        stripeSessionId: event.id,
        amountPence: (intent as any).amount_received ?? intent.amount ?? 0,
        currency: ((intent as any).currency ?? 'gbp').toLowerCase(),
        status: 'unmatched',
      })
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
    await logUnmatchedPayment(supabase, {
      userEmail: email,
      stripeSessionId: eventId,
      amountPence: 0,
      currency: 'gbp',
      status: 'unmatched',
    })
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

  let inserted = 0
  for (const cid of ids) {
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', cid)
      .maybeSingle()

    if (existing) continue

    const { error } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: cid,
      progress_percentage: 0,
      status: 'active',
    })
    if (error) console.error('❌ Failed to insert enrollment:', error)
    else inserted += 1
  }

  if (inserted > 0) console.log(`✅ Enrolled user ${userId} in ${inserted} course(s)`)
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

async function logUnmatchedPayment(
  supabase: ReturnType<typeof createClient>,
  input: {
    userEmail: string | null
    stripeSessionId: string
    amountPence: number
    currency: string
    status: string
  }
) {
  const { error } = await supabase.from('payments').insert({
    user_id: null,
    user_email: input.userEmail,
    amount_pence: input.amountPence,
    currency: input.currency,
    stripe_session_id: input.stripeSessionId,
    status: input.status,
    created_at: new Date().toISOString(),
  })
  if (error && (error as any).code !== '23505') {
    console.error('❌ Failed to log unmatched payment:', error)
  }
}
