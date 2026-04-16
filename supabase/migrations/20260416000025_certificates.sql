-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: certificates table
-- Date: 2026-04-16
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Stores a certificate record for each user who completes a course (100%).
-- Issued automatically via the on_course_completed() trigger on enrollments.
-- Idempotent throughout.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── A. certificates table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.certificates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  course_id   TEXT        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id
  ON public.certificates(user_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own certificates" ON public.certificates;
CREATE POLICY "Users can read their own certificates"
  ON public.certificates FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Service role (triggers, edge functions) can insert
DROP POLICY IF EXISTS "Service role can insert certificates" ON public.certificates;
CREATE POLICY "Service role can insert certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (true);


-- ── B. Trigger: issue certificate on course completion ────────────────────────
-- Fires when enrollments.progress_percentage is updated to 100.

CREATE OR REPLACE FUNCTION public.on_course_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.progress_percentage = 100 AND
     (OLD IS NULL OR OLD.progress_percentage < 100) THEN

    INSERT INTO public.certificates (user_id, course_id)
    VALUES (NEW.user_id, NEW.course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;

    -- Award 500 BROski$ bonus for completing a course
    PERFORM public.award_tokens(
      p_user_id   := NEW.user_id,
      p_amount    := 500,
      p_reason    := 'course_complete',
      p_source_id := NEW.course_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'enrollments'
  ) THEN
    DROP TRIGGER IF EXISTS trg_course_completed ON public.enrollments;

    CREATE TRIGGER trg_course_completed
      AFTER INSERT OR UPDATE OF progress_percentage
      ON public.enrollments
      FOR EACH ROW
      EXECUTE FUNCTION public.on_course_completed();
  END IF;
END;
$$;
