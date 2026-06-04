# 🎓 AGENT-START — Hyper-Vibe-Coding-Course Specific
> Repo-specific boot file for `Hyper-Vibe-Coding-Course`
> Read AGENT-START.md first, then this file.
> Last updated: May 21, 2026

---

## 🎯 THIS REPO'S MISSION

**"Stop apologising for your brain. Start building."**

The world's first neurodivergent-first AI coding course. 10 modules. ADHD + Dyslexia + Autistic friendly. Built on Next.js + Vercel + Supabase + Stripe + BROski$ tokens.

---

## 📋 READ ORDER FOR THIS REPO

```
1. AGENT-START.md                      → universal rules + skill loader
2. CLAUDE.md                           → sacred rules for this repo
3. WHATS_DONE.md                       → what's built (check before every suggestion)
4. VIBE_COURSE_REVIEW.md               → module audit scorecard
5. rewrites/SESSION_SNAPSHOT_[latest]  → last session state
```

---

## ⚡ KEY COMMANDS

```bash
# Dev server (from repo ROOT)
npm run dev:frontend

# Type check
npx tsc --noEmit

# Lint
npx eslint

# Build
npm run build

# E2E tests
npm run test:e2e

# Stripe test
.\scripts\Test-ShopPurchase.ps1
```

---

## 🔴 TOP 5 SACRED RULES (full list in CLAUDE.md)

1. **NEVER `supabase db push`** — use Supabase MCP `apply_migration` only
2. **NEVER import `wagmi`/`rainbowkit` outside `/pets`** — re-bloats cold funnel by ~900kB
3. **NEVER `--no-verify` on commits** — Husky catches real errors
4. **NO orange anywhere in UI** — sacred HFZ brand rule
5. **`npm run dev:frontend` from ROOT** — NOT `npm run dev`

---

## 🎓 COURSE AUDIT STATUS (May 2026)

| Priority | Module | Status |
|----------|--------|--------|
| 🔴 RED | M1 — Your AI Brain | ✅ DONE |
| 🔴 RED | M4 — Stripe Walkthrough | ✅ DONE |
| 🔴 RED | M8 — Web3 Plain English | ✅ DONE |
| 🔴 RED | M9 — Security + SRE | ✅ DONE |
| 🟡 YELLOW | M2+M2b — Merge Decision | ⏳ IN PROGRESS |
| 🟡 YELLOW | M3 — Win Summary | 🔜 Todo |
| 🟡 YELLOW | M5 — Split Observability | 🔜 Todo |
| 🟡 YELLOW | M6 — M5→M6 Handoff | 🔜 Todo |
| 🟡 YELLOW | M7 — Prompt Injection Intro | 🔜 Todo |
| 🟡 YELLOW | M10 — Graduation Reframe | 🔜 Todo |
| 🟢 GREEN | M0, M2 core, M6 core | Keep as-is |

Completed rewrites: `rewrites/MODULE_01_REWRITE.md` `MODULE_04_REWRITE.md` `MODULE_08_REWRITE.md` `MODULE_09_REWRITE.md`

---

## 🧠 EVERY MODULE MUST FOLLOW THIS STRUCTURE

```
1. STOP   — plain English context BEFORE any tech
2. WHY    — real-world use case (Netflix, Uber, Stripe refs)
3. HOW    — step-by-step with ⏱️ time estimates
4. WIN    — clear celebratable moment
5. NEXT   — warm bridge to next module
6. HELP   — troubleshooting that normalises problems
7. REWARD — BROski$ XP claim
```

---

## 🔌 LIVE SERVICES

| Service | Status | URL |
|---------|--------|-----|
| Vercel (course) | ✅ Live | hyper-vibe-coding-course.vercel.app |
| Supabase | ✅ Active | yhtmuibgdnxhbgboajhc (eu-west-2) |
| Stripe webhook | ✅ Live | v32 — all 5 price IDs mapped |
| Edge Functions | ✅ 10 active | All deployed |

---

## 📁 WHERE THINGS LIVE

```
frontend/src/pages/         → all page components
frontend/src/pages/Welcome.tsx → hero onboarding (LIVE)
supabase/functions/         → edge functions
supabase/migrations/        → DB migrations (NEVER db push)
rewrites/                   → completed module rewrites
VIBE_COURSE_REVIEW.md       → full module scorecard
CLAUDE.md                   → sacred rules
WHATS_DONE.md               → what's built
```

---

> 🐶♾️ Hyper-Vibe-Coding-Course — Built by @welshDog
> *"Stop apologising for your brain. Start building."*
