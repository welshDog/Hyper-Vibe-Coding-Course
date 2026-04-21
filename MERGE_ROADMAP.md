# MERGE_ROADMAP.md
> Integration Phases: Hyper-Vibe-Coding-Course ↔ HyperCode V2.4
> Generated: 2026-04-11 | Audit Pass 1 — READ ONLY / PLANNING DOC

---

## Architecture Recap

Three repos. Two integrate, one bridges them:

```
HyperAgent-SDK (NEW)
  hyper-agent-spec.json
  npx hyper-agent validate
        ↑                    ↑
Hyper-Vibe Course        HyperCode V2.4
Teaches the spec         Consumes the spec
```

Nothing is "merged" in the git sense. They stay as separate repos. Integration = agreed contracts, API calls, and shared conventions.

---

## Phase 0 — Hard Conflict Fixes (Pre-requisite)

**Do this before anything else. These are breaking if skipped.**

| Fix | Repo | Status | Blocker For |
|-----|------|--------|-------------|
| Remove port 5432 from Course docker-compose.yml | ✅ Done |
| Remove apps/web from Course docker-compose.yml | ✅ Done |
| Rename /leaderboard → /xp-leaderboard | ✅ Done |
| Add discord_id VARCHAR(30) UNIQUE NULLABLE | ✅ Done |

**Estimated time:** 2–3 hours total. None are risky. All are small edits.

**Note on `apps/web` archival:** CLAUDE.md already says to ignore `apps/web/`. The docker-compose change just removes the port binding — no files deleted yet (archive in Week 2 Day 5 per sprint plan).

---

## Phase 1 — Identity Bridge (Week 3)

**Goal:** Both systems can look up the same human. Link Course `user.id` (UUID) to V2.4 user by Discord ID.

### Course side (4–6h)
- [ ] New Edge Function: `course-profile`
  - Input: JWT (identifies Course user)
  - Output: `{ user_id, discord_id, display_name, broski_tokens, tier, lessons_completed }`
  - Purpose: V2.4 calls this to bootstrap a student record

### V2.4 side (4–6h)
- [ ] Alembic migration: add `discord_id VARCHAR(30) UNIQUE NULLABLE` to `users` table
- [ ] New API endpoint: `GET /api/v1/users/by-discord/{discord_id}` — returns V2.4 user record
- [ ] New API endpoint: `POST /api/v1/users/link-course` — accepts `{ discord_id, course_user_id }`, creates the link
- [ ] New Discord cog: `cogs/hypercode_sync.py`
  - `/coursestats` command: calls `course-profile` → displays Course tier + lesson count + token balance in Discord

### Verification
- [ ] `/coursestats` in Discord → shows both Course and V2.4 stats in one embed
- [ ] V2.4 can look up a student by Discord ID and get their Course progress

⚠️ **Assumption:** Discord ID is available in both systems. Course stores it via `discord_links` table (migration 20260410000010). V2.4 needs the Alembic migration applied first.

---

## Phase 2 — Token Sync (Week 3–4)

**Goal:** Earning tokens in the Course increments coins in V2.4 within 30 seconds.

### Decision first (not in this doc to resolve)
Map: `broski_tokens` (Course Supabase) → `coins` (V2.4 BROskiWallet). One-way sync only. Course is authoritative for course-earned tokens.

### Implementation
- [x] Course: Edge Function `sync-tokens-to-v24`
  - Triggered by Supabase DB webhook on `public.token_transactions` INSERT (positive amounts only)
  - Resolves `discord_id` via `public.discord_links` when it isn't present in the webhook record
  - POSTs `{ source_id, discord_id, tokens, reason }` to V2.4 with `X-Sync-Secret` auth header
- [x] V2.4: Endpoint `POST /api/v1/economy/award-from-course`
  - Awards `tokens` into the user's V2.4 BROskiWallet `coins` balance
  - Idempotent: `source_id` used as dedup key (stored in `course_sync_events`)
  - Returns `{ awarded: true, coins_balance, xp_balance, level, source_id }`

### Verification
- [x] Verified: `sync-tokens-to-v24` → V2.4 awards coins and returns `{ awarded: true, coins_balance: ... }`
- [x] Verified: idempotency via `course_sync_events.source_id` UNIQUE (duplicate deliveries return 409 / safe no-op)

⚠️ **Assumption:** V2.4 has a stable API that accepts inbound webhooks. If V2.4 is local-only (no public URL), token sync won't work until V2.4 is deployed or a tunnel (ngrok) is in place. For local dev with Supabase running in Docker, use `V24_API_URL=http://host.docker.internal:8000`.

---

## Phase 3 — Agent Access + Shop Bridge (Week 4)

**Goal:** Buying an `agent_access` item in Course /shop unlocks real V2.4 sandbox access.

### Course side
- [ ] Migration 000021: add `metadata JSONB` column to `shop_items`
- [ ] Update `shop-purchase` Edge Function: detect `metadata.type = 'agent_access'` purchases
  - After purchase: POST to V2.4 `provision-access` endpoint
  - Store V2.4 access token in `shop_purchases.metadata` column
- [ ] New shop item seeded: "Agent Sandbox Access" (300 tokens, `type: agent_access`)

### V2.4 side
- [ ] New endpoint: `POST /api/v1/access/provision`
  - Input: `{ discord_id, tier: 'sandbox' }`
  - Creates a scoped API key, sets `agent_access_level = 1` on the V2.4 user record
  - Returns `{ api_key, mission_control_url, expires_at }`
- [ ] New endpoint: `POST /api/v1/access/graduate`
  - Called by `award-graduate-badge` Edge Function
  - Upgrades `agent_access_level` to 4 (HyperCoder)

### Verification
- [ ] Buy "Agent Sandbox Access" in Course /shop → receive Discord DM with Mission Control login
- [ ] V2.4 API key works → `curl http://localhost:8820/health -H "Authorization: Bearer <key>"` → 200

⚠️ **Assumption:** V2.4 has a concept of "access levels" that can be provisioned via API. Current V2.4 doesn't expose this externally — needs to be built.

---

## Phase 4 — `npm run graduate` (Week 5)

**Goal:** One command turns a Course student into a V2.4 developer.

### Prerequisites (from Phases 0–3)
- [x] Identity bridge working (Phase 1)
- [x] `agent_access` shop item exists (Phase 3)
- [x] V2.4 `provision-access` endpoint exists (Phase 3)
- [x] `generate-v2-config` Edge Function exists (Phase 4)
- [x] `award-graduate-badge` Edge Function exists (Phase 4)

### Course side
- [ ] Edge Function: `generate-v2-config` (see BRIDGE_SCRIPT_PLAN.md Step 3)
- [ ] Edge Function: `award-graduate-badge` (see BRIDGE_SCRIPT_PLAN.md Step 7)
- [ ] `scripts/graduate.js` — full 8-step script
- [ ] `hyper-agent-spec.json` bundled in repo root
- [ ] `scripts/lib/*.js` — individual step modules
- [ ] `scripts/templates/` — Dockerfiles + Handlebars templates
- [ ] `package.json` — add `"graduate": "node scripts/graduate.js"` script + ajv deps
- [ ] Seed `.agents/` with 2–3 example starter agents (hyper-agent-spec.json compliant)

### V2.4 side
- [ ] `provision-access` handles `tier: 'level4'` from `award-graduate-badge`
- [ ] V2.4 bot `cogs/hypercode_sync.py` sends Discord DM on graduation

### HyperAgent-SDK (new repo)
- [ ] Create repo: `welshDog/HyperAgent-SDK`
- [ ] `hyper-agent-spec.json` v0.1
- [ ] CLI: `npx hyper-agent validate`
- [ ] Templates: python-starter, node-starter
- [ ] Publish to npm as `hyper-agent`

### Verification
- [ ] `npx hyper-agent validate .agents/python-starter` → passes
- [ ] `npm run graduate` from Course clone → `v2-deployment/` created → PR opened → Discord DM received
- [ ] `cd v2-deployment && docker compose up` → all containers healthy
- [ ] Mission Control at http://localhost:8088 → shows student's agents

---

## Phase 5 — Observability (Week 6)

**Goal:** V2.4 Grafana shows Course activity in real time.

### Course side
- [ ] New Edge Function: `course-metrics-relay`
  - Triggered by: lesson completion, token award, shop purchase
  - Pushes metrics to V2.4 via Prometheus pushgateway (or simple REST endpoint)
  - Metrics: `lesson_completions_total`, `tokens_awarded_total`, `shop_purchases_total`

### V2.4 side
- [ ] New Prometheus scrape job: `course-metrics`
- [ ] New Grafana dashboard: `Course Integration`
  - Panels: lesson completion rate, token award rate, active students, graduation funnel

### Verification
- [ ] Complete a lesson → Grafana dashboard updates within 15s

---

## What NEVER Gets Merged

| Item | Reason |
|------|--------|
| Supabase schema into V2.4 Postgres | Incompatible migration tooling; different trust model |
| V2.4 SQLAlchemy models into Course | Course is Supabase-native; no SQLAlchemy in frontend stack |
| `.env` files from either repo | Server-side secrets; stay separate forever |
| `CLAUDE.md` files | Different instructions for different codebases |
| Discord bot tokens | Each bot has its own identity; keep separate |
| Course `apps/web/` into V2.4 | `apps/web/` is abandoned — archive not migrate |
| V2.4 docker-compose into Course | Course has no containers in its deployment target (Vercel) |

---

## Decision Log

| Decision | Chosen Path | Rationale |
|----------|------------|-----------|
| Same DB vs. separate DBs | Separate forever | Incompatible tooling, incompatible schemas, different trust models |
| Token sync direction | One-way (Course → V2.4) | Course is authoritative for course-earned tokens |
| Bot naming | Course = Hyper-Vibe Bot, V2.4 = HyperCode Bot | Two distinct bots, two distinct identities |
| Shop inventories | Course = content (packs, coaching), V2.4 = platform (agent access, features) | Different economies, different audiences |
| Achievement sync | Bridge via `badge_id → achievement.name` mapping | V2.4 schema is richer — don't flatten it |
| Agent spec | New `manifest.json` + `SKILL.md` coexist | No changes to existing formats; spec is additive |

---

## Phase Timeline Summary

| Phase | Focus | Estimated Effort | Repos Touched |
|-------|-------|-----------------|---------------|
| 0 | Hard conflict fixes | 2–3h | Course, V2.4 |
| 1 | Identity bridge | 1–2d | Course, V2.4 |
| 2 | Token sync | 1d | Course, V2.4 |
| 3 | Agent access + shop | 1–2d | Course, V2.4 |
| 4 | `npm run graduate` | 2–3d | Course, V2.4, SDK (new) |
| 5 | Observability | 4–6h | Course, V2.4 |

**Total:** ~2 weeks of focused dev across all three repos.

**Critical path:** Phase 0 → Phase 1 (discord_id migration) → Phase 3 (provision-access) → Phase 4 (graduate script). Everything else can be done in parallel or deferred.
