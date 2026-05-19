# 🤝 Handover → Next Claude Window
> From: Claude (Opus 4.7), end of 2026-05-19 monster session.
> Read this + `SESSION_SNAPSHOT_2026-05-19.md` + the auto-loaded memory first.
> Repo: `Hyper-Vibe-Coding-Course` · all work on `main` · `b165f3f` → handover.

---

## 1. Where things stand (60-second orient)

The **Vibe Labs / HyperLabs** funnel is built, deployed, and live end-to-end:
- DB: `claim_level_reward` RPC + `user_level_progress` (prod, real-user tested).
- Frontend: `/vibe-labs` hub + 5 level pages, `useProgress` hook, landing
  funnel (hero CTA + rich section + progress-aware ✓).
- 5 video scripts (`video_scripts/VIBE_LAB_LEVEL1..5`).
- Perf: route code-split + web3 deferred → cold funnel **1,270 kB → ~61 kB gzip**.
- Auth-truth: real `authError` state + `useAuthStatus` + status badges.

**The work is solid. What's left is mostly human verification + Sprint 3/4.**

## 2. 🔴 Load-bearing gotchas — DO NOT relearn these the hard way

1. **NEVER run `supabase db push` on this repo.** Local migration filenames
   are desynced from the remote `schema_migrations` table (zero overlap).
   Deploy single migrations via the **Supabase MCP `apply_migration`** tool.
2. **Web3 is lazy + `/pets`-only.** `src/components/Web3Provider.tsx` wraps
   only the `/pets` route. **Never import `wagmi`/`@rainbow-me/rainbowkit` in
   anything global, the funnel, or `main.tsx`** — it re-bloats every cold load
   by ~900 kB and reverts Sprint 2. A new wallet route must be wrapped in
   `Web3Provider`. (Only 4 files use wagmi — keep it that way.)
3. **`react-hooks/set-state-in-effect` is an ERROR**, enforced by husky +
   lint-staged on pre-commit. Calling `setState` synchronously in a
   `useEffect` body fails the commit. Pattern: derive, or use a `useRef` for
   "track previous value". Never `--no-verify`.
4. **Three separate chrome systems** — funnel `TopNav` (LandingPage), light
   `Layout`→`Navbar` (course pages), `VibeLabShell` (vibe-labs). There is **no
   single global shell.** Funnel pages skip `Layout`. Don't put the auth badge
   or anything web3 on the funnel.
5. **Styling idiom differs per file:** lab pages + Navbar use Tailwind `hfz-*`
   tokens; `LandingPage.tsx` uses inline styles + CSS vars. Match the file.
   Master palette only — **no orange** (it's a sacred brand rule here).
6. **`award_tokens()` sig:** `(p_user_id uuid, p_amount int, p_reason text,
   p_stripe_payment_intent_id text DEFAULT NULL, p_source_id text DEFAULT
   NULL)`. Ledger dedup = partial unique `(user_id,reason,source_id) WHERE
   source_id IS NOT NULL`. Always pass a stable `p_source_id`.
7. **`Pets.tsx` has `@ts-nocheck`** (line 1) + an `any` cast — pre-existing,
   non-blocking warnings. Don't chase them; it's a money-path file.

## 3. ⚠️ Open gates — these need a REAL BROWSER (I can't do them)

| Gate | How | Owner |
|---|---|---|
| 15-step auth checklist | **Use the repo's Playwright** (`npm run test:e2e`). Best assertion: kill network during profile load → badge must read `Auth error`, not `Signed out`. | Next session (write the E2E) or Lyndz |
| `/pets` wallet smoke | Connect Wallet → RainbowKit modal → mint inits. MetaMask can't be automated — Lyndz clicks. | Lyndz |
| Real Core Web Vitals | Vercel dashboard → project → **Speed Insights** (RUM already collecting via `@vercel/speed-insights`). All CWV in the review are estimates. | Lyndz reads dashboard, or check Vercel MCP for a logs/metrics endpoint |

## 4. 🧰 Tools & skills you (next Claude) actually need

**Load-bearing this session — make sure these are available + use them:**
- **Supabase MCP** (`execute_sql`, `apply_migration`, `list_migrations`) —
  the only safe way to touch the DB here. Used to verify `award_tokens`,
  deploy `000035`, real-user-test the RPC (in a `begin; … rollback;` txn —
  MCP honours the rollback, so you can test on prod with zero persistence).
- **Vercel MCP** (`list_projects`/`list_deployments`/`get_deployment`) — for
  deploy state. But the **reliable "is it live" signal** was a backgrounded
  `curl` loop watching the prod `index-*.js` bundle hash flip (see §5).
- **`design-brain` skill** — invoke for ANY UI/page/component/visual work
  (Build Mode: Layer 1 taste + Layer 2 Emil). It's the anti-slop bar here.
- **Bash `run_in_background`** — for the deploy watcher (one-shot notify).
- The standard loop: `npx tsc --noEmit` + `npx eslint <files>` +
  `npm run build` (build also proves chunking — read the chunk sizes).

**The biggest gap — fix this next session:**
- **Use Playwright. It's already installed** (`@playwright/test`,
  `npm run test:e2e`, `playwright.config` exists). This session I kept saying
  "human must click-test" for the auth checklist + visual checks. That's a
  cop-out where Playwright applies. Next session: write an auth-flow E2E
  (sign in → navigate → refresh → sign out, assert `[data-auth-status]` on the
  badge), and visual smokes for the lab pages. The badge was *built* with
  `data-auth-status` / `data-wallet-status` attributes **specifically so
  Playwright can assert them** — use that.
- **What stays human-only (don't pretend otherwise):** MetaMask/wallet popups
  (extension UI), and real-field CWV (needs the Vercel dashboard, not a tool).
  Be honest about these, like this session was.

**Skills referenced but not deeply used (know they exist):** `supabase`,
`vercel-deploy`, `supabase-postgres-best-practices` (project skills);
`update-config` if hooks/permissions need changing.

## 5. 🔧 Working patterns that paid off (reuse them)

- **Deploy-verify watcher** (reliable; the prod alias auto-promotes on READY):
  ```
  PROD=https://hyper-vibe-coding-course.vercel.app; OLD=<current index hash>
  # backgrounded loop: curl $PROD, grep 'assets/index-*.js', exit when != OLD,
  # then print root/route HTTP codes. ~15s typical.
  ```
  Bundle-hash flip = the *new* build is provably serving (not stale cache).
- **Test a SECURITY DEFINER RPC on prod safely:** `begin; set local
  request.jwt.claims = '{"sub":"<real uuid>","role":"authenticated"}'; …;
  rollback;` via Supabase MCP `execute_sql`. Zero persistence (verified).
- **Verify perf claims from the build itself** — `npm run build` chunk sizes
  are real evidence. Don't assert LCP wins; show the chunk delta + say CWV is
  still an estimate until the Vercel dashboard confirms.
- **Honesty cadence that worked:** when code contradicted a plan/review,
  surfaced it and corrected the doc (visible correction log) instead of
  quietly proceeding. Keep doing this — it caught the Sprint-2 revert trap.

## 6. Recommended next moves (priority order)

1. **Playwright auth E2E** for the 15-step checklist (close gate #1 properly).
2. **Sprint 3** (review §5): 16px text floor, font `preload`+`display:swap`,
   44px progress-bar touch targets, run axe + Lighthouse.
3. **Sprint 4**: anon→signup conversion (localStorage `completedLevels`, gate
   the claim) — highest funnel ROI per the review.
4. Ask Lyndz for the `/pets` wallet result + a Vercel Speed Insights screenshot
   to replace the estimated CWV in the review with real numbers.

## 7. Key files map

```
DB:    supabase/migrations/20260518000035_claim_level_reward.sql  (deployed)
Hook:  frontend/src/hooks/useProgress.ts        (lab progress + claim RPC)
       frontend/src/hooks/useAuthStatus.ts      (unified auth status)
Web3:  frontend/src/components/Web3Provider.tsx (lazy, /pets ONLY)
Auth:  frontend/src/context/auth.ts             (now has authError)
Labs:  frontend/src/pages/vibe-labs/*           + components/vibe-labs/*
Funnel:frontend/src/pages/LandingPage.tsx       (VibeLabsBand section)
Routes:frontend/src/App.tsx                     (all lazy + Suspense + boundary)
Docs:  rewrites/HYPERLABS_PAGE_REVIEW_2026-05-19.md (roadmap Sprints 3/4)
       rewrites/SESSION_SNAPSHOT_2026-05-19.md
Scripts: video_scripts/VIBE_LAB_LEVEL1..5_VIDEO_SCRIPT.md
```

---

> Be honest about what you can't verify. Surface contradictions. Match the
> file's idiom. Never `db push`, never global wagmi, never `--no-verify`.
> Use Playwright instead of saying "human must test" when a browser test fits.
> *Built for brains that build differently. Keep it weird, keep it Welsh. ♾️*
