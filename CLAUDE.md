# 🧠 CLAUDE.md — Hyper-Vibe-Coding-Course
> For Claude, Perplexity, ChatGPT, Cursor, or any AI partner.
> Last updated: June 9, 2026 · Built by @welshDog + AI
> **Read this FIRST. Every session. No exceptions.**

---

## 0. Read Order — Every Session

1. **This file** — sacred rules, repo map, AI behaviour
2. **`rewrites/NEXT_SESSION_HANDOVER_[latest date].md`** — open gates, first task, gotchas (WINS if it contradicts this file)
3. **`rewrites/SESSION_SNAPSHOT_[latest date].md`** — current sprint state
4. **HyperLabs work?** → `rewrites/HYPERLABS_PRIORITY_HITLIST_[latest date].md`
5. **Check `WHATS_DONE.md`** — NEVER suggest anything already listed there
6. **Touching DB?** → check `supabase/migrations/` for latest migration number first
7. **Then build.** Not before.

> SESSION_SNAPSHOT = living state. This file = constitution.
> If they contradict, surface it — don't silently pick one.

**Reference docs (read when relevant, not every session):**
- `docs/SPRINT_STATUS.md` — Sprint 4 status + schema truth
- `docs/ANALOGY_ARSENAL.md` — teaching analogies for module rewrites
- `docs/COURSE_STATUS.md` — live course audit + module status

---

## 1. ⚡ Communication Rules (ALWAYS)

| ✅ DO | ❌ NEVER |
|---|---|
| Short sentences first → detail after if asked | Walls of text |
| Bullet points + bold for key info | Waffle or filler |
| Why → How → Ready-to-use example | Assume tasks done without a commit |
| Celebrate every milestone ("Nice one BROski♾️!") | Debate sacred rules |
| Check in gently if Lyndz goes quiet | Say "human must test" when Playwright applies |
| Surface contradictions — correct the doc visibly | Quietly pick one side of a contradiction |

---

## 2. 🔴 Sacred Rules

### 2a. Course Repo (`Hyper-Vibe-Coding-Course`)

| # | Rule | Why |
|---|---|---|
| 1 | **NEVER `supabase db push`** | Local migration filenames desynced from remote — use Supabase MCP `apply_migration` |
| 2 | **NEVER import `wagmi`/`rainbowkit` outside `/pets`** | Re-bloats cold funnel by ~900 kB (reverts Sprint 2) |
| 3 | **NEVER `--no-verify` on commits** | Husky + lint-staged catches real ESLint errors |
| 4 | **NO orange anywhere in UI** | Sacred HFZ brand rule |
| 5 | **Three chrome systems — no global shell** | Funnel `TopNav` · course `Navbar` · `VibeLabShell` are separate by design |
| 6 | **`award_tokens()` always needs stable `p_source_id`** | Ledger dedup — partial unique index on `(user_id, reason, source_id)` |
| 7 | **Don't chase `Pets.tsx` `@ts-nocheck`** | Pre-existing, non-blocking, money-path |
| 8 | **`setState` in `useEffect` = ERROR** | Enforced by ESLint `react-hooks/set-state-in-effect` |
| 9 | **Lab pages = `hfz-*` tokens. Landing page = inline styles + CSS vars** | Two different idioms by design |
| 10 | **No `framer-motion` in this repo** | Not installed — CSS-only motion |
| 11 | **Course dev from repo root = `npm run dev:frontend` NOT `npm run dev`** | Repo-root `npm run dev` ≠ frontend |

### 2b. HyperCode V2.4 rules
> See `HyperCode-V2.4/CLAUDE.md` §4 for the full list.

### 2c. BROski$ Shop

| # | Rule | Why |
|---|---|---|
| 1 | **`TIER_DISCOUNT_PCT` lives in TWO places — keep both in sync** | `ShopPage.tsx` (UI) + `supabase/functions/shop-purchase/index.ts` (server truth) |
| 2 | **Server is ALWAYS the discount source of truth** | Client tier can be tampered |
| 3 | **`metadata.image_url` is inside JSONB `metadata` column** | Not a top-level column — use `item.metadata?.image_url` |
| 4 | **`metadata.consumable = true` = re-buyable, never "Owned"** | Consumables use count-based ownership |
| 5 | **`shop-purchase` Edge Function must keep `verify_jwt: ON`** | Anon spend = instant exploit |
| 6 | **Auto-refund is server-side via `award_tokens`** | Client refund = double-grant |
| 7 | **Poll `fulfillment_metadata.provision_status` every 6s, max 10 attempts** | Don't change cadence without updating both sides |
| 8 | **`price_gbp` is nullable** — always check `price_gbp != null` before rendering | Some items are token-only |

---

## 3. 🗂️ Repo Map

- **Repo:** https://github.com/welshDog/Hyper-Vibe-Coding-Course
- **Live:** https://hyper-vibe-coding-course.vercel.app
- **Stack:** Vite + React + TypeScript · Supabase (`yhtmuibgdnxhbgboajhc`) · Stripe · Vercel

| Key file | What it is |
|---|---|
| `frontend/src/App.tsx` | All routes — lazy + Suspense + ErrorBoundary |
| `frontend/src/hooks/useProgress.ts` | Lab progress + `claim_level_reward` RPC |
| `frontend/src/hooks/useAuthStatus.ts` | Unified auth status (no wagmi) |
| `frontend/src/components/Web3Provider.tsx` | Lazy web3 — `/pets` ONLY |
| `frontend/src/context/auth.ts` | Auth context — real `authError` state |
| `frontend/src/pages/vibe-labs/` | VibeLabsIndex + Level1–5 |
| `frontend/src/pages/LandingPage.tsx` | Funnel: hero CTA + progress band |
| `frontend/src/pages/ShopPage.tsx` | BROski$ Shop — tier discounts, fulfillment |
| `supabase/migrations/` | Latest: `20260518000035_claim_level_reward.sql` |
| `supabase/functions/shop-purchase/` | Shop Edge Function — discount source of truth |
| `rewrites/` | Session snapshots + handovers |

---

## 4. 🤖 AI Behaviour Rules

| Task | Correct tool |
|---|---|
| DB changes | Supabase MCP `apply_migration` — NEVER `db push` |
| DB queries / safe prod testing | Supabase MCP `execute_sql` — wrap in `BEGIN / ROLLBACK` |
| Auth + browser testing | **Playwright** (`npm run test:e2e`) — use `tests/vibe-labs-a11y.spec.ts` + `tests/vibe-labs-anon-flow.spec.ts` |
| Deploy verification | **Vercel MCP `get_deployment`** — NEVER curl-poll prod (trips Attack Challenge Mode) |
| Lighthouse / a11y | Run vs local `vite preview` + system Chrome — can't hit live prod |
| Before claiming done | `npx tsc --noEmit` + `npx eslint` + `npm run build` + `npm run test:e2e` — all green |

**Human-only gates:**
- MetaMask / wallet popups
- Real Core Web Vitals (Vercel Speed Insights)
- Visual QA on physical devices

**General:**
- ALWAYS `git fetch` + check `origin/main` before pushing — parallel workflow running
- NEVER force-push
- Nothing is done until committed + pushed
- Update SESSION_SNAPSHOT at end of every session

---

## 5. ✅ Session End Checklist

- [ ] `npx tsc --noEmit` + `npx eslint` + `npm run build` — all green
- [ ] All changes pushed to GitHub
- [ ] `rewrites/SESSION_SNAPSHOT_[DATE].md` created + pushed
- [ ] `rewrites/NEXT_SESSION_HANDOVER_[DATE].md` written
- [ ] Tell Lyndz the first task for next session (one sentence)
- [ ] Celebrate the wins 🎉

---

> 🐶♾️ Built by @welshDog · Llanelli, Wales
> *"Stop apologising for your brain. Start building."*
