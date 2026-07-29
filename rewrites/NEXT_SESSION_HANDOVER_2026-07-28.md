# Next Session Handover — 2026-07-28
> Last updated: Claude (Cowork) ⚡

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project confirmed during this session:
  `tlavrxiaegbtyfmjfdcz`
- Latest deployed frontend hardening commit:
  `dba8ccf` (`fix(frontend): migrate browser Supabase client to publishable key`)

## Shipped this session

- `/profile` now shows honest hv_modules progress instead of misleading users
  with `0 Courses` when legacy enrollments are empty.
- Referral RPC hardened end to end:
  - old `public.get_or_create_referral_code(uuid)` dropped
  - new `public.get_or_create_referral_code()` uses `auth.uid()` only
  - unauthenticated call now fails clearly
  - execute removed from `PUBLIC`, granted only to `authenticated`
  - frontend callers updated in `Welcome.tsx`, `Dashboard.tsx`, `TokensPage.tsx`
- Referral frontend duplication removed without changing copy/design:
  - shared hook: `frontend/src/hooks/useReferralLink.ts`
  - shared helper: `frontend/src/lib/referralLink.ts`
  - all three referral surfaces now use the same load/copy/origin logic
- Referral-card audit complete: retain page-local cards; shared behaviour lives
  in `useReferralLink`, and full-card extraction fails the `<=5 props / >=60%
  duplication` threshold.
- `CourseModule` no longer flashes a false `Quiz coming soon.` state while the
  real `hv_quizzes` payload is still loading.
- `/dashboard` now bridges hv module progress on the read side when legacy
  `enrollments` are empty:
  - keeps legacy enrollment cards unchanged
  - reuses `buildModuleProgressSummary` from `profileProgress.ts`
  - shows one fallback card:
    `Vibe Code The Hyper Way` -> `1 of 12 modules complete` -> `Continue` ->
    `/courses`
  - only shows the old empty state when both legacy enrollments and hv module
    progress are absent
- Browser Supabase runtime migrated to the new public env contract:
  - browser client setup now reads `VITE_SUPABASE_PUBLISHABLE_KEY`
  - shared resolver lives in `frontend/src/lib/supabase/config.ts`
  - `frontend/src/lib/supabase.ts`, `frontend/src/lib/supabase/client.ts`,
    `frontend/src/lib/supabase/server.ts`, and `frontend/src/main.tsx` all use
    the same publishable-key path
  - stale `yhtmuibgdnxhbgboajhc` preconnect removed from `frontend/index.html`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` added in Vercel Production, Preview, and
    Development

## Exact migration applied

- `20260728215609_harden_referral_code_rpc.sql`

## Proof from this session

- Focused frontend regression passed:
  `frontend/tests/referral-rpc.spec.ts`
- Focused unit test passed:
  `frontend/unit-tests/referralLink.test.ts`
- Focused quiz-loading regression passed:
  `frontend/tests/course-module.spec.ts`
- Focused dashboard progress regression passed:
  `frontend/tests/dashboard-progress.spec.ts`
- Focused browser config regression passed:
  `frontend/tests/supabase-browser-config.spec.ts`
- Frontend build passed:
  `npm --prefix frontend run build`
- Live RPC probe passed:
  - authenticated call #1 → `200`
  - authenticated call #2 → same referral code
  - anonymous call → `400` with auth-required message
  - old `p_user_id` call → `404` / function signature gone
- Vercel production deploy passed for commit `42a1552`
- Live learner proof passed on production with throwaway learner:
  - M1 hard refreshes resolve to real quiz, not the false empty state
  - M1 completion lands `+10 BROski$`
  - `/profile` shows `1 of 12 modules complete`
  - `/dashboard` hard-refreshed 4 times in a fresh browser context:
    - `Vibe Code The Hyper Way` visible every pass
    - `1 of 12 modules complete` visible every pass
    - old empty-state message absent every pass
    - `Continue` href = `/courses`
    - click-through lands on `https://hypervibe.online/courses`
- Vercel production deploy passed for commit `dba8ccf`
- Browser-key production proof passed in a fresh signed-in browser context:
  - fresh sign-in succeeded with throwaway learner on `https://hypervibe.online/login`
  - M1 (`/courses/designing-your-focus-zone`) loaded the real quiz payload from
    `hv_quizzes` in `tlavrxiaegbtyfmjfdcz`
  - already-completed learner path remained valid for the smoke matrix
  - `/dashboard` showed `Vibe Code The Hyper Way` and `1 of 12 modules complete`
  - Dashboard `Continue` link resolved to `/courses`
  - `/profile` still showed `1 of 12 modules complete`
  - captured browser network log contained no requests to
    `yhtmuibgdnxhbgboajhc`
  - local built frontend output contained no legacy JWT-style anon marker and
    no `yhtmuibgdnxhbgboajhc` host references

## Known non-blockers

- Repo-wide frontend typecheck is still red in unrelated pre-existing files:
  - `src/hooks/useOwnedCosmetics.ts`
  - `src/pages/LessonPlayer.tsx`
- Immediate containment is done for server-side secrets:
  local/Vercel `SUPABASE_SERVICE_ROLE_KEY` now points to an `sb_secret_*`
  value.
- Full revocation is still outstanding:
  legacy JWT-style `anon` / `service_role` keys remain valid until explicitly
  deactivated in Supabase after a complete usage inventory and migration.

## First task next session

Continue the staged key migration server-side:
- migrate the Stripe webhook first and alone to a scoped `sb_secret_*` key
- smoke-test a known Stripe test-mode event before touching shop purchase,
  Discord, pets, tooling, or local scripts
