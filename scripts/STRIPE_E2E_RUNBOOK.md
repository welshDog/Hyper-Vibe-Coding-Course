# 🧪 Stripe E2E Test Runbook

> **Purpose:** verify the full purchase loop — Stripe event or Dashboard resend → Supabase Edge Function `stripe-webhook` → expected DB effect.
>
> **Architecture:** payments are wired Stripe → configured Stripe webhook endpoint → `https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/stripe-webhook` → Supabase tables.

---

## 🛡️ Safety check (do this first, every time)

```powershell
# Confirm Stripe CLI auth and mode
stripe config --list | Select-String 'mode|account'
```

⚠️ **NEVER run `stripe trigger` while only logged in to live mode** — fire test events only. Switch with:

```powershell
# Use a test-mode key for this session
$env:STRIPE_API_KEY = 'sk_test_...'   # paste your test secret key
```

Or pass `--api-key sk_test_...` to every `stripe` call.

---

## Path A — Local edge function (RECOMMENDED for dev)

Best for fast feedback. Runs the function locally with the test webhook signing secret.

### Terminal 1 — serve the function locally

```powershell
supabase functions serve stripe-webhook --no-verify-jwt --env-file .env.local
```

> Requires `.env.local` with `STRIPE_SECRET_KEY` (test) + `STRIPE_WEBHOOK_SECRET` (placeholder, will be overwritten in T2).

### Terminal 2 — forward Stripe events to localhost

```powershell
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

Stripe CLI prints `whsec_...` — **copy that into `.env.local` as `STRIPE_WEBHOOK_SECRET`** and restart Terminal 1.

### Terminal 3 — fire a test course enrollment

```powershell
# Replace COURSE_UUID with a real id from the courses table
stripe trigger checkout.session.completed `
  --add checkout_session:client_reference_id=COURSE_UUID `
  --add checkout_session:customer_details.email=test+e2e@hyper-vibe.dev
```

Watch Terminal 1 for `[200 OK]` and Terminal 2 for the forward log.

### Verify in DB

```sql
-- Did enrollment land?
SELECT id, user_id, course_id, created_at
FROM enrollments
WHERE created_at > now() - interval '5 minutes'
ORDER BY created_at DESC;

-- Or for an unregistered email — pending enrollment:
SELECT email, course_id, created_at
FROM pending_enrollments
WHERE email = 'test+e2e@hyper-vibe.dev'
ORDER BY created_at DESC;
```

---

## Path B — Live deployed edge function via Dashboard resend (recommended)

Best for the production proof because it exercises the actual configured Stripe
endpoint, its signing secret, the deployed Supabase function, and the live
database effect together.

### Pre-flight

- Confirm the Stripe test-mode webhook endpoint points at:
  `https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/stripe-webhook`
- Confirm the Supabase project is `tlavrxiaegbtyfmjfdcz`.
- Open the Stripe Dashboard event that you want to resend.
- Prefer an already-successfully-processed test event from the last 15 days so
  the expected safe result is a 2xx plus an idempotent skip or equivalent dedup.

### Resend the event

1. In Stripe Dashboard, open the chosen **test-mode** event.
2. Click **Resend** for the `stripe-webhook` endpoint.
3. Watch for a `2xx` delivery result in Stripe.

### Watch the function logs

```powershell
supabase functions logs stripe-webhook --tail
```

Look for the event id and a `2xx` response. For a replayed event, a successful
idempotent result such as `skipped: true` is a pass.

### Verify in DB

Use the narrowest query that matches the replayed event's expected effect:

```sql
-- Existing processed payment should stay deduped by source_id
SELECT id, user_id, amount, reason, source_id, created_at
FROM token_transactions
WHERE source_id = '<stripe_event_id>';
```

```sql
-- Course access should already exist or remain unchanged
SELECT id, user_id, course_id, status, created_at
FROM enrollments
WHERE user_id = '<expected_user_id>'
ORDER BY created_at DESC;
```

```sql
-- Unmatched payment logging path, if applicable
SELECT id, user_email, stripe_session_id, status, created_at
FROM payments
WHERE stripe_session_id = '<stripe_event_id>';
```

---

## 📋 Pre-flight checklist (paste before running)

- [ ] Stripe CLI authenticated (`stripe config --list`)
- [ ] In **test mode** (api key starts `sk_test_`)
- [ ] Got a real course UUID from `SELECT id, slug FROM courses LIMIT 1;`
- [ ] Test email is **not** an existing user (or use `+e2e` alias)
- [ ] Supabase logs tail open (Path B only)
- [ ] Local function serving + listen secret synced (Path A only)

---

## 🔥 Token-pack purchase variant

Same flow, different metadata:

```powershell
stripe trigger checkout.session.completed `
  --add checkout_session:metadata.token_amount=200 `
  --add checkout_session:customer_details.email=test+tokens@hyper-vibe.dev
```

Verify:
```sql
SELECT user_id, amount, source, created_at
FROM token_transactions
WHERE created_at > now() - interval '5 minutes'
ORDER BY created_at DESC;
```

---

## 🧹 Cleanup

```sql
-- Optional — remove test rows
DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test+e2e%');
DELETE FROM pending_enrollments WHERE email LIKE 'test+e2e%';
DELETE FROM token_transactions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test+tokens%');
DELETE FROM auth.users WHERE email LIKE 'test+%@hyper-vibe.dev';
```

---

## 🚦 Pass/fail signals

| Signal | Meaning |
|---|---|
| Function returns `200` | Signature verified, event accepted |
| Function returns `200` + `skipped: true` | Replay hit dedup path safely |
| `enrollments` row appears | Course flow complete ✅ |
| `pending_enrollments` row appears | Buyer not yet registered (expected for new emails) |
| Function returns `400` | Bad signature — check `STRIPE_WEBHOOK_SECRET` matches the listen secret |
| Function returns `500` | Real bug — read `supabase functions logs stripe-webhook --tail` |

---

*Last updated: May 5, 2026*
