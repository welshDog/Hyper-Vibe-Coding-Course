# Stripe Webhook Proof Chain (Stripe → Supabase) — Design

Date: 2026-05-28

## Goals

- Stop 401 responses from `stripe-webhook` so Stripe/Dashboard/CLI can call it.
- Verify Stripe signature correctly in Supabase Edge (Deno).
- Prove delivery independently of price/user matching.
- Capture unmatched events without violating DB constraints.
- Run a real checkout smoke test to prove tokens + enrollments side-effects.

## Non-Goals

- New tables or migrations.
- Building a full “payments admin UI”.
- Changing the product/price model.

## Current Observations (Verified)

- `stripe listen --forward-to ...` can show `POST 401` when the Edge Function requires JWT.
- `POST 400` with signature flags present indicates signature verification failure.
- After deploying with `--no-verify-jwt`, webhook calls can return `200`.
- Stripe CLI “fixture” events commonly use synthetic prices/emails and will not match real `PRICE_TO_TIER` mappings.

## Design

### 1) Public Webhook Endpoint

- Deploy `stripe-webhook` with `verify_jwt=false` via:
  - `supabase functions deploy stripe-webhook --no-verify-jwt`

Success condition:
- Stripe CLI and Stripe Dashboard can call the function without Authorization headers.

### 2) Deno-Compatible Signature Verification

- Use `Stripe.createSubtleCryptoProvider()`
- Verify with `await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider)`

Success condition:
- Correct secret + valid signature yields `200` and no `signature_verification_failed`.

### 3) Unmatched Event Logging (No DB Constraint Violations)

Problem:
- `token_transactions.user_id` is NOT NULL and FK constrained to `users.id`, so “dead-letter” rows with a dummy UUID are not reliable.

Solution:
- When a webhook cannot be mapped to a known user/known price mapping, insert into existing `payments` table:
  - `user_email` nullable
  - `user_id` nullable (FK uses `ON DELETE SET NULL`)
  - `stripe_session_id` unique (use `event.id` for idempotency)
  - `amount_pence` required (use 0 when unknown)
  - `status='unmatched'`

Success condition:
- After a fixture trigger, `payments` contains new rows with `status='unmatched'`.
- Webhook still returns `200`.

### 4) Real Checkout Smoke Test (End-to-End Proof)

Approach:
- Create a real Checkout Session using a real `price_...` from `PRICE_TO_TIER`.
- Set `customer_email` to an existing user in `public.users`.
- Set `client_reference_id` or `metadata.course_id` to a real `courses.id` (single course).

Success conditions:
- `users.broski_tokens` increases.
- `token_transactions` gets a new row with `source_id = evt_...`.
- `enrollments` upsert inserts a row for the chosen `course_id`.

## Runbook (Minimum Commands)

1. Deploy:
   - `supabase functions deploy stripe-webhook --no-verify-jwt`
2. Listen + forward:
   - `stripe listen --latest --forward-to https://<project>.supabase.co/functions/v1/stripe-webhook`
3. Fixture test (delivery proof):
   - `stripe trigger checkout.session.completed`
4. DB proof:
   - `select * from payments order by created_at desc limit 10;`
   - `select * from token_transactions where source_id like 'evt_%' order by created_at desc limit 10;`

