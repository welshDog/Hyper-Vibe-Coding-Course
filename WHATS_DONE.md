# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-08-05 by Claude (Cowork) ⚡

## 2026-08-05 — Active quiz containment + `/pets` live proof + frontend QA docs

This session closed the one meaningful production-verification loose end from
the 2026-08-01 handover, then fixed two small but real frontend UX issues on
top of that. Important split: some work was **verified live in production**,
while some was **fixed and verified locally only** and is not deployed yet.

**Per-pet-XP production proof — completed live**
- The outstanding manual authenticated `/pets` check from the 2026-08-01
  handover is now done on `https://hypervibe.online`.
- Verified on a real signed-in pet-owning account that the hero/evolution UI
  reflects the selected pet's own XP, not just the account total
  (`Luna XP : 414`, Stage Baby, Next target Learner).
- A later live pass on the same real account (after it had 2 pets and more
  shop purchases) also confirmed multi-pet switching works and a real Feed
  action updated Bolt's XP from `0` to `2`.

**Active course-module quiz explanation containment — fixed locally**
- The active `/courses/:slug` flow still accepted and rendered `explanation`
  text from `get_quiz_for_module()` if the backend RPC sent it. The active
  module page now sanitises the payload before storing it and no longer
  renders explanation text in the client UI.
- Failed-quiz copy was tightened so it tells the learner to review the lesson,
  not "review the explanations below".
- Regression added first in `frontend/tests/course-module.spec.ts`, then the
  fix was made in `frontend/src/pages/CourseModule.tsx`.
- Verified locally: full `course-module` Playwright spec green across
  Chromium/Firefox/WebKit + `npm run build` green.
- **Still open separately:** the legacy `/learn/:courseId` lesson-player quiz
  flow was deliberately left untouched on this pass.

**`/pets` UI polish — fixed locally**
- Live QA found a misleading Play empty-state message: `/pets` could say
  "You don't have any toys yet" while `/shop` showed owned generic toys like
  Laser Pointer / Code Ball / The Deploy Button.
- Important nuance: this was fixed as a **copy/expectation** issue, not by
  pretending generic shop toys are automatically pet-care-compatible. The
  empty-state now says `play items`, which matches the actual frontend rule.
- The mini pet-picker cards also had weak/inconsistent browser semantics when
  selected. `HVZCard` now exposes `aria-pressed` for clickable selected cards,
  so the chosen pet is no longer just visually highlighted.
- Regressions added first:
  - `frontend/tests/pets-care-actions.spec.ts`
  - `frontend/tests/pets-selection.spec.ts`
- Fixes landed in:
  - `frontend/src/components/pets/PetCareSection.tsx`
  - `frontend/src/components/ui/hvz/HVZCard.tsx`
- Verified locally: affected pets suite green across Chromium/Firefox/WebKit
  (`27` tests) + `npm run build` green.

**Session docs brought back into sync**
- Added fresh operational truth docs for this session:
  - `rewrites/SESSION_SNAPSHOT_2026-08-05.md`
  - `rewrites/NEXT_SESSION_HANDOVER_2026-08-05.md`
- Those docs explicitly separate:
  - what was verified live in production
  - what was fixed and verified locally only
  - what still remains open next session

**Quick local browser smoke — green**
- Ran a lightweight local browser smoke against the patched frontend on
  `http://localhost:4173`.
- Confirmed `/`, `/pets`, and `/courses` render without a blank screen or
  fatal runtime crash.
- One non-fatal wallet/provider-related console abort was observed on
  `/pets`; it did not block rendering.

## 2026-07-31 → 2026-08-01 — `/pets` Moy-style reskin + per-pet XP

Two linked pieces of work on the BROski Pets page, run back to back.

**Full visual reskin of `/pets` toward a pastel/chunky pet-sim look**
(PR #37, #40) — new `pet-*` Tailwind token namespace + a scoped
`.pet-theme-scope` CSS-var override block that cascades into the shared
`HVZCard`/`HVZButton`/`HVZTag`/`HVZProgress` primitives with zero edits to
their internals (so Shop/Tokens/Profile/Landing render identically).
Layout changed from "grid of equal pet cards" to a single hero-pet
spotlight + a demoted horizontally-scrollable mini-card picker strip.
Shipped in rounds against live user QA feedback (duplicate sections, an
XP-number duplication bug, layout rebalancing, hero-card sizing, an
Evolution Path "Baby row" fix) — PR #40 closed those out plus a
pre-existing `PetMentorBubble` collision bug (the auto-opened chat panel
could block a lesson page's "Next" button).

**Per-pet XP** (spec: PR #39, plan: PR #41, implementation: PR #42) — every
BROskiPet now earns its own XP instead of all of a user's pets sharing one
account-wide bar. A Postgres trigger (`trg_fan_out_pet_xp` on `user_xp`)
fans every `total_xp` increase out to all of that user's `pets.xp` rows;
`evolve_pet()` now gates on the pet's own `xp`, not the account total. No
backfill — existing pets start at `xp = 0` and earn forward from here
(deliberate design choice, documented in the spec).

Built via full spec → plan → `subagent-driven-development`: 4 tasks, each
implemented and reviewed independently, then a mandatory final
whole-branch review (dispatched on the most capable model) caught a real
**Critical** bug none of the per-task reviews could see because it spanned
a file no task touched — `EvolveButton.tsx` was still gating on the old
account-wide XP, so it would show an "Evolve" button the server then
rejected. Fixed, regression-tested (the fix was mutation-verified by the
re-reviewer — reverted it and confirmed the new test goes red), and
independently re-reviewed clean before merge.

- Also fixed along the way (PR #38, ahead of the full per-pet-XP work):
  `evolve_pet` was reading the wrong XP pool entirely — a same-day hotfix
  that the later per-pet-XP migration then built on top of correctly.
- **Known open item**: the plan's manual authenticated-UI check (log in as
  a real user who owns a pet, confirm the hero card/evolution path reflect
  that pet's own XP) was never completed — no real login credentials
  available in the agent environment. Flagged in PR #42's description;
  worth doing on the next real session, live on `hypervibe.online`.
- A stray uncommitted local edit to `PetCard.tsx` (same content that PR
  #42 already shipped) got committed directly to local `main` outside the
  PR flow and correctly rejected by GitHub's branch protection on push;
  local `main` was reset to `origin/main` to clear it — no functional
  change lost, since the content was already identical.

## 2026-07-31 — `cogs/signups.py` `subscription_tier` bug fixed and live-verified

The one open item from the 07-30 bot deployment (below): the "Catch
Stragglers" notifier queried `users.subscription_tier`, a column that has
never existed on `public.users` — confirmed live via Supabase MCP
(`42703 column "subscription_tier" does not exist`). Tier is actually
computed by the `public.user_loyalty_tier` view (same source
`course-profile` Edge Function already reads correctly) — `signups.py` was
the only consumer still assuming a raw column.

- Added `db.get_new_signups(since)`: fetches new `users` rows, then
  batch-queries `user_loyalty_tier` for each user's real `tier`, merging
  before returning. `signups.py` now calls `db.get_new_signups(...)`
  instead of querying `_client` directly — matching the `db.func()`
  convention every other cog already follows.
- Shipped via `fix/signups-subscription-tier` → PR #35 → merge (`db68131`),
  the required branch-protected flow.
- **Verified live**: Railway auto-redeployed on the `main` merge
  (deployment `8e7af80a`, `SUCCESS` in ~66s); runtime logs show all 5 cogs
  loaded and the new query hitting Supabase with the corrected column list,
  returning `HTTP/2 200 OK`.

## 2026-07-30 — BROski Course Bot deployed live for the first time (Railway)

`discord-bot/` (Python `discord.py` gateway bot — `/link`, `/xp`,
`/xp-leaderboard`, `/quest`, `/badges`, weekly quest auto-post, badge-unlock
announcements) had existed in the repo but was never deployed anywhere.
Investigated first (found no Dockerfile/Procfile/Railway config for it, and
a Railway project someone assumed was it — `broski-bot` in `HyperCode-V2.4`
— turned out to be a different repo entirely, itself pointed at a Supabase
project deleted 2026-07-18, unrelated, flagged not fixed).

- Migrated off `SUPABASE_SERVICE_ROLE_KEY` to a scoped named secret key
  (`discord_bot`), renamed to `SUPABASE_ADMIN_KEY` in code so the name
  itself signals it isn't the legacy key.
- Deployed to a new dedicated Railway project (`hyper-vibe-discord-bot`).
- Three real bugs hit and fixed during first deploy, each root-caused
  properly rather than guessed at:
  1. `ModuleNotFoundError: No module named 'audioop'` — Python 3.13
     (Railway default) removed it from stdlib; `discord.py==2.3.2` still
     imports it unconditionally. Fixed via `RAILPACK_PYTHON_VERSION=3.12`
     (first tried `NIXPACKS_PYTHON_VERSION`, which silently no-opped —
     this project's builder is Railpack, a different override var,
     confirmed via Railway's own docs).
  2. `discord.errors.LoginFailure: Improper token has been passed` — first
     token value was missing its trailing character. Fixed with a freshly
     reset token from the Discord Developer Portal.
  3. `SupabaseException: Invalid API key` — thrown client-side, before any
     network call. `supabase==2.4.0` predates the `sb_secret_*` key format
     and rejects anything not shaped like a legacy JWT. Bumped to `2.31.0`
     (verified `db.py`'s actual usage is core, stable PostgREST-client API,
     unchanged across that range).
- **Verified fully live** via real Discord gateway logs: logged in as
  `BROski Course Bot#7951`, 10 slash commands synced to the guild, all 5
  cogs loaded.
- **Found, not fixed**: `signups` cog's background task queries
  `users.subscription_tier`, a column that doesn't exist — doesn't crash
  the bot, but the "Catch Stragglers" notifier silently never fires.

## 2026-07-30 — Security hardening marathon: live exploit closed, corrupted commit caught, all 8 Edge Functions off the legacy key

Full detail lives in `CHANGELOG.md` `[Unreleased]` and
`rewrites/NEXT_SESSION_HANDOVER_2026-07-30.md`. Summary:

- **Closed a live token-economy exploit.** `complete_module()` trusted a
  client-computed quiz score and awarded full XP/BROski$ for any module_id
  regardless of score — a signed-in user could script-loop every module and
  mint unlimited rewards. Rebuilt to grade answers server-side against the
  real answer key (new `get_quiz_for_module()` RPC strips `answer_index`
  before it reaches the browser) and gate reward on ≥70%, matching the UI's
  own "Passing score: 70%" label that was never actually enforced. Verified
  live: a real failing attempt (0%) wrote nothing and granted nothing; a
  real passing attempt (100%) granted the exact XP/coin amounts.
- **`mc_missions` RLS** — any authenticated student had full read/write/
  delete on the admin-only ops table; now gated by `is_admin()`.
- **`get_or_create_referral_code()` / `hv_quizzes`** — closed a leftover
  `anon` execute grant and an anon-readable quiz-answers policy.
- **Found and fixed a `shop-purchase` CORS bug** (unrelated to the above):
  `Access-Control-Allow-Headers` was missing `apikey`/`x-client-info`, which
  every `supabase.functions.invoke()` call sends automatically — preflight
  always succeeded, but the browser silently refused to send the real
  request, so purchases were failing with zero server-side trace. Fixed,
  verified live with a real purchase.
- **Caught and fixed a corrupted commit on `main`** (`84ddd2b`, a stray
  GitHub web-editor paste that wiped `discord-link/index.ts` to one line)
  — restored to match the already-live deploy, then **added branch
  protection** (`enforce_admins: true`, PR required for everyone including
  the owner) so a repeat can't land on `main` unreviewed again. See
  `CLAUDE.md` §4 for the new required push flow.
- **Migrated all 8 Edge Functions off `SUPABASE_SERVICE_ROLE_KEY`** onto
  scoped named secret keys via the shared resolver
  (`supabase/functions/_shared/supabaseAdminKey.mjs`): `stripe-webhook`,
  `shop-purchase`, `discord-link`, `generate-v2-config`, `mint-pet-auth`,
  `mint-pet-confirm`, `course-profile`, `sync-tokens-to-v24`. Every one
  deployed and verified against production, not just theorized. Two of
  them had real access-control bugs fixed alongside the key swap:
  - `course-profile` had zero caller-identity check — any signed-in
    student could query any other student's `discord_id` and get back
    their BROski$ balance/tier/XP/email. Switched to a service-to-service
    shared-secret model (it was never meant to be end-user-facing —
    confirmed via `RISK_FLAGS.md` that the intended caller is V2.4's own
    backend, which currently doesn't even exist as a live integration).
  - `sync-tokens-to-v24` accepted any POST claiming to be a Supabase DB
    webhook with no verification — forgeable token-award requests. Added
    a `WEBHOOK_SECRET`/`X-Webhook-Secret` check. (Confirmed via
    `information_schema.triggers` that the DB Webhook trigger doesn't
    exist yet either — zero live traffic, safe to harden outright.)
- **Investigated the remaining legacy consumers** (`discord-bot/`,
  `agents/course-content-agent/`, `scripts/Test-ShopPurchase.ps1`) — all
  three are dormant/local-only, not deployed anywhere. Left as-is; migrate
  whenever they actually go live. Separately (different repo, not touched
  here): found `HyperCode-V2.4`'s `broski-bot` container has been running
  for a while pointed at the Supabase project that was deleted 2026-07-18
  (`yhtmuibgdnxhbgboajhc`) — explains its ongoing health-check failures.
  Flagged for a future `HyperCode-V2.4` session.

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
