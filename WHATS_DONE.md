# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 24, 2026** — update this every session.

---

## 🎯 MAY 24 — VERCEL BUILD RESCUE + MISSION CONTROL EASTER EGG ✅

### 🔴 CRITICAL — Vercel Build Fixed (was broken for 11 deploys)
- **Root cause found:** `frontend/src/lib/supabase/client.ts` was importing `createBrowserClient` from `@supabase/ssr` — a Next.js SSR package that was never installed in this Vite SPA
- **Fix:** Replaced with `createClient` from `@supabase/supabase-js` (already installed, correct for Vite React)
- **Commit:** `743bf57` — production live again ✅
- **Rule added to load-bearing gotchas:** `@supabase/ssr` is NOT installed — use `@supabase/supabase-js` always

### 🥚 Footer Easter Egg — Stealth Mission Control Link
- The word **`weird`** in `© HyperFocus Z0ne · Keep it weird, keep it Welsh.` is now a stealth `<Link>` to `/admin/mission-control`
- Same colour as surrounding text, no underline, cyan on hover only
- Normal users will never notice it — clean hidden admin door
- **File:** `frontend/src/components/Footer.tsx`
- **Commit:** `1fd71d9` — live on main ✅

### 🚀 `/admin/mission-control` Launchpad LIVE
- New page `frontend/src/pages/MissionControl.tsx` — hero · launch CTA · 4-panel "what's inside" card · "why it lives elsewhere" rationale · stealth-door footer. Pure hfz token palette (no orange, no new design tokens).
- Route wired in `App.tsx` inside `<AdminRoute role="admin" />` next to `admin/signups`. Lazy-loaded.
- `VITE_MISSION_CONTROL_URL` env added to `frontend/.env.example` (defaults to `http://localhost:5174` — the MC dev port). Set this in prod when MC has a public URL.
- **Decision recorded:** `/admin/mission-control` is a **launchpad to the sibling repo**, NOT a duplicate operator UI. Catch Stragglers / Health Pulse / Morning Brief / Missions Kanban all live in **WelshDog-Mission-Control** (commits `00aa770` / `ceadad2` / `c5b36c2` / `c5b36c2`) with a real Express backend. Course is a Vite SPA on Vercel — there is no FastAPI here, and the May 23 handover's "register catch_stragglers in main.py" + "mount CatchStragglers.jsx as first panel" instructions were a stale-handover trap (same class as Sprint 4 v2). Surfaced + resolved before building anything wrong.
- Pre-commit loop: `tsc` ✅ · `eslint` ✅ · `vite build` ✅ 18.70s · 1704 modules.

### 📝 Docs
- `rewrites/NEXT_SESSION_HANDOVER_2026-05-24.md` pushed (commit `b1d52ae`)
- `WHATS_DONE.md` updated (this file)

### 🔴 Still Open From May 24
- [ ] Smoke-test Catch Stragglers in WelshDog-Mission-Control (real Discord token + service-role key, then `npm run dev:full` → Scan → Send)
- [ ] Deploy WelshDog-Mission-Control to a public URL + set `VITE_MISSION_CONTROL_URL` in Vercel env vars for the course
- [ ] Enable Discord bot intents (Message Content + Direct Messages)
- [ ] Create `mc_events` event sourcing migration
- [ ] Delete the dead `api/routes/catch_stragglers.py` + `discord-bot/dm_sender.py` + `frontend/components/mission-control/CatchStragglers.jsx` from the course repo (planning artifacts, never deployed, can confuse future agents)

---

## 🎯 MAY 23 — CATCH STRAGGLERS + NOTEBOOKLM SYNC SESSION ✅

- **Catch Stragglers system — FULL BUILD pushed to main (commit `a3a06ed`)**
  - `api/routes/catch_stragglers.py` — scans `user_xp` for students idle 7+ days; generates 3-tone DM variants (warm/curious/terse); Discord send + email fallback; all actions logged to `mc_missions`
  - `discord-bot/dm_sender.py` — async Discord Bot API DM sender via httpx; rate limit handling; `open_dm_channel` + `send_discord_dm` functions
  - `frontend/components/mission-control/CatchStragglers.jsx` — full operator UI; tone picker; editable drafts; bulk approve all; snooze 24h; skip; Discord/email badge per student
- **AGENT-START.md v1.1 pushed** (commit `73f413`) — 9 audit fixes applied
- **NEXT_SESSION_HANDOVER_2026-05-23.md** pushed to `rewrites/` (commit `3d7c72e`)
- **SESSION_SNAPSHOT_2026-05-23.md** pushed to `rewrites/`
- **NotebookLM fully synced** — ingested AGENT-START.md + May 23 handover; returning correct commit SHAs and priorities
- **Sprint 4 truth reconciled** — Sprint 4 (anon → signup) was already LIVE since **May 19 (`a12ecd0`)**; the May 23 "in flight" handover claim was wrong. A parallel duplicate attempt (`d7ca644`) shipped 4 orphan root-level files bypassing the `claim_level_reward` RPC — **removed** to prevent a security regression.

---

## 🧩 MAY 5 PM — DOC SYNC + STRIPE SCAFFOLD SESSION ✅

- **`BUSINESS_PLAN.md` → v1.1** — corrected pricing (Pro £12 → **£9**, Hyper £35 → **£29**) to match live `/pricing` page; rebuilt 12-month projections with two scenarios (3% conservative / 5% target); added cost math for Stripe fees + Anthropic AI; promoted **“Neurodivergent Hiring Pipeline”** to its own headline section above sponsor tiers; added **“Risks & Mitigations”** 6-row table; deleted empty testimonials block; swapped in live Discord invite (`discord.gg/PSBHyvx86T`); marked `/welcome` as `LIVE (auth)`.
- **`/pricing` copy fix** (`Pricing.tsx:119`) — replaced contradictory "Cancel anytime. No subscription traps." with **"Month-to-month, cancel anytime — no annual lock-in"**. Stripe wiring is monthly subs (`pro_monthly` / `hyper_monthly` price keys).
- **Phantom preload nuked** — `index.html` was preloading `/assets/hero-bg.webp` which never existed in `public/` AND wasn’t imported anywhere. Removed the `<link rel="preload">` tag.
- **Zustand warning closed as NOOP** — only usage in `src/context/auth.ts:1` already uses named import; zustand@5.0.11 dropped the default export entirely.
- **Dead asset deleted** — `frontend/src/assets/hero.webp` (zero imports across the repo).
- **`scripts/STRIPE_E2E_RUNBOOK.md` created** — covers Path A (local) and Path B (live deployed). Includes pre-flight checklist, verification SQL, cleanup SQL, and pass/fail signal table.
- **Auth gating audit** — confirmed `App.tsx` route table. Cold-visitor leak found: `/welcome` is wrapped in `PrivateRoute`.
- **Commit landed:** `eb5a26f`
- **🟡 Open from this session:** Bro to decide on (a) make `/welcome` public, (b) get `sk_test_` Stripe key + register test-mode webhook.

---

## 🗺️ MAY 4 — 4-REPO MASTER PLAN REFRESH ✅
- New canonical doc: **[HYPER_ECOSYSTEM_PLAN_MAY4.md](./HYPER_ECOSYSTEM_PLAN_MAY4.md)**
- Layered structure: 4-repo health snapshot → 2-week sprint (Section B) → Phase 1-6 strategic → cross-repo bridges → next-session starters
- 4th repo **BROskiPets-LLM-dNFT** promoted to first-class
- `CLAUDE.md` NEXT UP table + ecosystem diagram refreshed
- `WHATS_DONE.md` NEXT UP block refreshed

---

## 🛍️ MAY 3 — E2E SHOP-PURCHASE TEST PASSED ✅
- New script: `scripts/Test-ShopPurchase.ps1`
- Creates temp test user via Auth admin API → awards BROski$ → signs in for real JWT → POSTs `shop-purchase` edge function → verifies row + balance + duplicate guard → cleans up
- Tested against production Supabase project `yhtmuibgdnxhbgboajhc`
- Default target item: `Agent Sandbox Access` (300 BROski$, agent_access)

---

## 🎤 MAY 4 — NOTEBOOKLM MODULE TRANSCRIPTS GENERATED ✅
- Installed `ffmpeg` (scoop) + `faster-whisper` (pip)
- New: `scripts/transcribe_module.py` + `scripts/Transcribe-Modules.ps1`
- 11 NotebookLM videos transcribed → `scripts/M{N}-*.md`
- Total: ~6-8KB per file, full NotebookLM narration captured

---

## 🛡️ MAY 3 — VERCEL SECURITY HEADERS REGRESSION FIXED 🔴→✅
- Live audit: only `Strict-Transport-Security` was firing on production
- Root cause: Vercel Root Directory = `frontend/`, reads `frontend/vercel.json` — which didn’t exist
- Fix: created `frontend/vercel.json` mirroring the repo-root config

---

## 🚀 MAY 3 — HERO ONBOARDING PAGE LIVE ✅
- New page: `frontend/src/pages/Welcome.tsx` at `/welcome`
- Own dark chrome (skips `<Layout/>`)
- First-login redirect: `Auth.tsx` checks `user.user_metadata.onboarded_at`

---

## 🔌 MAY 3 — BLOCKERS B1-B3 ALL CONFIRMED RESOLVED ✅
- **B1 DB Webhook** ✅ — Trigger `sync_tokens_to_v24` AFTER INSERT on `public.token_transactions`
- **B2 Edge Function Secrets** ✅ — All wired and confirmed
- **B3 Stripe E2E loop** ✅ — Already PROVED April 25

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
- Socket-proxy split — read-only main + healer with CONTAINERS+POST+PING ✅

### Observability
- Prometheus 7/7 targets UP ✅
- Grafana at `:3001` — all data flowing ✅
- OTLP traces live in Tempo ✅
- Loki + Promtail — log aggregation running ✅

### Backend (FastAPI)
- Rate limiting — Redis DB 2, Stripe webhook exempt ✅
- Circuit breakers — 3 active: `llm-router`, `crew-orchestrator`, `stripe-api` ✅
- Core RAG boot no longer hard-requires `langchain_text_splitters` ✅

### Stripe + Payments
- Full checkout → webhook → token award loop PROVED ✅
- Token grants: starter=200, builder=800, hyper=2500 ✅

### Supabase Edge Functions — ALL 4 DEPLOYED ✅
- `shop-purchase`, `course-profile`, `stripe-webhook`, `sync-tokens-to-v24`
- All deployed to project `yhtmuibgdnxhbgboajhc`

### Mission Control Hub
- `mc_missions` table + RLS ✅
- Health Pulse, Morning Brief, Catch Stragglers ✅
- Running locally port 5174 (not yet deployed to Vercel)
- Footer easter egg — `weird` → `/admin/mission-control` ✅

### Course Frontend
- Vibe Labs funnel live — 100/100 A11Y + BP ✅
- All 10 module rewrites pushed to `rewrites/` ✅
- `useProgress` hook + `claim_level_reward` RPC ✅
- `user_xp.level` bug fix confirmed ✅
- `frontend/src/lib/supabase/client.ts` — uses `@supabase/supabase-js` (NOT `@supabase/ssr`) ✅

### HyperAgent-SDK
- Published: `@w3lshdog/hyper-agent@0.1.7` ✅

---

## 🔧 ONE-TIME MANUAL STEPS REMAINING

- [ ] **Build `/admin/mission-control` page + mount `CatchStragglers.jsx`** ← NEXT
- [ ] Register Supabase DB Webhook: `token_transactions` → INSERT → `sync-tokens-to-v24`
- [ ] Set `COURSE_WEBHOOK_SECRET` in V2.4 `.env` AND Supabase Edge Function env vars
- [ ] Fix `.env` file — rename any vars with `-` dashes to `_` underscores
- [ ] `VITE_STRIPE_PAYMENT_LINK_URL` — set in `.env.local` + Vercel
- [ ] Add `DISCORD_BOT_TOKEN` to Vercel env vars
- [ ] Register `catch_stragglers` router in FastAPI `main.py`
- [ ] Enable Discord bot intents (Message Content + Direct Messages)
- [ ] Create `mc_events` event sourcing migration

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
broski-pets:     health → http://localhost:8098/health
Frontend auth:   VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY must be set in Vercel env vars
Mission Control: Running locally port 5174
Discord bot:     DISCORD_BOT_TOKEN in .env only — never commit
Supabase client: ALWAYS use @supabase/supabase-js — @supabase/ssr is NOT installed
```
