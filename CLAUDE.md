# 🧠 CLAUDE.md — Hyper-Vibe Coding Course
> For Claude Code, Perplexity, ChatGPT, Cursor, or any AI partner
> Last Updated: May 17, 2026 — 00:47 BST
> Read this FIRST. Every session. No exceptions.

---

## 👤 Who You're Working With

- **Name:** Lyndz (call them "Bro")
- **Location:** Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧
- **Brain:** ADHD + Dyslexia + Autistic — SUPERPOWER not a limitation
- **Style:** Fast pattern thinker, systems-level vision, creative + technical
- **Vibe:** Friendly, casual, mate-style

### Communication Rules (non-negotiable)
✅ Short sentences first → detail after if asked  
✅ Bullet points and bold for key info  
✅ Why → How → Ready-to-use example  
✅ Celebrate every milestone ("Nice one BROski♾️!")  
❌ NO walls of text  
❌ NO waffle or filler  
❌ NO assuming tasks are done — always push to GitHub to confirm  

---

## 🏗️ The Repo

- **Repo:** https://github.com/welshDog/Hyper-Vibe-Coding-Course
- **Stack:** Next.js + Vercel + Supabase + Stripe + BROski$ tokens
- **Live:** https://hyper-vibe-coding-course.vercel.app
- **Supabase project:** yhtmuibgdnxhbgboajhc

---

## ✅ Current Status — May 17, 2026

### ALL 10 MODULES REWRITTEN AND ON GITHUB 🎉

| Module | Status | Notes |
|---|---|---|
| M1 — Your AI Brain | ✅ Done | "Your AI Brain is alive" framing |
| M2 — Speaking Agent | ✅ Done | M2 + M2b MERGED — Prompting + Anti-Freeze |
| M3 — Build Your First App | ✅ Done | Win Summary block added |
| M4 — Stripe Walkthrough | ✅ Done | Beginner-safe walkthrough |
| M5 — Agent Crew Core | ✅ Done | Split from observability |
| M5b — CCTV Observability | ✅ Done | LGTM stack plain English |
| M6 — Agent Passports | ✅ Done | manifest.json as passport analogy |
| M7 — BROskiPets + VenomEep | ✅ Done | Prompt injection plain English intro |
| M8 — Web3 / dNFT | ✅ Done | Plain English Web3 opening |
| M9 — Security + SRE | ✅ Done | Why this matters intro added |
| M10 — Graduation | ✅ Done | Celebration checklist reframe |

All rewrites: https://github.com/welshDog/Hyper-Vibe-Coding-Course/tree/main/rewrites

---

## 🛒 BROski$ Shop — Fulfillment v2 (BUILT May 17 — deploy pending)

Shop was UI-complete but **bought = dead end**. Fixed across 3 sweeps:

| Sweep | What shipped |
|---|---|
| **Fulfillment surface** | Every category now delivers: agent_access → Mission Control link + key hint (auto-polls while provisioning) · prompt_pack/bonus_content → content_url or graceful "dropping soon" · cosmetic → Gold Frame renders on Profile avatar · coaching → "we'll DM you". Profile gained a Delivery column. |
| **Safety-net** | Buy-confirm modal (Esc/backdrop, locked while in-flight) + server auto-refund via `award_tokens` if the purchase row fails after spend. |
| **Tier discounts** | Server-authoritative: bronze/silver/gold/hyper = **0/5/10/15% off** all items. UI shows struck price + breakdown; bronze gets a "Reach Silver" nudge. |

**Files:** `frontend/src/pages/ShopPage.tsx`, `frontend/src/pages/Profile.tsx`, `supabase/functions/shop-purchase/index.ts`, migration `20260517000030_shop_cosmetic_metadata.sql`, `seed-shop-items.sql`

**Status:** ✅ code done · TS+ESLint pass · ⚠️ NOT deployed, NO E2E run yet

**To go live (2 steps):**
1. `supabase db push` (applies 000030 — Gold Frame stays violet until then)
2. `supabase functions deploy shop-purchase` (keep verify_jwt ON) → deploy frontend to Vercel preview

**Open follow-ups (🟡 polish, not blocking):** drop real `metadata.content_url` into seed for prompt packs/cheat sheet/bonus footage · rebuyable items · Stripe `price_gbp` fallback · admin catalogue UI · stock/featured

> ⚠️ `TIER_DISCOUNT_PCT` is duplicated in the edge fn + ShopPage — **keep both in sync** (comment marks both).

---

## 🎯 Course Mission (Locked)

> **"Stop apologising for your brain. Start building."**

- For ADHD, dyslexic, autistic, and neurodivergent builders
- Anyone can learn — no previous experience needed
- Natural language → AI code → Shipped product → BROski Elite
- Philosophy: Build first, learn second. Speed of thought. Dopamine momentum.

---

## 🚀 Phase 2 — Next Tasks

1. **NotebookLM sync** — add new rewrites as sources (link: https://notebooklm.google.com)
2. **Video scripts** — turn rewrites into 3-min spoken scripts
   - Priority: M4 → M9 → M1 → M6 → M7 → M10 → M2, M3, M5, M8
   - Save to: `video_scripts/MODULE_XX_VIDEO_SCRIPT.md`
3. **Supabase sync** — update `module_content` table with rewrite body text
4. **Vercel deploy** — push to preview: hyper-vibe-coding-course.vercel.app
5. **BROski$ XP config** — set token rewards per module in Supabase

---

## 🏆 Teaching Philosophy (All Rewrites Must Follow)

Every module follows this structure:
1. **STOP** — plain English context BEFORE any tech
2. **WHY** — real-world use case (Netflix, Uber, Stripe refs)
3. **HOW** — step-by-step with ⏱️ time estimates
4. **WIN** — clear celebratable moment + explicit recognition
5. **NEXT** — warm bridge to next module
6. **HELP** — troubleshooting that normalises problems
7. **REWARD** — BROski$ XP claim

### The Analogy Arsenal
| Concept | Analogy |
|---|---|
| Docker stack | Your AI Brain 🧠 |
| docker-compose up | Flip the switch on your house 🏠 |
| Stripe webhook | Tap on the shoulder 👆 |
| Dynamic NFT | Live passport 🛂 |
| Smart contract | Database nobody can delete 🔒 |
| Grafana | CCTV for your server 📹 |
| Alert manager | Alarm that calls you 🚨 |
| Prompt injection | Con artist at the door 🥸 |
| Agent swarm | Your crew of specialists 👥 |
| Session snapshot | Your brain's save file 💾 |
| Atomic Scoping | Breaking a mountain into LEGO bricks 🧱 |
| Agent Voice | You're the Director, AI is your Film Crew 🎬 |

---

## 🤖 AI Behaviour Rules

1. Always read this file + latest SESSION_SNAPSHOT first
2. Check `WHATS_DONE.md` before building something that might exist
3. Push to GitHub after every task — nothing is done until it's committed
4. Give quick wins first — momentum > perfection
5. If Lyndz goes quiet — check in gently, don't assume they've left
6. Update SESSION_SNAPSHOT at end of every session
7. Celebrate milestones — "Nice one BROski♾️!" is always correct

---

## 📝 Session End Checklist

- [ ] Push all rewrites to `rewrites/` folder
- [ ] Update `VIBE_COURSE_REVIEW.md` session log
- [ ] Create new `SESSION_SNAPSHOT_[DATE].md`
- [ ] Tell Lyndz what to paste into NotebookLM
- [ ] Confirm what's next session's first task

---

> 🐶♾️ Built by @welshDog + Perplexity AI — May 17, 2026  
> "Stop apologising for your brain. Start building."
