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

**First task:** decide whether to add a tiny shared referral hook/helper so the
same referral-link loading/copy logic stops living in three separate pages.

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
