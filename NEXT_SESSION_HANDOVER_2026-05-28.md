# NEXT_SESSION_HANDOVER — 2026-05-28
> Single source of truth for the next AI session. Read this FIRST.
> Last updated: 2026-05-28

---

## ✅ Stripe Webhook — Unblocked (PROVEN)

### Proof
- Stripe CLI forwarding now returns `POST 200` to Supabase `stripe-webhook`.
- Supabase Edge Function `stripe-webhook` is ACTIVE with `verify_jwt=false`.

### What was fixed
- **JWT gate removed:** `stripe-webhook` deployed with `--no-verify-jwt` so Stripe/CLI can call it.
- **Deno signature verify fixed:** switched to `Stripe.createSubtleCryptoProvider()` + `constructEventAsync(...)` (Deno/WebCrypto compatible).

### New “no-ghost” logging
- Fixture / unknown priceId / unknown user cases are logged to `payments` with:
  - `status='unmatched'`
  - `stripe_session_id = evt_...` (idempotent)
- This replaces unsafe “dead-letter” inserts into `token_transactions` (that table requires a real `user_id` FK).

---

## 🔜 Next Objective: Real Checkout Smoke Test (DB side-effects)

Goal: prove end-to-end chain: Stripe checkout → webhook → `users.broski_tokens` + `token_transactions` + `enrollments`.

Minimum proof queries:
```sql
select id, email, broski_tokens, subscription_tier from users order by created_at desc;
select id, user_id, amount, reason, source_id, created_at from token_transactions where source_id like 'evt_%' order by created_at desc limit 10;
select id, user_id, course_id, status, created_at from enrollments order by created_at desc limit 10;
select id, user_email, amount_pence, stripe_session_id, status, created_at from payments order by created_at desc limit 10;
```

---

## 🧠 Operational Rules (don’t re-break this)

- `401` from webhook calls = `verify_jwt` accidentally enabled again.
- Dashboard endpoint signing secret ≠ Stripe CLI listen signing secret.
- Fixture triggers often won’t match real `PRICE_TO_TIER` mapping; `payments.status='unmatched'` is expected and still counts as delivery proof.

