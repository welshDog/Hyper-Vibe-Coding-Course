// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — runs on Deno
// Handles Stripe checkout.session.completed events to auto-enroll students.
//
// Security model:
//   - courseId comes from session.client_reference_id (set by the frontend URL param).
//   - userId is NEVER trusted from the frontend. We look it up server-side from
//     session.customer_details.email, which Stripe owns and verifies at payment time.
//   - This prevents an attacker from tampering with the URL to enroll a different user.
//
// Setup:
//   1. supabase functions deploy stripe-webhook --no-verify-jwt
//   2. In Stripe Dashboard → Webhooks → Add endpoint:
//        URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//        Events: checkout.session.completed
//   3. supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//      supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically)

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

Deno.serve(async (req: Request) => {
  // ── Method guard ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── Stripe signature verification ─────────────────────────────────────────
  // This is the trust boundary. Everything after this point came from Stripe,
  // not from a user's browser.
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env var');
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

  // ── Handle checkout.session.completed ────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // courseId: from client_reference_id set in the frontend payment URL.
    // This is a public course UUID — knowing it grants nothing by itself.
    const courseId = session.client_reference_id;

    // buyerEmail: from Stripe's verified customer details.
    // Stripe requires email collection at checkout, so this is always present
    // on completed sessions. It cannot be forged by the frontend.
    const buyerEmail = session.customer_details?.email;

    if (!courseId || !buyerEmail) {
      console.warn('checkout.session.completed missing required fields', {
        sessionId: session.id,
        hasCourseId: !!courseId,
        hasBuyerEmail: !!buyerEmail,
      });
      // Return 200 — don't let Stripe retry an unfixable event
      return new Response('OK — missing required fields', { status: 200 });
    }

    // ── Resolve userId from Stripe-verified email ─────────────────────────
    // We look up the buyer in our users table by their email.
    // This is safe because the email came from Stripe, not the browser.
    const { data: userRecord, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', buyerEmail)
      .maybeSingle();

    if (userLookupError) {
      console.error('User lookup failed:', userLookupError);
      return new Response('User lookup failed', { status: 500 });
    }

    if (!userRecord) {
      // Buyer paid but doesn't have a platform account yet.
      // Log it — a support workflow can handle this edge case.
      console.warn(`Payment from unregistered email: ${buyerEmail} for course ${courseId}`);
      // Return 200 so Stripe doesn't retry endlessly — this needs human follow-up
      return new Response('OK — unregistered buyer', { status: 200 });
    }

    const userId = userRecord.id;

    // ── Validate course exists ────────────────────────────────────────────
    const { data: course, error: courseLookupError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseLookupError || !course) {
      console.error('Course not found or lookup failed:', { courseId, courseLookupError });
      // Return 200 — retrying won't fix a bad courseId
      return new Response('OK — course not found', { status: 200 });
    }

    // ── Create enrollment ─────────────────────────────────────────────────
    // Upsert is idempotent — safe if Stripe fires the event twice
    const { error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id' }
      );

    if (enrollmentError) {
      console.error('Failed to create enrollment:', enrollmentError);
      // Return 500 so Stripe retries
      return new Response('Enrollment failed', { status: 500 });
    }

    console.log(`✅ Enrolled: user=${userId} email=${buyerEmail} course=${courseId} session=${session.id}`);
  }

  return new Response('OK', { status: 200 });
});
