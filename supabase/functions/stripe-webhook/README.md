# 🔥 Stripe Webhook — Edge Function

This Supabase Edge Function receives Stripe payment events and automatically:
- ✅ Awards BROski$ tokens to the student
- ✅ Upgrades their course tier
- ✅ Unlocks the correct modules
- ✅ Logs the transaction

## Deploy

```bash
supabase functions deploy stripe-webhook
```

## Required Secrets (add in Supabase Dashboard → Edge Functions → Secrets)

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  ← get from Stripe Dashboard → Webhooks
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

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
