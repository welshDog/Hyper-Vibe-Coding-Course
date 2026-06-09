# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: June 9, 2026** — update this every session.

---

## 🎯 JUNE 9 — SHOP FULFILLMENT E2E + ANON→LOGIN RECONCILE E2E ✅

Two complete E2E suites shipped. Full suite now 168/168 green across chromium/firefox/webkit.

### 🛒 Shop Fulfillment v2 E2E (commit `389997b`)
- **42/42 tests, 14 spec groups** covering: auth gate, item load, GBP pricing, tier discounts, modal, frame/food/pet-cosmetic/agent-access purchases, consumable repeat-buy, server discount intercept, fulfillment polling, error notification
- Root causes fixed in `ShopPage.tsx`: added `data-testid="shop-notification"` + `data-testid="shop-balance"` to production DOM for reliable targeting
- Key fix: ASCII `-` in notification text (`-450 🪙`) vs Unicode minus `−` — regex `/−450/i` → `/-450/i`
- Strict mode race condition on `invokedBody`: body assertion moved after `await expect(notification)` to guarantee route handler has completed

### 🔄 Anon→Login Reconcile E2E (new file `frontend/tests/vibe-labs-reconcile.spec.ts`)
- **15/15 tests** (5 scenarios × 3 browsers)
- Covers: 2-level bank ascending + banner copy, singular "level" label, already-claimed skip, empty store no-op, tampered store server gate
- Root cause discovered + fixed in `useProgress.ts` (line 113): React 18 StrictMode double-invokes effects in dev; cleanup fired `cancelled = true` during the RPC awaits, blocking `setReconciliation`. Fix: split the guard — `setReconciliation` called unconditionally when `banked > 0`; only `refreshUser()` stays behind the `!cancelled` guard (safe: React 18 ignores setState on unmounted components)
- `PetMentorBubble` pointer-events fix (commit `173744e`): overlay was intercepting clicks on lesson UI

### 🔢 E2E Totals
- Before: 111 tests across 10 spec files
- After: 168 tests across 12 spec files (+57 new, 0 failures)

---

## 🎯 MAY 25 EVENING — MISSION CONTROL 4 SHIPS + RENDER BLUEPRINT ✅

Late-night push closed Mission Control to **5/6 Agent Actions live end-to-end** + first prod-deploy path documented. All work in `WelshDog-Mission-Control` (HEAD: `3e7738f`).

### 🎁 v0.7.0 — Grant Tokens (commit `f07597c`)
- `POST /api/grant-tokens/preview` + `POST /api/grant-tokens` (admin-only via `requireAdmin`)
- Uses existing course `award_tokens()` RPC — no schema changes, no duplication
- Idempotent: client UUID → `p_source_id = mc-grant-<uuid>` → RPC's `(user_id, reason, source_id)` partial unique constraint dedups
- Per-call cap `MAX_GRANT_PER_CALL` env (default 10000); UI shows the cap in preview
- Two-step UI: paste userId → Preview (verify name + email + current balance) → Confirm
- Audit: `mc_missions` shipped card + `mc_events` (`tokens.granted` OR `tokens.grant_skipped_duplicate`)

### 🎨 v0.7.1 — UI polish (commit `4bf5fe8`)
- Three layout bugs caught in pre-smoke review:
  - Kanban header `0 mission sNewSyncDETECTED` run-together → `gap-x-4 gap-y-2 mr-1`
  - `SOOND` badge bleed → tile is `flex flex-col h-full min-h-[128px]` + SOON `mt-auto`
  - Pipeline columns cramped → `gap-5 md:gap-6` + `p-3 → p-4` + header divider

### 🔁 v0.8.0 — Refund (commit `00c59ed`)
- Stripe charge refund + matching BROski$ deduction in one click
- Both sides idempotent: Stripe `Idempotency-Key` header + matching `spend_tokens()` `p_source_id`
- Raw Stripe REST (no SDK — keeps deps slim)
- **Pre-flight balance check** at preview AND re-check at commit (blocks "Stripe refunded but tokens couldn't deduct")
- **Partial-failure path**: if Stripe succeeds but `spend_tokens` fails, emits `refund.token_deduction_failed`, writes `investigating`-lane p0 mission, returns `success: true awarded: false` with the spend_tokens error — UI surfaces in amber
- Refuses to refund a `pi_*` with no matching `token_transactions` row (404) — operator uses Stripe dashboard for those edge cases

### 🚀 Render Blueprint + PORT fallback (commit `68c0a7a`)
- `render.yaml` for the Express API side (Vercel can't run `server/index.js` as long-lived process)
- Server `PORT` now resolves as `process.env.PORT || process.env.API_PORT || 3011` so Render's auto-injected port works
- Verified BOTH boot paths via real smoke (default + simulated `PORT=4321`)
- Two SPA↔API wiring options documented at the top of `render.yaml`:
  - **A (recommended)**: Vercel `rewrites` in `vercel.json` — zero client code change
  - **B**: `VITE_MC_API_URL` env + prefix every `fetch('/api/...')` call

### 📺 v0.9.0 — ActivityTicker v2 (commit `3e7738f`)
- The v0.5.0 `mc_events` spine finally pays off in the UI
- Initial load: `SELECT top 50 FROM mc_events ORDER BY created_at DESC`
- Realtime: INSERT subscription via the publication added in v0.5.0
- Per-event-type renderer (icon + accent + payload-aware summary) for 6 known types; unknown types degrade to Radio + raw type (future event_types appear instantly)
- Kept `mc_missions` subscription as fallback for non-Agent-Action cards (manual, Pulse, Brief); dedup by `signal_source` prefix
- Dropped `user_level_progress` (student-side noise)
- MAX_EVENTS 20 → 50; actor email shortened to local-part in the line

### ✅ Smoke verified
- Catch Stragglers Discord DM landed in production 01:02 BST (2026-05-25)
- Vercel SPA deployed 01:37 BST with all 6 env vars

### 🔴 Still Open (May 26 build order)
1. **Deploy MC API to Render** — single highest-leverage blocker; ~10 min total. Currently MC SPA is on Vercel but `/api/*` calls 404 in prod.
2. **Wire SPA ↔ API** after Render URL exists (Vercel rewrites recommended)
3. **Smoke Grant Tokens + Refund** — both built + audited but never smoked end-to-end
4. **Health Pulse + Morning Brief emit `mc_events`** — once they do, the ticker auto-renders them (unknown event_type fallback)
5. **Scheduler / cron** for Pulse + Brief auto-fire (recommend Supabase `pg_cron`)
6. **Drift Scan** (the last Agent Action)
7. **Delete dead course-repo artifacts** — `api/routes/catch_stragglers.py`, `discord-bot/dm_sender.py`, `frontend/components/mission-control/CatchStragglers.jsx`

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
- **DEPLOYED** — Vercel SPA live + Render API live at `https://welshdog-mc-api.onrender.com` (confirmed June 7, commit `999afef`)
- Footer easter egg — `weird` → `/admin/mission-control` launchpad ✅

### Course Frontend
- Vibe Labs funnel live — 100/100 A11Y + BP ✅
- All 10 module rewrites ✅
- `useProgress` hook + `claim_level_reward` RPC ✅
- `frontend/src/lib/supabase/client.ts` — `@supabase/supabase-js` only (NOT `@supabase/ssr`) ✅

### HyperAgent-SDK
- Published: `@w3lshdog/hyper-agent@0.4.0` ✅ (bumped from 0.1.7 — graduate build + web3/dNFT block)

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
Mission Control: DEPLOYED — Vercel SPA + Render API https://welshdog-mc-api.onrender.com
Discord bot:     DISCORD_BOT_TOKEN in .env only — never commit
Supabase client: ALWAYS use @supabase/supabase-js — @supabase/ssr is NOT installed
Catch Stragglers: BUILT in MC repo — do NOT rebuild. Smoke test only.
Grant Tokens:    NOT built — budget full build time (enabled:false tile)
Refund:          NOT built — budget full build time (enabled:false tile)
TDZ rule:        scan for const X = ... before replace_all on env-var renames. node --check won't catch it.
```
