# Course API Cleanup + Auth Bugs (P0) — Design

## Goal

1. Remove “split-brain” confusion in `apps/api` by making the runnable server the single source of truth.
2. Close two tracked frontend bugs:
   - BUG-013 (password strength validation)
   - BUG-014 (silent post-signup UX)

## Non-Goals

1. Do not promote the TS/Prisma API scaffold to production.
2. Do not introduce new infra (Prisma migrations, DB packages, new hosting) in this pass.

## Current State (Observed)

- `apps/api/package.json` runs `src/index.js` as the entrypoint.
- A separate TS entrypoint exists (`src/index.ts`) which is not wired into runtime and references dependencies not declared for the runtime path.
- BUG-013 and BUG-014 are listed as open in `docs/BUG_TRACKER.md` and point to `frontend/src/pages/Auth.tsx`.

## Proposed Approach (Approved)

### 1) `apps/api` single-truth cleanup (Archive, not delete)

- Keep the runtime entrypoint:
  - `apps/api/src/index.js` remains the only started server.
- Archive unused TS/Prisma scaffold so it cannot be mistaken for the real server:
  - Move:
    - `apps/api/src/index.ts`
    - `apps/api/src/routes/*`
    - `apps/api/src/middleware/*`
    - `apps/api/src/seed.ts`
  - Into:
    - `apps/api/src/_archive_ts_prisma_api/…`
- Optional (same pass, low risk): add a short README note in `apps/api/` clarifying the runtime entrypoint and that `_archive_ts_prisma_api` is historical.

### 2) Fix BUG-013 (password strength validation)

- Update register form validation in `frontend/src/pages/Auth.tsx`:
  - Enforce:
    - min length 8
    - 1 uppercase
    - 1 number
- UX: show clear inline validation messages (no Supabase-error-first confusion).

### 3) Fix BUG-014 (post-signup success UX)

- Update register submit flow in `frontend/src/pages/Auth.tsx`:
  - After successful signup, show an explicit success message that mentions email confirmation.
  - Do not instantly redirect; keep the user on-screen long enough to read the message (or require a click to proceed to login).

## Acceptance Criteria

- `apps/api` contains exactly one “live” server entrypoint: `src/index.js`.
- Frontend register form blocks weak passwords client-side (BUG-013 closed).
- After signup, the user sees a success message before any navigation (BUG-014 closed).
- Lint + build succeed for `frontend/`.

## Safety / Risk Notes

- Archiving keeps the historical TS scaffold without accidentally shipping it.
- No secrets are added or moved; `.env*` stays uncommitted.

## Test Plan

- Frontend:
  - Run lint + build.
  - Manual: try registering with:
    - short password (should block)
    - no uppercase (should block)
    - no number (should block)
    - valid password (should succeed and show success message)
- API:
  - Start `apps/api` and confirm `/health` responds.

## Rollback Plan

- Revert the commit(s) that archive the TS scaffold and change Auth UX; no data migrations involved.

