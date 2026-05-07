# 🦅 HYPER PLAN — Codebase Audit & Optimization Roadmap

> **Generated:** 2026-05-07 by full recursive scan of `H:\Hyper-Vibe-Coding-Course`
> **Scope:** Inventory, architecture, security, quality, performance baseline + prioritized hyper-plan
> **Companion docs:** `CLAUDE.md` (canonical state), `HYPER_ECOSYSTEM_PLAN_MAY4.md` (sprint truth)

---

## 1. CODEBASE INVENTORY

### File counts (git-tracked, 841 files)

| Type | Count | Notes |
|---|---|---|
| `.md` | 452 | **Major sprawl** — 30+ at root, 21 module stubs in `scripts/` |
| `.tsx` | 101 | Frontend React |
| `.ts` | 54 | Frontend logic + apps/api + agents |
| `.sql` | 49 | Supabase migrations (46 actual, 3 placeholders) |
| `.json` | 26 | configs + skills-lock |
| `.html` | 26 | mostly skill docs |
| `.py` | 21 | api/ mocks + scripts + tests |
| `.ps1` | 11 | PowerShell automation |
| `.mp4` / `.m4a` | 17 | course videos/audio (tracked — `.m4a` not in `.gitignore`) |

### Top-level structure

```
Hyper-Vibe-Coding-Course/
├── frontend/          ✅ LIVE — React 19 + Vite 8 + Tailwind 3 (12,309 LOC)
├── apps/
│   ├── api/           🟡 Stale Express+Stripe alt-API (likely dead)
│   └── web/           🔴 DEAD — duplicate React app, 3 routes, superseded by frontend/
├── api/               🟡 Mocks (xp_events.py, rifts.py) + broski-chat.ts (Vercel fn)
├── supabase/          ✅ 46 migrations + 1 edge function (stripe-webhook)
├── agents/            ✅ course-content-agent (parser/slug tests exist)
├── packages/database/ ✅ Prisma schema
├── scripts/           🔴 21 duplicated module stubs + 4 active scripts + runbook
├── tests/             🔴 1 trivial smoke + 1 Playwright auth.spec
├── discord-bot/       ✅ broski-bot (separate package)
├── docs/              ✅ TROUBLESHOOTING + design assets
└── 30+ root .md files 🔴 Heavy duplication / overlap
```

---

## 2. ARCHITECTURE FINDINGS

### Frontend (`frontend/`) — **HEALTHY**
- React 19.2.4, Vite 8.0.0 (Rolldown), Tailwind 3.4.17, zustand 5, react-router 7
- 49 routes registered in `App.tsx`, mix of public + `PrivateRoute` + `AdminRoute`
- State: `HUDContext` (XP/tokens/streak, polls every 60s) + `useAuthStore` (zustand, race-protected)
- Supabase client: `frontend/src/lib/supabase.ts` (env-checked, throws if missing keys)
- ErrorBoundary exists (`components/ErrorBoundary.tsx`) but **NOT wrapped at root** ⚠️
- Vite chunk-splitting: vendor / supabase / router (function syntax — Rolldown-compatible)

### Backend layers — **FRAGMENTED**
- `api/xp_events.py` + `api/rifts.py` — **MOCK only**, frontend bypasses, talks to Supabase directly
- `api/broski-chat.ts` — Vercel serverless → AI Gateway → Claude Opus 4.5
- `apps/api/` — alt Express server (Stripe + Supabase) — **status unclear, possibly orphan**
- `supabase/functions/stripe-webhook/` — **canonical webhook** (Deno, signature-verified)

### Database — **HARDENED** ✅
- 46 migrations, all idempotent
- RLS enabled on all sensitive tables; `auth.uid()` wrapped in `SELECT` (init-plan fix May 3)
- 7 FK indexes added (May 3)
- 15 SECURITY DEFINER functions, all `SET search_path = public` + revoked from anon/authenticated
- Public `leaderboard` view safely strips user IDs
- Gaps: leaked-password protection disabled (needs Supabase Pro)

### CI/CD — **MISSING** 🔴
- `.github/workflows/` does **not exist** (billing locked per CLAUDE.md)
- Husky + lint-staged configured locally (frontend)
- Vercel auto-deploys on push to `main`

---

## 3. CODE QUALITY BASELINE

| Check | Result | Notes |
|---|---|---|
| `tsc --noEmit` | ✅ **0 errors** | Type-clean |
| `eslint .` | 🟡 **1 error, 4 warnings** | Blocking error in `Navbar.tsx:33` |
| `python -m unittest` | ✅ Pass | Trivial — `assertTrue(True)` only |
| Playwright E2E | ⏭ Not executed | Needs running stack; CLAUDE.md claims 72 passing as of Apr 26 |
| Component duplication | 🔴 Confirmed | `Leaderboard.tsx` + `LeaderboardPage.tsx`; `QuestPage.tsx` + `Quests.tsx` |
| Largest files (LOC) | `Pets.tsx` 697 · `Profile.tsx` 506 · `LessonPlayer.tsx` 499 · `Auth.tsx` ~430 · `ShopPage.tsx` 434 |
| Hard-coded fallbacks | 🟡 `payments.ts:11` defaults API to `localhost:8000` if env var missing |
| Unused/under-used deps | `@rolldown/plugin-babel`, `class-variance-authority`, possibly `@vercel/speed-insights` |
| Stripe lazy-load | 🟡 No — loaded on every page despite only used in `/pricing` |

### Lint detail
```
ERROR  frontend/src/components/Navbar.tsx:33:5
  react-hooks/set-state-in-effect — setIsMenuOpen(false) inside useEffect
WARN   frontend/src/context/HUDContext.tsx:13:14
  react-refresh/only-export-components (acceptable per CLAUDE.md)
WARN   frontend/tests/courses.spec.ts:182,206,401  @typescript-eslint/no-explicit-any (×3)
```

---

## 4. PRIORITIZED HYPER-PLAN

### Scoring legend
- **Impact:** 🔴 high · 🟡 medium · 🟢 low
- **Effort:** S (≤1 hr) · M (½ day) · L (≥1 day)

### 🔥 P0 — This week (May 7–14, 2026)

| # | Task | Impact | Effort | Success metric |
|---|---|---|---|---|
| P0.1 | Fix `Navbar.tsx:33` setState-in-effect ESLint error | 🔴 | S | `eslint .` → 0 errors |
| P0.2 | Wrap `<App />` in `<ErrorBoundary>` at root (`main.tsx`) | 🔴 | S | Whole-app crash protection live |
| P0.3 | Self-test full user journey (register → quest → XP → leaderboard) in incognito | 🔴 | M | Documented run in `WHATS_DONE.md` |
| P0.4 | Stripe live E2E using `scripts/STRIPE_E2E_RUNBOOK.md` | 🔴 | M | Webhook fires + DB row written |
| P0.5 | Decide `/welcome` public vs gated (sponsors hit `/login`) | 🔴 | S | Routing decision committed |
| P0.6 | Delete dead `apps/web/` directory (verify with `git grep`) | 🟡 | S | -1 React app, monorepo simpler |
| P0.7 | Remove root junk: `supabase.deb`, `BROski C Bot pic.png`, `generated-image*.png` | 🟢 | S | Repo hygiene |
| P0.8 | Add `.gitignore` entries: `*.deb`, `generated-image*.png`, `*.m4a` (course audio) | 🟢 | S | No future leakage |

### 🟡 P1 — Sprint (May 14–28, 2026)

| # | Task | Impact | Effort | Success metric |
|---|---|---|---|---|
| P1.1 | Consolidate duplicate pages: pick one of `Leaderboard.tsx` vs `LeaderboardPage.tsx`, same for `Quests` | 🟡 | M | -2 pages, single source per feature |
| P1.2 | Lazy-load Stripe (`React.lazy` on `/pricing` & `/payment-success`) | 🟡 | M | -200KB on initial bundle |
| P1.3 | Refactor `Pets.tsx` (697 LOC) into 3–4 sub-components | 🟡 | L | Each file < 250 LOC |
| P1.4 | Refactor `LessonPlayer.tsx` (499 LOC) — extract toast + quiz components | 🟡 | M | Each file < 300 LOC |
| P1.5 | Move `scripts/M*-*.md` legacy stubs → `scripts/_old-stubs/` (CLAUDE.md backlog) | 🟢 | S | -10 stubs from active path |
| P1.6 | Consolidate root `.md` sprawl — delete `HYPER_ECOSYSTEM_REPORT_MAY3` (superseded), `MERGE_ROADMAP.md` (obsolete), audit `CONFLICT_REPORT.md` | 🟢 | M | < 20 root .md files |
| P1.7 | Add `.github/workflows/ci.yml` — lint + tsc + smoke on PR (once billing unlocked) | 🔴 | M | Green CI gate on every PR |
| P1.8 | Remove unused deps: `@rolldown/plugin-babel`, audit `class-variance-authority` | 🟢 | S | Smaller `package.json`, faster install |
| P1.9 | Decide fate of `apps/api/` (Express) vs `api/` (Python mocks) — delete the dead one | 🔴 | M | One backend story, not three |
| P1.10 | Replace `payments.ts:11` localhost fallback with build-time guard | 🟡 | S | No prod regression risk |

### 🟢 P2 — Backlog (June 2026+)

| # | Task | Impact | Effort | Success metric |
|---|---|---|---|---|
| P2.1 | Replace trivial `tests/test_smoke.py` with real API smoke (hits Supabase health + Stripe ping) | 🟡 | M | Coverage > 0 |
| P2.2 | Add Vitest + React Testing Library for component tests (Pricing, HUD, Auth) | 🟡 | L | ≥ 30% line coverage on `src/components/` |
| P2.3 | Add Supabase RLS test suite (pg_tap or Deno) — verify anon cannot read `users.email` | 🔴 | L | RLS regression-proof |
| P2.4 | Switch lucide-react to per-icon imports (tree-shakable) | 🟡 | M | -100KB bundle |
| P2.5 | Add Sentry / observability for frontend errors (already have ErrorBoundary refs) | 🔴 | M | < 5 unhandled errors / week |
| P2.6 | Upgrade Supabase to Pro plan → enable leaked-password protection | 🟡 | S | One known security gap closed |
| P2.7 | Convert tracked `.m4a` / `.mp4` course assets to git-lfs or external CDN | 🟢 | M | Repo clone < 100 MB |
| P2.8 | BROskiPets Phase 1 mint-via-BROski$ flow (cross-repo) | 🔴 | L | First pet minted on testnet |

---

## 5. ARCHITECTURAL ENHANCEMENTS

### Suggested directional shifts (require Lyndz buy-in before action)

1. **Pick one backend.** Three competing surfaces (`api/`, `apps/api/`, `supabase/functions/`) is the biggest source of confusion. Recommend: **Supabase edge functions + RPCs** as canonical; delete `apps/api/` and the Python mocks.
2. **Move secrets to Vercel env exclusively.** `frontend/.env.local` is fine for dev but make sure `apps/api/` (if kept) reads from Vercel env, not local files.
3. **Adopt route-level code splitting.** `App.tsx` imports all 29 pages eagerly. `React.lazy(() => import('./pages/Pets'))` will halve initial JS.
4. **Standardize loading/error UI.** Six different "Loading..." strings across pages — extract `<Spinner />` + `<ErrorState />` primitives.

---

## 6. INNOVATIVE FEATURE IDEAS (from current architecture)

These match the BROski$ / dNFT direction in `HYPER_ECOSYSTEM_PLAN_MAY4.md`:

1. **Live HUD push notifications** — wire Supabase Realtime to `HUDContext` so XP gain shows instantly without 60s poll (already have `useRift` pattern to copy).
2. **Public leaderboard widget** — embeddable iframe powered by existing `leaderboard` view; great for sponsor pages.
3. **Quest streak multiplier** — DB column + RPC; multiplies `complete_quest` reward by streak days.
4. **Referral receipt UI** — `idx_referrals_referred_user_id` index exists; surface in `/profile` "your tree".
5. **Rift admin Slack/Discord webhook** — emit when `AdminRiftPanel` opens a rift; uses existing `discord-bot/`.

---

## 7. TESTING STRATEGY

### Current state
- ✅ TypeScript: 0 errors
- 🟡 ESLint: 1 error (P0.1)
- 🔴 Python: 1 trivial smoke
- 🟡 Playwright: 1 spec in repo (`tests/e2e/auth.spec.ts`); CLAUDE.md claims 72 passing — verify via CI when unlocked
- 🔴 Component tests: none
- 🔴 RLS tests: none
- 🔴 API contract tests: none

### Recommended pyramid (target Q3 2026)

| Layer | Tooling | Target coverage |
|---|---|---|
| Unit (utils, hooks) | Vitest | 70% lines |
| Component | Vitest + RTL | 50% of `src/components/` |
| RPC / RLS | pgTAP or Supabase test runner | All `SECURITY DEFINER` fns |
| E2E happy paths | Playwright | register · enroll · pay · earn XP · leaderboard |
| Visual regression | Playwright snapshots | Top 5 routes |

### Validation script for current improvements
```powershell
# from repo root
npm --prefix frontend run lint        # P0.1 success when this exits 0
npx --prefix frontend tsc --noEmit    # already green
python -m unittest tests/test_smoke.py
# E2E (requires running stack):
# npm --prefix frontend run dev (terminal A)
# uvicorn api.main:app --port 8000 (terminal B)
# npm --prefix frontend test (terminal C)
```

---

## 8. CONTINUOUS MONITORING FRAMEWORK

### What to track weekly

| Metric | Source | Threshold |
|---|---|---|
| ESLint errors | `npm run lint` | 0 |
| TS errors | `tsc --noEmit` | 0 |
| Bundle size (vendor + supabase + main) | `vite build` output | < 800 KB total gzipped |
| Lighthouse perf (mobile) | Vercel Speed Insights | > 85 |
| Playwright pass rate | CI run | 100% |
| Supabase advisor warnings | `mcp Supabase get_advisors` | 0 errors, < 5 perf warnings |
| Open root `.md` count | `ls *.md \| wc -l` | < 20 |
| Frontend dep audit | `npm audit` | 0 critical, 0 high |

### Automation hooks (when CI unlocked)
1. **Pre-commit (already on Husky):** `lint-staged` → eslint --fix + prettier
2. **PR check (`.github/workflows/ci.yml`):** lint + tsc + Playwright on Vercel preview URL
3. **Nightly cron (`/loop` skill or GitHub schedule):** Supabase advisors → Discord webhook
4. **Vercel Speed Insights:** already live (PR #3)
5. **Sentry / error tracking:** add to ErrorBoundary `componentDidCatch` (P2.5)

### Status tracking — recommended cadence

| Cadence | Action |
|---|---|
| Daily | Mark P0 tasks done in this file + `WHATS_DONE.md` |
| Weekly | Re-run `eslint . && tsc --noEmit` baseline; record in CHANGELOG |
| Sprint end (every 2 wks) | Update `HYPER_ECOSYSTEM_PLAN_MAY4.md` with shipped items |
| Release | Roll forward `CLAUDE.md` "CURRENT STATUS" block |

---

## 9. KEY METRICS — BASELINE (May 7, 2026)

| Metric | Value |
|---|---|
| Frontend `src/` LOC | **12,309** |
| Largest single file | `Pets.tsx` — 697 lines |
| Tracked files | 841 |
| Root markdown count | 30+ |
| Migrations | 46 (5 placeholders) |
| Supabase edge functions | 1 deployed |
| ESLint errors | **1** |
| ESLint warnings | 4 |
| TS errors | **0** |
| Real test count | ~1 Python + 1 Playwright spec in tracked tests + agent unit tests |
| Routes registered | 49 (29 pages) |
| Containers (parent ecosystem) | 29 healthy (per CLAUDE.md) |

---

## 10. EXECUTION ORDER (TL;DR)

1. ✅ Audit complete — this document
2. **Lyndz reviews & accepts/edits priorities**
3. P0.1 → P0.8 (this week, mostly small fixes + decisions)
4. P1 over the next 2 weeks
5. P2 backlog feeds into next quarter's sprint plan

> **Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡
