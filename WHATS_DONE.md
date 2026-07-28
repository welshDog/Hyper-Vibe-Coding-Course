# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-07-28 by Claude (Cowork) ⚡

## 2026-07-28 — Referral-code RPC hardened against cross-user UUID targeting

The referral-link RPC is now locked to the signed-in user and no longer accepts
an arbitrary UUID from the client. This closes the IDOR-shaped hole where a
future execute grant on `get_or_create_referral_code(p_user_id uuid)` would have
let a caller target another user's referral-code row.

- **Root cause:** the original referral migration created
  `public.get_or_create_referral_code(p_user_id uuid)` as a
  `SECURITY DEFINER` function in `public`, but the function body trusted the
  caller-supplied UUID completely. That meant the function shape itself was
  unsafe even before the missing-grant issue was fixed.
- **DB fix shipped as one migration:**  
  `supabase/migrations/20260728215609_harden_referral_code_rpc.sql`
  - explicitly drops the old `public.get_or_create_referral_code(uuid)`
  - creates `public.get_or_create_referral_code()` with **no args**
  - binds `v_user_id` to `auth.uid()`
  - raises a clear exception for unauthenticated calls
  - keeps `SECURITY DEFINER`, but narrows exposure with  
    `REVOKE ALL ... FROM PUBLIC` and  
    `GRANT EXECUTE ... TO authenticated`
  - uses `SET search_path = pg_catalog, public`
- **Frontend callers updated:** the three user-facing referral surfaces now call
  the zero-argument RPC only:
  - `frontend/src/pages/Welcome.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/TokensPage.tsx`
- **Test-first proof added:** new focused Playwright regression
  `frontend/tests/referral-rpc.spec.ts` first failed against the old body shape
  because the request still posted `p_user_id`, then passed once the callers
  were switched to `supabase.rpc('get_or_create_referral_code')`.
- **Live verification against project `tlavrxiaegbtyfmjfdcz`:**
  - authenticated temp user call #1 → `200` with code `BROB1DCB353`
  - authenticated temp user call #2 → `200` with the **same** code
  - anonymous call → `400` / `P0001` with message  
    `"Authentication required to get or create a referral code."`
  - attempted old-shape call with `p_user_id` → `404` / `PGRST202`  
    (`Could not find the function ... (p_user_id) in the schema cache`)
  - temp probe user was deleted after verification
- **Deployment/apply path:** the first Supabase MCP `apply_migration` path timed
  out while initializing the history table, so the migration was applied via
  the repo-approved fallback connector `supabase_apply_migration` against the
  same live project. No `supabase db push` used.

## 2026-07-28 — Profile progress now tells the truth for hv_modules users

The `/profile` page no longer tells a user with real hv_modules completions that
they have `0 Courses` just because the legacy `enrollments` table is empty.
Fixed as a read-side-only change, exactly per the architecture decision: **treat
`module_completions` as the source of truth for hv_modules progress, do not backfill
`enrollments`, and do not mint fake achievements.**

- **Root cause:** `Profile.tsx` was reading only `public.enrollments` and
  `public.achievements`, which are the older lesson/course surfaces. The real
  hv_modules quest path (`/courses/:slug` → `complete_module()`) writes
  `module_completions`, `user_xp`, `users.broski_tokens`, and `xp_events` — so
  a learner could have genuine module progress and still see a misleading zero
  in Profile.
- **Fix:** added a tiny read-side adapter
  (`frontend/src/lib/profileProgress.ts`) and wired `Profile.tsx` to do two
  extra direct client reads that match existing repo patterns:
  `hv_modules` for total module count and `module_completions` for the signed-in
  user's completed count. No RPC, no view, no schema change, no write-path change.
- **UI now separates truthfully:** the stat strip shows `Progress` (`3/12`,
  etc.) instead of pretending hv_modules are legacy purchased courses, while
  the existing `Badges` stat still reflects only real `achievements`. The
  `My courses` empty state now explicitly says legacy enrollments live there and
  shows the learner's real module progress instead of a misleading blank state.
- **Legacy behavior preserved:** the legacy enrollment list still reads
  `public.enrollments`, and badges still read `public.achievements`. This fix
  does **not** bridge the two systems and does **not** auto-award anything.
- **Verification:** a new unit test covers the progress-summary adapter
  (`frontend/unit-tests/profileProgress.test.ts`), a mocked Playwright regression
  covers the signed-in `/profile` route
  (`frontend/tests/profile-progress.spec.ts`), and the frontend production build
  is green. Full app `tsc --noEmit` is still red in unrelated pre-existing files
  (`src/hooks/useOwnedCosmetics.ts`, `src/pages/LessonPlayer.tsx`) and was not
  changed by this fix.

## 2026-07-25 — Module completion write path: root-caused + fixed + verified live

A live QA pass ("befor beta testing report" / Comet bug report) flagged module
completion as launch-blocking: clicking "Mark as Complete" looked like it worked
(button went active, no error) but wrote nothing — no XP, no BROski$, no completion
record. Traced, root-caused, fixed, and shipped as `3a04d0c`, pushed to `origin/main`.

- **Third instance tonight of the same missing-EXECUTE-grant pattern** as
  `is_admin()` and the still-open `get_or_create_referral_code()` finding —
  `public.complete_module(uuid, integer)` is SECURITY DEFINER but `authenticated`
  had never been (re-)granted EXECUTE. Confirmed via the live network response:
  `{"code":"42501","message":"permission denied for function complete_module"}`.
  Notably, the *original* migration (`20260426220000_module_completion.sql`)
  already contained the correct grant — this is migration-history-vs-live-DB
  drift (same class as the tlav rebuild history), not a developer oversight.
  Re-granted and migration-tracked:
  `supabase/migrations/20260724231130_grant_complete_module_execute.sql`.
  Safe to grant — same shape as `is_admin()`: no caller-supplied `user_id`, only
  ever acts on `auth.uid()`.
- **Frontend was silently masking the failure** — `useModuleCompletion.ts` caught
  the RPC error and returned a fake `{status: 'already_completed'}`, and the
  caller flipped `isCompleted` to `true` on that status too. A hard permission
  failure and a real completion looked pixel-identical on screen while the
  database recorded nothing. Fixed: the hook now throws the real error;
  `CourseModule.tsx` catches it into a dedicated `completionError` state with an
  inline "That didn't save — nothing was lost, give it another try" message
  (kept separate from the page-level `error` state, which is for load failures
  and would otherwise nuke the whole module view on a completion-click failure).
- **`/pets` "Recent activity" fixed as a same-session follow-up** — the XpFeed
  component reads `public.xp_events`, which already had a `module_complete`
  event mapping ready to render but nothing ever inserted into it.
  `complete_module()` now logs an `xp_events` row alongside its existing writes
  (`amount` = BROski$ coins, matching what `EventRow` renders):
  `supabase/migrations/20260724232353_complete_module_logs_xp_event.sql`
  (`CREATE OR REPLACE`, same OID, grant preserved — verified).
- **Verified live end to end, twice** — completed two real modules (M1, M2)
  through the actual UI. RPC returns `200` with real `{status, xp, coins}`;
  `module_completions`/`user_xp`/`users.broski_tokens`/`xp_events` all show the
  correct rows; `/courses` progress ticks up, module card shows "✓ Quest
  complete"; `/pets` Recent Activity shows "📚 Module complete · +N BROski$";
  all of it persists across a full page reload.
- **First real pet minted on this account, verified across all four layers**
  (chain, DB, IPFS, UI) — Luna the Blizzard Lizard, Base Sepolia, contract
  `0x4daF9e1e...73A69a`, token ID 3. RPC receipt shows a genuine ERC-721 mint
  (status success, Transfer from the zero address); a live `ownerOf(3)` call
  confirms current custody, not just mint history; pinned IPFS metadata
  matches the DB row; block timestamp and DB `created_at` agree to within 2
  seconds. Bonus proof point: 5 real `module_complete` entries in her Recent
  Activity feed from actual use, confirming the completion-bug fix above holds
  under real usage. **Minor cosmetic note, not a bug:** the pinned metadata's
  "Minted At" trait is a shared baby-stage template placeholder (reads May
  2026), not per-token — harmless now, would need real per-token timestamps if
  rarity/provenance tooling is ever built on top of that trait.
- **Flagged, not fixed — needs its own scoped task, not a same-session patch:**
  `/profile` still shows "0 Courses / 0 Badges" for hv_modules completions.
  That stat block and the "My courses" list read `public.enrollments`/
  `public.achievements` (the older lesson-based system, `LessonPlayer.tsx` /
  `/learn/:courseId`), which `complete_module()` never touches. This is an
  architecture question — which system is source of truth for "a course" —
  not a bug, and deserves a deliberate decision rather than a rushed bridge.
- **Queued, not urgent:** given three separate functions tonight (`is_admin()`,
  `complete_module()`, and the still-open `get_or_create_referral_code()`) all
  hit the identical migration-history-vs-live-grant drift, a full audit —
  diff every `GRANT`/`REVOKE` statement across migration history against
  `has_function_privilege()` on the live DB for every SECURITY DEFINER
  function — would catch any other silently-broken function before a user
  finds it. Worth doing, not blocking anything right now.

## 2026-07-24 — Auth hardening batch (beta-readiness upgrade)

Root-caused and fixed the login incident from earlier the same day, then closed out
all three follow-up items in order. Shipped as `89b2793`, pushed to `origin/main`.

- **`is_admin()` grant is migration-tracked, not just a live SQL fix** — the ad-hoc
  `GRANT EXECUTE` that unblocked every user's login is now
  `supabase/migrations/20260724182817_grant_is_admin_execute.sql`, so it survives a
  future schema reset instead of silently regressing.
- **Password reset is complete end to end** — `ForgotPassword` + `ResetPassword`
  added to `frontend/src/pages/Auth.tsx`, routes wired in `App.tsx`. This was the
  actual missing piece behind the original incident (recovery email worked, but
  there was no page to land on). Verified live against `tlavrxiaegbtyfmjfdcz`:
  real recovery email sent, real recovery link clicked through, password updated,
  redirected to `/dashboard`. Expired-link state and duplicate-password rejection
  also verified.
- **`/signup` 500 (duplicate key on `users_email_key`) is root-caused and
  recurrence-protected** — `public.users` had a `UNIQUE(email)` but no FK back to
  `auth.users`, so a deleted auth account left a permanent orphan profile row that
  blocked that email from ever signing up again. Found 4 live orphans (incl.
  `lyndzwills@gmail.com` — the exact signup that was failing), confirmed zero
  dependent data on any of them, deleted them, and added
  `users_id_fkey ... REFERENCES auth.users(id) ON DELETE CASCADE`
  (`supabase/migrations/20260724184328_fix_signup_orphaned_profiles.sql`) so this
  class of bug can't recur.
- **Found but deliberately NOT fixed the same way:** `get_or_create_referral_code(p_user_id uuid)`
  has the same missing-EXECUTE-grant 403 as `is_admin()` did, but it isn't safe to
  blanket-grant — it takes an arbitrary `user_id` with no internal check against
  the caller, so a naive grant would let any signed-in user overwrite someone
  else's referral code. **Next task: a real code fix (validate `p_user_id = auth.uid()`,
  or drop the parameter), not another permission patch.**

## 2026-07-19 — Quizzes re-seeded from git (root-cause fix)

- **hv_quizzes was empty after the yhtmui→tlav rebuild** — quiz content had only ever
  lived in the old DB, never in git, so the rebuild lost it. **Root fix:** quiz content
  is now a committed seed migration (`supabase/migrations/20260718210000_seed_hv_quizzes.sql`),
  so it survives future rebuilds.
- **M3 (🎤 Prompt Like a Pro) + M4 (🏗️ Build Your First App) live on tlav** — 5 questions each,
  keyed to the correct live modules, applied idempotently. Disk = DB.
- **Caught two drift traps before applying:** (1) master-pack numbering ≠ live tlav numbering
  (a new intro module shifted everything down); (2) matching titles hid *different lesson content* —
  questions were rewritten from the LIVE lesson text (`scripts/_archive/M3-*.md`, `M4-*.md`),
  every answer grounded in a real line. **Lesson: verify content, not the label.**
- **Still open:** M1, M2, M5–M12 `hv_quizzes` (author from live content — HELD list in the seed file);
  the separate `quiz_questions` lesson-level system is still empty. See `docs/QUIZ_SEED_HANDOFF_2026-07-18.md`.

## Done & Locked — Do NOT re-suggest

- Course platform architecture: Supabase + Vercel + Web3
- Frontend dev command: `npm run dev:frontend` (NOT `npm run dev`)
- Sacred import rules enforced: `from app.X import Y`
- .env files never committed to git
- Stripe webhook rate-limit exempt confirmed

## Sacred Rules (NEVER break)

- `npm run dev:frontend` — NOT `npm run dev`
- `.env` files — NEVER committed to git
- Stripe webhook — rate-limit EXEMPT, always
- `from app.X import Y` — NEVER `from backend.app.X`
