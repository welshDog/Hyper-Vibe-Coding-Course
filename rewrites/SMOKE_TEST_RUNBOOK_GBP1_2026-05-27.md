# 🧪 £1 SMOKE TEST RUNBOOK (TEST → LIVE)
**Created:** May 27, 2026 · **Owner:** @welshDog  
**Purpose:** Prove the revenue loop is real: Stripe payment → webhook v39 → Supabase rows → access granted → refund revokes.

> Run TEST first (safe). Then do LIVE £1 (proof).

---

## ⚠️ #1 GOTCHA — Read This First

Webhook maps Stripe checkout email → `users.email`.

- Use the **same email** you are logged in with.
- Different email = webhook can’t find user = looks broken.

---

## 0 — Pre-flight (2 minutes)

- [ ] Confirm which environment you’re testing:
  - [ ] TEST (Stripe test mode)
  - [ ] LIVE (Stripe live mode)
- [ ] Supabase Edge Function `stripe-webhook` is on **v39** (ACTIVE)
- [ ] Stripe Dashboard → Developers → Webhooks:
  - [ ] Endpoint points at `stripe-webhook`
  - [ ] Events include `checkout.session.completed`
  - [ ] Events include `charge.refunded` (for refund test)

---

## 1 — TEST MODE REHEARSAL (safe proof)

Goal: prove logic path works before risking live money.

### 1A) Do a test purchase

1. Log into the app (test user).
2. Buy the cheapest paid thing you have in TEST mode.
3. Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any
   - Postcode: any
   - Email: must match your logged-in email

### 1B) Confirm webhook delivery

- Stripe Dashboard → Events → open `checkout.session.completed`
- Confirm webhook delivery succeeded (2xx).

### 1C) Confirm DB rows exist

```sql
select * from enrollments order by created_at desc limit 5;
select * from token_transactions order by created_at desc limit 10;
```

Pass signal:
- Fresh row in `enrollments`
- Fresh row in `token_transactions` (if that path awards tokens)

---

## 2 — LIVE £1 SMOKE TEST (real proof)

Goal: prove real money can land, grant access, and record rows.

### 2A) Ensure a £1 path exists

Use an existing £1 smoke path if it exists (best).  
If not, create a temporary £1 checkout path (short-lived):

- A dedicated £1 Payment Link, or
- A coupon / promo code that brings a tier to ~£1, or
- A temporary £1 price in Stripe (delete after proof).

Keep the scope tiny:
- 1 purchase
- 1 refund
- proof captured in Supabase rows

### 2B) Do the live purchase

1. Switch Stripe Dashboard to LIVE mode.
2. Purchase using the £1 path.
3. Confirm Stripe Checkout email matches your logged-in email.

### 2C) Confirm webhook delivery + DB rows

Stripe:
- Stripe Dashboard → Events → `checkout.session.completed` → delivery succeeded

Supabase:
```sql
select * from enrollments order by created_at desc limit 5;
select * from token_transactions order by created_at desc limit 10;
```

Pass signal:
- Fresh row in both tables after the live purchase

---

## 3 — REFUND TEST (revocation proof)

Goal: prove refund flips access off.

1. Stripe Dashboard → Payments → find the £1 payment → Refund.
2. Confirm Stripe event `charge.refunded` exists and delivered to webhook.

Then verify:

```sql
select status
from enrollments
order by created_at desc
limit 5;
```

Pass signal:
- Newest relevant enrollment shows `revoked` (or your chosen revoke status)

---

## 4 — Failure Map (fast diagnosis)

### No rows in Supabase
- Wrong email at checkout (most common).
- Webhook not pointing at the function (or wrong mode).
- Webhook secret mismatch (signature invalid).

### Enrollments row exists, but tokens missing
- Token award logic didn’t run for that checkout type.
- The webhook handled enrollment but skipped token grant.

### Refund doesn’t revoke
- `charge.refunded` not subscribed.
- Refund handler not implemented for that checkout type.
- Enrollment revoke status mismatch.

---

## 🔗 Related Files

- [`rewrites/PAY_TEST_RUNBOOK.md`](./PAY_TEST_RUNBOOK.md)
- [`NEXT_SESSION_HANDOVER_2026-05-27.md`](../NEXT_SESSION_HANDOVER_2026-05-27.md)
- [`rewrites/SESSION_STATUS_REPORT_2026-05-27.md`](./SESSION_STATUS_REPORT_2026-05-27.md)

