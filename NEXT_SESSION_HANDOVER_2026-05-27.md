# NEXT_SESSION_HANDOVER — 2026-05-27
> Single source of truth for the next AI session. Read this FIRST.
> Last updated: 01:38 BST

---

## ✅ What Was Done This Session (May 27, 01:00–01:38 BST)

### 1. `stripe/products.config.ts` — Updated ✅
- Old 3-tier config replaced with **Option A 5-tier stack**
- All product IDs + price IDs confirmed live from Stripe dashboard
- Commit: `d0ee7124d91d387964429da7a89c1ad885491531`

### 2. `.env.example` — Updated ✅
- Added all 8 Stripe price ID placeholders
- Added `DISCORD_BOT_TOKEN`, `DISCORD_SERVER_ID`, `DISCORD_VERIFIED_ROLE_ID`
- Commit: `6de4ddc13f9c158cf9222e21a452208b8833a047`

### 3. Vercel — Checked ✅
- Project: `hyper-vibe-coding-course` — **READY** 🟢
- Framework: Vite ✅ | Node: 24.x
- Live: https://hyper-vibe-coding-course.vercel.app
- Error rate: 0% in last 6h
- Production checklist: 4/5 (one optional Vercel feature pending)
- Env vars including `DISCORD_BOT_TOKEN` added manually by Lyndz ✅

### 4. `stripe-webhook` — Redeployed x2 ✅

#### v38 (01:23 BST)
- Replaced dead old 3-tier price IDs with all 8 live Option A IDs
- Added monthly plan + subscription event handling

#### v39 (01:36 BST) — CURRENT
- ✅ Fixed `enrollments.status` — now explicitly writes `'active'` (was missing → silent fail)
- ✅ Fixed `enrollments.user_email` — now written for debugging
- ✅ `enrollUser()` now takes `email` param and passes it through
- Function ID: `7c71a1e4-c2b7-47ad-b114-3c52dbe658ae` | Version: **39** | Status: **ACTIVE**

### 5. DB Schema Verified ✅
- `users_subscription_tier_check` accepts: `free | pro | hyper | starter | builder | hyper_legend` ✅
- `users_subscription_status_check` accepts: `inactive | active | cancelled | past_due` ✅
- `token_transactions` columns: `id, user_id, amount, reason, stripe_payment_intent_id, source_id, created_at` ✅
- `enrollments` columns: `id, user_id, user_email, course_id, status, created_at, progress_percentage` ✅
- RLS: `enrollments` has `service_role INSERT` policy ✅
- RLS: `token_transactions` — service role bypasses RLS ✅

### 6. Session Docs Pushed ✅
- `rewrites/SESSION_STATUS_REPORT_2026-05-27.md`
- Commit: `fb437fdbc8e592cce840f1a51977906fb3671d32`

---

## 💳 Live Stripe Tier Map (confirmed)

| Tier | One-Time Price ID | Amount | Monthly Price ID | Amount | Tokens |
|---|---|---|---|---|---|
| 🌱 Starter | `price_1TbUiz2LoEeIEPVE51tuHofX` | £29 | — | — | 100 |
| ⚡ Pro | `price_1TbUjB2LoEeIEPVEa3AEQywy` | £49 | — | — | 300 |
| 🔥 Builder | `price_1TbUjN2LoEeIEPVEEyy4FxrL` | £97 | `price_1TbUjT2LoEeIEPVECfWtHePf` | £12/mo | 800 |
| 🏛️ Architect | `price_1TbUjf2LoEeIEPVEyHtcTurh` | £167 | `price_1TbUjl2LoEeIEPVEKKa17fza` | £18/mo | 1500 |
| ⚛️ Hyper Legend | `price_1TbUjw2LoEeIEPVEIU4LKdZp` | £247 | `price_1TbUk22LoEeIEPVEB6hpSFZt` | £25/mo | 2500 |

---

## 🔴 Next Session Priorities

| Priority | Task | Status |
|---|---|---|
| 🔴 1 | **£1 smoke test** — buy, check `enrollments` + `token_transactions` rows | 🔜 Do first |
| 🔴 2 | Wire `CatchStragglers.jsx` into Mission Control main panel | 🔜 Todo |
| 🔴 3 | `mc_events` event sourcing migration (Supabase) | 🔜 Todo |
| 🟡 4 | Register `catch_stragglers` router in FastAPI `main.py` | 🔜 Todo |
| 🟡 5 | Verify Sprint 4 — `useAnonymousProgress` + `migrateAnonProgress` | 🔜 Todo |

---

## 🧪 Smoke Test Instructions (run after £1 purchase)
```sql
-- Confirm enrollment was created
select * from enrollments order by created_at desc limit 5;

-- Confirm tokens were awarded
select * from token_transactions order by created_at desc limit 10;
```
Both should have a fresh row. If yes — **revenue switch is ON** 🟢

Then run refund in Stripe and confirm:
```sql
select status from enrollments where user_id = '<your-user-id>';
-- should return 'revoked'
```

---

## 🔍 Where Truth Lives
- `WHATS_DONE.md` — full build history
- `AGENT-START.md` — boot file
- `stripe/products.config.ts` — live tier + price config
- `rewrites/SESSION_STATUS_REPORT_2026-05-27.md` — this session’s full report

## ⚡ Run (Local)
```
cd frontend && cp .env.example .env && npm install && npm run dev:frontend
```
- Live: https://hyper-vibe-coding-course.vercel.app

## 🔒 Security
- Real price IDs in `.env` locally — never committed
- `DISCORD_BOT_TOKEN` in Vercel env vars + local `.env` only
- Webhook secrets in Supabase Edge Function secrets only
- `stripe-webhook` has `verify_jwt: false` (correct — Stripe signs its own payloads)
