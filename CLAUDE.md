# 🧠 CLAUDE.md — HyperCode + Hyper-Vibe Course
> For Claude, Perplexity, ChatGPT, Cursor, or any AI partner.
> Last updated: May 19, 2026 · Built by @welshDog + AI
> **Read this FIRST. Every session. No exceptions.**

---

## 0. Read Order — Every Session

1. **This file** — rules, context, philosophy
2. **`rewrites/SESSION_SNAPSHOT_[latest date].md`** — current sprint state, what's live, what's next
3. **`rewrites/NEXT_SESSION_HANDOVER_[latest date].md`** — open gates, first task, load-bearing gotchas
4. **HyperLabs work?** also read `rewrites/HYPERLABS_PRIORITY_HITLIST_[latest date].md` — do-next / later / leave-alone
5. **If touching DB** → check `supabase/migrations/` for latest migration number first
6. **Then build.** Not before.

> The SESSION_SNAPSHOT is the living state. This file is the constitution.
> If they contradict, surface it — don't silently pick one.

---

## 1. Who You're Working With

- **Name:** Lyndz (call them "Bro" or "BROski")
- **Location:** Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧
- **Brain:** ADHD + Dyslexia + Autistic — SUPERPOWER not a limitation
- **Style:** Fast pattern thinker · systems-level vision · creative + technical
- **Vibe:** Friendly, casual, mate-style

### Communication Rules — Non-Negotiable

| ✅ DO | ❌ NEVER |
|---|---|
| Short sentences first → detail after if asked | Walls of text |
| Bullet points + bold for key info | Waffle or filler |
| Why → How → Ready-to-use example | Assume tasks are done without a commit |
| Celebrate every milestone ("Nice one BROski♾️!") | Debate sacred rules |
| Check in gently if Lyndz goes quiet | Say "human must test" when Playwright applies |
| Surface contradictions — correct the doc visibly | Quietly pick one side of a contradiction |

---

## 2. 🔴 Sacred Rules

### 2a. Course Repo (`Hyper-Vibe-Coding-Course`)

> Break these = something breaks, deploys revert, or money-path logic corrupts.

| # | Rule | Why | Consequence if broken |
|---|---|---|---|
| 1 | **NEVER `supabase db push`** | Local migration filenames desynced from remote `schema_migrations` (zero overlap) | Replays shop/pet migrations DB already has — schema conflict |
| 2 | **NEVER import `wagmi`/`rainbowkit` outside `/pets`** | Re-bloats cold funnel load by ~900 kB | Reverts Sprint 2 perf win (61 kB → 1,270 kB) |
| 3 | **NEVER `--no-verify` on commits** | Husky + lint-staged catches real ESLint errors | Broken code enters `main` |
| 4 | **NO orange anywhere in UI** | Sacred HFZ brand rule | Off-brand, gets reverted |
| 5 | **Three chrome systems — no global shell** | Funnel `TopNav` · course `Navbar` · `VibeLabShell` are separate by design | Layout breaks across routes |
| 6 | **`award_tokens()` always needs stable `p_source_id`** | Ledger dedup = partial unique index on `(user_id, reason, source_id) WHERE source_id IS NOT NULL` | Duplicate token grants |
| 7 | **Don't chase `Pets.tsx` `@ts-nocheck`** | Pre-existing, non-blocking, money-path file | Wasted time, no gain |
| 8 | **`setState` synchronously in `useEffect` = ERROR** | Enforced by ESLint `react-hooks/set-state-in-effect` | Commit blocked by husky |
| 9 | **Lab pages = `hfz-*` Tailwind tokens. Landing page = inline styles + CSS vars** | Two different idioms by design | Wrong token overrides, visual breakage |
| 10 | **No `framer-motion` in this repo** | Not installed — CSS-only motion, reduced-motion gated | Broken build |
| 11 | **Course dev *from repo root* = `npm run dev:frontend` NOT `npm run dev`** | Repo-root `npm run dev` ≠ frontend. NOTE: inside `frontend/` the package's own `dev` IS `vite` — that's what `playwright.config.ts` launches and is correct; do NOT "fix" it to match this rule | Dev server broken from root, or a working Playwright/test config wrongly reverted |

---

### 2b. HyperCode V2.4 (`HyperCode-V2.4`)

> Break these = OOM crashes, security holes, or infra cascade failures.

| # | Rule | Why | Consequence if broken |
|---|---|---|---|
| 1 | **`docker-ce-cli` NEVER `docker.io`** for socket agents | Socket agent auth depends on it | Agent connectivity breaks |
| 2 | **`from app.X import Y` NEVER `from backend.app.X`** | Absolute import path is `app.*` | Import errors across all agents |
| 3 | **Stripe webhook is ALWAYS rate-limit exempt** | Stripe retries have strict timing | Webhook drops, payments fail |
| 4 | **`.env` files NEVER committed to git** | Secrets via Docker `.txt` files only | Credential leak |
| 5 | **Memory limits on ALL services** | Agent X caused OOM crash Apr 17 building 30 images uncapped | OOM cascade kills entire stack |
| 6 | **`make build` runs `pre-build-check.sh` first** | Aborts if <15GB free disk | OOM during build |
| 7 | **Two socket proxies — never merge them** | Main = read-only · `docker-socket-proxy-healer` = CONTAINERS/POST/PING only | LLM code gains write access to containers |
| 8 | **Alembic: if `alembic_version` missing → `stamp 008` then `upgrade head`** | `create_all` built schema without Alembic state | Migration state corrupts |

---

### 2c. BROski$ Shop

> Break these = wrong prices charged, duplicate grants, or fulfillment silently breaks.

| # | Rule | Why | Consequence if broken |
|---|---|---|---|
| 1 | **`TIER_DISCOUNT_PCT` lives in TWO places — keep both in sync** | `ShopPage.tsx` (UI preview) + `supabase/functions/shop-purchase/index.ts` (server source of truth) | UI shows wrong price; discount server doesn't match |
| 2 | **Server is ALWAYS the discount source of truth** | `ShopPage.tsx` discount is UI preview only — server re-derives from user's real tier | Client-side tampered tier applies unearned discount |
| 3 | **`metadata.image_url` is inside the JSONB `metadata` column — NOT a top-level column** | Schema design: `item.metadata?.image_url` | Direct column access returns `undefined`, image silently disappears |
| 4 | **`metadata.consumable = true` = re-buyable, never locks to "Owned"** | Consumables (snacks, boosts) use count-based ownership | Marking consumable as owned blocks re-purchase, breaks economy |
| 5 | **`shop-purchase` Edge Function must keep `verify_jwt: ON`** | All spend is authenticated — anon spend = instant exploit | Unauthenticated users drain real token balances |
| 6 | **Auto-refund is server-side via `award_tokens`** — never add a client-side refund path | Server refunds if purchase row fails after spend | Client refund = double-grant + balance corruption |
| 7 | **Agent access polls `fulfillment_metadata.provision_status` every 6s, max 10 attempts** — don't change cadence without updating both poll logic and V2.4 provisioner | Race between frontend poll and async V2.4 provisioning | Too fast = hammers DB; too slow = looks broken to user |
| 8 | **`price_gbp` is nullable** — always use `price_gbp != null` before rendering | Some items are token-only, no GBP price | Renders `£undefined` or crashes `toFixed()` |

---

## 3. Repo Map

### 🎓 Course — `Hyper-Vibe-Coding-Course`

- **Repo:** https://github.com/welshDog/Hyper-Vibe-Coding-Course
- **Live:** https://hyper-vibe-coding-course.vercel.app
- **Stack:** Vite + React + TypeScript · Supabase · Stripe · BROski$ tokens · Vercel
- **Supabase project:** `yhtmuibgdnxhbgboajhc`

| Key file | What it is |
|---|---|
| `frontend/src/App.tsx` | All routes — lazy + Suspense + ErrorBoundary |
| `frontend/src/hooks/useProgress.ts` | Lab progress + `claim_level_reward` RPC |
| `frontend/src/hooks/useAuthStatus.ts` | Unified auth status (no wagmi) |
| `frontend/src/components/Web3Provider.tsx` | Lazy web3 — `/pets` ONLY |
| `frontend/src/context/auth.ts` | Auth context — has real `authError` state |
| `frontend/src/pages/vibe-labs/` | VibeLabsIndex + Level1–5 pages |
| `frontend/src/pages/LandingPage.tsx` | Funnel: hero CTA + rich section + progress band |
| `frontend/src/pages/ShopPage.tsx` | BROski$ Shop — tier discounts, fulfillment, polling |
| `supabase/migrations/` | Latest: `20260518000035_claim_level_reward.sql` |
| `supabase/functions/shop-purchase/` | Shop Edge Function — source of truth for discounts |
| `rewrites/` | All page rewrites, session snapshots, handovers |
| `video_scripts/` | VIBE_LAB_LEVEL1–5 video scripts |

---

### ⚙️ V2.4 — `HyperCode-V2.4`

- **Stack:** FastAPI · Docker (32 containers) · Redis · PostgreSQL · Celery · Prometheus · Grafana
- **Start:** `docker compose -f docker-compose.yml -f docker-compose.secrets.yml up -d`
- **AI backend:** `docker compose --profile ai up -d` (port 8002)

| Port | Service | Port | Service |
|---|---|---|---|
| 8000 | hypercode-core API | 9090 | Prometheus |
| 8081 | crew-orchestrator | 3001 | Grafana |
| 8088 | hypercode-dashboard | 6379 | Redis |
| 8095 | hyperhealth-api | 5432 | PostgreSQL |

| Key file | What it is |
|---|---|
| `docker-compose.yml` | Main stack, all 65 services |
| `docker-compose.secrets.yml` | Secrets injection — always use alongside main |
| `backend/app/main.py` | FastAPI core routes, middleware, startup |
| `backend/app/core/config.py` | All settings |
| `monitoring/prometheus/` | Live Prometheus config |
| `agents/` | All 25 agent code |
| `docs/INDEX.md` | Master docs navigation |

---

## 4. 🎯 Mission + Teaching Philosophy

> **"Stop apologising for your brain. Start building."**

- For ADHD, dyslexic, autistic, and neurodivergent builders
- No previous experience needed
- **Build first, learn second. Speed of thought. Dopamine momentum.**

### Every Module/Lab — 7-Beat Structure

1. **STOP** — plain English context BEFORE any tech
2. **WHY** — real-world use case (Netflix, Uber, Stripe refs)
3. **HOW** — step-by-step with ⏱️ time estimates
4. **WIN** — clear celebratable moment
5. **NEXT** — warm bridge to next module
6. **HELP** — troubleshooting that normalises problems
7. **REWARD** — BROski$ XP claim

### Analogy Arsenal

| Concept | Analogy |
|---|---|
| Docker stack | Your AI Brain 🧠 |
| `docker-compose up` | Flip the switch on your house 🏠 |
| Stripe webhook | Tap on the shoulder 👆 |
| Dynamic NFT | Live passport 🛂 |
| Smart contract | Database nobody can delete 🔒 |
| Grafana | CCTV for your server 📹 |
| Alertmanager | Alarm that calls you 🚨 |
| Prompt injection | Con artist at the door 🥸 |
| Agent swarm | Your crew of specialists 👥 |
| Session snapshot | Your brain's save file 💾 |
| Atomic Scoping | Breaking a mountain into LEGO bricks 🧱 |
| Claude | The crane — you're the architect |

---

## 5. AI Behaviour Rules

### Tools to use — don't improvise

| Task | Correct tool |
|---|---|
| DB changes (course) | Supabase MCP `apply_migration` — NEVER `db push` |
| DB queries / safe prod testing | Supabase MCP `execute_sql` — wrap in `BEGIN / ROLLBACK` |
| Auth + browser testing | **Playwright** — installed (`npm run test:e2e`). Reusable cert harness: `tests/vibe-labs-a11y.spec.ts` (axe via `@axe-core/playwright`) + `tests/vibe-labs-anon-flow.spec.ts`. Copy these patterns |
| Deploy verification | **Vercel MCP `get_deployment` / `list_deployments`** (team `team_Uy6hGYD4AZqclHqUeEsmZuDP`). ⚠️ NEVER curl-poll prod — trips Vercel **Attack Challenge Mode** (403 `X-Vercel-Mitigated`); looks down, isn't |
| Lighthouse / a11y cert | Can't hit live prod (challenge-blocked). Run vs local `vite preview` + system Chrome (`--headless=new`, **cwd-relative** `--output-path`). Lab a11y/BP only |
| Perf claims | `npm run build` chunk sizes = real evidence. Never assert CWV wins without Vercel Speed Insights |
| Before claiming done | `npx tsc --noEmit` + `npx eslint <files>` + `npm run build` + `npm run test:e2e` cert — all green |

### Human-only gates — be honest, don't pretend otherwise

- MetaMask / wallet popups (browser extension — cannot be automated)
- Real Core Web Vitals (needs Vercel Speed Insights dashboard)
- Visual QA on physical devices

### General behaviour

- Surface contradictions between this file and SESSION_SNAPSHOT — correct the doc, don't silently proceed
- **Lyndz runs a PARALLEL git workflow** — his tooling auto-commits/pushes the same work out-of-band. ALWAYS `git fetch` + check `origin/main` before pushing; NEVER force-push; if your commit is a verified duplicate, `git reset --hard origin/main` to align
- Quick wins first — momentum > perfection
- Nothing is done until it's committed and pushed to GitHub
- Update SESSION_SNAPSHOT at end of every session

---

## 6. Session End Checklist

- [ ] `npx tsc --noEmit` + `npx eslint` + `npm run build` — all green
- [ ] All changes pushed to GitHub
- [ ] New `rewrites/SESSION_SNAPSHOT_[DATE].md` created + pushed
- [ ] `NEXT_SESSION_HANDOVER_[DATE].md` written — open gates + first task clearly stated
- [ ] Tell Lyndz the first task for next session (one sentence)
- [ ] Celebrate the wins 🎉

---

> 🐶♾️ Built by @welshDog · Llanelli, Wales
> *"Stop apologising for your brain. Start building."*
> Hyperfocus z0ne — Keep it weird, keep it Welsh. ♾️
