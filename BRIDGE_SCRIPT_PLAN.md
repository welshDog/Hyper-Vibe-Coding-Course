# BRIDGE_SCRIPT_PLAN.md
> `npm run graduate` — Step-by-Step Implementation Plan
> Generated: 2026-04-11 | Audit Pass 1 — READ ONLY / DESIGN DOC

---

## What It Is

A Node.js script at `scripts/graduate.js` in the Course repo. Run from the student's local clone after completing prerequisite milestones. No Docker required to run the script itself — Docker is only needed to run the output.

```bash
npm run graduate
# or
node scripts/graduate.js
```

---

## Full Flow (8 Steps)

```
Student runs npm run graduate
        │
        ▼
Step 1: Preflight Check ──── fails? → friendly BROski error, exit
        │
        ▼
Step 2: Validate Agents ──── 0 pass? → must build at least 1, exit
        │
        ▼
Step 3: Generate V2.4 Config (calls Course Edge Function)
        │
        ▼
Step 4: Containerize Agents (generates Dockerfiles + compose stanzas)
        │
        ▼
Step 5: Optional DB Migrate (prompted — can skip)
        │
        ▼
Step 6: Open GitHub PR (forks V2.4 if needed, pushes branch, creates PR)
        │
        ▼
Step 7: Award Graduate Badge (calls Course Edge Function → V2.4 webhook)
        │
        ▼
Step 8: Print Final Instructions
```

---

## Step 1 — Preflight Check

**What it checks:**
- Node 18+ installed (`process.version`)
- Docker installed (`docker --version` subprocess)
- `gh` CLI installed and authenticated (`gh auth status`)
- `frontend/.env.local` exists and has `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- Valid Supabase session (GET `/auth/v1/user` with stored token)
- At least 1 lesson completed (query `lesson_progress` via Supabase REST)
- At least 1 `agent_access` item in `shop_purchases`

**On failure:**
```
✗ Preflight failed: you haven't purchased an agent access item yet.
  Head to /shop and grab "Agent Sandbox Access" first.
  (run: npm run graduate again after)
```

**Key file:** `scripts/lib/preflight.js`

⚠️ **Assumption:** `agent_access` shop item category exists in `shop_items` table. Migration 000021 adds `metadata JSONB` column — `agent_access` items will have `metadata.type = 'agent_access'`. If not added yet, preflight check cannot filter by type.

---

## Step 2 — Validate Agents

**What it does:**
- Scans `.agents/` for subdirectories
- Loads `manifest.json` from each
- Runs `hyper-agent-spec.json` validation (ajv)
- Reports pass/fail per agent

**Output:**
```
Scanning .agents/ for agents...
  ✓ my-writing-agent v0.1.0 — valid (2 tools, python, mcp_compatible: false)
  ✗ half-built-agent — INVALID
    → "tools" must have at least 1 item
    → Missing required field: "entrypoint"

1 of 2 agents valid. Proceeding with valid agents only.
```

**Hard stop:** If 0 agents pass, exit with instructions to build one first.

**Key file:** `scripts/lib/validate-agents.js`
**Depends on:** `hyper-agent-spec.json` (from HyperAgent-SDK repo — installed as dev dep or bundled locally)

---

## Step 3 — Generate V2.4 Config

**What it does:**
- POSTs to Course Edge Function `generate-v2-config` (new — does not exist yet)
- Edge Function returns:
  - Personal V2.4 API key (JWT signed by V2.4, scoped to this student's discord_id)
  - `docker-compose.nano.yml` template (pre-filled with student's discord_id)
  - `.env.v2` template (DISCORD_TOKEN placeholder, CORE_URL, API_KEY pre-filled)

**Writes to disk:**
```
v2-deployment/
  docker-compose.nano.yml    ← base V2.4 nano stack
  .env                       ← template with API_KEY pre-filled
  README.md                  ← personalised 3-command instructions
```

**Edge Function payload:**
```json
{
  "discord_id": "123456789",
  "display_name": "welshDog",
  "agent_names": ["my-writing-agent"]
}
```

**Edge Function response:**
```json
{
  "api_key": "hvb_...",
  "docker_compose_yaml": "...",
  "env_template": "...",
  "readme_md": "..."
}
```

⚠️ **Assumption:** `generate-v2-config` Edge Function exists and V2.4 has an API endpoint to issue scoped keys. Neither exists yet — Layer 3 of the integration plan.

**Key file:** `scripts/lib/generate-config.js`

---

## Step 4 — Containerize Agents

**What it does:**
For each validated agent, generates:
1. A `Dockerfile` (based on `manifest.runtime`)
2. A `docker-compose` service stanza
3. Copies agent source into `v2-deployment/agents/<agent-name>/`
4. Appends the service stanza to `v2-deployment/docker-compose.nano.yml`

**Dockerfile templates by runtime:**

```dockerfile
# python
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

```dockerfile
# node
FROM node:20-slim
WORKDIR /app
COPY package*.json .
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]
```

**Generated docker-compose stanza:**
```yaml
my-writing-agent:
  build: ./agents/my-writing-agent
  environment:
    - AGENT_NAME=my-writing-agent
    - MCP_PORT=3101
  ports:
    - "3101:3101"
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3101/health"]
    interval: 30s
    retries: 3
  networks:
    - hyper-net
```

**Port assignment:** Auto-assigned from the 3100–3199 range for first agent, incrementing. Detects clashes with other agents in the same deployment.

**Key file:** `scripts/lib/containerize.js`

---

## Step 5 — Optional DB Migrate

**Prompted — not forced:**
```
? Export your Course progress to V2.4 Postgres? (y/N)
```

**If yes:**
- Fetches from Supabase: `users` row (id, email, full_name), `enrollments`, current `broski_tokens` balance
- Generates `v2-deployment/seed-from-course.sql`

```sql
-- Generated by npm run graduate
-- Import into V2.4 Postgres on first docker compose up

INSERT INTO users (discord_id, email, display_name, created_at)
VALUES ('123456789', 'student@example.com', 'welshDog', NOW())
ON CONFLICT (discord_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO broski_wallets (user_id, coins, xp)
SELECT id, 150, 0 FROM users WHERE discord_id = '123456789'
ON CONFLICT (user_id) DO NOTHING;
```

⚠️ **Assumption:** V2.4 `users` table has `discord_id` column after the Alembic migration (S1 fix from CONFLICT_REPORT.md). Without that migration, this step cannot run — script should detect and warn.

**Key file:** `scripts/lib/db-migrate.js`

---

## Step 6 — Open GitHub PR

**What it does:**
1. Checks if student has a fork of `welshDog/HyperCode-V2.4` (`gh repo view welshDog/HyperCode-V2.4 --json ...`)
2. If not: `gh repo fork welshDog/HyperCode-V2.4 --clone=false`
3. Clones fork to a temp dir
4. Creates branch: `feat/graduate-<student-name>-<timestamp>`
5. Copies `v2-deployment/` contents into the fork
6. Commits: `git commit -m "🎓 Graduate: add <N> agents from welshDog's Course"`
7. Pushes + creates PR via `gh pr create`
8. Returns PR URL

**PR template:**
```
## 🎓 Graduate Submission

**Student:** welshDog
**Agents:** my-writing-agent v0.1.0
**Course progress:** Module 2 complete | 350 BROski$ earned

### Agents included
| Agent | Tools | Runtime | MCP |
|-------|-------|---------|-----|
| my-writing-agent | 2 | python | ✗ |

### Checklist
- [x] manifest.json validates against hyper-agent-spec.json v0.1
- [x] Dockerfile builds (tested locally)
- [ ] MCP tool definitions reviewed
- [ ] Ready to merge to main deployment

*Generated by npm run graduate*
```

⚠️ **Assumption:** Student has `gh` CLI authenticated with a GitHub account that can fork the repo.

**Key file:** `scripts/lib/open-pr.js`

---

## Step 7 — Award Graduate Badge

**What it does:**
- POSTs to Course Edge Function `award-graduate-badge` (new — does not exist yet)
- Edge Function:
  - Inserts `{ user_id, badge_id: 'graduate', earned_at: NOW() }` into `achievements`
  - Checks idempotency (ON CONFLICT DO NOTHING — already graduated? no duplicate)
  - POSTs to V2.4 `provision-access` endpoint → grants Level 4 unlock
  - Triggers dNFT mint webhook (future: BROskiPets integration — placeholder for now)
  - V2.4 bot sends Discord DM to student

**Discord DM from V2.4 bot:**
```
🎓 You graduated, BROski! Your agents are deploying.

PR: https://github.com/welshDog/HyperCode-V2.4/pull/42
Mission Control: http://localhost:8088
Run: cd v2-deployment && docker compose up

Next level: BROski Elite — contribute back to V2.4 core 💎
```

⚠️ **Assumption:** V2.4 `provision-access` endpoint exists. Does not exist yet — Layer 2 of the integration plan.

**Key file:** `scripts/lib/award-badge.js`

---

## Step 8 — Print Final Instructions

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏴 YOU GRADUATED, BROSKI! 🏴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your V2.4 deployment is ready:

  cd v2-deployment
  cp .env.example .env          ← add your DISCORD_TOKEN
  docker compose up

Agents deployed:
  ✓ my-writing-agent v0.1.0

PR: https://github.com/welshDog/HyperCode-V2.4/pull/42

Mission Control:  http://localhost:8088
V2.4 Agent Chat:  http://localhost:8080
BROski$ Balance:  350 coins (Level 3 — Agent Builder)

Next step: BROski Elite — contribute back to V2.4 core 💎
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## `package.json` Changes (Course repo)

```json
{
  "scripts": {
    "graduate": "node scripts/graduate.js"
  },
  "devDependencies": {
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1",
    "@supabase/supabase-js": "^2.x"
  }
}
```

⚠️ **Note:** `@supabase/supabase-js` is already a dep in `frontend/package.json`. The graduate script runs in Node, not Vite, so it needs its own copy OR the script can call the Supabase REST API directly without the SDK.

---

## File Tree (New Files Only)

```
scripts/
  graduate.js               ← entry point (orchestrates all 8 steps)
  lib/
    preflight.js
    validate-agents.js
    generate-config.js
    containerize.js
    db-migrate.js
    open-pr.js
    award-badge.js
    print-instructions.js
    supabase-client.js      ← minimal REST wrapper (no Vite, no env.local)
  templates/
    Dockerfile.python
    Dockerfile.node
    Dockerfile.deno
    docker-compose-stanza.yaml.hbs  ← Handlebars template
    pr-body.md.hbs
    readme.md.hbs

hyper-agent-spec.json       ← local copy (also in HyperAgent-SDK npm package)
```

---

## Dependencies That Must Exist Before This Script Can Run

| Dependency | Status | Blocks Which Step |
|-----------|--------|-------------------|
| `hyper-agent-spec.json` | 🟡 Designed (this doc) | Step 2 |
| `HyperAgent-SDK` npm package | 🔴 Not created | Step 2 |
| `generate-v2-config` Edge Function | 🔴 Not created | Step 3 |
| `award-graduate-badge` Edge Function | 🔴 Not created | Step 7 |
| V2.4 `provision-access` endpoint | 🔴 Not created | Step 7 |
| V2.4 `discord_id` Alembic migration | 🔴 Not applied | Step 5 |
| `agent_access` shop item category | 🟡 Needs migration 000021 | Step 1 |
| `gh` CLI on student's machine | 🟢 External prereq | Step 6 |

---

## Build Order

```
1. hyper-agent-spec.json (SHARED_SPEC.md) — write the schema
2. HyperAgent-SDK repo — publish npx hyper-agent validate
3. Migration 000021 — add metadata JSONB to shop_items + agent_access item
4. Edge Function: generate-v2-config
5. Edge Function: award-graduate-badge
6. V2.4: discord_id Alembic migration
7. V2.4: provision-access endpoint
8. scripts/graduate.js (all deps satisfied)
```

Steps 1–2 unblock all validation. Steps 3–7 are backend work spread across both repos. Step 8 is the assembly — only starts when all deps are green.
