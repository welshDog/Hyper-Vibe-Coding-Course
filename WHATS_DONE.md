# ✅ WHATS_DONE.md — HyperCode Ecosystem
> One file. Short bullets. No walls of text.
> **Updated: May 2, 2026** — update this every session.

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
- **Healer on obs-net** — can now reach Grafana/Prometheus for diagnostics ✅ ← **April 19**

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
- `/register` page shows `Failed to fetch` — needs investigation ⚠️

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

## 🔧 ONE-TIME MANUAL STEPS REMAINING

- [ ] **Vercel: set Root Directory = `frontend`** (Project → Settings → General → Root Directory) and remove the `NODE_ENV=development` env var
- [ ] Register Supabase DB Webhook: `token_transactions` → INSERT → `sync-tokens-to-v24`
- [ ] Set `COURSE_WEBHOOK_SECRET` in V2.4 `.env` AND Supabase Edge Function env vars
- [ ] Fix `.env` file — rename any vars with `-` dashes to `_` underscores (PowerShell deploy fix)
- [ ] Fix `/register` page — `Failed to fetch` error on sign-up form
- [ ] Fix frontend hooks: any hardcoded port 8081 → 8000
- [ ] `VITE_STRIPE_PAYMENT_LINK_URL` — set in `.env.local` + Vercel
- [ ] Add `DISCORD_USER_ID=<your_id>` to `.env` for `make calm` token awards
- [ ] E2E test `shop-purchase` with real JWT (user needs to be logged in on site first)

---

## 🚀 NEXT UP (in order)

1. **Vercel** — set Root Directory = `frontend`, remove `NODE_ENV=development`, redeploy
2. **Fix `/register` — `Failed to fetch`** — check Supabase auth + API route
3. **E2E test shop-purchase** — get JWT from logged-in session, run curl test
4. **Blockers B1-B3** — Supabase DB webhook + Edge Function secrets + Stripe E2E re-verify
5. **HyperAgent-SDK Phase 2** — validator UX, starter templates, npm 0.2.0
6. **Fix GitHub Actions billing lock** — github.com/settings/billing
7. **BROskiPets Phase 1** — mint first pet via BROski$
8. **MERGE_ROADMAP Phase 3** — Agent sandbox access shop item

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
