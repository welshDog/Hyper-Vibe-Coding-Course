# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 23, 2026** — update this every session.

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
- **Claude running Sprint 4** (anon → signup localStorage gate) in parallel — check git log next session

### 🔴 Still Open From May 23
- [ ] Wire `CatchStragglers.jsx` into Mission Control main panel
- [ ] Register `catch_stragglers` router in FastAPI `main.py`
- [ ] Add `DISCORD_BOT_TOKEN` to Vercel env vars
- [ ] Enable Discord bot intents (Message Content + Direct Messages)
- [ ] Verify Sprint 4 (Claude's work) — test `useAnonymousProgress` hook
- [ ] Create `mc_events` event sourcing migration

---

## 🧩 MAY 5 PM — DOC SYNC + STRIPE SCAFFOLD SESSION ✅

- **`BUSINESS_PLAN.md` → v1.1** — corrected pricing (Pro £12 → **£9**, Hyper £35 → **£29**) to match live `/pricing` page; rebuilt 12-month projections with two scenarios (3% conservative / 5% target); added cost math for Stripe fees + Anthropic AI; promoted **“Neurodivergent Hiring Pipeline”** to its own headline section above sponsor tiers; added **“Risks & Mitigations”** 6-row table; deleted empty testimonials block; swapped in live Discord invite (`discord.gg/PSBHyvx86T`); marked `/welcome` as `LIVE (auth)`.
- **`/pricing` copy fix** (`Pricing.tsx:119`) — replaced contradictory “Cancel anytime. No subscription traps.” with **“Month-to-month, cancel anytime — no annual lock-in”**. Stripe wiring is monthly subs (`pro_monthly` / `hyper_monthly` price keys).
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

## 🛒 MAY 3 — E2E SHOP-PURCHASE TEST PASSED ✅
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

### Course Frontend
- Vibe Labs funnel live — 100/100 A11Y + BP ✅
- All 10 module rewrites pushed to `rewrites/` ✅
- `useProgress` hook + `claim_level_reward` RPC ✅
- `user_xp.level` bug fix confirmed ✅

### HyperAgent-SDK
- Published: `@w3lshdog/hyper-agent@0.1.7` ✅

---

## 🔧 ONE-TIME MANUAL STEPS REMAINING

- [ ] Register Supabase DB Webhook: `token_transactions` → INSERT → `sync-tokens-to-v24`
- [ ] Set `COURSE_WEBHOOK_SECRET` in V2.4 `.env` AND Supabase Edge Function env vars
- [ ] Fix `.env` file — rename any vars with `-` dashes to `_` underscores
- [ ] `VITE_STRIPE_PAYMENT_LINK_URL` — set in `.env.local` + Vercel
- [ ] Add `DISCORD_BOT_TOKEN` to Vercel env vars
- [ ] Wire `CatchStragglers.jsx` into Mission Control panel
- [ ] Register `catch_stragglers` router in FastAPI `main.py`
- [ ] Enable Discord bot intents (Message Content + Direct Messages)

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
```
