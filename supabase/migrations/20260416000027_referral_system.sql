-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: referral system
-- Date: 2026-04-16
-- ═══════════════════════════════════════════════════════════════════════════
--
-- referral_codes: one short code per user (lazy-created via RPC)
-- referrals: records successful referrals + token awards
-- handle_new_user updated to process referral_code from auth metadata
-- Idempotent throughout.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── A. referral_codes ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(code)
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code
  ON public.referral_codes(code);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own referral code" ON public.referral_codes;
CREATE POLICY "Users can read their own referral code"
  ON public.referral_codes FOR SELECT
  USING ((SELECT auth.uid()) = user_id);


-- ── B. referrals ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.referrals (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  referred_email    TEXT        NOT NULL,
  tokens_awarded    INTEGER     NOT NULL DEFAULT 0,
  rewarded_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_user_id, referred_email)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer
  ON public.referrals(referrer_user_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own referrals" ON public.referrals;
CREATE POLICY "Users can read their own referrals"
  ON public.referrals FOR SELECT
  USING ((SELECT auth.uid()) = referrer_user_id);


-- ── C. get_or_create_referral_code(user_id) ──────────────────────────────────
-- Returns the user's referral code, creating one if it doesn't exist yet.
-- Code format: BRO + first 7 hex chars of user UUID (e.g. BRO1A2B3C4)

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT code INTO v_code
    FROM public.referral_codes
   WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_code := 'BRO' || UPPER(REPLACE(SUBSTR(p_user_id::TEXT, 1, 8), '-', ''));
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (p_user_id, v_code)
    ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code
    RETURNING code INTO v_code;
  END IF;

  RETURN v_code;
END;
$$;


-- ── D. Update handle_new_user to process referral codes ──────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_referral_code  TEXT;
  v_referrer_id    UUID;
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Apply any courses paid for before account creation
  PERFORM public.apply_pending_enrollments(NEW.email, NEW.id);

  -- Process referral code if provided at signup
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    SELECT user_id INTO v_referrer_id
      FROM public.referral_codes
     WHERE code = v_referral_code;

    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
      -- Record the referral
      INSERT INTO public.referrals
        (referrer_user_id, referred_user_id, referred_email, tokens_awarded, rewarded_at)
      VALUES
        (v_referrer_id, NEW.id, NEW.email, 100, NOW())
      ON CONFLICT (referrer_user_id, referred_email) DO NOTHING;

      -- Award 100 BROski$ to the referrer (idempotent via source_id dedup)
      PERFORM public.award_tokens(
        p_user_id   := v_referrer_id,
        p_amount    := 100,
        p_reason    := 'referral',
        p_source_id := NEW.id::TEXT
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
