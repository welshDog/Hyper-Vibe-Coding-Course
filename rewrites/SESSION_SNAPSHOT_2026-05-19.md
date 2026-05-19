# Session Snapshot — May 19, 2026 — HyperLabs Wired End-to-End

## What we did this session
Took HyperLabs from "markdown docs + skills" all the way to **live, tested, funnel-wired product**.

1. **Reviewed** skills + context. Flagged 2 big gaps: dual brand palette (old purple/orange vs master HFZ), and `supabase-xp` skill was Next.js in a Vite repo.
2. **L5 page pedagogy fixes** — 🔴→💡, per-step ⏱️ times, Vite + master palette in the capstone prompt blocks; aligned Step 1 & 2 prompt blocks (no orange, no Next.js).
3. **Rewrote `supabase-xp`** for Vite — one atomic `SECURITY DEFINER` RPC. Killed: double-award race, missing server-side level lock, Edge-Fn CORS.
4. **Migration `000035` `claim_level_reward`** — written house-style, idempotent.
5. **Verified `award_tokens()` live** → switched to named args + stable `p_source_id` (`vibe-level-N`) for ledger-level idempotency on top of the row lock.
6. **Deployed `000035` to prod** via Supabase MCP `apply_migration` (NOT `supabase db push`). Revoked `anon` EXECUTE (Supabase default privs bypass `revoke from public`). Verified table + RLS + grants.
7. **End-to-end tested** `claim_level_reward` against a real user in a rolled-back txn — happy path, idempotency, server lock, invalid, real `award_tokens` balance bump, ledger rows. Zero persistence.
8. **Built the frontend** — `useProgress` hook, `vibeLabs.ts` registry, 5 shared components, 5 level pages + hub, routed in `App.tsx`. HFZ Tailwind tokens, CSS-only motion (no framer dep in repo), reduced-motion safe.
9. **Navbar link** → `🧪 Vibe Labs`.
10. **Landing funnel** — hero ghost CTA, then the rich "Pick your first Big AI" section (asymmetric: featured L1 + path rail), then progress-aware ✓ marks for logged-in returners.
11. Every step: TS + ESLint + `vite build` green, pushed, Vercel deploy confirmed READY + serving live (bundle-hash flip verified each time).

## Files pushed this session
- `rewrites/HYPERFOCUS_FULLSTACK_LEVEL5_PAGE.md` ✅ (pedagogy + prompt-block fixes)
- `skills/supabase-xp/skill.md` ✅ (full Vite rewrite + verified award_tokens wiring)
- `supabase/migrations/20260518000035_claim_level_reward.sql` ✅ (**deployed to prod**)
- `frontend/src/hooks/useProgress.ts` ✅
- `frontend/src/lib/vibeLabs.ts` ✅
- `frontend/src/components/vibe-labs/` ✅ (VibeLabShell, LevelProgressBar, RewardCard, PromptBlock, LabSection)
- `frontend/src/pages/vibe-labs/` ✅ (VibeLabsIndex + Level1–5)
- `frontend/src/App.tsx` ✅ (routes)
- `frontend/src/components/Navbar.tsx` ✅ (nav link)
- `frontend/src/pages/LandingPage.tsx` ✅ (hero CTA + rich section + progress-aware band)

Commits: `b165f3f` `e869506` `03066ab` `72fd605` `4eb922d` `36e76d2` `93edfb6` `ae4436a` `43a47ac` `8e9dc1f` `ff74628` — all on `main`, all deployed READY.

## What's live now
- **Prod DB** (`yhtmuibgdnxhbgboajhc`): `user_level_progress` table + `claim_level_reward` RPC — atomic, idempotent (row lock + ledger dedup), server-side level lock, `authenticated`-only, real-user tested.
- **Frontend**: `/vibe-labs` hub + `/vibe-labs/level-1..5`; navbar link; landing-page funnel (free CTA → rich section → progress-aware ✓ for returners). All public to view, claim auth-gated.

## ⚠️ Key gotchas (read before touching this again)
- **NEVER run `supabase db push` on this repo** — local migration filenames are desynced from the remote `schema_migrations` table (zero overlap). It would replay shop/pet migrations the DB already has. Deploy single migrations via **Supabase MCP `apply_migration`**.
- `award_tokens()` verified sig: `(p_user_id uuid, p_amount int, p_reason text, p_stripe_payment_intent_id text DEFAULT NULL, p_source_id text DEFAULT NULL)`. Ledger dedup = partial unique index `(user_id, reason, source_id) WHERE source_id IS NOT NULL` — always pass a stable `p_source_id`.
- This repo has **no `framer-motion`** — Vibe Labs motion is CSS-only, reduced-motion gated.
- Landing-page styling idiom = inline styles + CSS vars + HVZ components (NOT the Tailwind `hfz-*` tokens the lab pages use). Match the file you're in.

## Addendum — video scripts + doc sync (later same session)
- **NotebookLM source pack** handed over (5 lab-page links + a "build state" text source + starter prompt).
- **5 Vibe Labs video scripts** written, reviewed, saved + pushed: `video_scripts/VIBE_LAB_LEVEL1..5_VIDEO_SCRIPT.md`. Same 7-beat pedagogy voice; rewards verified vs deployed RPC; standard fixes applied every time (claim **on the lab page** not a dashboard, real badge strings, no orange).
- **L3 source drift fixed at root** — `rewrites/TRAE_IDE_AGENTS_LAB_LEVEL3_PAGE.md` wrongly granted "Meta-Architect" (that's the L5 badge) → corrected to **Trae Agent Master**, claim-on-page, orange→violet/cyan.
- **`video_scripts/README.md`** updated — added the Vibe Labs track table + pipeline + verified-reward note.
- Commits this addendum: `7732c0a` `a42f165` `9c3feee` `f8a7062` `3edc3f4` `eb87f50` `<readme/snapshot sync>`.

## Addendum 2 — HyperLabs review + perf + auth-truth (later same session)
- **Comprehensive HyperLabs page review** written + saved: `rewrites/HYPERLABS_PAGE_REVIEW_2026-05-19.md`. Self-corrected two wrong first-pass claims after code inspection (error boundary already existed/wired; web3 was at the app root so lazy-routes alone wouldn't fix LCP).
- **Sprint 1 (`0cd772a`, live):** route code-splitting (`React.lazy`+`Suspense`) + route-scoped `ErrorBoundary` in `App.tsx`. Entry chunk **1,270 kB → 587 kB** gzip 340→176.
- **Sprint 2 (`4c16b0c`, live):** lifted Wagmi/RainbowKit/QueryClient out of `main.tsx`'s eager root into a **lazy `src/components/Web3Provider.tsx` wrapping ONLY the `/pets` route**. Entry **587 → ~61 kB** gzip 176→16. metamask-sdk/wagmi now `/pets`-only lazy chunks. Verified blast radius: only 4 files use wagmi (`main.tsx`, `lib/wagmi.ts`, `useMintPet.ts`, `MintPetButton.tsx`); react-query is wagmi-only.
- **Review doc updated (`0cb0402`)** — Sprints 1&2 marked ✅ with measured numbers; verdict 7.5→9.
- **Auth-truth (`949f733`):** added real `authError` state to `context/auth.ts` (was silently swallowed → looked signed-out). New `useAuthStatus` hook (auth-only, no wagmi). `AuthStatusBadge` in Navbar (authed shell, not funnel). `WalletStatusBadge` on `/pets` only (inside Web3Provider). Also fixed a pre-existing `set-state-in-effect` ERROR in `Pets.tsx` (ref not state; behaviour identical) that blocked the pre-commit hook.
- Commits this addendum: `2e86207` `0cd772a` `4c16b0c` `0cb0402` `949f733` + this snapshot/handover sync.

## ⚠️ Open human-only gates (cannot be done by Claude — need a real browser)
1. **15-step auth checklist** — now a fast eyeball pass (badge can't lie). Key test: kill network during profile load → must show **`Auth error`**, not `Signed out`.
2. **`/pets` wallet smoke test** — Connect Wallet → RainbowKit modal → mint inits (owed since Sprint 2 + new `Wallet ready` pill).
3. **Real Core Web Vitals read** — `@vercel/speed-insights` is installed; pull before/after LCP/INP/CLS from the Vercel dashboard. All CWV in the review are *estimates*.

## What's next (for the next session)
- Close the 3 gates above (see `NEXT_SESSION_HANDOVER_2026-05-19.md` for how — esp. use the existing **Playwright** harness for the auth checklist).
- Sprint 3 (review §5): 16px text-floor fix, font preload+`display:swap`, 44px touch targets on the progress bar, axe/Lighthouse certify.
- Sprint 4: anon→signup conversion (persist `completedLevels` in localStorage, gate the claim) — the funnel multiplier.
- Optional: NotebookLM deep-dive buttons; record the 5 lab videos.

## Key decisions
- Master HFZ palette is authoritative for this repo (no orange). Lab pages use Tailwind `hfz-*` tokens; landing page keeps its own CSS-var idiom.
- Reward logic = one atomic DB RPC, not an Edge Function (Vite SPA, no CORS, can't be spoofed).
- Wire into the existing `award_tokens()`/`token_transactions` economy — never a parallel coin system.
- Landing funnel: free taste (labs) before the ask (waitlist/course); returners see their own progress.

## Mood
🟢🔥 Monster session. Docs → deployed RPC → real-user tested → full wired frontend → live funnel. Every deploy green. Nice one BROski♾️

---

*Built by Lyndz Williams + Claude (Opus 4.7) ♾️🚀*
*Hyperfocus z0ne — Stop apologising for your brain. Start building.*
