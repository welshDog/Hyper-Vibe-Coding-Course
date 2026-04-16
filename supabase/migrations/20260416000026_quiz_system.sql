-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: quiz system — quiz_questions + quiz_attempts
-- Date: 2026-04-16
-- ═══════════════════════════════════════════════════════════════════════════
--
-- quiz_questions: authored per-lesson multiple-choice questions
-- quiz_attempts: one row per (user, question) — upserted on re-attempt
-- Idempotent throughout.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── A. quiz_questions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question       TEXT        NOT NULL,
  options        JSONB       NOT NULL,   -- array of strings, e.g. ["A","B","C","D"]
  correct_answer INTEGER     NOT NULL,   -- 0-based index into options
  explanation    TEXT,
  order_index    INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id
  ON public.quiz_questions(lesson_id);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read questions (lesson content)
DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON public.quiz_questions;
CREATE POLICY "Authenticated users can read quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage questions
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );


-- ── B. quiz_attempts ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id)          ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer INTEGER     NOT NULL,
  is_correct      BOOLEAN     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id
  ON public.quiz_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question_id
  ON public.quiz_attempts(question_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can read their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Allow upsert (re-attempt)
DROP POLICY IF EXISTS "Users can update their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update their own quiz attempts"
  ON public.quiz_attempts FOR UPDATE
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
