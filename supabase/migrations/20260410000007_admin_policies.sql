-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Admin SELECT policies for cockpit dashboard
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Grants users with role='admin' read access to:
--   public.users           (full user list)
--   public.enrollments     (all enrollments, not just own)
--   public.payments        (revenue data)
--   public.waitlist        (sign-up emails)
--   public.playtest_responses (tester feedback)
--
-- Pattern: EXISTS subquery checks role in public.users so we never trust
-- a JWT claim that could be forged. The subquery is fast via idx_users_email.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: reusable inline function (SQL macro — not a real function, just clarity)
-- "is the current JWT user an admin?"
-- EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')

-- ── public.users: admins can read all user rows ──────────────────────────────
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ── public.enrollments: admins can read all enrollments ─────────────────────
DROP POLICY IF EXISTS "Admins can read all enrollments" ON public.enrollments;
CREATE POLICY "Admins can read all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── public.payments: admins can read all payments ────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
CREATE POLICY "Users can read their own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all payments" ON public.payments;
CREATE POLICY "Admins can read all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── public.waitlist: admins can read all rows ────────────────────────────────
DROP POLICY IF EXISTS "Admins can read waitlist" ON public.waitlist;
CREATE POLICY "Admins can read waitlist"
  ON public.waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── public.playtest_responses: admins can read all rows ─────────────────────
DROP POLICY IF EXISTS "Admins can read playtest responses" ON public.playtest_responses;
CREATE POLICY "Admins can read playtest responses"
  ON public.playtest_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
