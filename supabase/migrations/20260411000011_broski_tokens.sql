-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: lesson_progress table + BROski$ token economy
-- Date: 2026-04-11
-- ═══════════════════════════════════════════════════════════════════════════
--
-- A. CREATE public.lesson_progress
-- B. ADD broski_tokens column to public.users
-- C. CREATE token_transactions table
-- D. CREATE award_tokens() and spend_tokens() SECURITY DEFINER functions
-- E. CREATE on_lesson_completed() trigger function
-- F. ATTACH trigger to public.lesson_progress (guarded DO $$ block)
--
-- Idempotent throughout. Safe to re-run.
-- Run BEFORE migration 000012 (security hardening).
-- ═══════════════════════════════════════════════════════════════════════════


-- ── A. public.lesson_progress ────────────────────────────────────────────────
--
-- course_id is UUID to match public.courses.id.
-- lesson_id is UUID to match public.lessons.id.
-- DROP + CREATE makes this fully idempotent (table confirmed empty).

DROP TABLE IF EXISTS public.lesson_progress;

CREATE TABLE public.lesson_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_lesson_progress_user_id
  ON public.lesson_progress(user_id);

CREATE INDEX idx_lesson_progress_course_id
  ON public.lesson_progress(course_id);

CREATE INDEX idx_lesson_progress_user_course
  ON public.lesson_progress(user_id, course_id);

-- RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own lesson progress"
  ON public.lesson_progress FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own lesson progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON public.lesson_progress FOR UPDATE
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- service_role bypasses RLS — no explicit policy needed for admin reads.


-- ── B. broski_tokens on public.users ─────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS broski_tokens INTEGER NOT NULL DEFAULT 0;

-- Idempotent CHECK constraint guard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'broski_tokens_non_negative'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT broski_tokens_non_negative CHECK (broski_tokens >= 0);
  END IF;
END;
$$;


-- ── C. token_transactions ────────────────────────────────────────────────────
-- Every earn (+) and spend (-) row lives here. Source of truth.
-- broski_tokens on users is a derived cache — always updated together.

CREATE TABLE IF NOT EXISTS public.token_transactions (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount                    INTEGER     NOT NULL,
  reason                    TEXT        NOT NULL,
  stripe_payment_intent_id  TEXT        UNIQUE,
  source_id                 TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reason values:
--   earn : 'lesson_complete' | 'module_complete' | 'streak_7' |
--          'referral' | 'stripe_purchase' | 'capstone'
--   spend: 'spend_ai_prompt' | 'spend_bonus_module' | 'spend_early_access' |
--          'spend_review' | 'spend_avatar' | 'refund'

-- Dedup index — prevents double-awarding the same lesson/event
CREATE UNIQUE INDEX IF NOT EXISTS idx_token_transactions_dedup
  ON public.token_transactions(user_id, reason, source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id
  ON public.token_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_token_transactions_created
  ON public.token_transactions(created_at DESC);

-- RLS
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own token transactions"
  ON public.token_transactions;

CREATE POLICY "Users can read their own token transactions"
  ON public.token_transactions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- No INSERT / UPDATE / DELETE for users.
-- All writes go through award_tokens() / spend_tokens() (SECURITY DEFINER).


-- ── D. award_tokens() ────────────────────────────────────────────────────────
-- Atomic: inserts ledger row AND updates broski_tokens in one call.
-- Idempotent: ON CONFLICT DO NOTHING — duplicate calls are silent no-ops.
-- Returns: { awarded: bool, new_balance: int }

CREATE OR REPLACE FUNCTION public.award_tokens(
  p_user_id                  UUID,
  p_amount                   INTEGER,
  p_reason                   TEXT,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_source_id                TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO public.token_transactions
    (user_id, amount, reason, stripe_payment_intent_id, source_id)
  VALUES
    (p_user_id, p_amount, p_reason, p_stripe_payment_intent_id, p_source_id)
  ON CONFLICT DO NOTHING;

  IF NOT FOUND THEN
    SELECT broski_tokens INTO v_new_balance
      FROM public.users WHERE id = p_user_id;
    RETURN jsonb_build_object('awarded', false, 'new_balance', v_new_balance);
  END IF;

  UPDATE public.users
    SET broski_tokens = broski_tokens + p_amount
  WHERE id = p_user_id
  RETURNING broski_tokens INTO v_new_balance;

  RETURN jsonb_build_object('awarded', true, 'new_balance', v_new_balance);
END;
$$;


-- ── D. spend_tokens() ────────────────────────────────────────────────────────
-- Deducts tokens when a student redeems an add-on.
-- Raises exception if balance would go below 0.
-- Returns: { spent: bool, new_balance: int }

CREATE OR REPLACE FUNCTION public.spend_tokens(
  p_user_id   UUID,
  p_amount    INTEGER,
  p_reason    TEXT,
  p_source_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current INTEGER;
  v_new     INTEGER;
BEGIN
  SELECT broski_tokens INTO v_current
    FROM public.users WHERE id = p_user_id FOR UPDATE;

  IF v_current < p_amount THEN
    RAISE EXCEPTION
      'Insufficient BROski$ balance: have %, need %', v_current, p_amount;
  END IF;

  INSERT INTO public.token_transactions (user_id, amount, reason, source_id)
  VALUES (p_user_id, -p_amount, p_reason, p_source_id);

  UPDATE public.users
    SET broski_tokens = broski_tokens - p_amount
  WHERE id = p_user_id
  RETURNING broski_tokens INTO v_new;

  RETURN jsonb_build_object('spent', true, 'new_balance', v_new);
END;
$$;


-- ── E. on_lesson_completed() trigger function ─────────────────────────────────
-- Awards +10 BROski$ only when completed transitions false → true.
-- Repeated upserts with completed = true are idempotent via award_tokens dedup.

CREATE OR REPLACE FUNCTION public.on_lesson_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
    PERFORM public.award_tokens(
      p_user_id   := NEW.user_id,
      p_amount    := 10,
      p_reason    := 'lesson_complete',
      p_source_id := NEW.lesson_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;


-- ── F. Attach trigger to public.lesson_progress ───────────────────────────────
-- Wrapped in a DO $$ guard — trigger attachment only runs if the table
-- exists, making this block safe to re-run even if section A is skipped
-- (e.g. if the table was created outside this migration).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'lesson_progress'
  ) THEN
    DROP TRIGGER IF EXISTS trg_lesson_completed ON public.lesson_progress;

    CREATE TRIGGER trg_lesson_completed
      AFTER INSERT OR UPDATE OF completed
      ON public.lesson_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.on_lesson_completed();
  END IF;
END;
$$;
