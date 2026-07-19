# 🎓 AGENT-START.md — Hyper-Vibe-Coding-Course Boot File
> **For ANY AI, agent, or human working on the course platform.**
> Read this FIRST. Every session. No exceptions.
> Built by @welshDog — 2026-06-01 · v2.0 (upgraded from v1)

> 📌 **Live truth ALWAYS wins:**
> Read `rewrites/NEXT_SESSION_HANDOVER_[latest date].md` BEFORE anything else in this repo.

---

## ⚡ WHAT THIS REPO IS

- **The neurodivergent-first AI coding education platform**
- Stack: **Vite + React** (NOT Next.js — never generate Next.js / App Router code here)
- Deployed on: **Vercel** → `hyper-vibe-coding-course.vercel.app`
- DB: **Supabase** (project: `tlavrxiaegbtyfmjfdcz`) — ⚠️ old `yhtmuibgdnxhbgboajhc` was DELETED + rebuilt 2026-07-18
- Payments: **Stripe** + BROski$ token economy
- Course mission: *"Stop apologising for your brain. Start building."*

---

## 📋 STEP 1 — READ THESE FILES (in this order, every session)

```
1. rewrites/NEXT_SESSION_HANDOVER_[latest date].md   ← LIVE state — ALWAYS wins
2. CLAUDE.md                                          ← sacred rules + tech gotchas
3. WHATS_DONE.md                                      ← full history — never rebuild what’s here
4. rewrites/SESSION_SNAPSHOT_[latest date].md         ← sprint history
5. AGENT-START-COURSE.md                              ← course content specific rules
```

> ⚠️ **Conflict rule:** Handover beats CLAUDE.md. CLAUDE.md beats this file. **Newest always wins.**

---

## 🎯 CURRENT SPRINT — Sprint 4 (Anon → Signup Conversion)

> ⚠️ **This board is from 2026-06-01 and is SUPERSEDED.** Items 2 (CatchStragglers wire)
> and 3 (`mc_events` migration) are **done**. For the true current state — including the
> Supabase rebuild and open items — read `docs/PROJECT_REPORT_2026-07-18.md` first.
> The file paths below (`app/.../page.tsx`) are **phantom Next.js leftovers** — the real
> app is Vite under `frontend/src/`. There is no `app/` directory.

### Status as of 2026-06-01 (historical)

| Priority | Task | Status |
|---|---|---|
| 🔴 1 | Verify Sprint 4 — `useAnonymousProgress` + `migrateAnonProgress` | ⏳ Verify Claude’s work |
| 🟡 2 | Wire `CatchStragglers.jsx` into Mission Control main panel | 🔜 Todo |
| 🟡 3 | `mc_events` event sourcing migration | 🔜 Todo |
| 🟡 4 | Add `DISCORD_BOT_TOKEN` to Vercel env vars | 🔜 Todo |
| 🟡 5 | Register `catch_stragglers` router in FastAPI `main.py` | 🔜 Todo |

### Sprint 4 files to verify
```
hooks/useAnonymousProgress.ts
app/vibe-labs/level-[n]/page.tsx
components/ClaimXPModal.tsx
lib/migrateAnonProgress.ts
```

---

## 🗂️ REPO STRUCTURE MAP

| Folder | What lives here |
|---|---|
| `frontend/` | Vite + React app — the course UI |
| `apps/` | App routes + pages |
| `components/` | Shared React components |
| `hooks/` | Custom React hooks (incl. `useAnonymousProgress`) |
| `lib/` | Utility functions (incl. `migrateAnonProgress`) |
| `supabase/` | Migrations, edge functions, DB schema |
| `stripe/` | Stripe webhook handlers |
| `discord-bot/` | Discord bot (Catch Stragglers lives here) |
| `agents/` | AI agent configs |
| `rewrites/` | ⭐ Course module rewrites + session handovers |
| `scripts/` | Automation scripts |
| `video_scripts/` | Course video scripts |
| `docs/` | Internal platform docs |
| `api/` | API route handlers |
| `skills/` | Local skills for this repo |
| `tests/` | Test suite |
| `archive/` | Old stuff — don’t touch |

---

## 🎓 COURSE MODULE STATUS (Audit Complete ✅)

| Module | Status | Notes |
|---|---|---|
| M0 — Welcome | ✅ Keep as-is | No rewrite needed |
| M1 — Your AI Brain | ✅ Rewritten | |
| M2 — Speaking Agent | ✅ Rewritten | M2 + M2b merged |
| M3 — Win Summary | ✅ Rewritten | |
| M4 — Stripe Walkthrough | ✅ Rewritten | |
| M5 — Observability Pt1 | ✅ Rewritten | |
| M5B — Observability Pt2 | ✅ Rewritten | |
| M6 — Agent Architecture | ✅ Rewritten | |
| M7 — Prompt Injection | ✅ Rewritten | |
| M8 — Web3 Plain English | ✅ Rewritten | |
| M9 — Security + SRE | ✅ Rewritten | |
| M10 — Graduation | ✅ Rewritten | |

> Single source of truth for rewrites: `rewrites/NOTEBOOKLM_MASTER_PACK.md`

### Module rewrite structure (SACRED — every module must follow this)
```
1. STOP   — plain English context BEFORE any tech
2. WHY    — real-world use case (Netflix, Uber, Stripe refs)
3. HOW    — step-by-step with ⏱️ time estimates
4. WIN    — clear celebratable moment + explicit recognition
5. NEXT   — warm bridge to next module
```

---

## 🔴 LOAD-BEARING RULES (NEVER BREAK THESE)

| Rule | Why |
|---|---|
| **Vite + React ONLY — NOT Next.js** | App Router code will break the build instantly |
| Never `supabase db push` | Migrations desynced — use `apply_migration` ONLY |
| Web3 = `/pets` route ONLY | Wagmi/RainbowKit must NOT leak into global app root |
| `npm run dev:frontend` not `npm run dev` | `npm run dev` breaks — bites every new AI |
| `set-state-in-effect` = lint fail | Hard commit block — avoid entirely |
| `git fetch` before any push | Auto-commits are running — pull first always |
| `DISCORD_BOT_TOKEN` in `.env` ONLY | Never commit secrets |
| Check `WHATS_DONE.md` FIRST | Never rebuild what’s already built |
| Commit + Push = Done | “I’ll do it later” doesn’t count |

---

## 🔌 LIVE CONNECTOR STACK

| Priority | Connector | What it gives you |
|---|---|---|
| 🔴 1 | **GitHub** | Code truth — commits, files, PRs, diffs |
| 🔴 2 | **Supabase** | Data truth — auth, tables, migrations, edge functions |
| 🔴 3 | **Vercel** | Deploy truth — build status, env vars, live frontend |
| 🟡 4 | **Discord + Discord Bot** | Student comms, Catch Stragglers, DM verification |
| 🟡 5 | **Google Drive** | Course brain, transcripts, raw scripts |
| 🟢 6 | **Stripe** | Payment verification, token economy, webhook testing |

---

## 🧰 LOCAL DEV QUICK START

```bash
# Install
npm install

# Run frontend (ALWAYS use this, not npm run dev)
npm run dev:frontend

# Supabase migrations (NEVER supabase db push)
supabase migration new <name>
# Then: apply_migration via connector

# Stripe webhook local testing
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

### Env vars needed (check `.env.example`)
```
VITE_SUPABASE_URL          ← Vite convention, NOT NEXT_PUBLIC_ (this is a Vite app)
VITE_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
DISCORD_BOT_TOKEN          ← server/edge only, never commit
```

---

## 📊 SUPABASE SCHEMA (Key Tables)

| Table | Purpose |
|---|---|
| `users` | Auth + profile |
| `enrollments` | Course access per user |
| `progress` | Module completion + XP |
| `token_transactions` | BROski$ economy ledger |
| `payments` | Stripe payment records |
| `mc_events` | Mission Control event sourcing (Sprint 4 P3) |
| `anonymous_progress` | Anon learner XP before signup (Sprint 4) |

---

## 🤖 HOW TO START A SESSION

**Lyndz will say something like:**
- "Let’s continue" / "Back to it bro" / "What’s next?"

**You must:**
1. Read `rewrites/NEXT_SESSION_HANDOVER_[latest date].md` via GitHub ✅
2. Read `WHATS_DONE.md` via GitHub ✅
3. State next task in **2 lines max**
4. Ask **ONE** decision question only if genuinely blocked
5. **Start building immediately**

**Never:** Ask “What would you like to work on today?”
**Never:** Recap everything from scratch.

---

## 🏁 SESSION END CHECKLIST (MANDATORY)

- [ ] All changes committed + pushed ← **nothing is done until pushed**
- [ ] `rewrites/NEXT_SESSION_HANDOVER_[DATE].md` created + pushed
- [ ] `rewrites/SESSION_SNAPSHOT_[DATE].md` updated
- [ ] `WHATS_DONE.md` updated if new things were built
- [ ] Tell Lyndz the ONE next task (one sentence)
- [ ] 🎉 Celebrate the wins — "Nice one BROski♾️!"

---

## 🔗 LINKED ECOSYSTEM FILES

- Full ecosystem boot: [`BROski-Obsidian-Brain/AGENT-START.md`](https://github.com/welshDog/BROski-Obsidian-Brain-for-HyperFocus-z0ne/blob/main/AGENT-START.md)
- Skills vault: [`HYPER-SILLs-By-WelshDog/AGENT-START.md`](https://github.com/welshDog/HYPER-SILLs-By-WelshDog/blob/main/AGENT-START.md)
- Course content rules: `AGENT-START-COURSE.md`
- Design system: `CLAUDE_DESIGN_STYLE.md`
- Full history: `WHATS_DONE.md`

---

> 🐶♾️ Built by @welshDog · Llanelli, Wales
> *"Stop apologising for your brain. Start building."*
