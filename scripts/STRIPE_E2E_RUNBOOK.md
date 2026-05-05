# 🧪 Stripe E2E Test Runbook

> **Purpose:** verify the full purchase loop — `stripe trigger` → Supabase Edge Function `stripe-webhook` → enrollment row in DB.
>
> **Architecture:** payments are wired Stripe → `vibe-hook` (Stripe Dashboard webhook) → `https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook` → Supabase tables.

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

## Path B — Live deployed edge function (use sparingly)

Only when you need to confirm the **deployed** function's behaviour on production.

### Pre-req

A **test-mode** webhook endpoint must be registered in Stripe Dashboard pointing at:
```
https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook
```

If `vibe-hook` is your live-mode webhook, add a separate test-mode one and copy its signing secret to a Supabase secret called `STRIPE_WEBHOOK_SECRET_TEST` (function must check both — confirm in `index.ts`).

### Fire the trigger

```powershell
stripe trigger checkout.session.completed `
  --api-key sk_test_... `
  --add checkout_session:client_reference_id=COURSE_UUID `
  --add checkout_session:customer_details.email=test+e2e@hyper-vibe.dev
```

### Watch the function logs

```powershell
supabase functions logs stripe-webhook --tail
```

Look for the event_id and the `[200 OK]` response. Then run the same DB queries as Path A.

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
| `enrollments` row appears | Course flow complete ✅ |
| `pending_enrollments` row appears | Buyer not yet registered (expected for new emails) |
| Function returns `400` | Bad signature — check `STRIPE_WEBHOOK_SECRET` matches the listen secret |
| Function returns `500` | Real bug — read `supabase functions logs stripe-webhook --tail` |

---

*Last updated: May 5, 2026*
