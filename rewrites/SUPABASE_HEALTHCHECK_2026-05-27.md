# Supabase Healthcheck — 2026-05-27

Project: `yhtmuibgdnxhbgboajhc`  
API URL: `https://yhtmuibgdnxhbgboajhc.supabase.co`

Goal: confirm the platform is alive (DB/Auth/Edge) and surface any real warnings.

---

## ✅ Database

- DB reachable via SQL.
- Postgres version: 17.6
- Key tables present + RLS enabled:
  - `users`, `enrollments`, `payments`, `token_transactions`, `courses`
  - `mc_missions`, `mc_events`

---

## ✅ API

Recent API health calls are returning 200:
- `GET /auth/v1/health` → 200
- `HEAD /rest-admin/v1/ready` → 200

---

## ✅ Auth

Auth is working for email/password login:
- `POST /token` returning 200 (observed)

Warnings seen:
- Deprecation notices:
  - `GOTRUE_JWT_ADMIN_GROUP_NAME` not supported
  - `GOTRUE_JWT_DEFAULT_GROUP_NAME` not supported

Action:
- If these are configured anywhere in your Supabase Auth settings or deployment config, remove them to avoid future breakage.

---

## ⚠️ Edge Functions

### Inventory (ACTIVE)
- `stripe-webhook` (verify_jwt=false) — version 40
- `shop-purchase` (verify_jwt=true) — version 31
- `course-profile` (verify_jwt=true) — version 29
- `sync-tokens-to-v24` (verify_jwt=false) — version 26
- `token-sync-to-v24` (verify_jwt=true) — version 23
- `mint-pet-auth` (verify_jwt=true) — version 13
- `get-pet-balance` (verify_jwt=true) — version 8
- `mint-pet-confirm` (verify_jwt=true) — version 9
- `truth-report` (verify_jwt=false) — version 7
- `pet-evolve-check` (verify_jwt=true) — version 4

### stripe-webhook errors (observed)
Recent requests show multiple:
- `POST /functions/v1/stripe-webhook` → 400

Most likely causes:
- Stripe webhook signing secret mismatch (`STRIPE_WEBHOOK_SECRET`)
- Missing/incorrect `stripe-signature` header (if called manually)

Fast proof:
- Trigger a Stripe test webhook event from Stripe dashboard and check:
  - Edge function logs include the “signature invalid” line (if mismatch)
  - Or a 200 with “received: true” (if good)

---

## ✅ Advisors (summary)

Run separately as a remediation plan:
- `rewrites/SUPABASE_ADVISOR_FIX_PLAN_2026-05-27.md`

