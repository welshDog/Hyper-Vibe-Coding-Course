# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 4, 2026** — update this every session.

---

## 🗺️ MAY 4 — 4-REPO MASTER PLAN REFRESH ✅
- New canonical doc: **[HYPER_ECOSYSTEM_PLAN_MAY4.md](./HYPER_ECOSYSTEM_PLAN_MAY4.md)** — supersedes the May 3 ecosystem report
- Layered structure: 4-repo health snapshot → 2-week sprint (Section B) → Phase 1-6 strategic → cross-repo bridges → next-session starters
- 4th repo **BROskiPets-LLM-dNFT** promoted to first-class — `H:\dNFTpet\BROskiPets-LLM-dNFT` (github.com/welshDog/BROskiPets-LLM-dNFT)
- `CLAUDE.md` NEXT UP table + ecosystem diagram refreshed to mirror Section B
- `WHATS_DONE.md` NEXT UP block (bottom) refreshed to mirror Section B
- The 3 docs are now in lockstep — drift is the enemy

---

## 🛒 MAY 3 — E2E SHOP-PURCHASE TEST PASSED ✅
- New script: `scripts/Test-ShopPurchase.ps1`
- Creates temp test user via Auth admin API → awards BROski$ → signs in for real JWT → POSTs `shop-purchase` edge function → verifies row + balance + duplicate guard → cleans up
- Tested against production Supabase project `yhtmuibgdnxhbgboajhc`
- Default target item: `Agent Sandbox Access` (300 BROski$, agent_access)
- `agent_access_pending:true` correctly returned when no `discord_id` linked
- Run: `pwsh ./scripts/Test-ShopPurchase.ps1` (use `-KeepUser` to skip cleanup)

---

## 🎙️ MAY 4 — NOTEBOOKLM MODULE TRANSCRIPTS GENERATED ✅
- Installed `ffmpeg` (scoop) + `faster-whisper` (pip) — both reusable for future transcription jobs
- New: `scripts/transcribe_module.py` (Python helper, utf-8 stdout) + `scripts/Transcribe-Modules.ps1` (orchestrator)
- Mapped 11 NotebookLM videos in `Hyper Vibe Course  Idea Data/Hyper vibe Course MP4/` → `scripts/M{N}-*.md`:
  - `M0-welcome.md` (8s — intro animation, no narration), `M1-your-first-vibe.md`, `M2-prompt-like-a-pro.md`, `M3-build-your-app.md`, `M4-full-stack-vibe.md`, `M5-hypercode-the-hyper-way.md`, `M6-agent-architecture.md`, `M7-soulful-entities.md`, `M8-architecting-on-chain-souls.md`, `M9-sre-observability.md`, `M10-ship-scale-graduate.md`
- Total: ~6-8KB per file, full NotebookLM narration captured (no paraphrasing). 24.6 min on CPU `base.en`.
- ⚠️ Existing `scripts/M1-M12-*.md` stubs left in place (different slugs) — NotebookLM numbering is offset from the old stub numbering. Decide later which set is canonical.
- Re-run any time: `pwsh ./scripts/Transcribe-Modules.ps1 -Force -IncludeWelcome` (or `-Only 1,2,5` for subset, `-Model small.en` for higher quality).

---

## 🛡️ MAY 3 — VERCEL SECURITY HEADERS REGRESSION FIXED 🔴→✅
- Live audit: only `Strict-Transport-Security` was firing on production. Other 5 headers from `vercel.json` (X-Frame-Options, X-Content-Type-Options, X-DNS-Prefetch-Control, Referrer-Policy, Permissions-Policy) were absent.
- **Root cause**: Vercel project's Root Directory = `frontend/`, so Vercel reads `frontend/vercel.json` — which didn't exist. Repo-root `vercel.json` was effectively dead code.
- **Fix**: created `frontend/vercel.json` mirroring the repo-root config (headers + cache rules).
- **Action needed**: commit + push so Vercel auto-deploys + the headers go live.
- Repo-root `vercel.json` left in place to avoid surprise — consider deleting later to dedupe.
- Latest production deploy `dpl_F2tFuZa1KJz9VLMTv3xiMjEvo4nF` is otherwise healthy (state: READY, no runtime errors).

---

## 🚀 MAY 3 — HERO ONBOARDING PAGE LIVE ✅
- New page: `frontend/src/pages/Welcome.tsx` at `/welcome`
- Own dark chrome (skips `<Layout/>`) — Starfield, hero greeting with first name, 3 perk cards (XP / BROski$ / Pets), starter quest CTAs, referral copy block
- First-login redirect: `Auth.tsx` checks `user.user_metadata.onboarded_at` — missing → `/welcome`, present → `/dashboard`
- "Enter Mission Control" + "Skip the tour" both call `supabase.auth.updateUser({ data: { onboarded_at } })` so it shows once
- HFZ-compliant: dark only, ≥16px text, no pill primaries, single primary CTA, generous spacing, dyslexia-friendly chunking
- ✅ `npx tsc --noEmit` clean, ✅ `eslint --max-warnings=0` clean, ✅ `npm run build` clean (1845 modules, 0 errors)
- ⚠️ UI not yet verified in browser — spin up `npm run dev` and visit `/welcome`

---

## 🔌 MAY 3 — BLOCKERS B1-B3 ALL CONFIRMED RESOLVED ✅
- **B1 DB Webhook** ✅ — Trigger `sync_tokens_to_v24` AFTER INSERT on `public.token_transactions`
  - Function `sync_tokens_to_v24_fn()` uses `net.http_post` (pg_net) to call edge function
  - Pre-resolves `discord_id` from `discord_links` and injects into payload
  - Live calls in `net._http_response` returning 200 (skipped where appropriate)
- **B2 Edge Function Secrets** ✅ — `supabase secrets list` confirms all wired:
  - `COURSE_SYNC_SECRET`, `COURSE_WEBHOOK_SECRET`, `SHOP_SYNC_SECRET`, `V24_API_URL`
  - All Stripe keys + Supabase service role
- **B3 Stripe E2E loop** ✅ — Already PROVED April 25
- ⚠️ Outstanding-but-not-blocking: actual live V2.4 forwarding hasn't been observed (only 1 discord_link exists, pg_net retention is short). Needs Bro to confirm `V24_API_URL` points to publicly reachable V2.4.

---

## 🏗️ THE 3 REPOS

| Repo | What it is | Where |
|---|---|---|
| HyperCode-V2.4 | Main platform — Docker, FastAPI, agents, infra | `H:\HyperStation zone\HyperCode\HyperCode-V2.4` |
| HyperAgent-SDK | TypeScript SDK — agent spec, CLI, templates | `H:\HyperAgent-SDK` |
| Hyper-Vibe-Coding-Course | Course frontend + Supabase + token shop | `H:\Hyper-Vibe-Coding-Course` ← **CORRECT PATH (May 2)** |

> ⚠️ OLD path `H:\the hyper vibe coding hub` was the **archived typo repo** `Hyper-Vibe-Codeing-Hub` — do NOT use it

---

## ✅ BUILT AND WORKING

### Infrastructure
- 32/32 Docker containers — all healthy ✅ ← **April 19** (HyperHealth API live)
- 5 isolated networks — `data-net` + `obs-net` internal (no internet) ✅
- Docker secrets pattern — `.txt` files, never baked into images ✅
- Kubernetes + Helm charts in `k8s/` + `helm/` — scale path ready ✅
- **Memory limits on ALL services** — every container capped, OOM cascades impossible ✅ ← **April 17**
- `scripts/pre-build-check.sh` — disk + memory guard before any Docker build ✅ ← **April 17**
- **OOM recovery completed April 17** — 34.4GB freed, 24/24 containers restored ✅
- **Socket-proxy split** — main proxy read-only, new `docker-socket-proxy-healer` with CONTAINERS+POST+PING ✅ ← **April 19**
- **Healer on obs-net** — can reach Grafana/Prometheus for diagnostics ✅ ← **April 19**

### Observability
- Prometheus 7/7 targets UP ✅
- Grafana at `:3001` — all data flowing ✅
- OTLP traces live in Tempo ✅
- Loki + Promtail — log aggregation running ✅

### Backend (FastAPI — hypercode-core)
- `/metrics` Prometheus endpoint ✅
- `/health` with Redis cache (10s TTL) ✅
- Rate limiting — Redis DB 2, Stripe webhook exempt ✅
- Circuit breakers — 3 active: `llm-router`, `crew-orchestrator`, `stripe-api` ✅
- **Core deps split for security** ✅ ← **April 23**
- **AI backend profile** — `docker compose --profile ai up -d` ✅ ← **April 23**
- Core RAG boot no longer hard-requires `langchain_text_splitters` ✅ ← **April 24**

### Database
- PostgreSQL running, Alembic migrations up to `009` ✅ ← **April 19**
- Async engine + connection pooling (`asyncpg`, pool_size=10) ✅
- Migration 009 — `pgcrypto` + `uuid-ossp` extensions enabled ✅

### Stripe + Payments
- `POST /api/stripe/checkout` — creates Stripe Checkout Session ✅
- `GET /api/stripe/plans` — lists plans (60s cache) ✅
- `POST /api/stripe/webhook` — signature verified, rate-limit exempt ✅
- Webhook writes: saves payment, awards BROski$, updates subscription tier ✅
- Token grants: starter=200, builder=800, hyper=2500 ✅
- **B3 E2E Stripe loop PROVED** ✅ ← **April 25**

### BROski$ Token Economy
- `public.users.broski_tokens` balance column ✅
- `token_transactions` — append-only ledger ✅
- `award_tokens()` + `spend_tokens()` — SECURITY DEFINER, server-side only ✅
- `CourseSyncEvent` model + migration 004 — idempotency for cross-repo sync ✅

### Course Frontend (Hyper-Vibe)
- `/pricing` → Stripe checkout → `/payment-success` → enrolled ✅
- Dashboard — BROski$ balance card ✅
- TokensPage, Certificates, Quiz/exercise, Referral system ✅
- 7 courses seeded in Supabase (`price_pence`, `is_active`) ✅
- RLS enabled — `security_invoker = on` on views ✅
- **Site live at https://hyper-vibe-coding-course.vercel.app** ✅
- **`CourseCatalog.tsx` null safety fix** ✅ ← **May 2** (commit `92ed5cb`) — `difficulty`, `description`, `thumbnail_url` all safe

### Supabase Edge Functions — ALL 4 FIXED + DEPLOYED ✅ ← **May 1, 2026**
- `shop-purchase` (422.1kB) — fixed `esm.sh` → `npm:@supabase/supabase-js@2` ✅
- `course-profile` (75.81kB) — fixed `std@0.168 serve` → `Deno.serve()` ✅
- `stripe-webhook` (491.9kB) — fixed imports + deployed `--no-verify-jwt` ✅
- `sync-tokens-to-v24` (78.38kB) — fixed `std@0.168 serve` → `Deno.serve()` + deployed `--no-verify-jwt` ✅
- All deployed to Supabase project `yhtmuibgdnxhbgboajhc` via CLI v2.95.4
- Root cause: `Deno.core.runMicrotasks()` crash — **FIXED** ✅

### WebSocket Endpoints (V2.4)
- `/ws/uplink`, `/ws/agents`, `/ws/events`, `/ws/logs` all live ✅

### Agents (25+)
- healer-agent, agent-x, crew-orchestrator, hyper-architect, hyper-observer, hyper-worker ✅
- **hyper-split-agent** ✅ ← **April 25**
- **broski-pets-bridge LIVE** ✅ ← **April 29**
  - `pets_enabled:true`, `ollama_connected:true`, `redis_connected:true`, `mcp_connected:true`
  - Health: `http://localhost:8098/health`

### 🏆 Hyperfocus Features — ALL 5 DONE
- **Feature 1: Micro-Achievement Git Hook** ✅ April 25
- **Feature 2: HyperSplit Agent** ✅ April 25
- **Feature 3: Session Snapshot Agent** ✅ April 25
- **Feature 4: Morning Briefing `/briefing`** ✅ April 26
- **Feature 5: Focus / Panic Mode** ✅ April 26

### Security
- Trivy scanner running as container ✅
- GitHub Actions CI — Trivy on every push/PR ✅ (**currently blocked — billing lock, fix at github.com/settings/billing**)
- Stripe keys rotated + scrubbed from 218 commits ✅ ← **April 16**
- **Supabase DB hardening migrations applied to production** ✅ ← **May 3**
  - `fix_anon_execute_security_definer_functions`
  - `fix_rls_initplan_and_missing_fk_indexes`
  - `merge_duplicate_permissive_policies`

### HyperAgent-SDK
- Published to npm: `@w3lshdog/hyper-agent@0.1.7` ✅
- CLI: `validate`, `registry`, `studio`, `status`, `agents`, `tokens`, `graduate` ✅
- GitHub Actions CI — `npm test` on every push + PR ✅

---

## 🧹 APRIL 29 — PHASE 1 TRIAGE SESSION
- All 5 Dependabot PRs merged — 0 open remaining ✅
- broski-pets-bridge 4/4 health checks green ✅
- MCP gateway port fixed (8099→8820) ✅

---

## 🐾 APRIL 29 — PHASE 3 PETS (COSMIC DRAGON)
- Docker DNS fixed for pets bridge ✅
- IDOR hardened on `/api/v1/pets/status|chat|powers` ✅
- Git hook now awards pet XP + streak ✅
- Cosmic Dragon minted + leaderboard live ✅

---

## ⚡ MAY 1 — EDGE FUNCTION DEPLOY SESSION
- Fixed all 4 Supabase edge functions (Deno.core crash) ✅
- Installed Supabase CLI v2.95.4 on WSL2 ✅
- Installed `jq` on WSL2 ✅
- Deployed all 4 functions to `yhtmuibgdnxhbgboajhc` ✅
- `.env` dash-in-variable-name issue identified (PowerShell deploy blocker) ⚠️

---

## 🔧 MAY 2 — VERCEL + REPO FIX SESSION
- **Identified wrong repo** — was accidentally cloned from archived `Hyper-Vibe-Codeing-Hub` (typo!) ⚠️ FIXED ✅
- **Correct repo cloned** to `H:\Hyper-Vibe-Coding-Course` ✅
- **Vercel GitHub webhook wired** — now auto-deploys on every `git push` to main ✅
- **`CourseCatalog.tsx` null safety fix** — `difficulty.charAt()` crash fixed (commit `92ed5cb`) ✅
- **Vercel build error fixed** — `vite: command not found` (exit 127) ✅ FIXED
  - Real cause: Vercel **Root Directory was set to repo root**, not `frontend/`. `npm install` ran at root (no vite), then root `build` script called `npm --prefix frontend run build` against an empty `frontend/node_modules`.
  - Secondary cause: commit `5d74e11` moved `vite` to `dependencies` but the lockfile still listed it under `devDependencies` → `npm ci` would fail on lockfile drift.
  - Fix: reverted vite back to `devDependencies` (lockfile now in sync, verified with `npm ci`). **Set Vercel Root Directory = `frontend`** so Vercel auto-detects Vite and runs install + build inside the actual app dir.
  - `NODE_ENV=development` workaround is no longer needed — remove it from Vercel env vars.

---

## 🔒 MAY 3 — AUTH FIX + SUPABASE HARDENING SESSION
- **Fixed `/register` `Failed to fetch` production bug** ✅
  - Root cause: Vercel frontend env vars were missing/incorrect
  - Fix: set correct `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel project settings
  - Production redeploy triggered — status: **READY** ✅
- **Auth wiring confirmed** — frontend uses `supabase.auth.signUp()` directly from browser, NOT via FastAPI
  - If auth breaks in production, check Vercel env vars FIRST before backend routes
- **Supabase DB hardening migrations applied** ✅
  - `fix_anon_execute_security_definer_functions`
  - `fix_rls_initplan_and_missing_fk_indexes`
  - `merge_duplicate_permissive_policies`
- **CLAUDE.md updated** with Vercel + Supabase security headers + perf notes ✅

---

## 🔧 ONE-TIME MANUAL STEPS REMAINING

- [ ] Register Supabase DB Webhook: `token_transactions` → INSERT → `sync-tokens-to-v24`
- [ ] Set `COURSE_WEBHOOK_SECRET` in V2.4 `.env` AND Supabase Edge Function env vars
- [ ] Fix `.env` file — rename any vars with `-` dashes to `_` underscores (PowerShell deploy fix)
- [ ] Fix frontend hooks: any hardcoded port 8081 → 8000
- [ ] `VITE_STRIPE_PAYMENT_LINK_URL` — set in `.env.local` + Vercel
- [ ] Add `DISCORD_USER_ID=<your_id>` to `.env` for `make calm` token awards
- [ ] E2E test `shop-purchase` with real JWT (user needs to be logged in on site first)
- [ ] **Optional hardening:** Enable leaked-password protection in Supabase Auth dashboard (Pro plan only)

---

## 🚀 NEXT UP — 2-Week Sprint (May 4 → May 18)

> Mirrors [HYPER_ECOSYSTEM_PLAN_MAY4.md](./HYPER_ECOSYSTEM_PLAN_MAY4.md) Section B. That doc is the single source of truth.

**🔴 Today (close-out flags from May 3)**
1. Browser-verify `/welcome` page (`http://localhost:5173/welcome`)
2. Move old `scripts/M*-*.md` stubs → `scripts/_old-stubs/` (keep NotebookLM set canonical)
3. Decide: add `Content-Security-Policy` to `frontend/vercel.json`?

**🟡 This week**
4. First real student invite (after #1 verified)
5. Stripe live E2E — payment → webhook → token award → enrolled
6. GitHub Actions billing unlock — github.com/settings/billing
7. **BROskiPets Phase 1** — mint first pet via BROski$ (cross-repo wiring)
8. HyperAgent-SDK 0.2.0 prep — validator UX + 2 starter templates

**🟢 Background**
9. Speed Insights monitoring — LCP <2.5s, TTFB <0.8s
10. Anthropic credit top-up if running thin
11. Leaked-password protection (needs Supabase Pro)

---

## 🔑 KEY FACTS (never re-look-up)

```
Start command:   docker compose -f docker-compose.yml -f docker-compose.secrets.yml up -d
AI backend:      docker compose --profile ai up -d  (API at http://127.0.0.1:8002)
Discord bot:     docker compose --profile discord up -d broski-bot
Tests:           pytest backend/tests -q  (223 passed, 6 skipped)
Prometheus live: monitoring/prometheus/prometheus.yml  (NOT root prometheus.yml)
Redis DB split:  DB 1 = cache  |  DB 2 = rate limits
Stripe webhook:  ALWAYS rate-limit exempt
Alembic:         if missing alembic_version table → run 'alembic stamp 008' first
Supabase table:  courses uses price_pence (int) + is_active (bool)
Docker context:  must be 'desktop-linux' on Windows
broski-pets:     health → http://localhost:8098/health | MCP gateway → http://mcp-gateway:8820
Supabase proj:   yhtmuibgdnxhbgboajhc (Hyper-Vibe-Coding-Course)
Edge functions:  deployed via Supabase CLI v2.95.4 from WSL2
Course site:     https://hyper-vibe-coding-course.vercel.app
Correct repo:    H:\Hyper-Vibe-Coding-Course (NOT H:\the hyper vibe coding hub — that's the archived typo clone)
Frontend auth:   VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY must be set in Vercel env vars
```

---

## 📁 WHERE THINGS LIVE

```
docker-compose.yml          — main stack (all 65 services)
docker-compose.secrets.yml  — secrets injection
backend/app/main.py         — FastAPI core
backend/app/core/config.py  — all settings
agents/broski-pets-bridge/  — BROski Pets bridge (port 8098)
scripts/focus-mode.sh       — Focus Mode
scripts/calm-mode.sh        — Calm Mode
supabase/functions/         — all 4 edge functions (Hyper-Vibe repo)
docs/PHASE2_TOKEN_SYNC.md   — token sync setup + curl test
```
