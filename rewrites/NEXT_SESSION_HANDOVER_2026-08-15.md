# Next Session Handover — 2026-08-15

# Session 10 — Wave 1 P1/P2 cleanup: RPC grant drift, discord-link hardening, waitlist RLS, user_loyalty_tier grants

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project: `tlavrxiaegbtyfmjfdcz`
- `main` is at commit `2771ea8` (PR #71 merge). Nothing local/uncommitted —
  everything below is committed, pushed, merged, and live-verified.
- `main` is a **protected branch** — every change this session went
  branch → PR → CI checks → merge → delete branch, same as always.

## What shipped this session

**1. PR #68 — RPC grant drift fixed: `claim_level_reward` / `complete_quest`**
Both were called live by the frontend but neither `authenticated` nor
`anon` could execute them (confirmed via `has_function_privilege`) — every
level-reward claim and quest completion was silently `42501`-ing. Same
root-cause class as the `is_admin()` incident (07-24): a grant defined in
a migration never took effect on the live `tlav` project. Migration
`20260814210000_grant_claim_level_reward_complete_quest_execute.sql`
grants `EXECUTE` to `authenticated` on both — applied live and re-verified.

**2. PR #69 — `discord-link` OAuth callback hardening**
Two independent gaps closed:
- The origin allowlist was stale — missing `https://hypervibe.online`, the
  real production domain. **Discord linking was actually broken in prod**,
  not just under-hardened.
- `state` was only ever checked client-side (sessionStorage); the edge
  function itself never saw it. New `discord_oauth_states` table backs a
  real mint-then-consume check: `GET /discord-link` mints a single-use
  state bound to the authenticated caller, `POST /discord-link` requires
  that exact state and consumes it atomically. Forged/replayed/cross-user
  states are now rejected server-side. Split into `handler.ts` (DI,
  14 new `deno test` cases) + `index.ts`, matching the `generate-v2-config`
  pattern. Deployed live (v19), smoke-tested (OPTIONS 200, unauthenticated
  GET/POST 401, DELETE 405).

**3. PR #70 — `waitlist` RLS mismatch fixed**
The landing-page waitlist form (`LandingPage.tsx`, root route) was
silently broken — the only live INSERT policy was
`deny_all_waitlist_public_insert` (`with_check = false`), present live but
never in any migration. **Investigated before fixing** (advisor-reviewed):
the original "anyone can insert" policy *was* applied historically per
`supabase_migrations.schema_migrations`, so this was a deliberate later
lockdown by hand, not accidental drift — the same deny-all pattern also
exists on `playtest_responses` (a two-table program). Zero rows ever
inserted, so not an active incident. Put the direction to Lyndz via
AskUserQuestion (reopen with validation / retire the CTA / merge into
`early_access_signups` / leave it) — chose **reopen with validation**,
following the pattern this project already uses correctly on the sibling
public-signup table `early_access_signups` (restricted to
`anon,authenticated`, real field checks) instead of a blanket
`WITH CHECK (true)`. Smoke-tested live via the public anon key, matching
the frontend's exact request shape: valid insert → 201, duplicate email →
409/23505 (already mapped to a friendly UI state), invalid source/email →
RLS-rejected.

**4. PR #71 — `user_loyalty_tier` grants reviewed and trimmed**
Live grants were far broader than the audit's "broadly selectable" implied
— full `SELECT/INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES` to both
`anon` and `authenticated`, Postgres/Supabase's default "grant everything"
behavior, never reviewed. The real risk was already fixed 04-11
(`security_invoker = true` — every query runs under the caller's own RLS,
so `authenticated` SELECT is safe and correct). Checked every non-frontend
caller (`discord-bot/db.py`, `course-profile`, `shop-purchase`) before
touching anything — all three use the service-role admin key, unaffected.
Trimmed to: `authenticated` keeps exactly `SELECT`; `anon` loses
everything (zero legitimate use — Navbar/Profile/ShopPage all gate this
behind a signed-in check). Verified with `has_table_privilege`, not just
the grants table.

**5. `playtest_responses` — reviewed, no action needed.** Same
`deny_all_*_public_insert` family as `waitlist`, but the audit's own
verdict on this one was already correct: admins read, authenticated users
insert, public insert is correctly blocked. Confirmed via the family-check
during the waitlist investigation; not touched, doesn't need to be.

## Discovered but NOT fixed this session

1. **Any anon `SELECT` on `waitlist` (and likely `user_loyalty_tier`, now
   that anon's grant is gone there too) throws a raw `42501`** instead of
   a clean empty result, because `anon` has no `SELECT` grant on
   `public.users`, which the existing "Admins can read waitlist" policy's
   subquery needs to evaluate just to determine the caller isn't an admin.
   Fails closed (no data exposure), doesn't affect any live path today
   (nothing anon actually selects from either table), but it's ugly and
   would surface loudly if any future code ever chains `.select()` onto an
   insert, or queries either table as a signed-out user. Worth a real fix
   (either grant `anon` narrow `SELECT` on the specific `users` columns
   the admin check needs, or restructure the admin check to avoid touching
   `users` for non-admins) in a future pass — not urgent, not started.

## Still open

1. **P0 — unchanged, still blocked.** `generate-v2-config` needs a
   confirmed V2.4 base URL. Confirmed again this session: `V24_API_URL` is
   still absent from live secrets, and Railway still returns "not the
   required role" on project `3d66bd92-cac3-4fde-ae9a-07f269b58791`. Same
   owner action as before — see the 08-06 handover for the full sequence,
   nothing about it has changed.
2. `/shop` → `/pets` same-session freshness after a purchase — still an
   open bug-hunt candidate, untouched this session.
3. `course-profile` doesn't reject non-GET verbs (P2, cosmetic —
   shared-secret auth already closes the real exposure).
4. `get-pet-balance` has no current browser caller; method gating is more
   permissive than the documented contract if it's ever re-exposed.
5. Legacy `/learn/:courseId` quiz flow client-side leak; real Discord
   OAuth creds for `discord-link` still missing (the callback hardening
   this session doesn't need real creds to be correct, just to be
   exercised end-to-end); ESLint pre-existing debt in `tests/shop.spec.ts`
   (8 errors, test-file-only, cosmetic).

## First task next session

**All four Wave 1 P1/P2 findings that were actually fixable without
external access are now closed.** The only remaining Wave 1 item is the
P0, which is still blocked on Railway access — check that first, same as
last time. If it's still blocked, there's no queued frontend/DB work from
this audit; pick from "Still open" above or ask Lyndz what's next.
