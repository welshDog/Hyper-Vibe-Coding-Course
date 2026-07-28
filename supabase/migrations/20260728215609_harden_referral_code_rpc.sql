-- Harden referral-code RPC against cross-user UUID targeting.
-- Replaces the old get_or_create_referral_code(uuid) shape with a zero-arg,
-- self-authing RPC that only ever operates on auth.uid().

DROP FUNCTION IF EXISTS public.get_or_create_referral_code(uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_code text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to get or create a referral code.';
  END IF;

  SELECT code
    INTO v_code
    FROM public.referral_codes
   WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    v_code := 'BRO' || upper(replace(substr(v_user_id::text, 1, 8), '-', ''));

    INSERT INTO public.referral_codes (user_id, code)
    VALUES (v_user_id, v_code)
    ON CONFLICT (user_id) DO UPDATE
      SET code = EXCLUDED.code
    RETURNING code INTO v_code;
  END IF;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;
