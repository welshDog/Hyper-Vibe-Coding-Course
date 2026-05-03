-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: referral metadata guard
-- Date: 2026-05-03
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Hardens handle_new_user() to accept BOTH:
--   (a) BRO-code style referral_code  (e.g. "BRO1A2B3C4")  ← preferred
--   (b) raw UUID style referral_code  (legacy fallback)
--
-- Also adds TRIM() so accidental whitespace never silently fails.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

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

  -- Read + trim the referral code from auth metadata
  v_referral_code := TRIM(NEW.raw_user_meta_data->>'referral_code');

  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN

    -- (a) BRO-code lookup (primary path)
    SELECT user_id INTO v_referrer_id
      FROM public.referral_codes
     WHERE code = v_referral_code;

    -- (b) UUID fallback (legacy path — ref=<user_id>)
    IF v_referrer_id IS NULL THEN
      BEGIN
        SELECT id INTO v_referrer_id
          FROM public.users
         WHERE id = v_referral_code::UUID;
      EXCEPTION WHEN invalid_text_representation THEN
        -- Not a valid UUID either — silently ignore
        v_referrer_id := NULL;
      END;
    END IF;

    -- Award if valid referrer found and it's not a self-referral
    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
      INSERT INTO public.referrals
        (referrer_user_id, referred_user_id, referred_email, tokens_awarded, rewarded_at)
      VALUES
        (v_referrer_id, NEW.id, NEW.email, 100, NOW())
      ON CONFLICT (referrer_user_id, referred_email) DO NOTHING;

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
