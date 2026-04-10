// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function — runs on Deno
// Handles Stripe checkout.session.completed events to auto-enroll students.
//
// Setup:
//   1. supabase functions deploy stripe-webhook
//   2. In Stripe Dashboard → Webhooks → Add endpoint:
//        URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//        Events: checkout.session.completed
//   3. Copy the webhook signing secret and add to Supabase secrets:
//        supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// In your Stripe Payment Links, add metadata:
//   course_id: <uuid of the course>
//   user_id:   <uuid of the user>  (pass via prefilled_email is fine — see payments.ts)
//
// IMPORTANT: For user_id in metadata, pass it from the frontend before redirecting.
// See frontend/src/lib/payments.ts for how to build the URL with metadata.

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

  // ── Signature verification ────────────────────────────────────────────────
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

    const courseId = session.metadata?.course_id;
    const userId = session.metadata?.user_id;

    if (!courseId || !userId) {
      // Missing metadata — log for investigation but don't 500
      // (Stripe would retry, causing duplicate attempts)
      console.warn('checkout.session.completed missing metadata', {
        sessionId: session.id,
        metadata: session.metadata,
      });
      return new Response('OK — missing metadata', { status: 200 });
    }

    // Upsert enrollment — idempotent; safe if webhook fires twice
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

    // Log purchase for audit trail
    console.log(`✅ Enrollment created: user=${userId} course=${courseId} session=${session.id}`);

    // Optional: trigger welcome email via Supabase Realtime / pg_net / Resend
    // await sendEnrollmentEmail(userId, courseId);
  }

  return new Response('OK', { status: 200 });
});
