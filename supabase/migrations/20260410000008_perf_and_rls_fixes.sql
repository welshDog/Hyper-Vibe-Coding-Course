-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Performance & RLS fixes from 10 April health report
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Addresses all three remaining findings from the health report:
--
-- 1. [MEDIUM] auth_rls_initplan — public.users
--    auth.uid() was called inline in USING clauses, causing Postgres to
--    re-evaluate it for every row scanned. Wrapping in (SELECT auth.uid())
--    forces a single evaluation per query (initplan), not per row.
--
-- 2. [MEDIUM] unindexed_foreign_keys — public.payments(user_id)
--    Every "show my payment history" query was doing a full table scan.
--
-- 3. [LOW] unused_index — public.waitlist(waitlist_email_idx)
--    Redundant: the UNIQUE(email) constraint already creates an implicit
--    btree index. Two indexes on the same column waste write overhead.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. Fix RLS initplan on public.users ─────────────────────────────────────

-- User self-access policies (from 20260312000002)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admin read-all policy (from 20260410000007) — also fix initplan here
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  );


-- ── 2. Index: payments.user_id ───────────────────────────────────────────────
-- The enrollments index was added in 20260410000003. Payments was missed.
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);


-- ── 3. Drop redundant waitlist email index ───────────────────────────────────
-- The UNIQUE(email) constraint creates its own implicit btree index.
-- The explicit idx_waitlist_email (created in 20260410000005) is a duplicate.
DROP INDEX IF EXISTS public.idx_waitlist_email;
-- Note: if the index was named differently (waitlist_email_idx), drop that too:
DROP INDEX IF EXISTS public.waitlist_email_idx;
