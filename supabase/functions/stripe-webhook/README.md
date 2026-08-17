# 🔥 Stripe Webhook — Edge Function

This Supabase Edge Function receives Stripe payment events and automatically:
- ✅ Awards BROski$ tokens to the student
- ✅ Upgrades their course tier
- ✅ Unlocks the correct modules
- ✅ Logs the transaction

## Deploy

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

`verify_jwt` stays off for this endpoint because Stripe does not send Supabase
credentials. The webhook authenticates requests by verifying Stripe's signed
payload internally.

## Required configuration

### Hosted runtime

- Create a named secret API key in Supabase Settings -> API Keys called
  `stripe_webhook`.
- Hosted Edge Functions expose named secret keys through
  `SUPABASE_SECRET_KEYS`, and this function reads
  `SUPABASE_SECRET_KEYS["stripe_webhook"]`.
- Supabase's dashboard validator currently requires underscores in API key
  names, so this component uses `stripe_webhook` rather than a hyphenated
  label.
- Do not paste or store the secret key in repo files or browser-exposed env
  vars.

### Function secrets (Dashboard -> Edge Functions -> Secrets)

The function is TEST/LIVE dual-mode: it verifies the incoming signature
against whichever secret matches (TEST first, then LIVE), and that
determines which API key it uses for the rest of the request. Set whichever
of these you actually have — `_TEST` falls back to the old unsuffixed name,
so this keeps working with only the original two secrets set:

```
STRIPE_SECRET_KEY_TEST=sk_test_xxx        (or the legacy STRIPE_SECRET_KEY)
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxx      (or the legacy STRIPE_WEBHOOK_SECRET)
STRIPE_SECRET_KEY_LIVE=sk_live_xxx        (once Stripe LIVE mode is activated)
STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxx      (from the LIVE webhook endpoint below)
SUPABASE_URL=https://xxx.supabase.co
```

**Current state:** this project is TEST mode only — no `_LIVE` secrets are
set yet, and no LIVE webhook endpoint exists in Stripe. See the go-live plan
for what's needed before that changes.

### Local-only fallback

For local `supabase functions serve`, this function accepts:

```
SUPABASE_SECRET_KEY=sb_secret_xxx
```

It does not fall back to `SUPABASE_SERVICE_ROLE_KEY`.

## Stripe Events Handled

The function handles **six** events — the first four grant access, the last
two revoke it. All six must be selected on the webhook endpoint, or refunds
and disputes will silently never revoke access in production.

| Event | When |
|---|---|
| `checkout.session.completed` | One-time purchase completed |
| `payment_intent.succeeded` | Direct payment succeeded |
| `customer.subscription.created` | New monthly sub |
| `invoice.payment_succeeded` | Monthly sub renewal |
| `charge.refunded` | Refund issued → revokes the buyer's active enrollments |
| `charge.dispute.created` | Chargeback opened → revokes the buyer's active enrollments |

## Register the Webhook in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Select events: **all six** listed above — do not stop at the first four
5. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET_TEST` or
   `STRIPE_WEBHOOK_SECRET_LIVE` in Supabase, matching the endpoint's mode

## Price ID → Tier Mapping

Mirrors `PRICE_TO_TIER` in `index.ts` and `stripe/products.config.ts` — see
`scripts/check-pricing-drift.mjs` for the automated check that keeps these
in sync. All 8 are currently TEST-mode price IDs.

| Price ID | Tier | Tokens | Modules |
|---|---|---|---|
| `price_1TbUiz2LoEeIEPVE51tuHofX` | starter | 100 | 1 |
| `price_1TbUjB2LoEeIEPVEa3AEQywy` | pro | 300 | 1-4 |
| `price_1TbUjN2LoEeIEPVEEyy4FxrL` | builder | 800 | 1-9 |
| `price_1TbUjT2LoEeIEPVECfWtHePf` | builder monthly | 800 | 1-9 |
| `price_1TbUjf2LoEeIEPVEyHtcTurh` | architect | 1500 | 1-11 |
| `price_1TbUjl2LoEeIEPVEKKa17fza` | architect monthly | 1500 | 1-11 |
| `price_1TbUjw2LoEeIEPVEIU4LKdZp` | hyper_legend | 2500 | 1-12 |
| `price_1TbUk22LoEeIEPVEB6hpSFZt` | hyper_legend monthly | 2500 | 1-12 |
