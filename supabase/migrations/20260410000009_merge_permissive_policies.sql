-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Merge dual SELECT policies into single combined policies
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Postgres evaluates ALL permissive policies and OR-combines the results.
-- Having two SELECT policies (user-own + admin-all) on the same table means
-- every query hits two policy checks. Merging into one eliminates the
-- duplicate evaluation.
--
-- Tables fixed:
--   public.enrollments  — "user own" + "admin all" → one combined policy
--   public.payments     — "user own" + "admin all" → one combined policy
--
-- public.playtest_responses and public.users already have single policies.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── enrollments ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read their own enrollments"  ON public.enrollments;
DROP POLICY IF EXISTS "Users can read own enrollments"        ON public.enrollments;
DROP POLICY IF EXISTS "Admins can read all enrollments"       ON public.enrollments;

CREATE POLICY "Read enrollments"
  ON public.enrollments FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ── payments ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can read all payments"      ON public.payments;

CREATE POLICY "Read payments"
  ON public.payments FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
