-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: RLS policies for all tables + achievements table
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Row Level Security on remaining tables ──────────────────────────────────
-- public.users RLS is already handled in 20260312000002

ALTER TABLE public.courses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress   ENABLE ROW LEVEL SECURITY;

-- ── courses: readable by anyone, writable only by instructors/admins ─────────
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;
CREATE POLICY "Courses are publicly readable"
  ON public.courses FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Instructors can manage their own courses" ON public.courses;
CREATE POLICY "Instructors can manage their own courses"
  ON public.courses FOR ALL
  USING (
    auth.uid() = instructor_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── lessons: readable by enrolled students + free previews ──────────────────
DROP POLICY IF EXISTS "Free lessons are publicly readable" ON public.lessons;
CREATE POLICY "Free lessons are publicly readable"
  ON public.lessons FOR SELECT
  USING (is_free = true);

DROP POLICY IF EXISTS "Enrolled students can read all lessons" ON public.lessons;
CREATE POLICY "Enrolled students can read all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE user_id = auth.uid()
        AND course_id = lessons.course_id
    )
  );

DROP POLICY IF EXISTS "Instructors can manage their course lessons" ON public.lessons;
CREATE POLICY "Instructors can manage their course lessons"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id
        AND (
          instructor_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

-- ── enrollments: users see only their own rows ───────────────────────────────
DROP POLICY IF EXISTS "Users can read their own enrollments" ON public.enrollments;
CREATE POLICY "Users can read their own enrollments"
  ON public.enrollments FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
CREATE POLICY "Users can create their own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
CREATE POLICY "Users can update their own enrollments"
  ON public.enrollments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role (webhook) bypasses RLS — no policy needed for it

-- ── progress: users see and write only their own rows ───────────────────────
DROP POLICY IF EXISTS "Users can read their own progress" ON public.progress;
CREATE POLICY "Users can read their own progress"
  ON public.progress FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can upsert their own progress" ON public.progress;
CREATE POLICY "Users can upsert their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own progress" ON public.progress;
CREATE POLICY "Users can update their own progress"
  ON public.progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── achievements table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    VARCHAR(50) NOT NULL,
  xp_awarded  INTEGER NOT NULL DEFAULT 0,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own achievements" ON public.achievements;
CREATE POLICY "Users can read their own achievements"
  ON public.achievements FOR SELECT
  USING (user_id = auth.uid());

-- Achievements are INSERT-only by the server (Edge Functions / service role)
-- Users cannot award themselves badges directly
DROP POLICY IF EXISTS "Service role inserts achievements" ON public.achievements;
-- (service role bypasses RLS — no explicit policy needed)

-- ── Indexes for query performance ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id   ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id      ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id    ON public.progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id  ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id     ON public.lessons(course_id);
