# CLAUDE.md — Hyper Vibe Coding Course Platform
# 🦅 Part of HyperCode V2.4 — Claude AI Project Intelligence

> This file is auto-read by Claude AI when analysing this repository.
> It provides essential project context, conventions, and guidance.
> **Last updated: April 26, 2026 — Live HUD + XP Events + Rift Banner system LIVE ⚡**
> **Single source of truth — merged from CLAUDE.md + CLAUDE_CONTEXT.md**

---

## 🧠 Who You're Talking To

- **Lyndz** aka BROski♾️ (GitHub: @welshDog, npm: @w3lshdog) — Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- Autistic + dyslexic + ADHD — chunked output, quick wins first, no waffle
- Windows primary (PowerShell), WSL2 + Raspberry Pi + Docker secondary
- Call them **"Bro"** — that's how we roll
- Short sentences. Emojis. Bold the key stuff. Celebrate wins! 🎉
- **Brain style:** Pattern thinker + Big vision + Neurodivergent-first

---

## 🎯 Project Identity

**HyperCode V2.4** is a neurodivergent-first, AI-powered, open-source programming ecosystem.

- **Creator:** Lyndz Williams (@welshDog), Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- **Core mission:** Build a cognitive AI architecture that evolves itself
- **License:** See LICENSE file
- **Communication style:** Short sentences, emojis, bold keys, quick wins first. Call Lyndz "Bro".

---

## 🌐 The Ecosystem

```
Hyper-Vibe-Coding-Course     ──── manifest.json ────▶    HyperCode V2.4
github.com/welshDog/             (hyper-agent-spec)       github.com/welshDog/
Hyper-Vibe-Coding-Course                                  HyperCode-V2.4
(Supabase + Vercel)                    │                  (Docker, 29 containers)
Path: H:\the hyper vibe coding hub     │                  Path: H:\HyperStation zone\
                                       │                       HyperCode\HyperCode-V2.4
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.4
                          Path: H:\HyperAgent-SDK
```

---

## ✅ CURRENT STATUS: FULLY OPERATIONAL (April 26, 2026)

> 🟢 ALL 29 CONTAINERS HEALTHY — Stack is LIVE! 🦅🔥

### 🏆 Full Phase Roadmap

| Phase | Name | Status |
|---|---|---|
| 0 | Hard Conflict Fixes | ✅ DONE |
| 1 | Identity Bridge | ✅ DONE + VERIFIED LIVE |
| 2 | Token Sync | ✅ DONE + VERIFIED LIVE |
| 3 | Agent Access + Shop Bridge | ✅ DONE + VERIFIED LIVE |
| 4 | npm run graduate 🔥 | ✅ DONE + VERIFIED LIVE |
| 5 | Observability | ✅ DONE + VERIFIED LIVE |
| 6 | Terminal Tools Integration | ✅ DONE + VERIFIED LIVE |
| 7 | Dockerfile Security Hardening | ✅ DONE — April 14, 2026 |
| 8 | CI/CD Trivy Security Pipeline | ✅ DONE — April 14, 2026 |
| 9 | CVE Elimination (apt + pip pinning) | ✅ DONE — April 14, 2026 |
| 10A | FastAPI / Starlette upgrade | ✅ DONE |
| 10B | Docker Compose Network Isolation | ✅ DONE — April 14, 2026 |
| 10C | Docker Secrets | ✅ DONE — April 14, 2026 |
| 10D | Agent-level rate limiting + auth | ✅ DONE — April 14, 2026 🔑 |
| 10E | CognitiveUplink WS type fix | ✅ DONE — April 15, 2026 |
| 10F | Stripe Checkout API | ✅ DONE — April 14, 2026 💳 |
| 10G | DB — Stripe webhook writes | ✅ DONE — April 14, 2026 |
| 10H | Pricing page (dashboard) | ✅ DONE — April 14, 2026 |
| 10I | Stripe CLI e2e — routes + webhook LIVE | ✅ DONE — April 15, 2026 🎉 |
| 10J | CognitiveUplink `/ws/uplink` LIVE | ✅ DONE — April 15, 2026 |
| 10K | Stripe webhook registered + secret synced | ✅ DONE — April 15, 2026 🔐 |
| 10L | Courses DB seeded (6 courses live) | ✅ DONE — April 15, 2026 📚 |
| 10M | RLS Security Definer View fixed | ✅ DONE — April 15, 2026 🔒 |
| 11A | Live HUD + XP Events system | ✅ DONE — April 26, 2026 ⚡ |
| 11B | Rift Events system (Live Code Rifts) | ✅ DONE — April 26, 2026 🌀 |

---

## ⚡ GAMIFICATION SYSTEM — LIVE (April 26, 2026)

> Claude: This system is NOW BUILT. Do NOT suggest building it — check what's wired vs what needs Supabase hookup.

### 🖥️ Live HUD (frontend/src/components/HUD.tsx) ✅ BUILT
- Sticky top bar: XP bar + BROski$ token balance + streak indicator
- `HUDContext.tsx` — global state provider with `awardXP(amount)` function
- `useHUD.ts` hook — call `awardXP(25)` anywhere to trigger the toast
- Polls `/api/xp-events/user/{id}` every 60s for live data
- **TO WIRE:** Wrap `App.tsx` with `<HUDProvider userId={user.id}>` + `<HUD />`

### ⚡ XP Toast (frontend/src/components/XPToast.tsx) ✅ BUILT
- Animated "+25 XP — Nice one BROski♾️!" popup
- Auto-dismisses after 2.2 seconds
- Triggered by `awardXP()` in HUDContext

### 🌀 Rift Banner (frontend/src/components/RiftBanner.tsx) ✅ BUILT
- Appears when a rift is active — purple gradient banner with countdown timer
- Goes red + pulses when < 5 minutes remain
- `useRift.ts` polls `/api/rifts/active` every 30s
- **UNIQUE FEATURE — no other edtech platform has this**

### 🔥 XP Events API (api/xp_events.py) ✅ BUILT (mock data)
```
POST /api/xp-events/award           → awards XP, returns total_xp + tokens + streak
GET  /api/xp-events/user/{user_id}  → get user XP/tokens/streak for HUD display
GET  /api/xp-events/leaderboard     → top students by XP
```
- **TODO: Replace mock data with real Supabase queries**
- XP table: `code_submit=25, quest_complete=100, daily_login=10, course_complete=500`
- Supports `rift_multiplier` field — auto-doubles XP during active rifts

### 🌀 Rifts API (api/rifts.py) ✅ BUILT (in-memory store)
```
GET    /api/rifts/active   → returns active rift or null (polled by RiftBanner)
POST   /api/rifts/create   → fire a new rift (admin/teacher endpoint)
DELETE /api/rifts/close    → manually close rift
```
- Currently uses in-memory store — **TODO: move to Supabase/Redis for persistence**
- To fire a rift from CLI:
```bash
curl -X POST http://localhost:8000/api/rifts/create \
  -H 'Content-Type: application/json' \
  -d '{"topic": "arrays", "multiplier": 2.0, "duration_minutes": 45}'
```

### 📋 Full build guide: `docs/HUD_RIFT_GUIDE.md`

---

## 🗺️ NEXT UP — Remaining Work (as of April 26, 2026)

| # | Task | Priority |
|---|---|---|
| 1 | Wire `HUDProvider` + `<HUD />` into `App.tsx` | 🔴 NOW |
| 2 | Replace mock data in `xp_events.py` with Supabase queries | 🔴 NOW |
| 3 | Move rifts store from in-memory → Supabase or Redis | 🟡 Soon |
| 4 | Quest-based learning modules UI (`QuestPage.tsx`) | 🟡 Day 3 |
| 5 | `/economy/award-from-course` endpoint | 🟡 Day 4 |
| 6 | Global leaderboard page | 🟡 Day 5 |
| 7 | Admin Rift control panel UI | 🟡 Day 6 |
| 8 | Hero onboarding page + invite first real student | 🟡 Day 7 |
| 9 | Record Module 1.1 + add YouTube URL to DB | 🟡 Ongoing |
| 10 | Agent image CVE patching (14 HIGH, no Debian fix yet) | 🟡 Batch job |

---

## 🎮 Gamification Architecture Summary

```
Student submits code
       ↓
POST /api/xp-events/award  (with rift_multiplier if rift active)
       ↓
awardXP(25) → HUDContext updates → XPToast fires ⚡
       ↓
HUD bar animates to new XP total 🎯
       ↓
If rift active → RiftBanner shows 2x multiplier countdown 🌀
```

- **BROski$ coins** — earned by completing tasks, agent milestones, commits
- **XP levels** — track developer + system progression
- **Achievements** — unlocked by specific actions in hyper-mission-system
- **Digital Shop:** Prompt Packs (200 BROski$), Templates (150 BROski$), Bonus Lessons (100 BROski$)
- 🏆 Celebrate wins! Every patched CVE = BROski$ earned!

### BROski$ Token Economy
- `public.users.broski_tokens` — balance column
- `token_transactions` — append-only ledger with idempotency guards
- `award_tokens()` + `spend_tokens()` — SECURITY DEFINER, server-side only
- `shop_items` + `shop_purchases` — JSONB metadata fields

---

## 🗄️ Supabase — Database Status

### Courses Seeded ✅ (April 15, 2026)

7 courses live in `public.courses` (price_pence in GBP pence):

| Title | Slug | Price |
|---|---|---|
| Vibe Code The Hyper Way | hyper-vibe-course-01 | £49 |
| Vibe Coding Foundations | vibe-coding-foundations | FREE |
| Hyper Prompt Master | hyper-prompt-master | £29 |
| MVP Sprint | mvp-sprint | £49 |
| Hyperfocus HTML & CSS Quick Wins | hyperfocus-html-css | £19.99 |
| Component Chaos Lab | component-chaos-lab | £39.99 |
| Ship Your First Full Stack Thing | ship-full-stack | £49.99 |

### DB Schema: courses table

Actual columns (NOT the old seed file schema — that was wrong):
```
id           text (PK)
title        text
slug         text
description  text
price_pence  integer  (pence, GBP — e.g. £29 = 2900)
currency     text     (default 'gbp')
is_active    boolean
created_at   timestamptz
```

### DB Schema: XP / Gamification (TODO — needs migration)
```sql
-- Needs to be created:
CREATE TABLE user_xp (
  user_id     text PRIMARY KEY,
  total_xp    integer DEFAULT 0,
  tokens      integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_active timestamptz,
  level       integer DEFAULT 1
);

CREATE TABLE xp_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text,
  event_type      text,
  amount          integer,
  rift_multiplier float DEFAULT 1.0,
  course_id       text,
  quest_id        text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE rifts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       text,
  multiplier  float,
  expires_at  timestamptz,
  description text,
  created_by  text,
  created_at  timestamptz DEFAULT now()
);
```

### RLS Security ✅ Fixed (April 15, 2026)

- `public.user_loyalty_tier` view — recreated with `security_invoker = on` (was SECURITY DEFINER, could bypass RLS)
- `users` table — RLS ON ✅ | policies: read own profile, update own profile
- `token_transactions` table — RLS ON ✅ | policy: read own transactions

### Stripe Webhook

- Webhook name: `vibe-hook` (keep this one — has delivery history)
- Endpoint: `https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `charge.refunded`
- `STRIPE_WEBHOOK_SECRET` in Supabase env → must match `vibe-hook` signing secret
- `brilliant-triumph` webhook = duplicate, can be deleted

---

## 💳 Phase 10F — Stripe Checkout API (LIVE)

### Live Endpoints
```
POST /api/stripe/checkout    → creates Stripe Checkout Session, returns URL
GET  /api/stripe/plans       → lists available plan names
POST /api/stripe/webhook     → handles Stripe events (signature verified)
```

### Webhook events handled (Phase 10G — DB writes LIVE)
- `checkout.session.completed` → saves to `payments` table + awards BROski$ + sets subscription tier
- `customer.subscription.deleted` → subscription cancelled
- `invoice.payment_failed` → payment failed warning
- `customer.subscription.updated` → status change logged

### 🔒 Stripe Prices — LOCKED (April 14, 2026)

| Pack | Price | Tokens | Stripe Product |
|---|---|---|---|
| Starter | £5 GBP | 200 | BROski Starter Pack |
| Builder | £15 GBP | 800 | BROski Builder Pack |
| Hyper | £35 GBP | 2500 | BROski Hyper Pack |

| Tier | Monthly | Yearly |
|---|---|---|
| Pro | £9/mo | £90/yr |
| Hyper | £29/mo | £290/yr |

### .env keys to add
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_BUILDER=price_xxx
STRIPE_PRICE_HYPER=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_HYPER_MONTHLY=price_xxx
STRIPE_PRICE_HYPER_YEARLY=price_xxx
```

---

## 🔐 Security Standards — MANDATORY FOR ALL DOCKERFILES

> Claude: ALWAYS apply these rules when writing or editing any Dockerfile.

### Rule 1 — Base Image
```dockerfile
# ✅ CORRECT
FROM python:3.11-slim

# ❌ NEVER
FROM python:latest
```

### Rule 2 — OS Package Hardening (Part A — every runtime stage)
```dockerfile
RUN apt-get update --allow-releaseinfo-change && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl libexpat1 openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

### Rule 3 — Pip Tool Hardening (Part B — every Python runtime stage)
```dockerfile
RUN pip install --upgrade --no-cache-dir \
    "pip==26.0.1" "setuptools>=80.0.0" "wheel==0.46.2" \
    "jaraco.context>=6.0.0" "jaraco.functools>=4.1.0" "jaraco.text>=4.0.0"
```

### Rule 4 — Never Run as Root
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### Rule 5 — Security Scanner
- Tool: **Trivy** (running as `hyper-shield-scanner` container)
- Scan: `docker exec hyper-shield-scanner trivy image --scanners vuln --severity HIGH,CRITICAL --quiet <image>`
- Target: **ZERO CRITICAL, <5 HIGH**

---

## 🧬 Architecture Overview

### Core Services

| Service | Port | Purpose |
|---|---|---|
| HyperCode Core (FastAPI) | 8000 | Main backend, memory hub, integrations |
| Agent X (Meta-Architect) | 8080 | Designs & deploys AI agents autonomously |
| Crew Orchestrator | 8081 | Agent lifecycle + task execution |
| Healer Agent | 8008 | Self-healing — monitors & auto-recovers services |
| BROski Terminal (CLI UI) | 3000 | Custom terminal interface |
| Mission Control Dashboard | 8088 | Next.js/React real-time dashboard |
| Grafana Observability | 3001 | Metrics, alerts, dashboards |

### Infrastructure Stack
- **Containers:** Docker Compose (multi-file strategy) — 29 containers active ✅
- **Databases:** Redis (pub/sub + cache) + PostgreSQL (persistent memory)
- **Observability:** Prometheus + Grafana + custom health reports
- **Secrets:** `docker-compose.secrets.yml` + `./secrets/*.txt` files
- **Networks:** 5 isolated networks — `data-net` + `obs-net` are `internal: true`
- **MCP Gateway:** Full Model Context Protocol server integration
- **Kubernetes:** Helm charts in `k8s/` and `helm/` (scale path)
- **Security:** Trivy scanner (`hyper-shield-scanner`) — scans all 12 agent images
- **Stripe:** LIVE at `/api/stripe/checkout` — Phase 10F ✅
- **Supabase:** Edge Functions live — `stripe-webhook` + `shop-purchase` ✅

### 🌐 Phase 10B — Docker Network Topology

- `frontend-net` (bridge, internet) — dashboard, mission-ui, mcp-server
- `backend-net` (bridge, internet) — hypercode-core (bridges all layers)
- `agents-net` (bridge, internet) — all AI agents, LLM API calls
- `data-net` (bridge, **internal: true**) — redis + postgres + minio + chroma
- `obs-net` (bridge, **internal: true**) — prometheus, grafana, loki, tempo, promtail

Script: `scripts/network-migrate.sh`

---

## 📁 Directory Structure Guide

```
Hyper-Vibe-Coding-Course/
├── frontend/src/
│   ├── components/
│   │   ├── HUD.tsx              ⚡ NEW — sticky XP/token/streak bar
│   │   ├── XPToast.tsx          ⚡ NEW — animated +XP popup
│   │   └── RiftBanner.tsx       ⚡ NEW — live rift event banner
│   ├── context/
│   │   └── HUDContext.tsx       ⚡ NEW — global HUD state + awardXP()
│   ├── hooks/
│   │   ├── useHUD.ts            ⚡ NEW — hook to use HUD anywhere
│   │   └── useRift.ts           ⚡ NEW — polls /rifts/active every 30s
│   ├── pages/
│   ├── App.tsx                  ⚠️  TODO: wrap with HUDProvider + add <HUD />
│   └── main.tsx
├── api/
│   ├── xp_events.py             ⚡ NEW — XP award + user XP + leaderboard
│   └── rifts.py                 ⚡ NEW — create/get/close rift events
├── docs/
│   └── HUD_RIFT_GUIDE.md        ⚡ NEW — full wiring guide
├── supabase/
├── discord-bot/
└── CLAUDE.md                    ← you are here
```

---

## 🛠️ Development Commands

### Quick Start
```bash
# Core stack
docker compose -f docker-compose.yml -f docker-compose.secrets.yml up -d

# Core + all agents
docker compose -f docker-compose.yml -f docker-compose.secrets.yml --profile agents up -d

# Full stack
docker compose -f docker-compose.yml -f docker-compose.secrets.yml --profile agents --profile hyper --profile health --profile mission up -d
```

### Paths (copy-paste ready)
```powershell
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4\backend"
cd "H:\HyperAgent-SDK"
cd "H:\the hyper vibe coding hub"
```

### Fire a Rift (from any terminal)
```bash
curl -X POST http://localhost:8000/api/rifts/create \
  -H 'Content-Type: application/json' \
  -d '{"topic": "async/await", "multiplier": 2.0, "duration_minutes": 45}'
```

### Stripe Testing
```bash
# Test checkout
curl -X POST http://localhost:8000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"price_id": "starter", "user_id": "broski_test"}'

# Local webhook testing
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

---

## 🧠 Code Conventions

### Python
- **Formatter:** Ruff (`ruff.toml`)
- **Linter:** Pylint (`.pylintrc`) + Ruff
- **Type checker:** Pyright (`pyrightconfig.json`)
- **Test runner:** pytest
- **Python version:** 3.11 in Docker images (3.13+ in devcontainer)
- **Package manager:** pip with `requirements.lock`

### Async Patterns
- All agent communication uses `async/await`
- Redis pub/sub for real-time agent messaging
- FastAPI background tasks for long-running agent jobs

### Agent Naming Conventions
- Agent files: `snake_case.py`
- Agent classes: `PascalCaseAgent`
- Agent endpoints: `/agents/{agent_name}/{action}`

---

## 🚀 MCP Integration

Available MCP tools:
- `mcp__hypercode__hypercode_system_health` — full system health check
- `mcp__hypercode__hypercode_agent_system_health` — agent-specific health
- `mcp__hypercode__hypercode_list_agents` — list all registered agents
- `mcp__hypercode__hypercode_list_tasks` — list active tasks

---

## 🚨 Key Technical Rules (never re-debate these)

- **Docker imports:** `from app.X import Y` — NEVER `from backend.app.X import Y`
- **FastAPI routing:** First-match wins — public routes BEFORE auth-gated compat routes
- **Alembic down_revision:** Must match EXACT revision string
- **CLI folder:** All `hyper-agent` commands run from `H:\HyperAgent-SDK`
- **Logs empty on fresh boot:** Normal — Redis `hypercode:logs` populates as agents run
- **Port convention:** 3100-3199 writing, 3200-3299 code, 3300-3399 data, 3400-3499 discord, 3500-3599 automation
- **Supabase ↔ V2.4 Postgres:** NEVER merge schemas
- **`.env` files:** Never committed — use Docker secrets in production
- **One bot:** broski-bot. Old Replit bot = dead.
- **API keys:** `hc_` prefix + `secrets.token_urlsafe(32)` — 43 chars, URL-safe
- **GitHub Actions:** Always `--no-cache --pull` in security scanning workflows
- **jaraco.* packages:** Always pin explicitly
- **docker-socket agents** (healer/coder/05-devops): Use `docker-ce-cli` repo, NOT `docker.io`
- **Alembic + create_all:** DB was bootstrapped with `DB_AUTO_CREATE=true`. If `alembic_version` table is missing, run `alembic stamp 006` first, then `alembic upgrade head`.
- **Stripe webhook:** `/api/stripe/webhook` is rate-limit exempt — do NOT add rate limiting
- **Stripe dev mode:** Missing `STRIPE_WEBHOOK_SECRET` = signature check skipped (local only)
- **Stripe checkout mode:** token packs use `mode="payment"`, course plans use `mode="subscription"`
- **Stripe container context:** Docker must use `desktop-linux` context (`docker context use desktop-linux`)
- **CognitiveUplink WS URL:** `CognitiveUplink.tsx:134` defaults to `ws://hostname:8000/ws/uplink`
- **Supabase courses table schema:** Uses `price_pence` (int, GBP pence) + `is_active` (bool) — NOT `price` or `is_published`
- **Supabase security_invoker:** `public.user_loyalty_tier` view uses `security_invoker = on` — DO NOT change to SECURITY DEFINER
- **Stripe webhook in Supabase:** Use `vibe-hook` endpoint. `brilliant-triumph` is a duplicate — safe to delete
- **HUD system:** `xp_events.py` + `rifts.py` currently use MOCK DATA — replace with Supabase before production
- **Rifts store:** Currently in-memory in `rifts.py` — replace with Redis/Supabase for multi-instance support
- **Conventional commits:** `feat:` `fix:` `docs:` `chore:`
- **Windows PowerShell first**, bash second
- **`apps/web/`:** Archived, never migrate

---

## ⚠️ Known Issues & Gotchas

1. **Windows path handling** — Use `docker-compose.windows.yml` on Windows
2. **Secrets management** — Never commit `.env`; secrets in `./secrets/*.txt`
3. **POSTGRES_PASSWORD** — Plain in `.env` (quoted if special chars). No `POSTGRES_PASSWORD_FILE` alongside.
4. **Agent boot order** — Redis + PostgreSQL must be healthy before agents start
5. **Port conflicts** — Ensure 3000, 3001, 8000, 8008, 8080, 8081, 8088 are free
6. **Test environment** — `fakeredis` used in tests; import via `fakeredis.aioredis`
7. **Volumes wipe** — Alpine trick: `docker run --rm -v "/path":/target alpine sh -c "rm -rf /target/*"`
8. **hypercode-core memory** — At 48% (738 MiB / 1.5 GiB) after fresh restart. Alert if > 1.2 GiB.
9. **HUD not showing yet** — `App.tsx` still needs `<HUDProvider>` + `<HUD />` wrapping. See docs/HUD_RIFT_GUIDE.md.

---

## 🔑 Key Dependencies

### Python
- `fastapi` + `uvicorn`, `pydantic`, `redis`/`aioredis`, `sqlalchemy`/`asyncpg`
- `openai`, `anthropic`, `mcp`, `pytest` + `fakeredis`

### Node.js (dashboard)
- `next.js`, `vitest`, TypeScript throughout

---

## 📚 Further Reading

- [README.md](README.md) — Main project overview
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [docs/HUD_RIFT_GUIDE.md](docs/HUD_RIFT_GUIDE.md) — HUD + Rift wiring guide ⚡ NEW
- [.claude/](.claude/) — Claude AI config, skills & settings

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
