# Session Snapshot — 2026-07-28
> Last updated: Claude (Cowork) ⚡

---

## ✅ DONE THIS SESSION

- Fixed the `/profile` truth gap for hv_modules learners without touching the
  write path or bridging old/new data models.
- Kept the agreed architecture intact for Profile:
  - `module_completions` = source of truth for hv_modules progress
  - `enrollments` = legacy enrollment/access only
  - `achievements` = real awards only
- Added `frontend/src/lib/profileProgress.ts` and wired
  `frontend/src/pages/Profile.tsx` to show honest hv_modules progress while
  preserving legacy enrollments and badges.
- Verification for that slice:
  - unit test: `frontend/unit-tests/profileProgress.test.ts`
  - Playwright regression: `frontend/tests/profile-progress.spec.ts`
  - frontend build: green

- Hardened the referral-link RPC against cross-user UUID targeting.
- Created and applied migration:
  - `supabase/migrations/20260728215609_harden_referral_code_rpc.sql`
- DB changes shipped:
  - dropped old `public.get_or_create_referral_code(uuid)`
  - created zero-argument `public.get_or_create_referral_code()`
  - bound the function to `auth.uid()`
  - added a clear unauthenticated guard
  - revoked `PUBLIC` execute and granted execute only to `authenticated`
- Frontend callers updated to zero-argument RPC only:
  - `frontend/src/pages/Welcome.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/TokensPage.tsx`
- Added focused frontend regression:
  - `frontend/tests/referral-rpc.spec.ts`
  - first failed correctly because the app still posted `p_user_id`
  - now passes and proves repeated signed-in reads use the same returned code
- Live production probe passed against `tlavrxiaegbtyfmjfdcz`:
  - authenticated call #1 → `200` with referral code
  - authenticated call #2 → same `200` code
  - anonymous call → `400` with clear auth-required message
  - attempted old `p_user_id` call → `404` because that signature is gone
  - temp probe user deleted after the check
- `WHATS_DONE.md` updated with the referral hardening details.

- Extracted the duplicated referral-link frontend logic into one tiny shared
  hook + helper pair:
  - `frontend/src/hooks/useReferralLink.ts`
  - `frontend/src/lib/referralLink.ts`
- The shared referral layer now owns:
  - zero-argument `get_or_create_referral_code` loading
  - loading and error state
  - referral URL construction from the current app origin
  - clipboard copy behavior plus short-lived copied state
- All three pages now consume the same behavior:
  - `frontend/src/pages/Welcome.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/TokensPage.tsx`
- Added focused unit coverage for the zero-argument RPC contract:
  - `frontend/unit-tests/referralLink.test.ts`
- Expanded the focused Playwright regression so it proves the same zero-arg
  referral behavior across Dashboard, Welcome, and Tokens:
  - `frontend/tests/referral-rpc.spec.ts`
- One friendly failure mode is now handled in the shared layer:
  - if `navigator.clipboard` fails, copy falls back to a hidden textarea copy
    path instead of silently giving up

- Migrated the browser Supabase runtime from the legacy Vite anon env to the
  publishable-key path.
- Added shared browser config resolver:
  - `frontend/src/lib/supabase/config.ts`
- Updated browser/runtime consumers to the new contract:
  - `frontend/src/lib/supabase.ts`
  - `frontend/src/lib/supabase/client.ts`
  - `frontend/src/lib/supabase/server.ts`
  - `frontend/src/main.tsx`
- Removed the stale deleted-project preconnect from:
  - `frontend/index.html`
- Added focused regression coverage for the new browser env contract:
  - `frontend/tests/supabase-browser-config.spec.ts`
- Browser migration verification passed:
  - frontend build: `npm --prefix frontend run build`
  - bundle scan: no legacy JWT anon marker in `frontend/dist`
  - bundle scan: no `yhtmuibgdnxhbgboajhc` host in `frontend/dist`
  - Vercel deploy: `dba8ccf` live in production
  - fresh signed-in learner smoke passed:
    - login succeeded
    - M1 quiz loaded from `tlavrxiaegbtyfmjfdcz`
    - Dashboard showed `Vibe Code The Hyper Way`
    - Dashboard showed `1 of 12 modules complete`
    - Dashboard `Continue` resolved to `/courses`
    - Profile showed `1 of 12 modules complete`
    - browser network capture showed no requests to the deleted `yhtmui` project

---

## 🔴 BLOCKED / NEEDS DECISION

- Nothing blocked for this scoped fix.

---

## 🟡 IN PROGRESS (not finished)

- Repo-wide frontend typecheck is still red in unrelated pre-existing files:
  - `src/hooks/useOwnedCosmetics.ts`
  - `src/pages/LessonPlayer.tsx`
- This session did **not** touch those files.

---

## 🎯 NEXT SESSION — START HERE

**First task:** continue the staged server-side key migration with the Stripe
webhook first and alone, then smoke-test a known Stripe test-mode event before
moving to shop purchase, Discord, pets, tooling, and local scripts.

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
