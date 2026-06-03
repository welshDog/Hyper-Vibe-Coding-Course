# 🧠 HYPER ECOSYSTEM REPORT — NotebookLM Master File
## Built by welshDog (Lyndz) — Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧
## Last Updated: June 03, 2026
> Single source of truth for the entire Hyperfocus Z0ne ecosystem.
> Drop this into NotebookLM as one source. It covers everything.

---

# 🌍 THE MISSION

> *"Stop apologising for your brain. Start building."*

Transform neurodivergent permission-seekers into Meta-Architects.
The Hyper Vibe platform exists to trigger HyperFocus — the state where the next step is so clear, your brain just does it. No decision fatigue. No shame spiral. Just momentum.

Built by a neurodivergent builder (ADHD + Dyslexia + Autistic) for neurodivergent learners.
Keep it weird. Keep it Welsh. 🏴󠁧󠁢󠁷󠁬󠁳󠁧

---

# 🏗️ THE FULL ECOSYSTEM — 14 Repos, 1 Brain

## Repo Map

| Repo | What It Is | Stack | Status |
|------|-----------|-------|--------|
| **Hyper-Vibe-Coding-Course** | Neurodivergent-first AI coding education platform | Vite + React, Supabase, Stripe, Vercel | 🔴 CURRENT FOCUS |
| **WelshDog-Mission-Control** | Operations dashboard — Catch Stragglers, Discord DMs | Express, React, Supabase | 🔴 ACTIVE |
| **HyperCode-V2.4** | Core platform — 32 Docker containers, FastAPI agent swarm | Docker, FastAPI, Python, Redis, PostgreSQL, Prometheus, Grafana | 🟢 Active |
| **HyperAgent-SDK** | npm package for AI agent orchestration | Node.js, TypeScript | 🟢 Published |
| **BROski-Obsidian-Brain-for-HyperFocus-z0ne** | Persistent knowledge vault — 72+ rescued hero skills | Obsidian, Python | 🟢 Active |
| **HYPER-SILLs-By-WelshDog** | Skills vault — 113 rescued hero skills, Vault Index | Markdown, Python | 🟢 Active |
| **BROskiPets-LLM-dNFT** | Dynamic NFTs — AI pets, rarity rolls, Web3 | Python, Solidity, Docker | 🟡 In Progress |
| **hyper-agents-ide** | Control room UI + API for HYPER Agents | Python, UI | 🟡 In Progress |
| **Hyper-Docker** | Docker Compose ecosystem overview + infra docs | Docker, Docs | 🟢 Active |
| **showcase-web** | Public portfolio + ecosystem status hub | Next.js | 🟡 In Progress |
| **welshdog-designs-web3-shop** | Web3 design shop | Web3, Solidity | 🟡 In Progress |
| **trae-ide** | Local Trae IDE state + data store | SQLite | 🟢 Support |
| **hyper-agents-ide** | VS Code workspace automation for agents | Python, UI | 🟡 In Progress |
| **HC** | HyperCode shortcut / alias repo | — | 🔍 Check |

---

# 🔗 HOW THE ECOSYSTEM CONNECTS

- **Course → HyperCode**: `VITE_HYPERCODE_API_URL` env var → Stripe Checkout Session creation
- **Course → Supabase**: Auth, enrollments, token transactions, XP, level progression
- **Course → Stripe**: Webhooks verify signatures → apply DB side-effects (`subscription_tier`, `token_transactions`, `enrollments`)
- **Course → Discord**: Catch Stragglers sends DMs to inactive students via `WelshDog-Mission-Control`
- **HyperAgent-SDK → HyperCode**: `manifest.json` agent definitions feed into the swarm
- **Mission Control → Discord**: Express API `/send-dm` endpoint → BROski bot → student outreach
- **Showcase → All Repos**: Pulls static/dynamic status to present live ecosystem activity
- **Supabase Edge Function** (`stripe-webhook`): Deno runtime — verifies Stripe signatures, applies fulfillment

---

# 🎓 HYPER VIBE CODING COURSE — Deep Dive

## Live URL
`https://hyper-vibe-coding-course.vercel.app`

## Tech Stack
- **Frontend**: Vite + React (NOT Next.js — never generate Next.js/App Router code for this repo)
- **Database**: Supabase (project: `yhtmuibgdnxhbgboajhc`)
- **Payments**: Stripe (webhooks + Payment Links + Checkout Sessions)
- **Deploy**: Vercel
- **Tokens**: BROski$ — gamified XP economy
- **Auth**: Supabase Auth with anonymous → signed-in migration

## Key Files (read in this order)
1. `rewrites/NEXT_SESSION_HANDOVER_[latest].md` — live state, always wins
2. `CLAUDE.md` — sacred rules + tech gotchas
3. `WHATS_DONE.md` — full history, never rebuild what's here
4. `rewrites/SESSION_SNAPSHOT_[latest].md` — sprint history
5. `AGENT-START.md` — load skills + start task

## Sprint Status (June 2026)
- **Sprint 4 — Anon → Signup Conversion**: ✅ LIVE since May 19 (commit `a12ecd0`)
  - Architecture: `lib/anonProgress.ts` + `useProgress.reconcile` + `claim_level_reward` RPC
  - Tests: `vibe-labs-anon-flow.spec.ts` — 33 green in prod
  - Duplicate files removed: commit `c4a9274`
- **Catch Stragglers**: ✅ LIVE in WelshDog-Mission-Control (commits `00aa770`, `ceadad2`, `c5b36c2`)
- **Next**: Catch Stragglers smoke-test with real Discord token + `mc_events` event-sourcing migration

## Immediate Priorities
| Priority | Task | Status |
|----------|------|--------|
| 🔴 1 | Wire `CatchStragglers.jsx` into Mission Control main panel | Todo |
| 🟡 2 | `mc_events` event sourcing migration | Todo |
| 🟡 3 | Add `DISCORD_BOT_TOKEN` to Vercel env vars | Todo |
| 🟡 4 | Register `catch_stragglers` router in FastAPI `main.py` | Todo |

## Course Modules — All 10 Rewritten ✅

| Module | Title | Status |
|--------|-------|--------|
| M0 | Welcome | ✅ Keep as-is |
| M1 | Your AI Brain | ✅ Rewritten |
| M2 | Speaking Agent (M2 + M2b merged) | ✅ Rewritten |
| M3 | Win Summary | ✅ Rewritten |
| M4 | Stripe Walkthrough | ✅ Rewritten |
| M5 | Observability Pt1 | ✅ Rewritten |
| M5B | Observability Pt2 | ✅ Rewritten |
| M6 | Agent Architecture | ✅ Rewritten |
| M7 | Prompt Injection | ✅ Rewritten |
| M8 | Web3 Plain English | ✅ Rewritten |
| M9 | Security + SRE | ✅ Rewritten |
| M10 | Graduation | ✅ Rewritten |

Single source of truth: `rewrites/NOTEBOOKLM_MASTER_PACK.md`

---

# 🤖 HYPERCODE-V2.4 — Core Platform

## What It Is
32 Docker containers. FastAPI backend. Full agent swarm. Ops + monitoring baked in.

## Stack
- **Backend**: FastAPI (Python)
- **Containers**: Docker + Docker Compose
- **Agents**: 22 confirmed agents, 5 expansion slots
- **Databases**: PostgreSQL (20 tables), Redis (context store)
- **Monitoring**: Prometheus + Grafana
- **Ports**: 42-port network map

## Key Files
- `CLAUDE.md` — sacred rules
- `CLAUDE_CONTEXT.md` — context snapshot
- `WHATS_DONE.md` — full history
- `hyperlaunch.py` — unified launch commander
- `docker-compose.agents.yml` — 42KB mega agent orchestration config

## Agent Roster (22 Confirmed)
Includes: BROski Orchestrator, GoalKeeper, MetricsEngine, Healer, Throttle Agent, Session Snapshot, Guardian Watchdog, Nightly Learning Loop, Life Plans, Crew Orchestrator + more.

---

# 📦 HYPERAGENT-SDK

## What It Is
npm package for AI agent orchestration. Published and live.

## Details
- **Package**: `@w3lshdog/hyper-agent@0.1.7`
- **Key Feature**: `manifest.json` agent definitions + swarm coordination
- **Stack**: Node.js / TypeScript

---

# 🧠 BROSKI-OBSIDIAN-BRAIN

## What It Is
Persistent knowledge base. Obsidian vault + Python tools. The long-term memory of the entire ecosystem.

## Key Files
- `CLAUDE.md` — sacred rules
- `WHATS_DONE.md` — full history
- `HYPERFOCUS_ZONE/VIBE_COURSE_REVIEW_BRAIN.md` — course review log

## Rule
Always check `WHATS_DONE.md` before suggesting something that might already be built.

---

# 🦸 HYPER-SILLs VAULT — 113 Hero Skills

## What It Is
The skill library. Every pattern, architecture decision, and teaching technique rescued from across all repos.

## Stats (as of May 21, 2026)
- **Total repos scanned**: 86
- **Skills rescued** (file on disk): 72
- **Skills catalogued** (pattern identified, file not yet written): 37
- **In progress**: 4

## Top Skill Categories
- **Agents**: 39 skills — swarm, orchestration, guardrails, lifecycle
- **Dev**: 27 skills — FastAPI, Docker, testing, git workflow
- **BROski**: 5 skills — design, level progression, ND-first error messages
- **Web3**: 7 catalogued — dNFT, BROskiPets (files not yet written)

---

# 🐾 BROSKIPETS-LLM-dNFT

## What It Is
AI-powered dynamic NFTs. Pets that evolve based on your dev activity.

## Key Concepts
- Pet rarity roll formula
- Dev action XP trigger system
- dNFT on-chain portfolio pattern
- Web3 scoped to `/pets` only — Wagmi/RainbowKit must NOT leak into global app root

---

# 🎮 THE HYPERFOCUS WAY — Teaching Philosophy

## What is HyperFocus?
The state where the next step is so clear, your brain just does it. No decision fatigue. No "what should I do?". Momentum builds on momentum. Every win leads to the next win.

## The One Rule
One action. Dead clear. Celebratable moment at the end.
- If a student has to decide what to do next → we failed
- If a student can't tell when they've won → we failed
- If a student feels stupid → we failed

## The HyperFocus Learning Structure (Every Module)
1. **STOP** — Plain English context FIRST. No jargon. No assumptions.
2. **WHY** — Real-world use case. Netflix, Uber, Stripe refs. Make it feel possible.
3. **HOW** — Exact steps. One at a time. Numbered. Each step fits in one thought.
4. **WIN** — The moment the student KNOWS they did it. Explicit. Loud. Celebrated.
5. **NEXT** — Warm handoff. Never a cliff edge. One sentence to the next module.
6. **HELP** — Troubleshooting that normalises problems.
7. **REWARD** — BROski$ XP claim.

## Why This Works for ADHD / Dyslexic / Autistic Brains
- No working memory overload
- No shame spiral — lose the thread? Come back. No penalty.
- Clear win states — done is real
- Momentum is the engine — compound confidence
- Pattern recognition over rote learning
- Identity shift: *"I am someone who builds things"*

## The Analogy Arsenal
| Concept | Analogy |
|---------|---------|
| Docker stack | Your AI Brain |
| `docker-compose up` | Flip the switch on your house |
| Stripe webhook | Tap on the shoulder |
| Dynamic NFT | Live passport |
| Smart contract | Database nobody can delete |
| Grafana | CCTV for your server |
| Rate limiting | Auto-throttle on attacks |
| Prompt injection | Con artist at the door |
| Agent swarm | Your crew of specialists |
| Session snapshot | Your brain's save file |
| localStorage migration | Saving your game before logging in |
| Catch Stragglers | Sending a lifeline to lost players |

---

# 🔴 LOAD-BEARING RULES — Never Break These

| Rule | Why |
|------|-----|
| Never `supabase db push` | Migrations desynced — use `apply_migration` only |
| Web3 = `/pets` only | Wagmi/RainbowKit must NOT leak into global app root |
| `npm run dev:frontend` not `npm run dev` | `npm run dev` breaks the build for AI agents |
| Avoid `set-state-in-effect` | Hard commit block — lint fail |
| `docker-ce-cli` not `docker.io` | Agent connectivity depends on it |
| `git fetch` before push | Auto-commits are running — pull first |
| `DISCORD_BOT_TOKEN` in `.env` only | Never commit secrets |
| Commit + Push = Done | "I'll do it later" doesn't count |

---

# 🛠️ LIVE CONNECTOR STACK

| Priority | Connector | What It Gives |
|----------|-----------|---------------|
| 🔴 1 | GitHub | Code truth — commits, files, PRs, diffs |
| 🔴 2 | Supabase | Data truth — auth, tables, migrations, edge functions |
| 🔴 3 | Vercel | Deploy truth — build status, env vars, live frontend |
| 🟡 4 | Discord + Bot | Student comms, Catch Stragglers, DM verification |
| 🟡 5 | Google Drive | Course brain, transcripts, raw scripts |
| 🟢 6 | Gmail + Calendar | Launch ops, student outreach |
| 🟢 7 | Stripe | Payment verification, token economy, webhook testing |

---

# 🌟 GITHUB REPOS WORTH STUDYING (June 2026 Finds)

These were discovered during a GitHub exploration session and are relevant to the Hyper ecosystem:

| Repo | Stars | Why It Matters |
|------|-------|----------------|
| [AionUi](https://github.com/iOfficeAI/AionUi) | 27,485 | Free local 24/7 AI cowork app — runs Claude Code, Codex, Gemini CLI + 20 agents in one UI. The future of how Hyper Vibe students will work. |
| [headroom](https://github.com/chopratejas/headroom) | 8,079 | Compresses tool outputs 60-95% fewer tokens before hitting LLM. Direct win for our agent swarm cost + speed. |
| [OpenMontage](https://github.com/calesthio/OpenMontage) | 4,249 | Open-source agentic video production — 12 pipelines, 52 tools. Could automate Hyper Vibe course video creation. |
| [lumen](https://github.com/ahmedEid1/lumen) | 66 | Open-source AI TUTOR — multi-agent orchestrator, course-scoped RAG, MCP server. Closest reference build to what Hyper Vibe IS. |
| [project-codeguard](https://github.com/cosai-oasis/project-codeguard) | 206 | Security framework for AI coding agents — direct match for M9 Security + SRE module. |
| [EloPhanto](https://github.com/elophanto/EloPhanto) | 90 | Autonomous agent with self-model that changes as it runs — ego, affect, identity. BROski personality layer evolution. |
| [agentic-mesh](https://github.com/nguyenquoaca-hash/agentic-mesh) | — | YAML multi-agent orchestrator, 6+ LLM providers, ReAct + Swarm. Matches HyperAgent-SDK patterns. |

---

# 📋 AI AGENT RULES (For Any AI Working on This Ecosystem)

1. **Always read `NEXT_SESSION_HANDOVER`** before suggesting anything
2. **Check `WHATS_DONE.md`** before building something that might exist
3. **Push to GitHub after every task** — nothing is done until committed
4. **Give quick wins first** — momentum > perfection
5. **One question at a time** — if blocked, ask the single most important thing
6. **Celebrate milestones** — "Nice one BROski♾️!" is always correct
7. **Never `supabase db push`** — use `apply_migration` only
8. **Never generate Next.js code** for Hyper-Vibe-Coding-Course — it's Vite + React

---

# 📞 SESSION END CHECKLIST

Before ending any session:
- Push all changes to GitHub via connector
- Create `NEXT_SESSION_HANDOVER_[DATE].md` and push to `rewrites/`
- Create `SESSION_SNAPSHOT_[DATE].md` and push to `rewrites/`
- Update `WHATS_DONE.md`
- Tell Lyndz the first task for next session in one sentence
- Tell Lyndz what to add to NotebookLM

---

*Built by welshDog + Perplexity AI — June 03, 2026*
*Stop apologising for your brain. Start building.* 🏴󠁧󠁢󠁷󠁬󠁳󠁧
