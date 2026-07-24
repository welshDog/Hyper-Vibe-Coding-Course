# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-07-24 by Claude (Cowork) ⚡

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
