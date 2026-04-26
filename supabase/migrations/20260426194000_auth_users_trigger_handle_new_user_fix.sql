BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth
AS $function$
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
  )
  ON CONFLICT (id) DO NOTHING;

  PERFORM public.apply_pending_enrollments(NEW.email, NEW.id);

  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    SELECT user_id
      INTO v_referrer_id
      FROM public.referral_codes
     WHERE code = v_referral_code;

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
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;

