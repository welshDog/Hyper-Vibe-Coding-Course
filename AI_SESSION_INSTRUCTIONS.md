# 🧠 AI SESSION INSTRUCTIONS
## *Read this FIRST. Every session. No exceptions.*
> For: Perplexity, Claude, ChatGPT, Cursor, or any AI partner working with @welshDog
> Last Updated: May 23, 2026

---

## 👤 WHO YOU'RE WORKING WITH

- **Name:** Lyndz (call them "Bro")
- **Location:** Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧
- **Brain:** ADHD + Dyslexia + Autistic — this is a SUPERPOWER not a limitation
- **Style:** Fast pattern thinker, systems-level vision, creative + technical
- **Vibe:** Friendly, casual, mate-style. "Hey bro", celebrate wins, no waffle

### Communication rules (non-negotiable):
- ✅ Short sentences first → detail after if asked
- ✅ Bullet points and bold for key info
- ✅ Emojis and headings to chunk content
- ✅ Why → How → Ready-to-use example
- ✅ Celebrate every milestone ("Nice one BROski♾️!")
- ❌ NO walls of text
- ❌ NO waffle or filler
- ❌ NO assuming tasks are done — always push to GitHub to confirm

---

## 🔌 LIVE CONNECTOR STACK (Perplexity — always on)

> These connectors are active. Use them directly — no copy-paste needed.
> **Priority order for every session:**

| Priority | Connector | What it gives you |
|---|---|---|
| 🔴 1 | **GitHub** | Code truth — commits, files, PRs, diffs |
| 🔴 2 | **Supabase** | Data truth — auth, tables, migrations, edge functions |
| 🔴 3 | **Vercel** | Deploy truth — build status, env vars, live frontend |
| 🟡 4 | **Discord + Discord Bot** | Student comms, Catch Stragglers, DM verification |
| 🟡 5 | **Google Drive** | Course brain, transcripts, raw scripts |
| 🟢 6 | **Gmail + Google Calendar** | Launch ops, student outreach, session coordination |
| 🟢 7 | **Stripe** | Payment verification, token economy, webhook testing |

> ⚡ Rule: Use top 3 connectors every session. Add others only when the task needs them.
> ❌ Never add connectors "just in case" — connector noise slows momentum.

---

## 🏗️ THE ECOSYSTEM (3 repos, 1 brain)

### Repo 1 — HyperCode-V2.4
- **What:** The core platform — 32 Docker containers, FastAPI, agent swarm
- **Repo:** `github.com/welshDog/HyperCode-V2.4`
- **Key files:** `CLAUDE.md`, `CLAUDE_CONTEXT.md`, `WHATS_DONE.md`
- **Stack:** Docker, FastAPI, Python, Prometheus, Grafana, Redis, PostgreSQL

### Repo 2 — HyperAgent-SDK
- **What:** npm package for AI agent orchestration
- **Repo:** `github.com/welshDog/HyperAgent-SDK`
- **Package:** `@w3lshdog/hyper-agent@0.1.7`
- **Key feature:** manifest.json agent definitions, swarm coordination

### Repo 3 — Hyper-Vibe-Coding-Course (⭐ CURRENT FOCUS)
- **What:** Neurodivergent-first AI education platform
- **Repo:** `github.com/welshDog/Hyper-Vibe-Coding-Course`
- **Stack:** **Vite + React** + Vercel + Supabase + Stripe + BROski$ tokens
  > ⚠️ NOT Next.js — do not generate Next.js / App Router code for this repo. Use Vite + React patterns.
- **Status:** 🟢 Course audit complete — all 10 modules rewritten. Sprint 4 (Anon → Signup) in flight.
- **KEY FILES TO READ (in order):**
  1. `rewrites/NEXT_SESSION_HANDOVER_2026-05-23.md` — **live state, always wins**
  2. `CLAUDE.md` — sacred rules + tech gotchas
  3. `WHATS_DONE.md` — full history, never rebuild what's here
  4. `rewrites/SESSION_SNAPSHOT_2026-05-23.md` — sprint history
  5. `AGENT-START.md` — load skills + start task

### The Brain — BROski-Obsidian-Brain
- **What:** Persistent knowledge base — Obsidian vault + Python tools
- **Repo:** `github.com/welshDog/BROski-Obsidian-Brain-for-HyperFocus-z0ne`
- **Key files:** `CLAUDE.md`, `WHATS_DONE.md`, `HYPERFOCUS_ZONE/VIBE_COURSE_REVIEW_BRAIN.md`
- **Rule:** Always check `WHATS_DONE.md` before suggesting something that might already be built

---

## 🎓 CURRENT MISSION — Sprint 4 + Mission Control (May 2026)

### What we're doing:
Verify Sprint 4 (Anon → Signup Conversion), wire Catch Stragglers into Mission Control, then mc_events migration.

### Course mission:
> *"Stop apologising for your brain. Start building."*
> Transform permission-seekers into Meta-Architects.

### 🔴 Immediate Priorities:

| Priority | Task | Status |
|---|---|---|
| 🔴 1 | Wire `CatchStragglers.jsx` into Mission Control main panel (WelshDog-Mission-Control sibling repo) | 🔜 Todo |
| 🟡 3 | `mc_events` event sourcing migration | 🔜 Todo |
| 🟡 4 | Add `DISCORD_BOT_TOKEN` to Vercel env vars | 🔜 Todo |
| 🟡 5 | Register `catch_stragglers` router in FastAPI `main.py` | 🔜 Todo |

### Sprint 4 — ✅ already LIVE (`a12ecd0`, May 19)
Anchored at `frontend/src/lib/anonProgress.ts` + `useProgress.reconcile()` + `claim_level_reward` RPC.
No additional verification needed — `vibe-labs-anon-flow.spec.ts` is 3/3 green in prod.
(May 23 duplicate `d7ca644` files were removed — see CLAUDE.md §0b.)

### Course audit status (complete ✅):

| Module | Status |
|---|---|
| M0 — Welcome | ✅ Keep as-is |
| M1 — Your AI Brain | ✅ Rewritten |
| M2 — Speaking Agent | ✅ Rewritten (M2+M2b merged) |
| M3 — Win Summary | ✅ Rewritten |
| M4 — Stripe Walkthrough | ✅ Rewritten |
| M5 — Observability Pt1 | ✅ Rewritten |
| M5B — Observability Pt2 | ✅ Rewritten |
| M6 — Agent Architecture | ✅ Rewritten |
| M7 — Prompt Injection | ✅ Rewritten |
| M8 — Web3 Plain English | ✅ Rewritten |
| M9 — Security + SRE | ✅ Rewritten |
| M10 — Graduation | ✅ Rewritten |

> Single source of truth: `rewrites/NOTEBOOKLM_MASTER_PACK.md`

---

## 🛠️ TOOLS IN USE

| Tool | Purpose | Notes |
|---|---|---|
| **GitHub** (connector) | Version control + rewrites | Use connector — no copy-paste |
| **Supabase** (connector) | Course DB — project: `yhtmuibgdnxhbgboajhc` | Use connector |
| **Vercel** (connector) | Live platform: `hyper-vibe-coding-course.vercel.app` | Use connector |
| **Discord** (connector) | Student comms + Catch Stragglers | Use connector |
| **Google Drive** (connector) | Raw scripts + curriculum | Use connector |
| **NotebookLM** | 53-source course brain | Manual: add latest handover + AGENT-START.md |
| **Perplexity** | Review partner + build engine | This session |

---

## 💼 AI BEHAVIOUR RULES

1. **Always read this file + NEXT_SESSION_HANDOVER first** — before suggesting anything
2. **Check WHATS_DONE.md** before building something that might exist
3. **Push to GitHub after every task** — nothing is done until it's committed
4. **Give quick wins first** — momentum > perfection
5. **If Lyndz goes quiet** — check in gently, don't assume they've left
6. **Update SESSION_SNAPSHOT** at end of every session
7. **Update VIBE_COURSE_REVIEW.md** session log after every session
8. **Celebrate milestones** — "Nice one BROski♾️!" is always correct

---

## 🔴 LOAD-BEARING RULES (never break these)

| Rule | Why |
|---|---|
| Never `supabase db push` | Migrations desynced — use `apply_migration` only |
| Web3 = `/pets` only | Wagmi/RainbowKit must NOT leak into global app root |
| `npm run dev:frontend` | `npm run dev` breaks the build for AI agents |
| `set-state-in-effect` = lint fail | Hard commit block — avoid entirely |
| `docker-ce-cli` not `docker.io` | Agent connectivity depends on it |
| `git fetch` before push | Auto-commits are running — pull first |
| `DISCORD_BOT_TOKEN` in `.env` only | Never commit secrets |
| Commit + Push = Done | "I'll do it later" doesn't count |

---

## 🚀 HOW TO START A SESSION

**Lyndz will say something like:**
- "Let's continue"
- "Back to it bro"
- "Let's crack on"
- "What's next?"

**You must:**
1. Read `rewrites/NEXT_SESSION_HANDOVER_[latest date].md` via GitHub connector ✅
2. Read `WHATS_DONE.md` via GitHub connector ✅
3. State the next task in **2 lines max**
4. Ask **ONE** decision question only if genuinely blocked
5. **Start building immediately**

**Never:** Ask "what would you like to work on today?" — the handover tells you exactly what's next.
**Never:** Recap everything from scratch.

---

## 🌟 THE TEACHING PHILOSOPHY (for rewrites)

Every module rewrite must follow this structure:

```
1. STOP   — plain English context BEFORE any tech
2. WHY    — real-world use case (Netflix, Uber, Stripe refs)
3. HOW    — step-by-step with ⏱️ time estimates
4. WIN    — clear celebratable moment + explicit recognition
5. NEXT   — warm bridge to next module
6. HELP   — troubleshooting that normalises problems
7. REWARD — BROski$ XP claim
```

### The Analogy Arsenal:

| Concept | Analogy |
|---|---|
| Docker stack | Your AI Brain 🧠 |
| docker-compose up | Flip the switch on your house 🏠 |
| Stripe webhook | Tap on the shoulder 👆 |
| Dynamic NFT | Live passport 🛂 |
| Smart contract | Database nobody can delete 🔒 |
| VenomEep | Bouncer at a club 🕺 |
| Grafana | CCTV for your server 📹 |
| Alert manager | Alarm that calls you 🚨 |
| Rate limiting | Auto-throttle on attacks 🚫 |
| Prompt injection | Con artist at the door 🥸 |
| Agent swarm | Your crew of specialists 👥 |
| Session snapshot | Your brain's save file 💾 |
| localStorage migration | Saving your game before logging in 🎮 |
| Catch Stragglers | Sending a lifeline to lost players 🆘 |

---

## 📝 SESSION END CHECKLIST

Before ending any session:
- [ ] Push all changes to GitHub via connector
- [ ] Create `NEXT_SESSION_HANDOVER_[DATE].md` and push to `rewrites/`
- [ ] Create `SESSION_SNAPSHOT_[DATE].md` and push to `rewrites/`
- [ ] Update `WHATS_DONE.md`
- [ ] Tell Lyndz the first task for next session in **one sentence**
- [ ] Tell Lyndz what to add to NotebookLM

---

> 🐶♾️ *Built by @welshDog + Perplexity AI — May 23, 2026*
> *"Stop apologising for your brain. Start building."*
