-- Migration: BROskiPet mint infrastructure (upstream — applied via dashboard 2026-05-07 ~07:09Z)
-- Synced to git AFTER the fact for parity. See follow-up migration
-- 20260507075000_broskipet_mint_hardening.sql for fixes to the regressions
-- this introduced (search_path, duplicate RLS policy, exposed RPC).
--
-- This file should be considered "as-applied" — do not edit, fix in the follow-up.

-- 1. Ensure mint_nonces has all required columns (safe, additive only)
ALTER TABLE mint_nonces
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- 2. Ensure RLS is on and policy is service-role-only
ALTER TABLE mint_nonces ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'mint_nonces' AND policyname = 'service only'
  ) THEN
    EXECUTE 'CREATE POLICY "service only" ON mint_nonces USING (false)';
  END IF;
END $$;

-- 3. broskipet_id_seq already exists — ensure next_pet_id() function is present
CREATE OR REPLACE FUNCTION next_pet_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT nextval('broskipet_id_seq');
$$;

-- 4. Grant edge function service role access
GRANT EXECUTE ON FUNCTION next_pet_id() TO service_role;
GRANT ALL ON TABLE mint_nonces TO service_role;
GRANT USAGE ON SEQUENCE broskipet_id_seq TO service_role;

-- 5. Cleanup index for expired nonce pruning
CREATE INDEX IF NOT EXISTS idx_mint_nonces_expires_at
  ON mint_nonces (expires_at);

CREATE INDEX IF NOT EXISTS idx_mint_nonces_user_id
  ON mint_nonces (user_id);

-- 6. Auto-cleanup job: mark expired nonces (safe to run repeatedly)
CREATE OR REPLACE FUNCTION prune_expired_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM mint_nonces
  WHERE expires_at < now() - interval '1 hour'
    AND used_at IS NOT NULL;
$$;
