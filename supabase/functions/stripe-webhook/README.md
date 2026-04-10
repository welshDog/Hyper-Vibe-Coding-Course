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

## Security model

`userId` is **never** passed from the frontend. The webhook resolves the buyer's
identity from `session.customer_details.email` — a value Stripe verifies during
checkout. This prevents an attacker from modifying the URL to enroll a different
user's account.

`courseId` is passed via `client_reference_id` (a plain UUID). Knowing a course
UUID grants nothing — the webhook validates it exists in the DB before proceeding.

## How it works

```
Student clicks "Enroll — $29"
  → CourseDetail.tsx calls getCoursePaymentLinkUrl(courseId, userEmail)
  → URL includes client_reference_id=<courseId> + prefilled_email=<email>
  → Redirect to Stripe
  → Student pays (Stripe collects + verifies their email)
  → Stripe fires checkout.session.completed to our webhook
  → Edge Function verifies Stripe signature (trust boundary)
  → courseId  ← session.client_reference_id
  → buyerEmail ← session.customer_details.email  (Stripe-owned, unforgeable)
  → userId    ← SELECT id FROM users WHERE email = buyerEmail
  → Validates course exists in DB
  → Upserts row in public.enrollments
  → Student lands on /payment-success?course_id=...
  → PaymentSuccess.tsx polls enrollments table (max 10s)
  → Shows "You're enrolled! 🎉" with link to start learning
```

## Testing with Stripe CLI

```bash
# Install Stripe CLI, then:
stripe listen --forward-to https://<ref>.supabase.co/functions/v1/stripe-webhook

# Trigger a test event:
stripe trigger checkout.session.completed \
  --add checkout_session:client_reference_id=<course-uuid> \
  --add checkout_session:customer_details.email=student@example.com
```
