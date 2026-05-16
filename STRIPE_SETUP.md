# 🔥 Stripe Setup Guide — Hyper Vibe Coding Course

> Built by BROski AI • May 2026 • All price IDs already created in Stripe ✔️

---

## ✅ What's Already Done

| Item | Status | ID |
|---|---|---|
| 🌱 Starter product | ✅ Live | `prod_UWqiI5b5vIgCat` |
| 🔥 Builder product | ✅ Live | `prod_UWqiuUe1RU9VKL` |
| ⚛️ Hyper Legend product | ✅ Live | `prod_UWqidgFnOz2QMW` |
| 🌱 Starter £29 one-time price | ✅ Live | `price_1TXn1T2LoEeIEPVE2YULkFsI` |
| 🔥 Builder £79 one-time price | ✅ Live | `price_1TXn1Z2LoEeIEPVEHSj3TDBF` |
| 🔥 Builder £9/month price | ✅ Live | `price_1TXn1e2LoEeIEPVE00MmiaYj` |
| ⚛️ Hyper Legend £149 one-time price | ✅ Live | `price_1TXn1j2LoEeIEPVEjzzhcJny` |
| ⚛️ Hyper Legend £15/month price | ✅ Live | `price_1TXn1o2LoEeIEPVEWICzEMHV` |

---

## 🔧 Step 1 — Add Business Name (REQUIRED for Payment Links)

1. Go to → https://dashboard.stripe.com/settings/business
2. Add **Business name** (e.g. `HyperCode` or `Hyper Vibe Coding`)
3. Save ✅

---

## 🔗 Step 2 — Create 5 Payment Links

For each link below:
1. Go to → https://dashboard.stripe.com/payment-links
2. Click **+ Create payment link**
3. Click **Add a product** → search by name or paste the Price ID
4. Set quantity = 1
5. (Optional) Under **After payment** → set redirect URL to `https://your-domain.com/payment-success`
6. Click **Create link** → copy the `https://buy.stripe.com/xxx` URL

| # | Tier | Price ID to use | Env var to fill |
|---|---|---|---|
| 1 | 🌱 Starter £29 | `price_1TXn1T2LoEeIEPVE2YULkFsI` | `VITE_STRIPE_STARTER_URL` |
| 2 | 🔥 Builder £79 | `price_1TXn1Z2LoEeIEPVEHSj3TDBF` | `VITE_STRIPE_BUILDER_URL` |
| 3 | 🔥 Builder £9/mo | `price_1TXn1e2LoEeIEPVE00MmiaYj` | `VITE_STRIPE_BUILDER_MONTHLY_URL` |
| 4 | ⚛️ Legend £149 | `price_1TXn1j2LoEeIEPVEjzzhcJny` | `VITE_STRIPE_HYPER_LEGEND_URL` |
| 5 | ⚛️ Legend £15/mo | `price_1TXn1o2LoEeIEPVEWICzEMHV` | `VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL` |

---

## 🚀 Step 3 — Add to Vercel Environment Variables

1. Go to → https://vercel.com/dashboard → Your project → Settings → Environment Variables
2. Add all 5 `VITE_STRIPE_*` variables with the URLs from Step 2
3. Also add `VITE_STRIPE_PUBLISHABLE_KEY` = your `pk_live_xxx` key
4. **Redeploy** your project → Done! ✅

---

## 🧲 Step 4 — Deploy Supabase Webhook

```bash
# From repo root:
supabase functions deploy stripe-webhook
```

Then add these secrets in Supabase Dashboard → Edge Functions → stripe-webhook → Secrets:

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## 🔔 Step 5 — Register Webhook in Stripe

1. Go to → https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. URL: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Select these 4 events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`
5. Click **Add endpoint** → copy **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Step 6 — Test It!

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events to your local Supabase
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger a test payment in another terminal
stripe trigger checkout.session.completed
```

Check your Supabase logs → you should see:
```
✅ Awarded 200 BROski$ to test@example.com | Tier: starter | Modules: 1, 2, 3, 4
```

---

## 🐶 Built by welshDog • Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
