-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: security policy fixes for migrations 000025–000027
-- Date: 2026-04-16
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Fix 1 — certificates INSERT policy was WITH CHECK (true):
--   Any authenticated user could forge their own certificate by inserting
--   directly into the table. The on_course_completed() trigger is
--   SECURITY DEFINER (runs as postgres, which has bypassrls) so it never
--   needed an RLS policy. Service role also bypasses RLS in Supabase.
--   → Drop the policy entirely.
--
-- Fix 2 — quiz_questions SELECT policy used bare auth.uid():
--   USING (auth.uid() IS NOT NULL) calls auth.uid() once per row.
--   Wrapping in (SELECT auth.uid()) hoists the call to a single evaluation
--   per query — required pattern for all RLS policies in this project.
--   → Recreate the policy with the wrapped form.
--
-- Idempotent throughout.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── Fix 1: Remove forged-certificate attack vector ───────────────────────────

DROP POLICY IF EXISTS "Service role can insert certificates" ON public.certificates;
-- The trigger (SECURITY DEFINER) and service_role both bypass RLS — no policy needed.


-- ── Fix 2: Wrap auth.uid() for per-query evaluation ─────────────────────────

DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON public.quiz_questions;
CREATE POLICY "Authenticated users can read quiz questions"
  ON public.quiz_questions FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);
