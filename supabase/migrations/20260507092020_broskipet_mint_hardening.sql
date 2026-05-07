-- 20260507092020_broskipet_mint_hardening (applied via dashboard 2026-05-07 ~09:20Z)
--
-- ⚠️ Synced to git AFTER the fact for parity. This migration's intent was to fix
-- 3 regressions but only #1 actually landed. See follow-up
-- 20260507100000_broskipet_grants_lockdown.sql for the real fix to #2 and #3.
--
-- What this migration actually achieved:
--   ✅ search_path='' on next_pet_id, prune_expired_nonces, cleanup_expired_mint_nonces
--   ❌ Tried to drop "Users can insert/view their own nonces" — those policies never
--      existed. The real duplicate is "service only", which was NOT dropped.
--   ❌ REVOKE EXECUTE ... FROM PUBLIC is a no-op vs Supabase's anon/authenticated
--      default grants. anon + authenticated still hold execute on
--      prune_expired_nonces; authenticated still holds execute on next_pet_id
--      (and the explicit GRANT TO authenticated below made it worse).

-- 1. Fix next_pet_id() -- RETURNS bigint, uses broskipet_id_seq
CREATE OR REPLACE FUNCTION public.next_pet_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT nextval('public.broskipet_id_seq');
$$;

-- 2. Fix prune_expired_nonces() -- RETURNS void
CREATE OR REPLACE FUNCTION public.prune_expired_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.mint_nonces
  WHERE expires_at < now() - interval '1 hour'
    AND used_at IS NOT NULL;
$$;

-- 3. Fix cleanup_expired_mint_nonces() -- RETURNS integer
CREATE OR REPLACE FUNCTION public.cleanup_expired_mint_nonces()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted integer;
BEGIN
  DELETE FROM public.mint_nonces
   WHERE used_at IS NULL
     AND expires_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- 4. ⚠️ NO-OP: tried to drop "Users can insert/view their own nonces" policies
--    that never existed. The actual duplicate is "service only".
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mint_nonces' AND policyname='mint_nonces_insert_own'
  ) AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mint_nonces' AND policyname='Users can insert their own nonces'
  ) THEN
    DROP POLICY IF EXISTS "Users can insert their own nonces" ON public.mint_nonces;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mint_nonces' AND policyname='mint_nonces_select_own'
  ) AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mint_nonces' AND policyname='Users can view their own nonces'
  ) THEN
    DROP POLICY IF EXISTS "Users can view their own nonces" ON public.mint_nonces;
  END IF;
END;
$$;

-- 5. Revoke public execute on all 3 security definer functions
--    ⚠️ FROM PUBLIC does NOT revoke Supabase's default anon/authenticated grants.
REVOKE EXECUTE ON FUNCTION public.next_pet_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prune_expired_nonces() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_mint_nonces() FROM PUBLIC;

-- ⚠️ This grant makes next_pet_id() callable by every signed-in user.
--    The Edge Function calls it with service_role; authenticated should NOT have it.
GRANT EXECUTE ON FUNCTION public.next_pet_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prune_expired_nonces() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_mint_nonces() TO service_role;

-- 6. Log result
DO $$
DECLARE
  v_policies INT;
  v_fns INT;
BEGIN
  SELECT COUNT(*) INTO v_policies FROM pg_policies
    WHERE schemaname='public' AND tablename='mint_nonces';
  SELECT COUNT(*) INTO v_fns FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN ('next_pet_id','prune_expired_nonces','cleanup_expired_mint_nonces');
  RAISE NOTICE 'Hardening done: % policies on mint_nonces | % functions patched', v_policies, v_fns;
END;
$$;
