# 🤖 HyperAgent-SDK + Hyperfocus Zone — Claude Context Handoff v2
> Read this first. Every word. Then start the mission.
> Updated: April 12, 2026 — Phases 0–3 complete. Phase 4 is CURRENT MISSION.

---

## Who You're Talking To
- **Lyndz** aka BROski♾️ (GitHub: @welshDog, npm: @w3lshdog) — South Wales
- Autistic + dyslexic + ADHD — chunked output, quick wins first, no waffle
- Windows primary (PowerShell), WSL2 + Raspberry Pi + Docker secondary
- Call them "Bro" — that's how we roll

---

## The Ecosystem

```
Hyper-Vibe-Coding-Course     ──── manifest.json ────▶    HyperCode V2.4
github.com/welshDog/             (hyper-agent-spec)       github.com/welshDog/
Hyper-Vibe-Coding-Course                                  HyperCode-V2.4
(Supabase + Vercel)                    │                  (Docker, 26 containers)
Path: H:\the hyper vibe coding hub     │                  Path: H:\HyperStation zone\
                                       │                       HyperCode\HyperCode-V2.4
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.4
                          Path: H:\HyperAgent-SDK
```

---

## 6-Phase Roadmap — Current Status

| Phase | Name | Status |
|---|---|---|
| 0 | Hard Conflict Fixes | ✅ DONE |
| 1 | Identity Bridge | ✅ DONE + VERIFIED LIVE |
| 2 | Token Sync | ✅ DONE |
| 3 | Agent Access + Shop Bridge | ✅ DONE |
| **4** | **npm run graduate 🔥** | **👈 CURRENT MISSION** |
| 5 | Observability | 🔜 |
| 6 | Terminal Tools Integration | 🔜 |

---

## ✅ What's Done — Full History

### HyperAgent-SDK ✅ SHIPPED
- `cli/validate.js` — AJV validator, coloured output, exit codes
- `hyper-agent-spec.json` — JSON Schema, if/then port enforcement
- `templates/python-starter/` + `templates/node-starter/` — both valid
- `npm test` — 2/2 passing ✅
- Published: `@w3lshdog/hyper-agent@0.1.4` live on npm ✅
- LICENSE (MIT) + CONTRIBUTING.md + docs/ ✅

### Phase 0 ✅ DONE
- `docker-compose.yml` — port 5432 removed, apps/web dropped
- `discord-bot/cogs/xp.py` — /leaderboard → /xp-leaderboard
- `002_add_discord_id_to_users.py` — Alembic migration created

### Phase 1 ✅ DONE + VERIFIED
Files built:
1. `backend/alembic/versions/003_add_discord_id.py` — discord_id VARCHAR(32) UNIQUE NULL
2. `backend/app/models/models.py` — discord_id added to User ORM
3. `backend/app/schemas/schemas.py` — discord_id in UserBase
4. `backend/app/api/v1/endpoints/users.py` — GET /api/v1/users/by-discord/{discord_id}
5. `supabase/functions/course-profile/index.ts` — edge fn, fans out to Supabase + V2.4
6. `agents/broski-bot/src/cogs/course_stats.py` — /coursestats Discord command
7. `bot.py` + `settings.py` — wired cog + course_profile_edge_url

**Verified:** `/coursestats` in Discord shows the dual-system embed ✅

### Bot Consolidation ✅ DONE
- Old course bot (Replit) — RETIRED
- `broski-bot` (HyperCode V2.4, Docker, 15 cogs) = THE ONE BOT

### Phase 2 ✅ DONE — Token Sync
Flow: Course token_transactions INSERT → sync-tokens-to-v24 edge fn → V2.4 POST /api/v1/economy/award-from-course
Files built:
1. `backend/alembic/versions/004_add_course_sync_events.py`
2. `backend/app/models/broski.py` — CourseSyncEvent ORM
3. `backend/app/core/config.py` — COURSE_SYNC_SECRET
4. `backend/app/api/v1/endpoints/economy.py` — award-from-course endpoint
5. `backend/app/api/api.py` — economy router wired
6. `supabase/functions/sync-tokens-to-v24/index.ts` — edge function

Dedup: source_id UNIQUE — same event twice = 409, never double coins ✅

### Phase 3 ✅ DONE — Agent Access + Shop Bridge
Flow: Student buys "Agent Sandbox Access" (300 BROski$) → provision-access edge fn → V2.4 POST /api/v1/access/provision → Discord DM with hc_ API key + Mission Control URL
Files built:
1. `backend/alembic/versions/005_add_access_provisions.py`
2. `backend/app/models/models.py` — AccessProvision ORM
3. `backend/app/core/config.py` — SHOP_SYNC_SECRET, DISCORD_BOT_TOKEN, MISSION_CONTROL_URL
4. `backend/app/api/v1/endpoints/access.py` — POST /provision + GET /my-provisions
5. `backend/app/api/api.py` — access router wired
6. `supabase/functions/provision-access/index.ts` — edge function

---

## 🎯 CURRENT MISSION — Phase 4: npm run graduate 🔥

This is the flagship. One command turns a Course student into a V2.4 developer.

```bash
npm run graduate
```

### 8-Step Graduation Script:
1. `npx @w3lshdog/hyper-agent validate .agents/` — validate all agents
2. Fetch student identity via `course-profile` edge function
3. `generate-v2-config` → build `docker-compose.agents.yml`
4. Scaffold `v2-deployment/` from Handlebars templates
5. Write runtime-specific Dockerfiles (python/node/deno)
6. Create GitHub PR
7. `award-graduate-badge` → Level 4 upgrade in V2.4
8. V2.4 bot sends Discord DM with Mission Control URL

**Done when:** Student runs `npm run graduate` → PR created → badge awarded → Discord DM arrives with Mission Control URL. Runtime <60 seconds.

---

## 🛡️ Licensing — COMPLETED April 12, 2026

| Repo | License | Status |
|---|---|---|
| HyperCode V2.4 | AGPL-3.0 | ✅ Already correct |
| Hyper-Vibe-Coding-Course | AGPL-3.0 | ✅ Upgraded from MIT |
| THE-HYPERCODE | AGPL-3.0 | ✅ First license ever |
| HyperAgent-SDK | MIT | ✅ Kept — SDK needs wide adoption |

Copyright: `Copyright (C) 2026 Lyndon Williams (welshDog) & HyperCode Contributors`

Why AGPL-3.0: Forces network SaaS forks to open-source their changes. Prevents corporate exploitation.
Why SDK stays MIT: Maximum adoption. AGPL on the platform still catches closed platform forks.

### License Commits
- Hyper-Vibe-Coding-Course → AGPL-3.0: `f78e705`
- THE-HYPERCODE → AGPL-3.0 (first ever): `4ccdf8b`
- AGPL badge added to Course README: `3929972`
- New THE-HYPERCODE README + ecosystem table + badge: `2aa20b8`

---

## 🔌 API Endpoints Built

### V2.4 Endpoints
| Method | Endpoint | Purpose | Phase |
|---|---|---|---|
| GET | `/api/v1/users/by-discord/{discord_id}` | Look up user by Discord ID | 1 |
| POST | `/api/v1/users/link-course` | Link Course + V2.4 accounts | 1 |
| POST | `/api/v1/economy/award-from-course` | Receive token sync (idempotent) | 2 |
| POST | `/api/v1/access/provision` | Generate API key + Mission Control URL | 3 |
| GET | `/api/v1/access/my-provisions` | List a user's provisioned access | 3 |

### Course Edge Functions
| Function | Trigger | Purpose | Phase |
|---|---|---|---|
| `course-profile` | HTTP (Discord bot) | Fan out to Supabase + V2.4 | 1 |
| `sync-tokens-to-v24` | token_transactions INSERT | Sync BROski$ to V2.4 | 2 |
| `provision-access` | shop_purchases INSERT | Trigger V2.4 access provisioning | 3 |

---

## 🛡️ Security Architecture
- All sensitive endpoints use shared secrets (COURSE_SYNC_SECRET, SHOP_SYNC_SECRET)
- award_tokens() + spend_tokens() are SECURITY DEFINER — never callable from browser
- Dedup via source_id UNIQUE prevents economic exploits on webhook retries
- agent_access_level only upgradeable via approved award-graduate-badge flow
- Semgrep + Trivy on every push
- No .env files, Discord tokens, or CLAUDE.md ever committed to git

---

## 📊 Performance Targets
| Metric | Target | Status |
|---|---|---|
| API response time | <100ms | ✅ Validated |
| Token sync latency | <30 seconds | ✅ Phase 2 done |
| Graduate script runtime | <60 seconds | 🎯 Phase 4 target |
| Memory usage | <50% (2.4GB) | ✅ Currently 33% |
| Uptime | >99.9% | ✅ Currently 99.95% |
| Test coverage (new code) | 85–90% | 🎯 Spec target |

---

## 🖳️ Database Migration History
| Migration | What | Phase |
|---|---|---|
| 001_broski_token_system | Base token tables | Pre-existing |
| 002_add_discord_id_to_users | discord_id on users (30 chars) | Phase 0 |
| 003_add_discord_id | discord_id VARCHAR(32) UNIQUE NULL | Phase 1 |
| 004_add_course_sync_events | course_sync_events + source_id UNIQUE | Phase 2 |
| 005_add_access_provisions | access_provisions table | Phase 3 |

---

## 🚫 Permanent Boundaries (Never Change These)
- Supabase schema ↔ V2.4 Postgres — **never merge**
- `.env` files, Discord tokens, CLAUDE.md — **never commit**
- `apps/web/` — **archived**, never migrated
- V2.4 docker-compose into Course — **never** (Course = Vercel, zero containers)
- One bot only: **broski-bot**. Old Replit bot = retired.

---

## Key Technical Decisions (don't re-debate these)
- Port convention: 3100-3199 writing, 3200-3299 code, 3300-3399 data, 3400-3499 discord, 3500-3599 automation
- `mcp_compatible: true` requires `port` — enforced in spec
- Supabase schema ↔ V2.4 Postgres NEVER merge
- Windows PowerShell first, bash second — always
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- One bot: broski-bot. Old Replit bot = dead.

---

## Paths (copy-paste ready)

```powershell
# HyperAgent-SDK
cd "H:\HyperAgent-SDK"

# HyperCode V2.4
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4\backend"

# Hyper-Vibe-Coding-Course
cd "H:\the hyper vibe coding hub"

# V2.4 Docker commands
docker compose up -d
docker compose exec api alembic upgrade head
docker compose exec api alembic history --verbose
```

---

## npm / SDK Quick Reference

```powershell
# Validate agents
npx @w3lshdog/hyper-agent validate .agents/my-agent/
npx @w3lshdog/hyper-agent validate .agents/

# Publish new version
npm version patch --no-git-tag-version
npm publish --access public --tag alpha
```

---

## BROski$ Token Economy (Course side)
- `public.users.broski_tokens` — balance column
- `token_transactions` — append-only ledger with idempotency guards
- `award_tokens()` + `spend_tokens()` — SECURITY DEFINER, server-side only
- `shop_items` + `shop_purchases` — JSONB metadata fields
- Stripe integration for token packs (Starter/Builder/Hyper)

---

## 🏗️ Built By
**Lyndz (@welshDog)** — Solo indie dev, South Wales 🏴‍☠️
Built neurodivergent-first. ADHD-friendly. Fast feedback. Real tools. No fluff. 🧠⚡

*"From Course student to production developer — one command."*
