-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: pending_enrollments — pay-before-register flow
-- Date: 2026-04-15
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Problem: a buyer pays via Stripe before creating a Supabase account.
-- The stripe-webhook can't find their user_id by email, so enrollment drops.
--
-- Solution:
--   A. pending_enrollments table — stores (email, course_id) from webhook
--   B. apply_pending_enrollments(email, user_id) — applies saved rows as
--      real enrollments; idempotent via ON CONFLICT DO NOTHING
--   C. handle_new_user trigger — calls apply_pending_enrollments when a
--      new auth.users row is created, so the course unlocks on first login
--
-- Idempotent throughout. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── A. pending_enrollments ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pending_enrollments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT        NOT NULL,
  course_id           UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stripe_session_id   TEXT        UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, course_id)
);

CREATE INDEX IF NOT EXISTS idx_pending_enrollments_email
  ON public.pending_enrollments(email);

-- No RLS needed — only written by service_role (stripe-webhook) and
-- read/deleted by apply_pending_enrollments (SECURITY DEFINER).
ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;


-- ── B. apply_pending_enrollments() ───────────────────────────────────────────
-- Converts any pending_enrollment rows for this email into real enrollments,
-- then deletes the pending rows. Safe to call multiple times.

CREATE OR REPLACE FUNCTION public.apply_pending_enrollments(
  p_email   TEXT,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row   RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_row IN
    SELECT course_id FROM public.pending_enrollments WHERE email = p_email
  LOOP
    INSERT INTO public.enrollments (user_id, course_id, progress_percentage, enrolled_at)
    VALUES (p_user_id, v_row.course_id, 0, NOW())
    ON CONFLICT (user_id, course_id) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;

    DELETE FROM public.pending_enrollments
    WHERE email = p_email AND course_id = v_row.course_id;
  END LOOP;

  RETURN v_count;
END;
$$;


-- ── C. Update handle_new_user to apply pending enrollments on signup ──────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Apply any courses paid for before the account was created
  PERFORM public.apply_pending_enrollments(NEW.email, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
