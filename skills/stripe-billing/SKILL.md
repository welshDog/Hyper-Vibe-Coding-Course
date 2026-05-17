---
name: stripe-billing
description: Handle all Stripe payment tasks for the Hyper-Vibe Coding Course — products, pricing, payment links, subscriptions, webhooks, and BROski$ token pack purchases.
triggers:
  - "stripe"
  - "payment"
  - "billing"
  - "token pack"
  - "checkout"
  - "subscription"
  - "webhook"
  - "refund"
  - "price"
  - "product"
metadata:
  platform: Stripe
  project: hyper-vibe-coding-course
  mode: live + test
  test_card: 4242 4242 4242 4242
  webhook_path: /api/stripe/webhook
  currency: GBP
---

# 💳 Skill: stripe-billing

## Purpose
Handle all Stripe tasks for the Hyper-Vibe platform — from creating products and pricing to testing webhooks, handling refunds, and managing the BROski$ token economy.

## When to Use
- Creating or updating a token pack product (Starter, Builder, Hyper)
- Testing the checkout flow end-to-end
- Debugging a failed webhook or missing payment
- Adding a new pricing tier or course subscription
- Checking if a payment went through
- Issuing a refund

---

## 📋 Step-by-Step Workflow

### 1. Create a New Product + Price
```bash
# Via Stripe Dashboard:
# Products → Add Product → Set name, price, currency (GBP)
# Or via CLI:
stripe products create --name="Starter Pack" --description="500 BROski$ tokens"
stripe prices create \
  --product=prod_XXXXX \
  --unit-amount=499 \
  --currency=gbp
```
✅ Confirm: Product appears in Stripe dashboard with correct price.

### 2. Create a Payment Link
```bash
# Via Dashboard: Payment Links → New → Select product + price
# Or via CLI:
stripe payment_links create \
  --line-items[0][price]=price_XXXXX \
  --line-items[0][quantity]=1
```
✅ Confirm: Payment link loads and shows correct product + price.

### 3. Test Checkout End-to-End
```bash
# Use test card:
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
# Postcode: Any valid UK postcode
```
✅ Confirm: Payment succeeds → webhook fires → BROski$ tokens added to user account in Supabase.

### 4. Listen to Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
✅ Confirm: Events appear in terminal. `checkout.session.completed` fires on successful payment.

### 5. Check Webhook in Production
- Go to: Stripe Dashboard → Developers → Webhooks
- Check the endpoint: `https://hyper-vibe-coding-course.vercel.app/api/stripe/webhook`
- Look for failed events → Resend if needed

### 6. Issue a Refund
```bash
# Via Dashboard: Payments → Find payment → Refund
# Or via CLI:
stripe refunds create --payment-intent=pi_XXXXX
```
✅ Confirm: Refund appears in dashboard. If tokens were granted, manually deduct from Supabase `users.broski_tokens`.

### 7. BROski$ Token Pack Structure
| Pack | Tokens | Price (GBP) | Stripe Product |
|---|---|---|---|
| Starter | 500 | £4.99 | prod_starter |
| Builder | 1,500 | £9.99 | prod_builder |
| Hyper | 5,000 | £24.99 | prod_hyper |

---

## ⚠️ Guardrails
- NEVER add rate limiting to `/api/stripe/webhook` — Stripe requires unrestricted access
- NEVER hardcode Stripe secret keys — use env vars only (`STRIPE_SECRET_KEY`)
- ALWAYS verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- NEVER test with real cards in dev — use test mode + test card only
- ALWAYS check both Stripe dashboard AND Supabase DB to confirm token credit
- Webhook path is `/api/stripe/webhook` — never change without updating Stripe dashboard

---

## ✅ Success Checks
- [ ] Test checkout completes with card 4242 4242 4242 4242
- [ ] `checkout.session.completed` webhook fires
- [ ] User `broski_tokens` column updated in Supabase `users` table
- [ ] Payment appears in Stripe dashboard under Payments
- [ ] No errors in Vercel function logs for the webhook route
- [ ] Refund flow works without crashing

---

## 🔗 Key Links
- Stripe Dashboard: https://dashboard.stripe.com
- Webhook endpoint: https://hyper-vibe-coding-course.vercel.app/api/stripe/webhook
- Stripe Docs — Agents: https://docs.stripe.com/agents
- Stripe Docs — Billing Workflows: https://docs.stripe.com/agents-billing-workflows
- Supabase project: https://supabase.com/dashboard/project/yhtmuibgdnxhbgboajhc
