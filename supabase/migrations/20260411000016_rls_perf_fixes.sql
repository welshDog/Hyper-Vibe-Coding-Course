-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000016: RLS performance fixes
--   FIX 1 — public.lessons: consolidate 3 permissive SELECT policies → 2
--   FIX 2 — public.playtest_responses: auth.uid() → (select auth.uid())
--   BONUS  — add missing FK index on enrollments.course_id
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- FIX 1: public.lessons — consolidate permissive SELECT policies
-- ══════════════════════════════════════════════════════════════════════════
-- Drop all three existing SELECT policies (names exactly as created in 000013)

DROP POLICY IF EXISTS "Admins can manage lessons"         ON public.lessons;
DROP POLICY IF EXISTS "Enrolled students can read all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Free lessons are publicly readable" ON public.lessons;

-- a) anon / unauthenticated: free lessons only
CREATE POLICY lessons_public_read ON public.lessons
  FOR SELECT
  TO anon
  USING (is_free = true);

-- b) authenticated: free lessons OR enrolled in this course
--    (select auth.uid()) evaluated once per statement, not per row
CREATE POLICY lessons_authenticated_read ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    is_free = true
    OR EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.user_id    = (SELECT auth.uid())
        AND e.course_id  = lessons.course_id
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- FIX 2: public.playtest_responses — initplan fix on auth.uid()
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can submit playtest response"
  ON public.playtest_responses;

CREATE POLICY "Authenticated users can submit playtest response"
  ON public.playtest_responses
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ══════════════════════════════════════════════════════════════════════════
-- BONUS: missing FK index on enrollments.course_id
-- ══════════════════════════════════════════════════════════════════════════
-- The EXISTS subquery in lessons_authenticated_read joins on course_id;
-- this index makes it a fast index scan instead of a seq scan.

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
  ON public.enrollments (course_id);

-- ── Verify (uncomment to test manually) ──────────────────────────────────
-- SELECT policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'lessons'
-- ORDER BY policyname;
--
-- SELECT policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'playtest_responses';
--
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'enrollments';

COMMIT;
