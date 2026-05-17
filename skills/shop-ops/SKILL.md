---
name: shop-ops
description: Manage the Hyper-Vibe shop — BROski$ token packs, product setup, pricing updates, checkout flow QA, fulfillment checks, and admin content updates for the /shop page.
triggers:
  - "shop"
  - "token pack"
  - "add product"
  - "update pricing"
  - "shop page"
  - "checkout"
  - "token balance"
  - "fulfillment"
  - "shop task"
  - "add item to shop"
  - "update shop"
metadata:
  platform: Vercel + Stripe + Supabase
  project: hyper-vibe-coding-course
  shop_url: https://hyper-vibe-coding-course.vercel.app/shop
  stripe_dashboard: https://dashboard.stripe.com
  supabase_project: yhtmuibgdnxhbgboajhc
---

# 🛒 Skill: shop-ops

## Purpose
Handle everything related to the Hyper-Vibe shop — from adding a new token pack to checking why a purchase didn't credit tokens, updating shop copy, and keeping the full checkout-to-fulfillment flow working.

## When to Use
- Adding a new product or token pack to the shop
- Updating the price or description of an existing pack
- Checking why a user didn't receive their tokens after payment
- Updating shop page UI copy or pack descriptions
- Running a QA check on the full purchase flow
- Handling a refund or failed payment complaint
- Adding a new shop item (e.g. course access, special pack, merch)

---

## 📋 Step-by-Step Workflow

### 1. Add a New Token Pack
```bash
# Step 1 — Create product in Stripe
stripe products create \
  --name="Elite Pack" \
  --description="10,000 BROski$ tokens — for the serious builders"

# Step 2 — Create price
stripe prices create \
  --product=prod_XXXXX \
  --unit-amount=4999 \
  --currency=gbp

# Step 3 — Create payment link
stripe payment_links create \
  --line-items[0][price]=price_XXXXX \
  --line-items[0][quantity]=1
```
✅ Then: Add the product to the `/shop` page component with the payment link URL.

### 2. Update Shop Page Content
```
File: frontend/src/pages/Shop.tsx (or /app/shop/page.tsx)
Update: product name, description, price display, payment link URL
```
✅ Confirm: Push to GitHub → Vercel auto-deploys → check /shop on live site.

### 3. Current Token Pack Structure
| Pack | Tokens | Price | Description |
|---|---|---|---|
| 🥉 Starter | 500 | £4.99 | Perfect for trying it out |
| 🥈 Builder | 1,500 | £9.99 | For regular builders |
| 🥇 Hyper | 5,000 | £24.99 | For the serious ones |
| ⚡ Elite | 10,000 | £49.99 | Empire mode |

### 4. Check Token Fulfilment After Purchase
```sql
-- In Supabase SQL editor:
SELECT id, email, broski_tokens, updated_at
FROM users
WHERE email = 'user@example.com';
```
✅ Confirm: `broski_tokens` increased by the correct pack amount after purchase.

If NOT updated:
1. Check Stripe dashboard — did payment succeed?
2. Check Vercel logs for `/api/stripe/webhook` — did the event fire?
3. Check webhook signature — is `STRIPE_WEBHOOK_SECRET` correct in Vercel env?
4. Manually trigger the webhook from Stripe dashboard → resend event.

### 5. Full Shop QA Checklist
```
[ ] /shop page loads without errors
[ ] All token packs display with correct name, price, description
[ ] "Buy now" / checkout button opens Stripe payment page
[ ] Test purchase with card 4242 4242 4242 4242 succeeds
[ ] Webhook fires — check Stripe dashboard → Webhooks
[ ] Supabase users.broski_tokens updated correctly
[ ] User sees updated token balance in Navbar / Dashboard
[ ] Shop page is gated correctly (logged-in users only, or accessible?)
```

### 6. Handle a Refund + Token Deduction
```bash
# Step 1 — Refund in Stripe
stripe refunds create --payment-intent=pi_XXXXX

# Step 2 — Deduct tokens in Supabase
# SQL in Supabase editor:
UPDATE users
SET broski_tokens = broski_tokens - 500
WHERE email = 'user@example.com';
```
✅ Confirm: Stripe shows refund. Supabase shows corrected token balance.

### 7. Add a Non-Token Shop Item (e.g. Course Access, Merch)
- Create product in Stripe as normal
- Add fulfillment logic to webhook handler: check `metadata.type` to know what to grant
- Update Supabase schema if needed (e.g. `users.has_elite_access = true`)
- Update shop page UI to show the new item

---

## ⚠️ Guardrails
- NEVER manually edit `broski_tokens` without logging why (add a comment in Supabase or Discord)
- NEVER change a Stripe price ID without updating the shop page payment link too
- ALWAYS test the full flow in Stripe test mode before going live
- NEVER remove a product from Stripe if users have active subscriptions or pending refunds
- ALWAYS confirm webhook is firing BEFORE assuming a purchase failed
- Payment link URLs MUST match the correct Stripe price — double-check after any price update

---

## ✅ Success Checks
- [ ] Shop page loads and shows all packs correctly
- [ ] Stripe checkout works with test card 4242 4242 4242 4242
- [ ] Webhook fires and tokens are credited in Supabase
- [ ] Token balance shows in Navbar after purchase
- [ ] Refund flow works cleanly
- [ ] No broken links or wrong prices on /shop

---

## 🔗 Key Links
- Live shop: https://hyper-vibe-coding-course.vercel.app/shop
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs — Agents: https://docs.stripe.com/agents
- Supabase project: https://supabase.com/dashboard/project/yhtmuibgdnxhbgboajhc
- Vercel Dashboard: https://vercel.com/bro-skis/hyper-vibe-coding-course
- GitHub repo: https://github.com/welshDog/Hyper-Vibe-Coding-Course
