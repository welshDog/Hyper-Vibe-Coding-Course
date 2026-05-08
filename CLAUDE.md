# CLAUDE.md — Hyper Vibe Coding Course Platform
# 🦅 Part of HyperCode V2.4 — Claude AI Project Intelligence

> This file is auto-read by Claude AI when analysing this repository.
> It provides essential project context, conventions, and guidance.
> **Last updated: May 8, 2026 — Phase 2A SHIPPED: pet collection persistence + Edge Fn v4 deployed 🔥**
> **Single source of truth for the sprint = `HYPER_ECOSYSTEM_PLAN_MAY4.md` Section B**

---

## 🧠 Who You're Talking To

- **Lyndz** aka BROski♾️ (GitHub: @welshDog, npm: @w3lshdog) — Llanelli, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- Autistic + dyslexic + ADHD — chunked output, quick wins first, no waffle
- Windows primary (PowerShell), WSL2 + Raspberry Pi + Docker secondary
- Call them **"Bro"** — that's how we roll
- Short sentences. Emojis. Bold the key stuff. Celebrate wins! 🎉
- **Brain style:** Pattern thinker + Big vision + Neurodivergent-first
- **IDE:** Trae IDE (Windows) + Claude Code terminal. Trae Pro expired May 2026 — Claude Code is agent brain this month.

---

## 🎯 Project Identity

**HyperCode V2.4** is a neurodivergent-first, AI-powered, open-source programming ecosystem.

- **Creator:** Lyndz Williams (@welshDog), Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- **Core mission:** Build a cognitive AI architecture that evolves itself
- **License:** See LICENSE file
- **Communication style:** Short sentences, emojis, bold keys, quick wins first. Call Lyndz "Bro".

---

## 🌐 The 5-Repo Ecosystem

```
Hyper-Vibe-Coding-Course     ──── manifest.json ────▶    HyperCode V2.4
github.com/welshDog/             (hyper-agent-spec)       github.com/welshDog/
Hyper-Vibe-Coding-Course                                  HyperCode-V2.4
(Supabase + Vercel + Web3)             │                  (Docker, 48 containers)
Path: H:\Hyper-Vibe-Coding-Course      │                  Path: H:\HyperStation zone\
⚠️ NOT H:\the hyper vibe coding hub    │                       HyperCode\HyperCode-V2.4
   (that = archived typo repo)         │
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.7 (v0.3.0 code)
                          Path: H:\HyperAgent-SDK
                                       │
                         BROskiPets-LLM-dNFT  ◀── Web3 mint LIVE May 7 🔥
                     github.com/welshDog/BROskiPets-LLM-dNFT
                     Path: H:\dNFTpet\BROskiPets-LLM-dNFT
                     (Pets · dNFT · 78 EEPs · port 8098)
                                       │
                      BROski-Obsidian-Brain-for-HyperFocus-z0ne
                     github.com/welshDog/BROski-Obsidian-Brain-for-HyperFocus-z0ne
                     Path: H:\BROski-Obsidian-Brain-for-HyperFocus-z0ne
                     (Second Brain vault — PARA + Dataview + GitHub bridge)
```

---

## ✅ CURRENT STATUS (May 8, 2026)

> 🟢 48 CONTAINERS HEALTHY + FULL GAMIFICATION STACK LIVE + BROSKIPETS WEB3 MINT LIVE + PET COLLECTION PERSISTENCE LIVE 🦅🔥

### What went live TODAY (May 8) — Phase 2A: Persistent Pet Collection
- ✅ **`pets` table + RLS + `top_pets` view** — migration `20260508120000_broskipets_persistence` applied
- ✅ **`mint-pet-auth` Edge Fn v4 DEPLOYED** — accepts `species_id` + `rarity`, INSERTs row to `pets` after relay tx
- ✅ **`useMyPets` hook** — `frontend/src/hooks/useMyPets.ts` — RLS-safe fetch + refetch
- ✅ **`PetCard` component** — `frontend/src/components/pets/PetCard.tsx` — full + mini sizes, legend gold glow
- ✅ **`XPBar` + `MoodBadge`** — `frontend/src/components/pets/{XPBar,MoodBadge}.tsx`
- ✅ **`lib/evolution.ts`** — 6 stages (baby → legend), `progressInStage`, `baseScanTxUrl`
- ✅ **Pets.tsx Section 0** — persistent collection above Step 1 mint flow, "Syncing fresh mint…" indicator
- ✅ **`useMintPet` + `MintPetButton` updated** — forward `species_id` + `rarity` to Edge Fn
- ✅ TypeScript clean, ESLint clean, Vite build green (~20s)

### ⚠️ Phase 2A blocker — Vercel env var (May 8)
- 🔴 **`VITE_MINT_VIA_RELAY` is NOT set** on Vercel (or `.env.local` / `.env.example`)
- v4 Edge Fn ONLY persists pets in **relay mode** — wallet-signed mode logs a warn + skips INSERT
- **Action needed:** add `VITE_MINT_VIA_RELAY=true` to Vercel Production + Preview + Development → redeploy
- Once relay is on: relayer wallet must hold ETH on the target Base chain (Sepolia or mainnet)

### What was claimed live May 7 vs reality
- ✅ **WAS truly live May 7:** mint UI, RainbowKit, wagmi, 10 species, IPFS CIDs, `mint_nonces` table, EIP-712 v2 signing
- ❌ **NOT actually deployed May 7 (despite earlier claim):** Edge Fn v3 with `relay` flag. Production was on v2 until May 8.
- ✅ **Now live May 8:** Edge Fn v4 = v3 relay + Phase 2A pets persistence in one deploy

### Previously done (May 7, 2026)
- ✅ **BROskiPets Web3 Mint UI** — RainbowKit + wagmi + viem wired in
- ✅ **Base Sepolia testnet + Base mainnet** wallet config
- ✅ **`useMintPet` hook** — two-step: Edge Function auth → on-chain tx
- ✅ **Supabase Edge Functions**: mint authorisation + pet balance check (v2 only — v3/v4 came May 8)
- ✅ **DB migrations**: `mint_nonces` + pet ID sequencing
- ✅ **CSP headers updated** for WalletConnect + blockchain RPC endpoints
- ✅ **10 pet species images** + species catalogue with metadata
- ✅ **SpeciesPicker component** — visual species selection UI
- ✅ **MintPetButton** — wallet connect + BROski$ balance check + mint flow
- ✅ **Pets page rebuilt** — three-step mint interface
- ✅ **Pinata dry-run upload** scripts added to Claude settings
- ✅ Claude hyper skill zip added to HyperCode-V2.4

### Previously done (May 5, 2026)
- ✅ BUSINESS_PLAN.md → v1.1 — corrected pricing (£9 Pro / £29 Hyper)
- ✅ `/pricing` copy fixed — "Month-to-month, cancel anytime"
- ✅ Stripe E2E runbook scaffolded at `scripts/STRIPE_E2E_RUNBOOK.md`
- ✅ Phantom `hero-bg.webp` preload removed from `index.html`
- ✅ Dead `frontend/src/assets/hero.webp` deleted
- ✅ Vercel env vars fixed — VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY on ALL 3 environments
- ✅ /register `Failed to fetch` bug ROOT CAUSE FIXED
- ✅ Supabase DB fully hardened — May 3, 2026
- ✅ Vercel security headers + perf fixes live — May 3, 2026

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
| BUSINESS_PLAN.md v1.0 | Sponsor-ready business plan added to repo | ✅ DONE — May 4, 2026 |
| Vercel Env Vars | VITE_ keys set on all 3 Vercel environments | ✅ DONE — May 5, 2026 |
| BUSINESS_PLAN.md v1.1 | Pricing align + hiring section + risks + Discord live link | ✅ DONE — May 5 PM |
| Pricing.tsx copy fix | Removed "no subscription traps" contradiction | ✅ DONE — May 5 PM |
| Stripe E2E runbook | `scripts/STRIPE_E2E_RUNBOOK.md` — Path A local + Path B prod | ✅ DONE — May 5 PM |
| Dead asset cleanup | Phantom preload + unused `hero.webp` removed | ✅ DONE — May 5 PM |
| **BROskiPets Web3 Mint** | RainbowKit + wagmi + Base Sepolia + mint UI | ✅ **LIVE — May 7** 🔥 |
| **BROskiPets Phase 2A** | `pets` table + Edge Fn v4 + `useMyPets` + `PetCard` persistent collection | ✅ **LIVE — May 8** 🔥 (gated on `VITE_MINT_VIA_RELAY=true`) |

---

## 🐾 BROskiPets Web3 — Full Detail (May 8, 2026)

> Claude: **The Web3 mint stack + persistent collection are LIVE. Do NOT suggest rebuilding any part of it.**

### What's built
| File / Feature | Status | Notes |
|---|---|---|
| RainbowKit + wagmi + viem | ✅ LIVE May 7 | Wallet connection layer |
| `@tanstack/react-query` | ✅ LIVE May 7 | Required by wagmi |
| Base Sepolia testnet config | ✅ LIVE May 7 | Test minting live |
| Base mainnet config | ✅ LIVE May 7 | Production ready |
| `useMintPet` hook | ✅ LIVE May 7 (updated May 8) | Two modes: wallet-signed + relay |
| Edge Fn: mint auth v4 | ✅ DEPLOYED May 8 | Auth + sign + relay + INSERT pets row |
| Edge Fn: pet balance | ✅ LIVE May 7 | Checks BROski$ before mint |
| DB migration: `mint_nonces` | ✅ LIVE May 7 | Replay protection |
| DB migration: pet ID sequence | ✅ LIVE May 7 | Sequential pet IDs |
| **DB migration: `pets` + `top_pets` view** | ✅ **LIVE May 8** | Persistent collection cache |
| CSP headers update | ✅ LIVE May 7 | WalletConnect + RPC endpoints allowed |
| 10 species images + catalogue | ✅ LIVE May 7 | Metadata per species + Pinata CIDs |
| `SpeciesPicker` component | ✅ LIVE May 7 | Visual picker UI |
| `MintPetButton` component | ✅ LIVE May 7 (updated May 8) | Forwards species_id + rarity |
| Pets page (3-step UI + Section 0) | ✅ LIVE May 7 (extended May 8) | Collection above mint flow |
| **`PetCard` + `XPBar` + `MoodBadge`** | ✅ **LIVE May 8** | Reusable hvz-styled |
| **`useMyPets` hook** | ✅ **LIVE May 8** | RLS-safe collection fetch |
| **`lib/evolution.ts`** | ✅ **LIVE May 8** | 6 stages, progress helpers |
| Pinata dry-run scripts | ✅ LIVE May 7 | In Claude settings |

### ⚠️ Open question for V2.4
- Does V2.4 need a new endpoint to receive/confirm mint events?
- `pets` + `mint_nonces` tables are in Supabase — does V2.4 need syncing?
- Check before building any on-chain confirmation listener.

### ⚠️ Phase 2A relay-mode dependency
- v4 Edge Fn ONLY persists pets when `relay: true` was sent
- Frontend sets `relay: true` when `VITE_MINT_VIA_RELAY=true` is set at build time
- **If env var is missing → no pets row gets inserted** even though mints succeed on-chain
- Phase 2A.5 follow-up: add `mint-pet-confirm` endpoint to verify wallet-signed tx receipts and INSERT after the fact

### Mint flow (relay mode — Phase 2A path)
```
User picks species → SpeciesPicker
  → Connect wallet (RainbowKit)
  → MintPetButton checks BROski$ balance (Edge Fn)
  → useMintPet POST /mint-pet-auth { relay: true, species_id, rarity, pet_name }
  → Edge Fn: spend tokens → next_pet_id() → nonce → sign EIP-712
  → Edge Fn submits mintWithAuth tx itself (relayer pays gas)
  → Edge Fn INSERTs row into pets table
  → Frontend gets tx_hash + relayed:true
  → useMyPets refetch → PetCard renders → 🐾 persistent
```

### Mint flow (wallet-signed mode — fallback)
```
... (same up to Edge Fn signing)
  → Edge Fn returns signature only (no tx_hash)
  → Frontend wagmi writeContract — user pays gas + signs
  → ⚠️ NO pets row inserted (Phase 2A.5 will handle this via mint-pet-confirm)
```

---

## 🔐 SUPABASE DB HEALTH (May 7, 2026)

> ✅ All performance + security fixes applied + Web3 mint migrations added

| Fix | Status | Migration |
|---|---|---|
| RLS Init Plan (auth.uid → SELECT auth.uid()) | ✅ Fixed | `fix_rls_init_plan_and_fk_indexes` |
| FK indexes (7 missing indexes added) | ✅ Fixed | `fix_rls_init_plan_and_fk_indexes` |
| Duplicate permissive policies merged | ✅ Fixed | `merge_duplicate_permissive_policies` |
| `mint_nonces` table | ✅ Added May 7 | Web3 mint security |
| Pet ID sequencing | ✅ Added May 7 | Sequential pet IDs |
| Leaked password protection | 🟡 Needs Pro plan | Manual — Supabase Auth settings |

### Tables with RLS Init Plan fixed:
- `module_completions`, `users`, `token_transactions`, `enrollments`

### FK Indexes added:
- `idx_certificates_course_id`, `idx_module_completions_module_id`
- `idx_pending_enrollments_course_id`, `idx_referrals_referred_user_id`
- `idx_rifts_created_by`, `idx_shop_purchases_item_id`, `idx_user_quests_quest_id`

---

## 🚀 VERCEL HEALTH (May 7, 2026)

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
| CSP for WalletConnect + RPC | ✅ Updated May 7 |

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

### 🔴 Vercel Env Vars NEEDED for Phase 2A persistence (May 8):
- `VITE_MINT_VIA_RELAY=true` → all 3 environments → unlocks pet persistence
- Without it: mints succeed on-chain but **don't show up in `pets` table**
- After setting: trigger a redeploy (push or "Redeploy" in Vercel dashboard)

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

## 🗺️ NEXT UP — Sprint (May 8 → May 18, 2026)

| # | Task | Repo | Priority |
|---|---|---|---|
| 1 | ✅ DONE — BROskiPets Web3 Mint live (May 7) | Hyper-Vibe | ✅ |
| 2 | ✅ DONE — Phase 2A pet persistence shipped (May 8) | Hyper-Vibe | ✅ |
| 3 | **Set `VITE_MINT_VIA_RELAY=true` on Vercel** + fund relayer wallet with ETH | Hyper-Vibe | 🔴 NOW |
| 4 | **BROskiPets E2E test** — mint on Base Sepolia → verify row in `pets` table → reload check | Hyper-Vibe | 🔴 NOW |
| 5 | **`design-brain` audit** on new `PetCard` before user-facing launch | Hyper-Vibe | 🔴 This week |
| 6 | **Stripe live E2E** — `stripe listen` + card `4242 4242 4242 4242` | Hyper-Vibe + V2.4 | 🔴 This week |
| 7 | **Self-test full user journey** — register → quest → XP → leaderboard (incognito) | Hyper-Vibe | 🔴 This week |
| 8 | **Decide:** make `/welcome` public? (sponsors hit `/login` from BUSINESS_PLAN) | Hyper-Vibe | 🔴 This week |
| 9 | **First real student invite** — DM 5 people | Hyper-Vibe | 🔴 This week |
| 10 | **Phase 2A.5** — `mint-pet-confirm` Edge Fn for wallet-signed persistence | Hyper-Vibe | 🟡 This week |
| 11 | **Phase 2B** — Evolution Timeline + Squad row + reconciliation cron | Hyper-Vibe | 🟡 This week |
| 12 | **V2.4 open question** — does `pets` / `mint_nonces` need a backend endpoint in V2.4? | V2.4 | 🟡 This week |
| 13 | **SDK v0.4.0** — add Web3/dNFT types to `hyper-agent-spec.json` | HyperAgent-SDK | 🟡 This week |
| 14 | Fix GitHub Actions billing lock | All | 🟡 This week |
| 15 | Screenshot full quest + mint journey for launch content | Hyper-Vibe | 🟡 This week |
| 16 | Leaked-password protection (needs Supabase Pro) | Hyper-Vibe | 🟢 Bg |
| 17 | Move old `scripts/M*-*.md` stubs → `scripts/_old-stubs/` | Hyper-Vibe | 🟢 Bg |

---

## 📁 Directory Structure Guide

```
Hyper-Vibe-Coding-Course/
├── frontend/
│   ├── .env.local               ✅ VITE_ keys live HERE (not root .env)
│   ├── index.html               ✅ LCP preload + Supabase preconnect + CSP for Web3
│   ├── vite.config.ts           ✅ Vite 8 chunk splitting (function syntax)
│   └── src/
│       ├── assets/hero.webp     ✅ WebP hero image
│       ├── components/
│       │   ├── ui/hvz/          ✅ Shared design primitives (Card, Tag, Button, Progress)
│       │   └── pets/
│       │       ├── SpeciesPicker.tsx  ✅ Pet species visual picker (May 7)
│       │       ├── MintPetButton.tsx  ✅ Full Web3 mint flow (May 7, updated May 8)
│       │       ├── PetCard.tsx        ✅ Persistent pet card (May 8)
│       │       ├── XPBar.tsx          ✅ Stage-aware progress bar (May 8)
│       │       └── MoodBadge.tsx      ✅ 4-mood tag (May 8)
│       ├── context/             ✅ HUDContext live
│       ├── hooks/               ✅ useHUD + useRift + useMintPet + useMyPets (May 8)
│       ├── lib/
│       │   ├── species.ts       ✅ 10 species + Pinata CIDs
│       │   ├── evolution.ts     ✅ 6 stages + helpers (May 8)
│       │   ├── wagmi.ts         ✅ Base config
│       │   └── contracts/       ✅ broskiPet ABI
│       └── pages/
│           └── Pets.tsx         ✅ Section 0 collection + 3-step mint (May 7+8)
├── vercel.json                  ✅ Security headers + cache rules + Web3 CSP
├── BUSINESS_PLAN.md             ✅ Sponsor-ready plan v1.1 (May 5, 2026)
├── supabase/
│   ├── migrations/              ✅ Latest: 20260508120000_broskipets_persistence
│   └── functions/               ✅ mint-pet-auth v4 deployed May 8
├── pets_page_deepdive_plan.md   ✅ Phase 2 master plan (rewritten May 8)
├── pets_phase_2a_spec.md        ✅ Phase 2A build spec (May 8)
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
Stripe webhook secret updated May 5 ✅ — fresh `whsec_` live in Supabase

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
- **Web3 wallet:** RainbowKit + wagmi — do NOT replace with another wallet lib
- **Mint flow:** ALWAYS goes through Edge Function auth first — NEVER skip to on-chain directly

---

## ⚠️ Known Issues & Gotchas

1. ~~**`/register` page** — `Failed to fetch`~~ ✅ **FIXED May 5** — was missing Vercel env vars on all 3 environments
2. ~~**hero-bg.webp preload warning**~~ ✅ **FIXED May 5 PM** — phantom file removed
3. ~~**zustand deprecated default export**~~ ✅ **NOOP May 5 PM** — already on v5
4. **`/welcome` is auth-gated** — sponsors clicking from BUSINESS_PLAN.md hit `/login`. Open call: make public?
5. **`.env` dash vars** — PowerShell deploy blocker — rename `-` to `_` in var names
6. **GitHub Actions billing lock** — fix at github.com/settings/billing
7. **HUDContext lint** — `react-refresh/only-export-components` — known + acceptable
8. **Migration history** — `supabase db push --linked --yes --include-all` if history mismatch
9. **POSTGRES_PASSWORD** — Plain in `.env`, quoted if special chars
10. **hypercore-core memory** — alert if > 1.2 GiB
11. **Leaked password protection** — disabled, needs Supabase Pro plan
12. **Stripe CLI in live mode only** — set `STRIPE_API_KEY=sk_test_...` before running `stripe trigger`. See `scripts/STRIPE_E2E_RUNBOOK.md`.
13. **Web3 mint — V2.4 open question** — `pets` + `mint_nonces` are in Supabase only. Check if V2.4 needs a sync endpoint before building on-chain confirmation listener.
14. **Phase 2A persistence is relay-mode-only** — until `VITE_MINT_VIA_RELAY=true` is on Vercel, mints succeed on-chain but no `pets` row is created. Wallet-signed mode persistence is Phase 2A.5 (`mint-pet-confirm` Edge Fn).
15. **Edge Fn deployed v4 ≠ Supabase version 3** — Supabase increments deploy versions independently from our v-numbers. The deployed function is what we call v4 (Phase 2A); Supabase shows it as version 3 in dashboard.

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
