# CLAUDE.md — Hyper Vibe Coding Course Platform
# 🦅 Part of HyperCode V2.4 — Claude AI Project Intelligence

> This file is auto-read by Claude AI when analysing this repository.
> It provides essential project context, conventions, and guidance.
> **Last updated: April 26, 2026 — Gamification FULLY LIVE — Supabase wired, HUD in App.tsx, 33 E2E tests passing ✅**
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

> 🟢 ALL 29 CONTAINERS HEALTHY + GAMIFICATION STACK LIVE 🦅🔥

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
| 11A | Live HUD components (HUD.tsx, XPToast, RiftBanner) | ✅ DONE — April 26, 2026 ⚡ |
| 11B | Rift Events system (RiftBanner + api/rifts.py) | ✅ DONE — April 26, 2026 🌀 |
| 11C | Supabase gamification schema (migration) | ✅ DONE — April 26, 2026 🗄️ |
| 11D | HUD wired into App.tsx + Layout.tsx (auth-aware) | ✅ DONE — April 26, 2026 🔗 |
| 11E | HUDContext + useRift.ts reading from Supabase directly | ✅ DONE — April 26, 2026 ⚡ |
| 11F | E2E tests updated + all 33 passing | ✅ DONE — April 26, 2026 🧪 |

---

## ⚡ GAMIFICATION SYSTEM — FULLY LIVE (April 26, 2026)

> Claude: This system is COMPLETELY BUILT AND WIRED. **Do NOT suggest building or re-wiring it.**
> Frontend reads from Supabase directly — the legacy FastAPI endpoints are mock-only backups.

### Architecture (Final State)

```
Student submits code
       ↓
awardXP(25) called → HUDContext updates immediately → XPToast fires ⚡
       ↓
Supabase `user_xp` table updated via direct client call
       ↓
HUD bar animates to new XP total 🎯
       ↓
If rift active in `rifts` table → RiftBanner shows 2x multiplier countdown 🌀
```

### Files (ALL COMPLETE ✅)

| File | Status | Notes |
|------|--------|-------|
| `frontend/src/components/HUD.tsx` | ✅ LIVE | Sticky top bar: XP bar + BROski$ + streak |
| `frontend/src/components/XPToast.tsx` | ✅ LIVE | Animated +XP popup, auto-dismisses 2.2s |
| `frontend/src/components/RiftBanner.tsx` | ✅ LIVE | Purple banner + countdown, red panic at <5 min |
| `frontend/src/components/Layout.tsx` | ✅ UPDATED | HUD inserted into app shell |
| `frontend/src/context/HUDContext.tsx` | ✅ LIVE | Reads from Supabase `user_xp` table directly |
| `frontend/src/hooks/useHUD.ts` | ✅ LIVE | Hook — call `awardXP(n)` anywhere |
| `frontend/src/hooks/useRift.ts` | ✅ LIVE | Reads from Supabase `rifts` table directly |
| `frontend/src/App.tsx` | ✅ UPDATED | Wrapped with `<HUDProvider userId={user.id}>` |
| `api/xp_events.py` | ⚠️ MOCK ONLY | Legacy FastAPI endpoints — frontend no longer calls these |
| `api/rifts.py` | ⚠️ MOCK ONLY | Legacy in-memory store — frontend uses Supabase directly |
| `supabase/migrations/20260426162000_xp_rifts_gamification.sql` | ✅ LIVE | `user_xp` + `xp_events` + `rifts` tables + RLS |
| `frontend/tests/auth.spec.ts` | ✅ UPDATED | Mocks Supabase REST for `user_xp` + `rifts` + `broski_tokens` |
| `frontend/tests/learning.spec.ts` | ✅ UPDATED | Asserts HUD presence on learning pages |

### Supabase Tables (LIVE as of April 26, 2026)

```sql
-- ALL THREE TABLES CREATED via migration 20260426162000
user_xp     — user_id PK, total_xp, tokens, streak_days, last_active, level
xp_events   — log of every XP award (event_type, amount, rift_multiplier, course_id, quest_id)
rifts       — active/past rifts (topic, multiplier, expires_at, description, created_by)
```

- RLS policies applied to all 3 tables ✅
- Indices on `user_id` + `expires_at` for performance ✅

### XP Award Values
```
code_submit      = 25 XP
quest_complete   = 100 XP
daily_login      = 10 XP
course_complete  = 500 XP
first_attempt    = 15 XP
```
All values support `rift_multiplier` — double during active rifts.

### Fire a Rift (admin CLI — still works via legacy endpoint OR direct Supabase insert)
```bash
curl -X POST http://localhost:8000/api/rifts/create \
  -H 'Content-Type: application/json' \
  -d '{"topic": "async/await", "multiplier": 2.0, "duration_minutes": 45}'
```

### Test Results (April 26, 2026)
```
Frontend lint:  ✅ 1 warning only (react-refresh in HUDContext.tsx — acceptable)
Frontend build: ✅ clean TypeScript compile
E2E tests:      ✅ 33 passed
API tests:      ✅ (no API tests yet — by design)
```

---

## 🗺️ NEXT UP — Remaining Work (as of April 26, 2026)

| # | Task | Priority |
|---|---|---|
| 1 | Quest-based learning modules UI (`QuestPage.tsx`) | 🔴 Day 3 |
| 2 | `/economy/award-from-course` endpoint | 🔴 Day 4 |
| 3 | Global leaderboard page | 🟡 Day 5 |
| 4 | Admin Rift control panel UI | 🟡 Day 6 |
| 5 | Hero onboarding page + invite first real student | 🟡 Day 7 |
| 6 | Record Module 1.1 + add YouTube URL to DB | 🟡 Ongoing |
| 7 | Agent image CVE patching (14 HIGH, no Debian fix yet) | 🟡 Batch job |
| 8 | Promote `api/rifts.py` from mock to production (Supabase-backed admin endpoint) | 🟡 Soon |

---

## 📁 Directory Structure Guide

```
Hyper-Vibe-Coding-Course/
├── frontend/src/
│   ├── components/
│   │   ├── HUD.tsx              ✅ LIVE — sticky XP/token/streak bar
│   │   ├── XPToast.tsx          ✅ LIVE — animated +XP popup
│   │   ├── RiftBanner.tsx       ✅ LIVE — live rift event banner
│   │   └── Layout.tsx           ✅ UPDATED — HUD in app shell
│   ├── context/
│   │   └── HUDContext.tsx       ✅ LIVE — Supabase-wired state + awardXP()
│   ├── hooks/
│   │   ├── useHUD.ts            ✅ LIVE — hook to use HUD anywhere
│   │   └── useRift.ts           ✅ LIVE — reads Supabase `rifts` table
│   ├── pages/
│   ├── App.tsx              ✅ UPDATED — HUDProvider wrapping auth user
│   └── main.tsx
├── api/
│   ├── xp_events.py         ⚠️ MOCK — legacy, not called by frontend
│   └── rifts.py             ⚠️ MOCK — legacy, admin CLI use only
├── supabase/
│   └── migrations/
│       └── 20260426162000_xp_rifts_gamification.sql  ✅ APPLIED
├── docs/
│   └── HUD_RIFT_GUIDE.md    ✅ Full wiring guide
├── frontend/tests/
│   ├── auth.spec.ts         ✅ UPDATED — mocks Supabase user_xp + rifts
│   └── learning.spec.ts     ✅ UPDATED — asserts HUD presence
└── CLAUDE.md              ← you are here
```

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

### DB Schema: XP / Gamification ✅ LIVE (April 26, 2026)
```sql
-- migration: supabase/migrations/20260426162000_xp_rifts_gamification.sql
user_xp(
  user_id     text PRIMARY KEY,
  total_xp    integer DEFAULT 0,
  tokens      integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_active timestamptz,
  level       integer DEFAULT 1
);

xp_events(
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text,
  event_type      text,
  amount          integer,
  rift_multiplier float DEFAULT 1.0,
  course_id       text,
  quest_id        text,
  created_at      timestamptz DEFAULT now()
);

rifts(
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       text,
  multiplier  float,
  expires_at  timestamptz,
  description text,
  created_by  text,
  created_at  timestamptz DEFAULT now()
);
```

### RLS Security ✅
- `user_loyalty_tier` view — `security_invoker = on` (DO NOT change to SECURITY DEFINER)
- `users`, `token_transactions`, `user_xp`, `xp_events`, `rifts` — all RLS ON ✅

### Stripe Webhook
- Webhook name: `vibe-hook` (keep this one)
- Endpoint: `https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `charge.refunded`
- `brilliant-triumph` webhook = duplicate, safe to delete

---

## 💳 Phase 10F — Stripe Checkout API (LIVE)

### Live Endpoints
```
POST /api/stripe/checkout    → creates Stripe Checkout Session, returns URL
GET  /api/stripe/plans       → lists available plan names
POST /api/stripe/webhook     → handles Stripe events (signature verified)
```

### Stripe Prices — LOCKED
| Pack | Price | Tokens |
|---|---|---|
| Starter | £5 | 200 BROski$ |
| Builder | £15 | 800 BROski$ |
| Hyper | £35 | 2500 BROski$ |

| Tier | Monthly | Yearly |
|---|---|---|
| Pro | £9/mo | £90/yr |
| Hyper | £29/mo | £290/yr |

---

## 🔐 Security Standards — MANDATORY FOR ALL DOCKERFILES

### Rule 1 — Base Image: `FROM python:3.11-slim` (NEVER `python:latest`)
### Rule 2 — OS Package Hardening
```dockerfile
RUN apt-get update --allow-releaseinfo-change && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends ca-certificates curl libexpat1 openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```
### Rule 3 — Pip Hardening
```dockerfile
RUN pip install --upgrade --no-cache-dir \
    "pip==26.0.1" "setuptools>=80.0.0" "wheel==0.46.2" \
    "jaraco.context>=6.0.0" "jaraco.functools>=4.1.0" "jaraco.text>=4.0.0"
```
### Rule 4 — Never Root: `RUN groupadd -r appuser && useradd -r -g appuser appuser` + `USER appuser`
### Rule 5 — Trivy scanner: target ZERO CRITICAL, <5 HIGH

---

## 🚀 MCP Integration
- `mcp__hypercode__hypercode_system_health`
- `mcp__hypercode__hypercode_agent_system_health`
- `mcp__hypercode__hypercode_list_agents`
- `mcp__hypercode__hypercode_list_tasks`

---

## 🚨 Key Technical Rules (never re-debate these)

- **Docker imports:** `from app.X import Y` — NEVER `from backend.app.X import Y`
- **FastAPI routing:** First-match wins — public routes BEFORE auth-gated compat routes
- **HUD data source:** Frontend reads `user_xp` + `rifts` from Supabase directly — NOT from `api/xp_events.py` or `api/rifts.py`
- **Legacy API endpoints:** `api/xp_events.py` + `api/rifts.py` are MOCK ONLY — do not wire frontend to them
- **Rifts admin:** Use direct Supabase insert OR legacy CLI curl endpoint for creating rifts
- **HUDContext lint warning:** `react-refresh/only-export-components` in HUDContext.tsx — known, acceptable, do not auto-fix
- **Supabase ↔ V2.4 Postgres:** NEVER merge schemas
- **`.env` files:** Never committed — use Docker secrets in production
- **Stripe webhook:** `/api/stripe/webhook` is rate-limit exempt — do NOT add rate limiting
- **Stripe checkout mode:** token packs = `mode="payment"`, course plans = `mode="subscription"`
- **Stripe container context:** `docker context use desktop-linux`
- **Supabase courses table:** `price_pence` (int) + `is_active` (bool) — NOT `price` or `is_published`
- **`public.user_loyalty_tier`:** `security_invoker = on` — DO NOT change to SECURITY DEFINER
- **Alembic:** If `alembic_version` missing, run `alembic stamp 006` first
- **One bot:** broski-bot only. Old Replit bot = dead.
- **API keys:** `hc_` prefix + `secrets.token_urlsafe(32)` = 43 chars
- **`apps/web/`:** Archived, never migrate
- **Conventional commits:** `feat:` `fix:` `docs:` `chore:`
- **Windows PowerShell first**, bash second

---

## ⚠️ Known Issues & Gotchas

1. **Windows path handling** — Use `docker-compose.windows.yml` on Windows
2. **Secrets management** — Never commit `.env`; secrets in `./secrets/*.txt`
3. **POSTGRES_PASSWORD** — Plain in `.env` (quoted if special chars). No `POSTGRES_PASSWORD_FILE` alongside.
4. **Agent boot order** — Redis + PostgreSQL must be healthy before agents start
5. **Port conflicts** — Ensure 3000, 3001, 8000, 8008, 8080, 8081, 8088 are free
6. **Test environment** — `fakeredis` used in tests; import via `fakeredis.aioredis`
7. **Volumes wipe** — Alpine trick: `docker run --rm -v "/path":/target alpine sh -c "rm -rf /target/*"`
8. **hypercode-core memory** — Alert if > 1.2 GiB
9. **HUDContext lint warning** — `react-refresh/only-export-components` — known + acceptable

---

## 📚 Further Reading

- [README.md](README.md)
- [docs/HUD_RIFT_GUIDE.md](docs/HUD_RIFT_GUIDE.md) — HUD + Rift wiring guide ⚡
- [supabase/migrations/](supabase/migrations/) — all DB migrations
- [.claude/](.claude/) — Claude AI config, skills & settings

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
