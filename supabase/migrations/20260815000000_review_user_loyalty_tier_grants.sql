-- Wave 1 P2 review: user_loyalty_tier grants were never reviewed after the
-- view was created, so it still carried Postgres/Supabase's default
-- "grant everything on new relations" privileges to both anon and
-- authenticated: SELECT, INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER,
-- REFERENCES.
--
-- Findings from this review, verified live on tlavrxiaegbtyfmjfdcz:
-- - The view was already hardened against the real risk in
--   20260411000020_view_security_invoker.sql: WITH (security_invoker = true)
--   means every query runs with the CALLING user's own RLS, not the view
--   owner's. RLS on users ("own profile only", or all rows for admins)
--   and token_transactions ("own rows only") means an authenticated caller
--   can only ever see their own aggregated tier -- SELECT for
--   `authenticated` is correct and is the only grant this view actually
--   needs; it stays.
-- - `anon` has zero legitimate use: Navbar.tsx, Profile.tsx, and
--   ShopPage.tsx all gate this query behind a signed-in user check, and
--   an anon caller's query would return zero rows anyway (auth.uid() IS
--   NULL matches no row under the users RLS policies). Revoked.
-- - INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES on both roles are
--   inert: this view is not auto-updatable (it has a JOIN, GROUP BY, and
--   aggregates -- disqualifying under Postgres's updatable-view rules)
--   and carries no INSTEAD OF trigger (confirmed: zero triggers on
--   pg_trigger for this relation), so none of those grants could ever do
--   anything. Revoked as noise, not as a live risk.
--
-- Net effect: authenticated keeps exactly SELECT; anon loses everything.
revoke all on public.user_loyalty_tier from anon;
revoke all on public.user_loyalty_tier from authenticated;
grant select on public.user_loyalty_tier to authenticated;

comment on view public.user_loyalty_tier is
  'Per-user BROski$ loyalty tier, computed from lifetime positive token_transactions. WITH (security_invoker = true) -- see 20260411000020_view_security_invoker.sql for why that matters: RLS on users/token_transactions scopes every query to the caller''s own data (admins see all users via the existing users RLS admin policy). Grants: SELECT to authenticated only -- anon has no signed-out caller and would see nothing anyway; write-family grants were reviewed and removed 2026-08-15 as inert (non-updatable view, no INSTEAD OF trigger).';
