# CLAUDE.md — Hyper Vibe Coding Course Platform
# 🦅 Part of HyperCode V2.4 — Claude AI Project Intelligence

> This file is auto-read by Claude AI when analysing this repository.
> It provides essential project context, conventions, and guidance.
> **Last updated: May 2, 2026 — Vercel webhook fixed, correct repo path confirmed, vite build error pending fix.**
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
Path: H:\Hyper-Vibe-Coding-Course      │                  Path: H:\HyperStation zone\
⚠️ NOT H:\the hyper vibe coding hub    │                       HyperCode\HyperCode-V2.4
   (that = archived typo repo)         │
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.7
                          Path: H:\HyperAgent-SDK
```

---

## ✅ CURRENT STATUS (May 2, 2026)

> 🟢 ALL 29 CONTAINERS HEALTHY + FULL GAMIFICATION STACK LIVE 🦅🔥
> ⚠️ Vercel build currently failing — `vite: command not found` — fix: add `NODE_ENV=development` in Vercel env vars

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
| 10A–10M | FastAPI, networks, secrets, auth, WS, Stripe, courses | ✅ ALL DONE |
| 11A–11F | Live HUD, Rift Events, Gamification schema, E2E 72 passing | ✅ DONE — April 26, 2026 |
| 12A–12F | Leaderboard, Quests, Admin Rift Panel, Navbar links, Migrations | ✅ DONE — April 26, 2026 |
| Edge Fns | All 4 Supabase edge functions fixed + deployed | ✅ DONE — May 1, 2026 |
| Vercel | GitHub webhook wired, auto-deploy on push | ✅ DONE — May 2, 2026 |
| CourseCatalog | Null safety fix on difficulty/description/thumbnail | ✅ DONE — May 2, 2026 (`92ed5cb`) |

---

## 🏆 FULL GAMIFICATION SYSTEM — LIVE (April 26, 2026)

> Claude: **The entire gamification system is BUILT, WIRED, AND TESTED.**
> Do NOT suggest rebuilding any part of it. Check this table before suggesting any changes.

### All Live Files

| File | Status | Notes |
|---|---|---|
| `frontend/src/components/HUD.tsx` | ✅ LIVE | Sticky XP bar + BROski$ + streak |
| `frontend/src/components/XPToast.tsx` | ✅ LIVE | Animated +XP popup |
| `frontend/src/components/RiftBanner.tsx` | ✅ LIVE | Purple banner + countdown |
| `frontend/src/components/AdminRiftPanel.tsx` | ✅ LIVE | Open/close rifts — admin only |
| `frontend/src/components/Layout.tsx` | ✅ LIVE | HUD in app shell |
| `frontend/src/components/Navbar.tsx` | ✅ LIVE | Leaderboard (public) + Quests (authed) links |
| `frontend/src/context/HUDContext.tsx` | ✅ LIVE | Supabase `user_xp` + `awardXP()` |
| `frontend/src/hooks/useHUD.ts` | ✅ LIVE | Call `awardXP(n)` from anywhere |
| `frontend/src/hooks/useRift.ts` | ✅ LIVE | Polls Supabase `rifts` table |
| `frontend/src/pages/LeaderboardPage.tsx` | ✅ LIVE | Public `/leaderboard` route |
| `frontend/src/pages/QuestPage.tsx` | ✅ LIVE | Private `/quests` route |
| `frontend/src/pages/Dashboard.tsx` | ✅ FIXED | Resilient if enrollment.courses missing |
| `frontend/src/pages/CourseCatalog.tsx` | ✅ FIXED | Null-safe difficulty/description/thumbnail (May 2) |
| `frontend/src/App.tsx` | ✅ LIVE | All routes registered incl. leaderboard + quests |
| `api/xp_events.py` | ⚠️ MOCK | Legacy — frontend does NOT call this |
| `api/rifts.py` | ⚠️ MOCK | Legacy — admin CLI only, frontend uses Supabase |

### Supabase: All Tables Live

```
migration 20260426162000 — user_xp, xp_events, rifts (+ RLS + indices)
migration 20260426180000 — public_profiles view, leaderboard view,
                            quests, user_quests, complete_quest() RPC,
                            admin write policy on rifts
```

**Important DB notes:**
- `users` table has NO `avatar_url` column — leaderboard view returns `null` for avatar
- `complete_quest(uuid)` is a SECURITY DEFINER RPC — atomic
- `leaderboard` view is public — do NOT add RLS that blocks anon

### XP Award Values
```
code_submit      = 25 XP
quest_complete   = 100 XP  (via complete_quest RPC)
daily_login      = 10 XP
course_complete  = 500 XP
first_attempt    = 15 XP
rift_rider       = 75 XP
```

---

## 🗺️ NEXT UP (May 2, 2026)

| # | Task | Priority |
|---|---|---|
| 1 | **Fix Vercel build** — add `NODE_ENV=development` in Vercel env vars → redeploy | 🔴 NOW |
| 2 | Fix `/register` — `Failed to fetch` error | 🔴 Next |
| 3 | E2E test shop-purchase with real JWT | 🟡 Soon |
| 4 | Blockers B1-B3 — Supabase DB webhook + secrets + Stripe E2E | 🟡 Soon |
| 5 | Course content — generate expanded scripts M1–M12 via NotebookLM | 🟡 Soon |
| 6 | Hero onboarding page + invite first real student | 🟡 Soon |

---

## 📁 Directory Structure Guide

```
Hyper-Vibe-Coding-Course/
├── frontend/src/
│   ├── components/
│   │   ├── HUD.tsx                  ✅ LIVE
│   │   ├── XPToast.tsx              ✅ LIVE
│   │   ├── RiftBanner.tsx           ✅ LIVE
│   │   ├── AdminRiftPanel.tsx       ✅ LIVE
│   │   ├── Layout.tsx               ✅ LIVE
│   │   └── Navbar.tsx               ✅ LIVE
│   ├── context/HUDContext.tsx       ✅ LIVE
│   ├── hooks/useHUD.ts              ✅ LIVE
│   ├── hooks/useRift.ts             ✅ LIVE
│   ├── pages/
│   │   ├── LeaderboardPage.tsx      ✅ LIVE
│   │   ├── QuestPage.tsx            ✅ LIVE
│   │   ├── CourseCatalog.tsx        ✅ FIXED (null safety May 2)
│   │   ├── Admin.tsx                ✅ LIVE
│   │   └── Dashboard.tsx            ✅ FIXED
│   └── App.tsx                      ✅ LIVE
├── api/
│   ├── xp_events.py             ⚠️ MOCK
│   └── rifts.py                 ⚠️ MOCK
├── supabase/
│   ├── migrations/              ✅ both pushed
│   └── functions/               ✅ all 4 deployed (May 1)
└── CLAUDE.md                    ← you are here
```

---

## 🗄️ Supabase — Database Status

### Courses Seeded ✅ (7 courses)
| Title | Slug | Price |
|---|---|---|
| Vibe Code The Hyper Way | hyper-vibe-course-01 | £49 |
| Vibe Coding Foundations | vibe-coding-foundations | FREE |
| Hyper Prompt Master | hyper-prompt-master | £29 |
| MVP Sprint | mvp-sprint | £49 |
| Hyperfocus HTML & CSS Quick Wins | hyperfocus-html-css | £19.99 |
| Component Chaos Lab | component-chaos-lab | £39.99 |
| Ship Your First Full Stack Thing | ship-full-stack | £49.99 |

---

## 💳 Stripe (LIVE)
```
POST /api/stripe/checkout    → Checkout Session
GET  /api/stripe/plans       → plan list
POST /api/stripe/webhook     → events (rate-limit EXEMPT)
```
Webhook: `vibe-hook` — `brilliant-triumph` = duplicate, delete it

---

## 🔐 Security Standards — MANDATORY DOCKERFILES
- Base image: `FROM python:3.11-slim`
- Always apt-get upgrade + clean in same RUN layer
- Always pin pip/setuptools/wheel/jaraco.*
- Never run as root — always `appuser`
- Trivy target: ZERO CRITICAL, <5 HIGH

---

## 🔑 Key Technical Rules (never re-debate)
- **Correct repo path:** `H:\Hyper-Vibe-Coding-Course` — NOT `H:\the hyper vibe coding hub` (archived typo clone)
- **Vercel build:** requires `NODE_ENV=development` OR move `vite` to `dependencies` in `frontend/package.json`
- **HUD data:** Reads `user_xp` + `rifts` from Supabase directly
- **Legacy API:** `api/xp_events.py` + `api/rifts.py` are MOCK ONLY
- **complete_quest RPC:** SECURITY DEFINER, atomic
- **leaderboard view:** Public anon SELECT — do NOT add RLS that blocks it
- **users.avatar_url:** Does NOT exist on linked DB
- **Supabase import path:** `../lib/supabase`
- **Docker imports:** `from app.X import Y` only
- **FastAPI routing:** Public routes BEFORE auth-gated routes
- **Stripe webhook:** Rate-limit EXEMPT
- **One bot:** broski-bot. Replit bot = dead.
- **`.env`:** Never committed
- **Commits:** `feat:` `fix:` `docs:` `chore:`
- **PowerShell first**, bash second

---

## ⚠️ Known Issues & Gotchas

1. **Vercel build failing** — `vite: command not found` exit 127 — add `NODE_ENV=development` in Vercel env vars
2. **`/register` page** — `Failed to fetch` on sign-up form — needs investigation
3. **`.env` dash vars** — PowerShell deploy blocker — rename `-` to `_` in var names
4. **GitHub Actions billing lock** — fix at github.com/settings/billing
5. **HUDContext lint** — `react-refresh/only-export-components` — known + acceptable
6. **Migration history** — `supabase db push --linked --yes --include-all` if history mismatch
7. **POSTGRES_PASSWORD** — Plain in `.env`, quoted if special chars
8. **hypercode-core memory** — alert if > 1.2 GiB

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
