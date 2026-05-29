# NEXT_SESSION_HANDOVER — 2026-05-29
> Single source of truth for the next AI session. Read this FIRST.
> Last updated: 2026-05-29

---

## ✅ What Changed Since May 28

### 1) Pricing no longer dead-ends (Payment Link → Checkout Session fallback) ✅

If a Stripe Payment Link env var is missing, Pricing now falls back to creating a Stripe Checkout Session via HyperCode and redirects the buyer.

**Files**
- `frontend/src/pages/Pricing.tsx`
- `frontend/src/lib/stripe-price-ids.ts` (new: tier → Stripe `price_...` IDs)

**Behavior**
- If `VITE_STRIPE_*_URL` exists → redirect to Stripe Payment Link (unchanged)
- If missing:
  - Logged-in user → calls HyperCode `POST /api/stripe/checkout` and redirects to returned `checkout_url`
  - Logged-out user → shows: “Log in to checkout — your purchase needs to link to your account.”
- Monthly selected but monthly link missing → auto-switch to one-time so checkout still works

**Verification (already run)**
- `npm run lint` (PASS; warnings only, pre-existing)
- `npm run build` (PASS)

---

## 🔴 Current P0 Objective: Prove Revenue Loop End-to-End

Goal: real buyer flow works:

Pricing → Stripe checkout → webhook → DB side-effects:
- `users.subscription_tier` / `subscription_status`
- `token_transactions`
- `enrollments`

### Step A (DONE) ✅
- Pricing hybrid fallback implemented (see above)

### Step B (NEXT) 🔜
- Verify Stripe webhook signing secret alignment for TEST mode
- Then do the £1 (or Starter tier) smoke purchase

---

## 🧪 Quick Proof Checklist (next session)

### 1) Force the fallback path
- Temporarily remove one Payment Link env var (or test in an env where it’s missing)
- Log in
- `/pricing` → click a tier CTA
- Expected: redirect via HyperCode-created Checkout Session (not Payment Link)

### 2) Confirm webhook chain

Run queries after the purchase:

```sql
select id, email, broski_tokens, subscription_tier, subscription_status from users order by created_at desc;
select id, user_id, amount, reason, source_id, created_at from token_transactions order by created_at desc limit 10;
select id, user_id, course_id, status, created_at from enrollments order by created_at desc limit 10;
select id, user_email, amount_pence, stripe_session_id, status, created_at from payments order by created_at desc limit 10;
```

---

## 🔍 Where Truth Lives

- `DASHBOARD_STATUS_2026-05-27.md` (ecosystem blockers list)
- `frontend/src/pages/Pricing.tsx` (current checkout entrypoint)
- `frontend/src/lib/payments.ts` (HyperCode checkout client)
- `frontend/src/lib/stripe-price-ids.ts` (tier price IDs used by fallback)

---

## ✅ Stripe Webhook Proof Chain (Keep This)

### What was proven previously

- Stripe events can reach Supabase Edge Function `stripe-webhook`
- `stripe-webhook` must run with `verify_jwt=false`
- Signature verification must use Deno-compatible verification (`constructEventAsync` with SubtleCrypto provider)

### Operational rules (don’t re-break this)

- Stripe CLI `trigger` emits TEST-mode events
- Webhook delivery only verifies if `STRIPE_WEBHOOK_SECRET` matches the signing secret for the endpoint that received the event
- Stripe Dashboard endpoint signing secret ≠ Stripe CLI listen signing secret

### Minimum proof queries

```sql
select id, email, broski_tokens, subscription_tier from users order by created_at desc;
select id, user_id, amount, reason, source_id, created_at from token_transactions where source_id like 'evt_%' order by created_at desc limit 10;
select id, user_id, course_id, status, created_at from enrollments order by created_at desc limit 10;
select id, user_email, amount_pence, stripe_session_id, status, created_at from payments order by created_at desc limit 10;
```
