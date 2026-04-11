// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — runs on Deno
//
// Handles two Stripe event types:
//   1. checkout.session.completed
//      a. No metadata.token_amount → course enrollment (original flow)
//      b. Has metadata.token_amount → BROski$ token pack purchase
//   2. charge.refunded → deduct tokens (token pack refunds only)
//
// Security model:
//   - All logic runs after stripe.webhooks.constructEventAsync() — Stripe-signed only.
//   - courseId / tokenAmount come from Stripe metadata, not from the browser.
//   - userId is always resolved from Stripe-verified customer email, never from the URL.
//
// Setup:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//   Stripe Dashboard → Webhooks → Add endpoint → events:
//     checkout.session.completed
//     charge.refunded
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno&no-check';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolveUserId(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (error) {
    console.error('User lookup failed:', error);
    return null;
  }
  return data?.id ?? null;
}

// ── Handler: checkout.session.completed ──────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<Response> {
  const buyerEmail = session.customer_details?.email;
  if (!buyerEmail) {
    console.warn('checkout.session.completed: no customer email', { sessionId: session.id });
    return new Response('OK — no email', { status: 200 });
  }

  const tokenAmount = session.metadata?.token_amount
    ? parseInt(session.metadata.token_amount, 10)
    : null;

  // ── Branch A: Token pack purchase ────────────────────────────────────────
  if (tokenAmount && !isNaN(tokenAmount) && tokenAmount > 0) {
    const userId = await resolveUserId(buyerEmail);
    if (!userId) {
      console.warn(`Token purchase from unregistered email: ${buyerEmail}`);
      return new Response('OK — unregistered buyer', { status: 200 });
    }

    const { error } = await supabaseAdmin.rpc('award_tokens', {
      p_user_id: userId,
      p_amount: tokenAmount,
      p_reason: 'stripe_purchase',
      p_stripe_payment_intent_id: session.payment_intent as string ?? session.id,
    });

    if (error) {
      console.error('award_tokens failed:', error);
      return new Response('Token award failed', { status: 500 });
    }

    console.log(`✅ Tokens awarded: user=${userId} amount=${tokenAmount} session=${session.id}`);
    return new Response('OK', { status: 200 });
  }

  // ── Branch B: Course enrollment ───────────────────────────────────────────
  const courseId = session.client_reference_id;
  if (!courseId) {
    console.warn('checkout.session.completed: no client_reference_id', { sessionId: session.id });
    return new Response('OK — no courseId', { status: 200 });
  }

  const userId = await resolveUserId(buyerEmail);
  if (!userId) {
    console.warn(`Payment from unregistered email: ${buyerEmail} for course ${courseId}`);
    return new Response('OK — unregistered buyer', { status: 200 });
  }

  const { data: course, error: courseLookupError } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();

  if (courseLookupError || !course) {
    console.error('Course not found:', { courseId, courseLookupError });
    return new Response('OK — course not found', { status: 200 });
  }

  const { error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id' },
    );

  if (enrollmentError) {
    console.error('Enrollment failed:', enrollmentError);
    return new Response('Enrollment failed', { status: 500 });
  }

  console.log(`✅ Enrolled: user=${userId} email=${buyerEmail} course=${courseId} session=${session.id}`);
  return new Response('OK', { status: 200 });
}

// ── Handler: charge.refunded ──────────────────────────────────────────────────
// Only handles refunds for token pack purchases (identified by metadata.token_amount).
// Course refunds are handled manually (unenrollment is a support workflow).

async function handleChargeRefunded(charge: Stripe.Charge): Promise<Response> {
  const tokenAmount = charge.metadata?.token_amount
    ? parseInt(charge.metadata.token_amount, 10)
    : null;

  if (!tokenAmount || isNaN(tokenAmount)) {
    // Not a token pack — course refunds handled separately
    return new Response('OK — not a token purchase', { status: 200 });
  }

  const email = charge.billing_details?.email;
  if (!email) {
    console.warn('charge.refunded: no billing email', { chargeId: charge.id });
    return new Response('OK — no email', { status: 200 });
  }

  const userId = await resolveUserId(email);
  if (!userId) {
    console.warn(`Refund for unregistered email: ${email}`);
    return new Response('OK — unregistered user', { status: 200 });
  }

  // Deduct tokens — spend_tokens() enforces floor at 0 via CHECK constraint.
  // If balance < tokenAmount, clamp to current balance so we never go negative.
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('broski_tokens')
    .eq('id', userId)
    .single();

  const deductAmount = Math.min(tokenAmount, userData?.broski_tokens ?? 0);

  if (deductAmount > 0) {
    const { error } = await supabaseAdmin.rpc('spend_tokens', {
      p_user_id: userId,
      p_amount: deductAmount,
      p_reason: 'refund',
      p_source_id: charge.id,
    });

    if (error) {
      console.error('spend_tokens (refund) failed:', error);
      return new Response('Refund deduction failed', { status: 500 });
    }
  }

  console.log(`↩️ Refund processed: user=${userId} deducted=${deductAmount} charge=${charge.id}`);
  return new Response('OK', { status: 200 });
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
    return new Response('Unauthorized', { status: 401 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);

    case 'charge.refunded':
      return handleChargeRefunded(event.data.object as Stripe.Charge);

    default:
      // Acknowledge unhandled events — don't let Stripe retry them
      return new Response('OK — unhandled event type', { status: 200 });
  }
});
