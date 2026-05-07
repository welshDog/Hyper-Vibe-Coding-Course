-- 20260507100000_broskipet_grants_lockdown
--
-- Real fix for the 2 regressions 20260507092020_broskipet_mint_hardening missed:
--   1. "service only" duplicate RLS policy on mint_nonces (target — drop it)
--   2. anon + authenticated still hold EXECUTE on prune_expired_nonces
--      authenticated still holds EXECUTE on next_pet_id (was even granted explicitly)
--      Root cause: Supabase auto-grants execute on public-schema functions to
--      anon + authenticated as explicit role grants, so REVOKE ... FROM PUBLIC
--      does nothing. Must REVOKE FROM the named roles directly.
--
-- After applying, expected ACL on all 3 BROskiPet helper fns:
--   postgres=X/postgres, service_role=X/postgres
-- (no anon, no authenticated)
--
-- Expected mint_nonces policies:
--   mint_nonces_no_public_access (canonical FOR ALL deny — keep)
-- (no "service only" duplicate)

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Drop the duplicate "service only" policy.
--    "mint_nonces_no_public_access" (FOR ALL anon,authenticated USING/WITH CHECK false)
--    already covers the same intent and is the canonical one.
-- ───────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "service only" ON public.mint_nonces;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Revoke EXECUTE on all 3 helper fns from anon + authenticated explicitly.
--    These RPCs are only ever called by the Edge Function (service_role key).
-- ───────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.next_pet_id()                    FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prune_expired_nonces()           FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_mint_nonces()    FROM anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Re-affirm service_role grants (idempotent — already there in most cases,
--    but cheap insurance against any prior REVOKE going too broad).
-- ───────────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.next_pet_id()                  TO service_role;
GRANT EXECUTE ON FUNCTION public.prune_expired_nonces()         TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_mint_nonces()  TO service_role;
