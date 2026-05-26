# 💳 Stripe Payment Links — Master Map
**Generated: 27 May 2026**
**Author: Lyndz + Perplexity**

> Single source of truth for all Stripe ↔ Vercel ↔ Webhook connections.
> Keep this updated whenever you create or change a Payment Link in Stripe.

---

## 🗺️ The Full Offer Stack

| Tier | Billing | Price | BROski$ | Modules | Vercel Env Var | Stripe Price ID needed |
|---|---|---|---|---|---|---|
| 🌱 Starter | One-time | £29 | 100 | M1 | `VITE_STRIPE_STARTER_URL` | Create in Stripe |
| ⚡ Pro | One-time | £49 | 300 | M1–M4 | `VITE_STRIPE_PRO_URL` | Create in Stripe |
| 🔥 Builder | One-time | £97 | 800 | M1–M9 | `VITE_STRIPE_BUILDER_URL` | Create in Stripe |
| 🔥 Builder | Monthly | £12/mo | 800 | M1–M9 | `VITE_STRIPE_BUILDER_MONTHLY_URL` | Create in Stripe |
| 🏛️ Architect | One-time | £167 | 1,500 | M1–M11 | `VITE_STRIPE_ARCHITECT_URL` | Create in Stripe |
| 🏛️ Architect | Monthly | £18/mo | 1,500 | M1–M11 | `VITE_STRIPE_ARCHITECT_MONTHLY_URL` | Create in Stripe |
| ⚛️ Hyper Legend | One-time | £247 | 2,500 | M1–M13 + Quantum | `VITE_STRIPE_HYPER_LEGEND_URL` | Create in Stripe |
| ⚛️ Hyper Legend | Monthly | £25/mo | 2,500 | M1–M13 + Quantum | `VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL` | Create in Stripe |

---

## 🛠️ How to Set Up Each Payment Link in Stripe

For every row above:
1. Go to [Stripe → Payment Links → Create](https://dashboard.stripe.com/payment-links/create)
2. Add the product + price (match the table above)
3. Under **Metadata**, add:
   - Key: `price_id`
   - Value: the Stripe Price ID for that product (copy from the product page)
4. Copy the Payment Link URL
5. Add it to Vercel env vars (see below)

---

## ⚙️ Vercel Env Vars to Set

Go to: [Vercel → hyper-vibe-coding-course → Settings → Environment Variables](https://vercel.com/welshDog/hyper-vibe-coding-course/settings/environment-variables)

Add all 8:

```
VITE_STRIPE_STARTER_URL=https://buy.stripe.com/...
VITE_STRIPE_PRO_URL=https://buy.stripe.com/...
VITE_STRIPE_BUILDER_URL=https://buy.stripe.com/...
VITE_STRIPE_BUILDER_MONTHLY_URL=https://buy.stripe.com/...
VITE_STRIPE_ARCHITECT_URL=https://buy.stripe.com/...
VITE_STRIPE_ARCHITECT_MONTHLY_URL=https://buy.stripe.com/...
VITE_STRIPE_HYPER_LEGEND_URL=https://buy.stripe.com/...
VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL=https://buy.stripe.com/...
```

> ⚠️ These MUST start with `VITE_` or the React frontend won't see them.
> ⚠️ After adding, trigger a Vercel redeploy — env vars don't hot-reload.

---

## 🔌 Webhook — PRICE_TO_TIER Mapping

Once you have the Stripe Price IDs, update `supabase/functions/stripe-webhook/index.ts`:

```ts
const PRICE_TO_TIER = {
  // Starter — one-time £29
  'price_STARTER_ONE_TIME_ID': { tier: 'starter', tokens: 100, modules: [1] },

  // Pro — one-time £49
  'price_PRO_ONE_TIME_ID': { tier: 'pro', tokens: 300, modules: [1,2,3,4] },

  // Builder — one-time £97
  'price_BUILDER_ONE_TIME_ID': { tier: 'builder', tokens: 800, modules: [1,2,3,4,5,6,7,8,9] },
  // Builder — monthly £12/mo
  'price_BUILDER_MONTHLY_ID': { tier: 'builder', tokens: 800, modules: [1,2,3,4,5,6,7,8,9] },

  // Architect — one-time £167
  'price_ARCHITECT_ONE_TIME_ID': { tier: 'architect', tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },
  // Architect — monthly £18/mo
  'price_ARCHITECT_MONTHLY_ID': { tier: 'architect', tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },

  // Hyper Legend — one-time £247
  'price_HYPER_LEGEND_ONE_TIME_ID': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  // Hyper Legend — monthly £25/mo
  'price_HYPER_LEGEND_MONTHLY_ID': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
}
```

> ⚠️ Replace each `price_XXX_ID` with the real Stripe Price ID from your dashboard.
> ⚠️ After updating, redeploy the edge function: `supabase functions deploy stripe-webhook`

---

## 🗄️ DB — subscription_tier CHECK constraint (already fixed ✅)

The `users.subscription_tier` column now accepts all these values:
```
'free' | 'starter' | 'pro' | 'builder' | 'architect' | 'hyper_legend'
```
Migration `fix_subscription_tier_check_constraint` was applied 2026-05-27. ✅

> ⚠️ Note: 'architect' was NOT in the original constraint. If it rejects on purchase,
> run this fix:
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier = ANY (ARRAY[
    'free','starter','pro','builder','architect','hyper_legend'
  ]));
```

---

## 🛒 BROski$ Token Shop — Separate Top-Up Packs

These are NOT course subscriptions — they're standalone token top-ups for the Shop page.

| Pack | Price | BROski$ | Vercel Env Var |
|---|---|---|---|
| Starter Pack | £5 | 200 | `VITE_STRIPE_TOKEN_STARTER_URL` |
| Builder Pack | £15 | 800 | `VITE_STRIPE_TOKEN_BUILDER_URL` |
| Hyper Pack | £35 | 2,500 | `VITE_STRIPE_TOKEN_HYPER_URL` |

> These need their own Stripe Payment Links + webhook handler that credits
> `users.broski_tokens` only (no tier change, no enrollment).

---

## ✅ Go-Live Checklist

- [ ] Create all 8 course Payment Links in Stripe
- [ ] Add `price_id` metadata to each Payment Link
- [ ] Set all 8 `VITE_STRIPE_*` env vars in Vercel
- [ ] Update `PRICE_TO_TIER` in webhook with real Price IDs
- [ ] Redeploy edge function
- [ ] Trigger Vercel redeploy
- [ ] Do £1 test purchase (use Starter tier)
- [ ] Verify: `users.subscription_tier` updated
- [ ] Verify: `token_transactions` row created
- [ ] Verify: `enrollments` row created
- [ ] Create 3 token shop Payment Links
- [ ] Build shop top-up panel in `frontend/src/pages/Shop.tsx`

---

*🐶♾️ Lyndz + Perplexity — May 27 2026*
*"Stop apologising for your brain. Start building."*
