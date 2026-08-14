-- Fix: the landing-page waitlist form (LandingPage.tsx, live at
-- https://hypervibe.online/) has been silently broken for every visitor.
--
-- Live on tlavrxiaegbtyfmjfdcz, the only INSERT policy on public.waitlist
-- was `deny_all_waitlist_public_insert` (with_check = false) -- present
-- live but never captured in any checked-in migration, so it was applied
-- by hand at some point after 20260410000005_waitlist.sql (which DID ship
-- a real "anyone can insert" policy and IS in the applied migration
-- history) intentionally locked it back down. Investigated before fixing:
-- `waitlist` has zero rows ever (nobody has hit the broken form, or if
-- they did the insert silently failed), and the exact same deny-all
-- pattern also exists on `playtest_responses` -- a deliberate two-table
-- lockdown pass, not accidental drift on one table.
--
-- Rather than restoring the original blanket `WITH CHECK (true)`, this
-- follows the validated-anonymous-insert pattern this project already
-- uses correctly for the sibling public signup table
-- (`early_access_signups`: explicit anon+authenticated roles, real field
-- validation) instead of an unbounded public write.
--
-- source is constrained to the three values documented on the column
-- itself (20260410000005_waitlist.sql: 'hero' | 'footer' | 'pricing');
-- only 'hero' and 'footer' are wired in the live frontend today, but
-- 'pricing' is kept since it's already part of the documented contract.
drop policy if exists "deny_all_waitlist_public_insert" on public.waitlist;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (
    email is not null
    and char_length(email) >= 6
    and char_length(email) <= 320
    and email like '%@%'
    and source in ('hero', 'footer', 'pricing')
    and country ~ '^[A-Z]{2}$'
  );
