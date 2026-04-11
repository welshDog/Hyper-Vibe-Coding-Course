-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: lessons table
-- Date: 2026-04-11
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Creates public.lessons so the catalogue has structured lesson data.
-- course_id is TEXT to match public.courses.id (confirmed TEXT PK in prod).
-- Idempotent throughout.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lessons (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      TEXT        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  order_index    INTEGER     NOT NULL,
  video_url      TEXT,
  content        TEXT,
  duration_seconds INTEGER,
  is_free        BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id
  ON public.lessons(course_id);

CREATE INDEX IF NOT EXISTS idx_lessons_order
  ON public.lessons(course_id, order_index);

-- RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Free lessons are visible to everyone (preview / marketing)
DROP POLICY IF EXISTS "Free lessons are publicly readable" ON public.lessons;
CREATE POLICY "Free lessons are publicly readable"
  ON public.lessons FOR SELECT
  USING (is_free = true);

-- Enrolled students can read all lessons in their courses
DROP POLICY IF EXISTS "Enrolled students can read all lessons" ON public.lessons;
CREATE POLICY "Enrolled students can read all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE user_id = (SELECT auth.uid())
        AND course_id = lessons.course_id
    )
  );

-- Admins can manage all lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
