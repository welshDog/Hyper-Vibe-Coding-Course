# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 24, 2026** — update this every session.

---

## 🎯 MAY 24 AFTERNOON — JWT AUTH MIDDLEWARE + v0.6.0 ✅

### 🔒 requireAdmin Middleware LIVE (commit `6f3f706`)
- **`server/middleware/requireAdmin.js`** — Bearer JWT in → `supabase.auth.getUser()` signature check → `users.role` lookup → `req.user` attached
- **`/api/send-dm`** now protected. CORS-only era over.
- **Error shapes:** 401 (no/expired JWT), 403 (not admin role), 500 (DB error) — all documented
- **`emitEvent()` helper** — all `mc_events` inserts flow through one function. Defaults actor to `req.user.email`; supports `'system'` for autonomous events. Logs but never throws (audit failure must never fail the user action)
- **`/api/send-dm` now writes both:** `mc_missions` (Kanban card, owner stamped) + `mc_events` (`straggler.dm_sent` with structured payload)
- **🐛 TDZ bug fixed:** `const DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN || …` was a ReferenceError on first boot — caught + fixed
- **Client:** `sendStragglerDM` fetches `auth.getSession()` + attaches `Authorization: Bearer …`. Clean 401/403/429 error surfaces in UI.
- **Build:** 23.30s green, +0.18 kB gzip ✅

### 🚨 New load-bearing rule added
- **`replace-all-near-const`** — scan for `const X = …` before replace_all on env-var renames. `node --check` does NOT catch TDZ. Always pair with a real boot smoke.

### 🔓 What v0.6.0 unlocks
- **Grant Tokens** — auth + audit story solved. Now mostly UI + token-balance update RPC.
- **Refund** — same pattern + Stripe idempotency keys.
- **ActivityTicker v2** — drop `mc_missions` + `user_level_progress` proxy; subscribe to `mc_events` realtime directly.

### 🔴 Still Open (build order)
1. **Smoke test Catch Stragglers** — DISCORD_TOKEN + SUPABASE_SERVICE_ROLE_KEY in `.env.local`, `npm run dev:full` → Scan → Send. Confirms TDZ fix + middleware + spine together. 5-min human-only step.
2. **Build Grant Tokens** — requireAdmin + emitEvent(`tokens.granted`) + mc_missions row + token-balance RPC
3. **Rebuild ActivityTicker on mc_events** — drop proxy stream, subscribe to realtime publication
4. **Build Refund** — same pattern + Stripe idempotency keys
5. **Deploy MC to prod** — needs Render/Fly for Express backend (Vercel alone won't run `server/index.js`)
6. **Delete dead planning artifacts** from course repo: `api/routes/catch_stragglers.py` + `discord-bot/dm_sender.py` + `frontend/components/mission-control/CatchStragglers.jsx`

---

## 🎯 MAY 24 PM — mc_events SPINE + v0.5.0 ✅

### 🧠 mc_events — The Audit + Activity Spine (LIVE)
- **Migration:** `mc_events_and_missions_schema_bump` applied via Supabase MCP to `yhtmuibgdnxhbgboajhc`
- **Verified:** all 6 invariants true — table, columns, indexes, triggers, RLS, realtime
- **MC repo commits:** `9dbd95a` (SQL) + `45c2ceb` (v0.5.0 bump + CHANGELOG)
- Append-only, immutable via triggers. No INSERT policy — only service_role writes. Realtime publication added.
- **mc_missions** schema bumped: `owner text` + `priority text` CHECK `p0..p3`. Existing 21+ rows survive.

---

## 🎯 MAY 24 AM — VERCEL BUILD RESCUE + MISSION CONTROL EASTER EGG ✅

- **11 broken Vercel deploys fixed** — `@supabase/ssr` → `@supabase/supabase-js` in `client.ts`. Commit `743bf57`.
- **Footer easter egg** — `weird` → stealth link to `/admin/mission-control`. Commit `1fd71d9`.
- **`/admin/mission-control` launchpad** — no longer 404s. Commit `cb21de9`. Launchpad only — NOT a duplicate operator UI.
- **Handover v2** — Claude's 3 corrections + 3 missing items + refined build order. Commit `8c18bf0`.

---

## 🎯 MAY 23 — CATCH STRAGGLERS + NOTEBOOKLM SYNC SESSION ✅

- **Catch Stragglers FULLY BUILT** in MC repo (commits `00aa770` / `ceadad2` / `c5b36c2` / `583a2a1`)
  - Status: BUILT. Needs smoke test + prod deploy only — **do NOT rebuild**
- **Sprint 4** (anon → signup) — LIVE since May 19 (`a12ecd0`). Do NOT rebuild.

---

## 🧉 MAY 5 PM — DOC SYNC + STRIPE SCAFFOLD ✅
- `BUSINESS_PLAN.md` v1.1, `/pricing` copy fix, phantom preload nuked, dead asset deleted, STRIPE_E2E_RUNBOOK.md. Commit `eb5a26f`.

---

## 🗃️ MAY 4 — 4-REPO MASTER PLAN REFRESH ✅
- `HYPER_ECOSYSTEM_PLAN_MAY4.md` — BROskiPets-LLM-dNFT promoted to first-class.

---

## 🛒 MAY 3 — E2E SHOP-PURCHASE + SECURITY HEADERS + ONBOARDING ✅
- Shop purchase test script, Vercel security headers fix, `/welcome` hero page, Blockers B1-B3 resolved.

---

## 🏗️ THE 3 REPOS

| Repo | What it is | Where |
|---|---|---|
| HyperCode-V2.4 | Main platform — Docker, FastAPI, agents, infra | `H:\HyperStation zone\HyperCode\HyperCode-V2.4` |
| HyperAgent-SDK | TypeScript SDK — agent spec, CLI, templates | `H:\HyperAgent-SDK` |
| Hyper-Vibe-Coding-Course | Course frontend + Supabase + token shop | `H:\Hyper-Vibe-Coding-Course` |

> ⚠️ OLD path `H:\the hyper vibe coding hub` was the **archived typo repo** — do NOT use it

---

## ✅ BUILT AND WORKING

### Infrastructure
- 32/32 Docker containers — all healthy ✅
- Memory limits on ALL services — OOM cascades impossible ✅
- Socket-proxy split — read-only main + healer ✅

### Observability
- Prometheus 7/7 targets UP ✅ · Grafana `:3001` ✅ · OTLP Tempo ✅ · Loki + Promtail ✅

### Backend (FastAPI)
- Rate limiting — Redis DB 2, Stripe webhook exempt ✅
- Circuit breakers — 3 active: `llm-router`, `crew-orchestrator`, `stripe-api` ✅

### Stripe + Payments
- Full checkout → webhook → token award loop PROVED ✅
- Token grants: starter=200, builder=800, hyper=2500 ✅

### Supabase Edge Functions — ALL 4 DEPLOYED ✅
- `shop-purchase`, `course-profile`, `stripe-webhook`, `sync-tokens-to-v24` — project `yhtmuibgdnxhbgboajhc`

### Mission Control Hub — WelshDog-Mission-Control repo
- `mc_missions` table + RLS ✅
- `mc_events` append-only spine ✅ (v0.5.0)
- `requireAdmin` JWT middleware ✅ (v0.6.0)
- `emitEvent()` helper ✅ (v0.6.0) — every audit action flows through one function
- Health Pulse, Morning Brief, Catch Stragglers ✅ (built, needs smoke + prod deploy)
- Running locally port 5174 — NOT yet deployed to prod
- Footer easter egg — `weird` → `/admin/mission-control` launchpad ✅

### Course Frontend
- Vibe Labs funnel live — 100/100 A11Y + BP ✅
- All 10 module rewrites ✅
- `useProgress` hook + `claim_level_reward` RPC ✅
- `frontend/src/lib/supabase/client.ts` — `@supabase/supabase-js` only (NOT `@supabase/ssr`) ✅

### HyperAgent-SDK
- Published: `@w3lshdog/hyper-agent@0.1.7` ✅

---

## 🔑 KEY FACTS (never re-look-up)

```
Start command:   docker compose -f docker-compose.yml -f docker-compose.secrets.yml up -d
AI backend:      docker compose --profile ai up -d
Tests:           pytest backend/tests -q  (223 passed, 6 skipped)
Redis DB split:  DB 1 = cache  |  DB 2 = rate limits
Stripe webhook:  ALWAYS rate-limit exempt
Supabase proj:   yhtmuibgdnxhbgboajhc
Course site:     https://hyper-vibe-coding-course.vercel.app
Mission Control: Local port 5174 — NOT yet deployed to prod
Discord bot:     DISCORD_BOT_TOKEN in .env only — never commit
Supabase client: ALWAYS use @supabase/supabase-js — @supabase/ssr is NOT installed
Catch Stragglers: BUILT in MC repo — do NOT rebuild. Smoke test only.
Grant Tokens:    NOT built — budget full build time (enabled:false tile)
Refund:          NOT built — budget full build time (enabled:false tile)
TDZ rule:        scan for const X = ... before replace_all on env-var renames. node --check won't catch it.
```
