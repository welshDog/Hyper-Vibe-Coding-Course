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

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  ← get from Stripe Dashboard → Webhooks
SUPABASE_URL=https://xxx.supabase.co
```

### Local-only fallback

For local `supabase functions serve`, this function accepts:

```
SUPABASE_SECRET_KEY=sb_secret_xxx
```

It does not fall back to `SUPABASE_SERVICE_ROLE_KEY`.

## Stripe Events Handled

| Event | When |
|---|---|
| `checkout.session.completed` | One-time purchase completed |
| `payment_intent.succeeded` | Direct payment succeeded |
| `customer.subscription.created` | New monthly sub |
| `invoice.payment_succeeded` | Monthly sub renewal |

## Register the Webhook in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Select events: all 4 listed above
5. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Supabase

## Price ID → Tier Mapping

| Price ID | Tier | Tokens | Modules |
|---|---|---|---|
| `price_1TXn1T2LoEeIEPVE2YULkFsI` | starter | 200 | 1-4 |
| `price_1TXn1Z2LoEeIEPVEHSj3TDBF` | builder | 800 | 1-11 |
| `price_1TXn1e2LoEeIEPVE00MmiaYj` | builder monthly | 800 | 1-11 |
| `price_1TXn1j2LoEeIEPVEjzzhcJny` | hyper_legend | 2500 | 1-13 |
| `price_1TXn1o2LoEeIEPVEWICzEMHV` | hyper_legend monthly | 2500 | 1-13 |
