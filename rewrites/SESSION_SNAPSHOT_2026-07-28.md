# Session Snapshot — 2026-07-28
> Last updated: Claude (Cowork) ⚡

---

## ✅ DONE THIS SESSION

- Fixed the `/profile` truth gap for hv_modules learners without touching the
  write path or bridging old/new data models.
- Kept the agreed architecture intact:
  - `module_completions` = source of truth for hv_modules progress
  - `enrollments` = legacy enrollment/access only
  - `achievements` = real awards only
- Added a tiny read-side adapter at
  `frontend/src/lib/profileProgress.ts` to derive:
  - completed module count
  - total module count
  - completion percent
  - human-friendly summary copy
- Wired `frontend/src/pages/Profile.tsx` to read `hv_modules` +
  `module_completions` directly, matching the existing repo pattern already used
  in `/courses` and `useModuleCompletion`.
- Updated the Profile stat strip so users now see `Progress` (`3/12`, etc.)
  instead of a misleading `0 Courses` when legacy enrollments are empty.
- Kept the legacy `My courses` and `Badges` surfaces honest:
  - legacy enrollments still render from `public.enrollments`
  - badges still render from `public.achievements`
  - empty legacy-course state now explains itself and shows real module progress
- Added verification:
  - unit test: `frontend/unit-tests/profileProgress.test.ts`
  - Playwright regression: `frontend/tests/profile-progress.spec.ts`
  - production build: green
- Updated `WHATS_DONE.md` with the fix and verification notes.

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

**First task:** fix `get_or_create_referral_code(p_user_id uuid)` properly.
Do the real code fix (`auth.uid()` validation or drop the parameter) instead of
papering over it with a permission grant.

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
