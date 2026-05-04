# CLAUDE.md — Hyper Vibe Coding Course Platform
# 🦅 Part of HyperCode V2.4 — Claude AI Project Intelligence

> This file is auto-read by Claude AI when analysing this repository.
> It provides essential project context, conventions, and guidance.
> **Last updated: May 5, 2026 — register fix, Vercel env vars, BUSINESS_PLAN.md added**
> **Single source of truth for the sprint = `HYPER_ECOSYSTEM_PLAN_MAY4.md` Section B**

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
(Supabase + Vercel)                    │                  (Docker, 32 containers)
Path: H:\Hyper-Vibe-Coding-Course      │                  Path: H:\HyperStation zone\
⚠️ NOT H:\the hyper vibe coding hub    │                       HyperCode\HyperCode-V2.4
   (that = archived typo repo)         │
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.7
                          Path: H:\HyperAgent-SDK
                                       │
                              BROskiPets-LLM-dNFT  ◀── 4th repo (May 4, 2026)
                          github.com/welshDog/BROskiPets-LLM-dNFT
                          Path: H:\dNFTpet\BROskiPets-LLM-dNFT
                          (Pets · dNFT · 78 EEPs · port 8098)
```

---

## ✅ CURRENT STATUS (May 5, 2026)

> 🟢 ALL 29 CONTAINERS HEALTHY + FULL GAMIFICATION STACK LIVE 🦅🔥
> ✅ Vercel env vars fixed — VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set on ALL 3 environments (Production + Preview + Development)
> ✅ /register `Failed to fetch` bug ROOT CAUSE FIXED — May 5, 2026
> ✅ BUSINESS_PLAN.md added to repo — May 4, 2026
> ✅ Supabase DB fully hardened — May 3, 2026
> ✅ Vercel security headers + perf fixes live — May 3, 2026

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
| CourseCatalog | Null safety fix on difficulty/description/thumbnail | ✅ DONE — May 2, 2026 |
| DB Hardening | RLS init plan, FK indexes, duplicate policies fixed | ✅ DONE — May 3, 2026 |
| Vercel Perf | Security headers, chunk splitting, LCP preload, WebP hero | ✅ DONE — May 3, 2026 |
| BUSINESS_PLAN.md | Sponsor-ready business plan added to repo | ✅ DONE — May 4, 2026 |
| Vercel Env Vars | VITE_ keys set on all 3 Vercel environments | ✅ DONE — May 5, 2026 |

---

## 🔐 SUPABASE DB HEALTH (May 3, 2026)

> ✅ All performance + security fixes applied

| Fix | Status | Migration |
|---|---|---|
| RLS Init Plan (auth.uid → SELECT auth.uid()) | ✅ Fixed | `fix_rls_init_plan_and_fk_indexes` |
| FK indexes (7 missing indexes added) | ✅ Fixed | `fix_rls_init_plan_and_fk_indexes` |
| Duplicate permissive policies merged | ✅ Fixed | `merge_duplicate_permissive_policies` |
| Leaked password protection | 🟡 Needs Pro plan | Manual — Supabase Auth settings |

### Tables with RLS Init Plan fixed:
- `module_completions`, `users`, `token_transactions`, `enrollments`

### FK Indexes added:
- `idx_certificates_course_id`, `idx_module_completions_module_id`
- `idx_pending_enrollments_course_id`, `idx_referrals_referred_user_id`
- `idx_rifts_created_by`, `idx_shop_purchases_item_id`, `idx_user_quests_quest_id`

---

## 🚀 VERCEL HEALTH (May 5, 2026)

> ✅ Production deployment healthy — 0 runtime errors

| Fix | Status |
|---|---|
| Security headers (6 headers) | ✅ Live in `vercel.json` |
| `/assets/*` immutable cache (1 year) | ✅ Live |
| `/index.html` no-cache | ✅ Live |
| Bundle chunk splitting (Vite 8 function syntax) | ✅ Live |
| LCP hero image preload | ✅ Live in `index.html` |
| Supabase DNS prefetch + preconnect | ✅ Live in `index.html` |
| Hero image → WebP | ✅ Done manually |
| Speed Insights | ✅ Live (PR #3) |
| VITE_SUPABASE_URL env var | ✅ Set on Production + Preview + Development |
| VITE_SUPABASE_ANON_KEY env var | ✅ Set on Production + Preview + Development |

### ⚠️ Vite 8 / Rolldown note:
- `manualChunks` MUST be a **function**, not an object — Rolldown rejects the object form
- Correct syntax: `manualChunks(id) { if (id.includes(...)) return 'chunk-name' }`

### 🔑 Vercel Env Var Rules (learned May 5):
- `VITE_` prefixed vars are safe to expose — they go to the browser by design
- `VITE_SUPABASE_ANON_KEY` = public anon key — safe ✅
- `SUPABASE_SERVICE_ROLE_KEY` = NEVER add to frontend/Vercel frontend vars ❌
- Always tick ALL THREE environments: Production + Preview + Development
- Vite only reads from `frontend/.env.local` locally — NOT root `.env`
- Always restart `npm run dev` after any `.env` change

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
| `frontend/src/pages/CourseCatalog.tsx` | ✅ FIXED | Null-safe difficulty/description/thumbnail |
| `frontend/src/App.tsx` | ✅ LIVE | All routes registered incl. leaderboard + quests |
| `api/xp_events.py` | ⚠️ MOCK | Legacy — frontend does NOT call this |
| `api/rifts.py` | ⚠️ MOCK | Legacy — admin CLI only, frontend uses Supabase |

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

## 🗺️ NEXT UP — Sprint (May 5 → May 18, 2026)

| # | Task | Repo | Priority |
|---|---|---|---|
| 1 | ✅ DONE — Vercel env vars set on all 3 environments | Hyper-Vibe | ✅ |
| 2 | ✅ DONE — BUSINESS_PLAN.md pushed to repo | Hyper-Vibe | ✅ |
| 3 | **Self-test full user journey** — register → quest → XP → leaderboard (incognito) | Hyper-Vibe | 🔴 NOW |
| 4 | **Stripe live E2E** — `stripe trigger checkout.session.completed` → webhook fires | Hyper-Vibe + V2.4 | 🔴 This week |
| 5 | **First real student invite** — DM 5 people, "HYPER VIBE" offer ends Friday | Hyper-Vibe | 🔴 This week |
| 6 | Screenshot full quest journey for launch content | Hyper-Vibe | 🟡 This week |
| 7 | Fix hero-bg.webp preload warning in `index.html` | Hyper-Vibe | 🟡 This week |
| 8 | Fix zustand deprecated default export warning | Hyper-Vibe | 🟡 This week |
| 9 | GitHub Actions billing unlock | All | 🟡 This week |
| 10 | BROskiPets Phase 1 — mint first pet via BROski$ | BROskiPets + Hyper-Vibe | 🟡 This week |
| 11 | HyperAgent-SDK 0.2.0 prep — validator UX + 2 templates | HyperAgent-SDK | 🟡 This week |
| 12 | Leaked-password protection (needs Supabase Pro) | Hyper-Vibe | 🟢 Bg |
| 13 | Move old `scripts/M*-*.md` stubs → `scripts/_old-stubs/` | Hyper-Vibe | 🟢 Bg |

---

## 📁 Directory Structure Guide

```
Hyper-Vibe-Coding-Course/
├── frontend/
│   ├── .env.local               ✅ VITE_ keys live HERE (not root .env)
│   ├── index.html               ✅ LCP preload + Supabase preconnect
│   ├── vite.config.ts           ✅ Vite 8 chunk splitting (function syntax)
│   └── src/
│       ├── assets/hero.webp     ✅ WebP hero image
│       ├── components/          ✅ All gamification components live
│       ├── context/             ✅ HUDContext live
│       ├── hooks/               ✅ useHUD + useRift live
│       └── pages/               ✅ All pages live
├── vercel.json                  ✅ Security headers + cache rules
├── BUSINESS_PLAN.md             ✅ Sponsor-ready plan (May 4, 2026)
├── supabase/
│   ├── migrations/              ✅ All pushed incl. May 3 hardening
│   └── functions/               ✅ All 4 deployed
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

### Stripe E2E Test Commands:
```powershell
# Terminal 1
stripe listen --forward-to http://127.0.0.1:8000/api/stripe/webhook

# Terminal 2
stripe trigger checkout.session.completed
# ✅ Should see webhook received in Terminal 1
```

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
- **Vercel build:** Root Directory = `frontend/`, vite in `devDependencies`
- **Vite 8 / Rolldown:** `manualChunks` MUST be a function, not an object
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
- **VITE_ keys:** Live in `frontend/.env.local` locally + Vercel dashboard (all 3 envs)
- **Commits:** `feat:` `fix:` `docs:` `chore:`
- **PowerShell first**, bash second
- **Test locally first** (`localhost:5173`) → then verify on Vercel live

---

## ⚠️ Known Issues & Gotchas

1. ~~**`/register` page** — `Failed to fetch`~~ ✅ **FIXED May 5** — was missing Vercel env vars on all 3 environments
2. **hero-bg.webp preload warning** — preloaded but not used within load window — fix `as` value in `index.html`
3. **zustand deprecated default export** — update to `import { create } from 'zustand'`
4. **`.env` dash vars** — PowerShell deploy blocker — rename `-` to `_` in var names
5. **GitHub Actions billing lock** — fix at github.com/settings/billing
6. **HUDContext lint** — `react-refresh/only-export-components` — known + acceptable
7. **Migration history** — `supabase db push --linked --yes --include-all` if history mismatch
8. **POSTGRES_PASSWORD** — Plain in `.env`, quoted if special chars
9. **hypercode-core memory** — alert if > 1.2 GiB
10. **Leaked password protection** — disabled, needs Supabase Pro plan

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
