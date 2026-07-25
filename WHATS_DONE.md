# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-07-25 by Claude (Cowork) ⚡

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
