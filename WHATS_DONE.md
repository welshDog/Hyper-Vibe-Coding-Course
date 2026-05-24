# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 24, 2026** — update this every session.

---

## 🎯 MAY 24 PM — mc_events SPINE + v0.5.0 ✅

### 🧠 mc_events — The Audit + Activity Spine (LIVE)
- **Migration:** `mc_events_and_missions_schema_bump` applied via Supabase MCP to project `yhtmuibgdnxhbgboajhc`
- **Verified live:** all 6 invariants returned true — table, columns, indexes, triggers, RLS, realtime
- **MC repo commits:** `9dbd95a` (migration SQL) + `45c2ceb` (v0.5.0 bump + CHANGELOG)
- **Table:** `mc_events` — append-only, immutable via triggers (even service_role can't UPDATE/DELETE)
- **Security:** No INSERT policy — only Express server (service_role) writes events. Compromised browser can't fake audit rows.
- **Realtime:** `supabase_realtime` publication added — Live Activity feed gets free streaming
- **FK:** `mission_id` → `mc_missions(id)` ON DELETE SET NULL — deleting a mission never nukes its history

### 📊 mc_missions Schema Bump
- Added `owner text` (nullable, email-shaped)
- Added `priority text` CHECK constrained to `p0..p3` (nullable — existing 21+ rows survive untouched)
- Partial indexes on both columns — no waste on NULL rows

### 🔓 What mc_events unlocks
- **Live Activity v2** — `SELECT * FROM mc_events ORDER BY created_at DESC` + realtime subscribe. Pure UI work now.
- **Grant Tokens** — emits `tokens.granted` event with actor from JWT. Auditable forever.
- **Refund** — emits `refund.issued` event with Stripe idempotency key in payload.
- **Catch Stragglers audit upgrade** — structured `straggler.dm_sent` event (channel + tone + message hash + discord_message_id all queryable)
- **Missions Board owner/priority chips** — schema ready, just paint pixels.

### 🔴 Still Open (build order, in order)
1. **Server-side admin JWT auth on MC Express** — one middleware, unblocks Grant Tokens + Refund safely
2. **Catch Stragglers smoke test** — real DISCORD_TOKEN + service-role key, `npm run dev:full` → Scan → Send
3. **Deploy MC to prod** — needs Render/Fly for Express backend (Vercel alone won't run `server/index.js`). Sets `VITE_MISSION_CONTROL_URL` for real.
4. **Real signals in Health Pulse + Morning Brief** (persisted via mc_events)
5. **Build Grant Tokens** (needs mc_events + JWT auth)
6. **Build Refund** (same deps + Stripe idempotency keys)
7. **Add `SUPABASE_SERVICE_ROLE_KEY` to MC `.env.local`** if not already there
8. **Delete dead planning artifacts** from course repo: `api/routes/catch_stragglers.py` + `discord-bot/dm_sender.py` + `frontend/components/mission-control/CatchStragglers.jsx`

---

## 🎯 MAY 24 AM — VERCEL BUILD RESCUE + MISSION CONTROL EASTER EGG ✅

### 🔴 CRITICAL — Vercel Build Fixed (was broken for 11 deploys)
- **Root cause found:** `frontend/src/lib/supabase/client.ts` was importing `createBrowserClient` from `@supabase/ssr` — a Next.js SSR package that was never installed in this Vite SPA
- **Fix:** Replaced with `createClient` from `@supabase/supabase-js` (already installed, correct for Vite React)
- **Commit:** `743bf57` — production live again ✅
- **Rule added to load-bearing gotchas:** `@supabase/ssr` is NOT installed — use `@supabase/supabase-js` always

### 🥚 Footer Easter Egg — Stealth Mission Control Link
- The word **`weird`** in `© HyperFocus Z0ne · Keep it weird, keep it Welsh.` is now a stealth `<Link>` to `/admin/mission-control`
- Same colour as surrounding text, no underline, cyan on hover only
- **Commit:** `1fd71d9` — live on main ✅

### 🚀 `/admin/mission-control` Launchpad LIVE
- New page `frontend/src/pages/MissionControl.tsx` — hero · launch CTA · 4-panel card · "why it lives elsewhere" rationale
- Route wired in `App.tsx` inside `<AdminRoute role="admin" />`
- **Commit:** `cb21de9` — easter egg no longer 404s ✅
- **Decision:** `/admin/mission-control` is a launchpad, NOT a duplicate operator UI. MC lives in WelshDog-Mission-Control repo.

### 📝 Docs
- `rewrites/NEXT_SESSION_HANDOVER_2026-05-24.md` v2 pushed (commit `8c18bf0`) — includes Claude's 3 corrections + 3 missing items + refined build order

---

## 🎯 MAY 23 — CATCH STRAGGLERS + NOTEBOOKLM SYNC SESSION ✅

- **Catch Stragglers system — FULL BUILD pushed to MC repo (commits `00aa770` / `ceadad2` / `c5b36c2` / `583a2a1`)**
  - Detect idle students ✅ · Draft DMs ✅ · Edit tone ✅ · Approve/Skip/Snooze ✅ · Audit log to mc_missions ✅
  - Status: BUILT. Needs smoke test + prod deploy only — do NOT rebuild
- **AGENT-START.md v1.1 pushed** (commit `73f413`) — 9 audit fixes applied
- **Sprint 4 truth reconciled** — Sprint 4 (anon → signup) was already LIVE since **May 19 (`a12ecd0`)**

---

## 🧉 MAY 5 PM — DOC SYNC + STRIPE SCAFFOLD SESSION ✅

- **`BUSINESS_PLAN.md` → v1.1** — corrected pricing (Pro £9, Hyper £29); 12-month projections; Neurodivergent Hiring Pipeline section; Risks & Mitigations table
- **`/pricing` copy fix** — "Month-to-month, cancel anytime — no annual lock-in"
- **Phantom preload nuked** — `index.html` was preloading `/assets/hero-bg.webp` which never existed
- **Dead asset deleted** — `frontend/src/assets/hero.webp`
- **`scripts/STRIPE_E2E_RUNBOOK.md` created**
- **Commit:** `eb5a26f`

---

## 🗃️ MAY 4 — 4-REPO MASTER PLAN REFRESH ✅
- New canonical doc: **[HYPER_ECOSYSTEM_PLAN_MAY4.md](./HYPER_ECOSYSTEM_PLAN_MAY4.md)**
- 4th repo **BROskiPets-LLM-dNFT** promoted to first-class

---

## 🛒 MAY 3 — E2E SHOP-PURCHASE TEST PASSED ✅
- New script: `scripts/Test-ShopPurchase.ps1`
- Tested against production Supabase project `yhtmuibgdnxhbgboajhc`

---

## 🛡️ MAY 3 — VERCEL SECURITY HEADERS REGRESSION FIXED 🔴→✅
- Root cause: Vercel Root Directory = `frontend/`, reads `frontend/vercel.json` — which didn't exist
- Fix: created `frontend/vercel.json` mirroring the repo-root config

---

## 🚀 MAY 3 — HERO ONBOARDING PAGE LIVE ✅
- New page: `frontend/src/pages/Welcome.tsx` at `/welcome`

---

## 🔌 MAY 3 — BLOCKERS B1-B3 ALL CONFIRMED RESOLVED ✅
- **B1 DB Webhook** ✅ · **B2 Edge Function Secrets** ✅ · **B3 Stripe E2E loop** ✅

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
- Prometheus 7/7 targets UP ✅
- Grafana at `:3001` — all data flowing ✅
- OTLP traces live in Tempo ✅
- Loki + Promtail — log aggregation running ✅

### Backend (FastAPI)
- Rate limiting — Redis DB 2, Stripe webhook exempt ✅
- Circuit breakers — 3 active: `llm-router`, `crew-orchestrator`, `stripe-api` ✅

### Stripe + Payments
- Full checkout → webhook → token award loop PROVED ✅
- Token grants: starter=200, builder=800, hyper=2500 ✅

### Supabase Edge Functions — ALL 4 DEPLOYED ✅
- `shop-purchase`, `course-profile`, `stripe-webhook`, `sync-tokens-to-v24`
- Project: `yhtmuibgdnxhbgboajhc`

### Mission Control Hub — WelshDog-Mission-Control repo
- `mc_missions` table + RLS ✅
- `mc_events` append-only spine ✅ (v0.5.0 — May 24)
- Health Pulse, Morning Brief, Catch Stragglers ✅ (built, needs smoke + prod deploy)
- Running locally port 5174 — NOT yet deployed to prod
- Footer easter egg — `weird` → `/admin/mission-control` launchpad ✅

### Course Frontend
- Vibe Labs funnel live — 100/100 A11Y + BP ✅
- All 10 module rewrites pushed to `rewrites/` ✅
- `useProgress` hook + `claim_level_reward` RPC ✅
- `frontend/src/lib/supabase/client.ts` — uses `@supabase/supabase-js` (NOT `@supabase/ssr`) ✅

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
```
