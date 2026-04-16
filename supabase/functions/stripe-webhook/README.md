# Stripe Webhook — Setup Guide

This Edge Function handles two Stripe events:
- `checkout.session.completed` — enrolls students after payment (course purchases + token packs)
- `charge.refunded` — deducts BROski$ tokens on refund

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

Optional — email confirmation via Resend:
```bash
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
supabase secrets set APP_URL=https://yourdomain.com
```

### 3. Register the webhook in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
4. Select events: `checkout.session.completed`, `charge.refunded`
5. Copy the **Signing secret** (`whsec_...`) → paste into step 2 above

> **Webhook name:** `vibe-hook` — keep this one, it has delivery history.

## How checkout sessions are created

Course purchases and token packs both go through the HyperCode V2.4 backend at
`POST /api/stripe/checkout`. The frontend never redirects to a static Stripe Payment Link.

### Course purchases (`price_id = "course_purchase"`)

```ts
// CourseDetail.tsx
import { createCourseCheckoutSession } from '../lib/payments'

const url = await createCourseCheckoutSession(
  { id: course.id, title: course.title, price_pence: course.price_pence },
  user.id,
)
window.location.href = url
```

The backend creates a Checkout Session with:
- `price_data` (inline pricing — no pre-created Stripe Price ID needed per course)
- `client_reference_id = course_id` — used by this webhook to identify which course to enroll
- `mode = "payment"` (one-time)

### Token packs + subscriptions

```ts
// TokensPage.tsx / Pricing.tsx
import { createCheckoutSession } from '../lib/payments'

const url = await createCheckoutSession('starter', user.id)
window.location.href = url
```

Uses pre-created Stripe Price IDs from env vars (`STRIPE_PRICE_STARTER` etc.).

## Security model

`userId` is **never** passed from the frontend for course purchases. The webhook resolves
the buyer's identity from `session.customer_details.email` — a value Stripe verifies
during checkout. This prevents an attacker from enrolling a different user's account.

`courseId` comes from `session.client_reference_id` (set server-side by the backend).
The webhook validates it exists in the DB before proceeding.

## How it works — course enrollment

```
Student clicks "Enroll — £29"
  → CourseDetail.tsx calls createCourseCheckoutSession()
  → POST /api/stripe/checkout {price_id: "course_purchase", course_id, course_title, price_pence}
  → HyperCode V2.4 backend creates Checkout Session (inline price_data, client_reference_id=courseId)
  → Student pays on Stripe-hosted checkout
  → Stripe fires checkout.session.completed to this Edge Function
  → Signature verified via STRIPE_WEBHOOK_SECRET
  → Branches:
      A. metadata.token_amount set → award BROski$ tokens
      B. client_reference_id set  → course enrollment flow:
           buyerEmail ← session.customer_details.email  (Stripe-owned, unforgeable)
           userId     ← SELECT id FROM users WHERE email = buyerEmail
           If user exists    → INSERT INTO enrollments + send confirmation email
           If user not found → INSERT INTO pending_enrollments
                               (apply_pending_enrollments trigger fires on signup)
  → Student lands on /payment-success?course_id=...
```

## Testing with Stripe CLI

```bash
# Forward to the Edge Function directly:
stripe listen --forward-to https://<ref>.supabase.co/functions/v1/stripe-webhook

# Or forward to the local HyperCode backend (dev only):
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Trigger a test course enrollment:
stripe trigger checkout.session.completed \
  --add checkout_session:client_reference_id=<course-uuid> \
  --add checkout_session:customer_details.email=student@example.com

# Trigger a test token purchase:
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.token_amount=200 \
  --add checkout_session:customer_details.email=student@example.com
```
