-- Migration: BROskiPet mint nonces + per-token id sequence
-- Date: 2026-05-07
-- Purpose: Backing storage for the `mint-pet-auth` Supabase Edge Function.
--
-- Flow recap (for future-you):
--   1. Authed user hits POST /functions/v1/mint-pet-auth
--   2. Function calls spend_tokens() to deduct 100 BROski$ atomically
--   3. Function calls next_pet_id() to claim a unique pet id
--   4. Function inserts a row into mint_nonces with random nonce + expiry
--   5. Function signs an EIP-712 MintAuth and returns it to the client
--   6. Client submits mintWithAuth(auth, sig) on-chain
--
-- Security model:
--   - All writes go through the Edge Function using service_role key
--   - RLS denies everything to authenticated/anon — they can never read/insert/update nonces
--   - SECURITY DEFINER functions revoked from public, granted to service_role only

-- ───────────────────────────────────────────────────────────────────────────
-- 1. mint_nonces table
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mint_nonces (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nonce       text        NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mint_nonces IS
  'Single-use nonces for EIP-712 BROskiPet mint authorizations. Service-role-only.';

CREATE INDEX IF NOT EXISTS idx_mint_nonces_user_id     ON public.mint_nonces (user_id);
CREATE INDEX IF NOT EXISTS idx_mint_nonces_expires_at  ON public.mint_nonces (expires_at)
  WHERE used_at IS NULL;

ALTER TABLE public.mint_nonces ENABLE ROW LEVEL SECURITY;

-- Belt-and-braces: deny all to authenticated/anon. service_role bypasses RLS
-- by default, so the Edge Function (using SUPABASE_SERVICE_ROLE_KEY) is unaffected.
DROP POLICY IF EXISTS "mint_nonces_no_public_access" ON public.mint_nonces;
CREATE POLICY "mint_nonces_no_public_access"
  ON public.mint_nonces
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. broskipet_id_seq + next_pet_id()
-- ───────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.broskipet_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

COMMENT ON SEQUENCE public.broskipet_id_seq IS
  'Monotonic per-pet id, baked into the petId string passed to BROskiPet.mintWithAuth.';

CREATE OR REPLACE FUNCTION public.next_pet_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.broskipet_id_seq');
$$;

COMMENT ON FUNCTION public.next_pet_id() IS
  'Atomic claim of the next BROskiPet id. Service-role only.';

REVOKE ALL ON FUNCTION public.next_pet_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.next_pet_id() FROM authenticated, anon;
GRANT  EXECUTE ON FUNCTION public.next_pet_id() TO service_role;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. cleanup_expired_mint_nonces() — housekeeping
-- ───────────────────────────────────────────────────────────────────────────
-- Removes unused nonces past their expiry. Run from pg_cron or on demand.
CREATE OR REPLACE FUNCTION public.cleanup_expired_mint_nonces()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

REVOKE ALL ON FUNCTION public.cleanup_expired_mint_nonces() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_expired_mint_nonces() FROM authenticated, anon;
GRANT  EXECUTE ON FUNCTION public.cleanup_expired_mint_nonces() TO service_role;
