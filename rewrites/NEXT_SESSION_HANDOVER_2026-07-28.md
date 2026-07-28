# Next Session Handover — 2026-07-28
> Last updated: Claude (Cowork) ⚡

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project confirmed during this session:
  `tlavrxiaegbtyfmjfdcz`

## Shipped this session

- `/profile` now shows honest hv_modules progress instead of misleading users
  with `0 Courses` when legacy enrollments are empty.
- Referral RPC hardened end to end:
  - old `public.get_or_create_referral_code(uuid)` dropped
  - new `public.get_or_create_referral_code()` uses `auth.uid()` only
  - unauthenticated call now fails clearly
  - execute removed from `PUBLIC`, granted only to `authenticated`
  - frontend callers updated in `Welcome.tsx`, `Dashboard.tsx`, `TokensPage.tsx`

## Exact migration applied

- `20260728215609_harden_referral_code_rpc.sql`

## Proof from this session

- Focused frontend regression passed:
  `frontend/tests/referral-rpc.spec.ts`
- Frontend build passed:
  `npm run build`
- Live RPC probe passed:
  - authenticated call #1 → `200`
  - authenticated call #2 → same referral code
  - anonymous call → `400` with auth-required message
  - old `p_user_id` call → `404` / function signature gone

## Known non-blockers

- Repo-wide frontend typecheck is still red in unrelated pre-existing files:
  - `src/hooks/useOwnedCosmetics.ts`
  - `src/pages/LessonPlayer.tsx`

## First task next session

Decide whether to extract the duplicated referral-link load/copy flow into a
small shared hook/helper used by Dashboard, Welcome, and TokensPage.
