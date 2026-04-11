-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000017: Replace single-column course_id index with composite
--                   (user_id, course_id) for the RLS EXISTS check:
--                   EXISTS (SELECT 1 FROM enrollments e
--                     WHERE e.user_id = auth.uid()
--                     AND e.course_id = lessons.course_id)
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DROP INDEX IF EXISTS public.idx_enrollments_course_id;

CREATE INDEX IF NOT EXISTS idx_enrollments_user_course
  ON public.enrollments (user_id, course_id);

COMMIT;
