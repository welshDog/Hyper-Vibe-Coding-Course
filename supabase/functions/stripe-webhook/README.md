# Stripe Webhook — Setup Guide

This Edge Function auto-enrolls students after a successful Stripe payment.

## One-time setup (15 minutes)

### 1. Deploy the function

```bash
# From repo root
supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` is required because Stripe sends the request, not a logged-in user.

### 2. Set secrets in Supabase

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
```

### 3. Register the webhook in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** (`whsec_...`) → paste into step 2 above

### 4. Add metadata to your Payment Links

In Stripe Dashboard → Payment Links → edit each link:

| Key | Value |
|-----|-------|
| `course_id` | The Supabase UUID of the course |

The `user_id` is passed via `client_reference_id` in the URL (built by `getCoursePaymentLinkUrl`).

### 5. Update `.env` with the payment link URL

```bash
VITE_STRIPE_PAYMENT_LINK_URL=https://buy.stripe.com/your-link
```

## How it works

```
Student clicks "Enroll — $29"
  → CourseDetail.tsx calls getCoursePaymentLinkUrl()
  → URL includes client_reference_id={userId, courseId}
  → Redirect to Stripe
  → Student pays
  → Stripe fires checkout.session.completed to our webhook
  → Edge Function decodes client_reference_id
  → Upserts row in public.enrollments
  → Student lands on /payment-success?course_id=...
  → PaymentSuccess.tsx polls enrollments table (max 10s)
  → Shows "You're enrolled!" with link to start learning
```

## Testing with Stripe CLI

```bash
# Install Stripe CLI, then:
stripe listen --forward-to https://<ref>.supabase.co/functions/v1/stripe-webhook

# Trigger a test event:
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.course_id=<uuid> \
  --add checkout_session:client_reference_id='{"userId":"<uuid>","courseId":"<uuid>"}'
```
