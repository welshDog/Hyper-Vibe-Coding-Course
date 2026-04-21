# RISK_FLAGS.md
> Things That Could Break — Integration Risk Register
> Generated: 2026-04-11 | Audit Pass 1 — READ ONLY

---

## How to Read This

```
🔴 HIGH   — Will break production or block the integration if ignored
🟡 MEDIUM — Will cause bugs or confusion; fixable before or after shipping
🟢 LOW    — Worth knowing; unlikely to cause immediate harm
```

Each flag has: **What could break → Why → Mitigation**

---

## Security Risks

### R1 — V2.4 API Keys Leaked via Graduate Script Output 🔴

**What breaks:** `generate-v2-config` Edge Function writes a personal V2.4 API key into `v2-deployment/.env`. If the student's Course repo is public (or if they commit without checking), this key lands in git history.

**Why it's risky:** V2.4 API key = access to the student's deployed agents and potentially Mission Control (port 8088). Leaked key = an attacker can control their agents.

**Mitigation:**
- `v2-deployment/` must be in `.gitignore` of the Course repo **before** the graduate script is merged
- `v2-deployment/.env` must ALSO be in `.gitignore` as a belt-and-braces guard
- README in `v2-deployment/` should warn in large bold text: "DO NOT COMMIT THIS FOLDER"
- Consider: API key delivered only via Discord DM (V2.4 bot), never written to disk

---

### R2 — `award-graduate-badge` Callable Without Real Graduation 🔴

**What breaks:** If `award-graduate-badge` Edge Function is exposed without proper guards, a student could call it directly (Postman, browser fetch) to award themselves a graduate badge without completing the prerequisites.

**Why it's risky:** Fake graduates get Level 4 V2.4 access without earning it. Undermines the whole system.

**Mitigation:**
- Edge Function must verify prerequisites server-side (not just in the script):
  - Query `lesson_progress` to confirm ≥1 module completed
  - Query `shop_purchases` to confirm `agent_access` item owned
  - Verify at least 1 valid agent passed spec validation (store result in DB after Step 2)
- Rate limit: 1 graduation per user, ever (idempotency check via `achievements` table)

---

### R3 — Token Sync Webhook Has No Auth 🔴

**What breaks:** `sync-tokens-to-v24` Edge Function POSTs to V2.4's `award-from-course` endpoint. If V2.4 endpoint has no auth, anyone who discovers the URL can award themselves unlimited coins in V2.4.

**Why it's risky:** Economy exploit. V2.4's BROski$ coin system has real perceived value (shop, leaderboard).

**Mitigation:**
- V2.4 `award-from-course` endpoint requires a shared secret header (`X-Sync-Secret`)
- Secret stored in: Course Edge Function environment vars + V2.4 `.env`
- Source IP allowlist as additional guard if V2.4 is deployed (not localhost)
- `source_id` dedup key prevents replay attacks even if the secret leaks temporarily

---

### R4 — Supabase Service Role Key in Graduate Script 🟡

**What breaks:** `scripts/graduate.js` needs to read Course user data (lesson_progress, shop_purchases). If it uses the service role key (bypasses RLS), it could inadvertently expose another user's data if the script has a bug.

**Why it's risky:** Service role key = god mode on Supabase. Scripts running on student machines shouldn't hold it.

**Mitigation:**
- Graduate script uses the **anon key + user's JWT** from `frontend/.env.local` (same as the app uses)
- All queries are user-scoped via RLS — no service role key on the client machine
- Course Edge Functions hold the service role key server-side only

---

## Integration Reliability Risks

### R5 — V2.4 Local-Only Means Token Sync Won't Work 🟡

**What breaks:** Token sync (Phase 2) POSTs to V2.4's API. If V2.4 is running on `localhost:8080` on a student's machine and the Course is on Supabase cloud, the webhook can't reach localhost.

**Why it happens:** V2.4 is a local Docker stack, not deployed to a public URL by default.

**Mitigation:**
- Short term: Token sync is optional for local dev — Supabase webhook delivery to localhost will fail silently (or with a logged error). Student's V2.4 balance is manually synced on first login.
- Long term: When a student deploys V2.4 to a server or cloud VM, they register their V2.4 URL in the Course dashboard → Supabase webhook updated to point to that URL
- Alternative: Polling instead of push — V2.4 `hypercode_sync.py` cog polls the `course-profile` Edge Function every 5 minutes and syncs the delta

---

### R6 — `gh` CLI Not Installed on Student's Machine 🟡

**What breaks:** Step 6 of the graduate script (`gh pr create`) requires the `gh` CLI. Many students won't have it.

**Mitigation:**
- Preflight check (Step 1) verifies `gh` is installed and authenticated before doing any work
- Clear install instructions printed if missing: `brew install gh` / winget / scoop
- Fallback: If `gh` is unavailable, script writes the PR body to `v2-deployment/PR_BODY.md` and prints instructions to open a PR manually

---

### R7 — Docker Not Running When `docker compose up` Is Run 🟢

**What breaks:** After graduation, student runs `docker compose up` but Docker Desktop isn't running.

**Why it happens:** Common on Windows — Docker Desktop needs to be started manually.

**Mitigation:**
- `README.md` in `v2-deployment/` includes a prominent "Make sure Docker Desktop is running first" step
- Graduate script checks `docker info` in preflight and warns if Docker is not running (not a hard stop — the script output is still valid)

---

### R8 — Port Conflicts in Student's `v2-deployment` 🟡

**What breaks:** If a student has two agents that both auto-assign port 3101, the `docker compose up` will fail with a bind error.

**Why it happens:** Port auto-assignment in `containerize.js` increments from 3100 but only checks within the current run — it doesn't check if the port is already in `docker-compose.nano.yml` from a previous graduation.

**Mitigation:**
- `containerize.js` reads the existing `docker-compose.nano.yml` (if present) before assigning ports
- Collects all used ports from existing service definitions
- Assigns next available port in the 3100–3999 range that isn't already taken

---

## Schema / Data Risks

### R9 — V2.4 `users` Table Missing `discord_id` Blocks Everything 🔴

**What breaks:** Every Phase 1–4 feature requires V2.4 to look up users by Discord ID. Without the Alembic migration, `users` has no `discord_id` column.

**Why it's the #1 blocker:** Identity bridge, token sync, agent access provisioning, and the graduate script all touch this column. None of them can be built or tested until it's added.

**Mitigation:**
- Add the Alembic migration as the absolute first V2.4 change (before writing any integration code)
- Migration: `discord_id VARCHAR(30) UNIQUE NULLABLE` — NULLABLE because existing V2.4 users don't have Course accounts
- Column is NULLABLE until a user links their account — use `LEFT JOIN` not `INNER JOIN` everywhere

---

### R10 — Course `achievements` Table Schema Mismatch 🟡

**What breaks:** V2.4's `BROskiAchievement` model expects: `id, name, description, category, points, badge_emoji, trigger_type, trigger_value`. Course's `achievements` table has: `id, user_id, slug, label, earned_at`.

**Why it matters:** Any code that tries to sync achievements between systems will either fail or corrupt data if it maps fields naively.

**Mitigation:**
- Document the mapping explicitly: Course `slug` → V2.4 `achievement.name`, Course `label` → V2.4 `achievement.description`
- Never INSERT directly across systems — always go through an API endpoint that validates the mapping
- Graduate badge (`badge_id: 'graduate'`) is Course-only — it's just a string slug, not linked to V2.4's achievement catalogue

---

### R11 — XP Numbers Will Differ Between Systems 🟢

**What breaks:** If a leaderboard or profile shows XP from both systems, the numbers won't match. Course XP = `COUNT(achievements) * 100` or `lifetime_earned` from loyalty view. V2.4 XP = direct value on `BROskiWallet.xp`.

**Why it happens:** Different calculation models, different events trigger XP.

**Mitigation:**
- Display them as separate stats, never aggregated: "Course XP: 400 | HyperCode XP: 1200"
- Label them clearly in UI — users will notice the difference, but it won't cause bugs
- No sync needed: they're measuring different things (course progress vs. platform activity)

---

## Development Process Risks

### R12 — V2.4 Has Two DB Paths (SQLAlchemy + legacy aiosqlite) 🔴

**What breaks:** If new integration code accidentally uses the legacy `aiosqlite` path, it will write to a separate SQLite file instead of the main Postgres DB. Bugs will be invisible until someone queries Postgres and finds missing data.

**Why it exists:** V2.4 migrated from aiosqlite to SQLAlchemy + Postgres but legacy code wasn't fully removed.

**Mitigation:**
- All new integration code (hypercode_sync.py, course_integration.py, etc.) must import from `backend/app/db/session.py` (SQLAlchemy) only
- Add a comment at the top of every new file: `# DB: SQLAlchemy only — do NOT use aiosqlite`
- Code review checklist: flag any import of `aiosqlite` in new files

---

### R13 — Supabase Webhook Delivery Is Not Guaranteed 🟡

**What breaks:** Token sync relies on Supabase Database Webhooks firing on `token_transactions` INSERT. Supabase webhooks have a 5-second timeout and retry 3 times. If V2.4's endpoint is slow or down, the webhook fails silently after 3 retries — and the coins are never awarded in V2.4.

**Why it happens:** Network conditions, V2.4 being offline, slow Edge Function cold start.

**Mitigation:**
- V2.4's `award-from-course` endpoint must respond within 3 seconds (avoid DB slow paths on this endpoint)
- `source_id` dedup key means replays are safe — if a retry fires after a partial success, it won't double-count
- Periodic reconciliation job (cron in V2.4): every hour, call `course-profile` and compare balances — award any missing delta
- Dashboard indicator if sync is lagging (nice to have, not MVP)

---

### R14 — Both Bots In the Same Discord Server = Autocomplete Chaos 🟡

**What breaks:** Even after renaming `/leaderboard` → `/xp-leaderboard` in the Course bot, both bots will be in the same server with overlapping command areas (both have `/rank`, both respond to BROski-related queries). Students may not know which bot to use.

**Mitigation:**
- Rename the Course bot's `/rank` to `/course-rank` at the same time as `/xp-leaderboard`
- Add a pinned message in the Discord server explaining which bot does what
- V2.4 bot's `/help` command should mention "for course progress, use the Hyper-Vibe Bot"
- Long term: unify into a single bot with a `course:` command group prefix

---

## Summary Table

| # | Risk | Severity | Phase Affected | Mitigated? |
|---|------|----------|---------------|-----------|
| R1 | API key in git | 🔴 HIGH | Phase 4 | .gitignore + DM delivery |
| R2 | Fake graduation | 🔴 HIGH | Phase 4 | Server-side checks |
| R3 | Token webhook no auth | 🔴 HIGH | Phase 2 | Shared secret header |
| R4 | Service role key on client | 🟡 MED | Phase 4 | Use anon key + JWT |
| R5 | V2.4 localhost unreachable | 🟡 MED | Phase 2 | Polling fallback |
| R6 | gh CLI not installed | 🟡 MED | Phase 4 | Preflight check + fallback |
| R7 | Docker not running | 🟢 LOW | Phase 4 | README warning |
| R8 | Agent port conflicts | 🟡 MED | Phase 4 | Read existing compose before assigning |
| R9 | Missing discord_id column | 🔴 HIGH | ALL | Alembic migration — FIRST V2.4 change |
| R10 | Achievement schema mismatch | 🟡 MED | Phase 1–4 | API mapping layer |
| R11 | XP numbers differ | 🟢 LOW | UI/display | Label separately |
| R12 | aiosqlite vs SQLAlchemy | 🔴 HIGH | Phase 1+ | Import guard + code review |
| R13 | Webhook delivery not guaranteed | 🟡 MED | Phase 2 | Reconciliation cron |
| R14 | Duplicate bot commands | 🟡 MED | Phase 0 | Rename + help text |

---

## Before Writing Any Code — Resolve These First

```
1. 🔴 R9  — Alembic migration: add discord_id to V2.4 users
2. 🔴 R12 — Confirm all new V2.4 code will use SQLAlchemy only
3. 🔴 R1  — Add v2-deployment/ to Course .gitignore NOW (before graduate.js is merged)
4. 🔴 R3  — Design token webhook auth before implementing Phase 2
5. 🟡 R14 — Rename /leaderboard → /xp-leaderboard in Course bot (Phase 0)
```
