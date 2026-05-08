-- Migration: BROskiPet ownership persistence (Phase 2A)
--
-- Adds the `pets` table that caches on-chain mint metadata + holds off-chain
-- state (stage, mood) that doesn't live on the contract. The contract is the
-- source of truth for ownership; this table is the fast read-path for the UI.
--
-- Writes are service_role-only — the `mint-pet-auth` Edge Function INSERTs
-- after a successful relay tx. Reads are RLS-gated to the owning user.
--
-- Also exposes a column-restricted `top_pets` view for the public squad row.

CREATE TABLE IF NOT EXISTS pets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address  TEXT NOT NULL,
  pet_id          TEXT NOT NULL UNIQUE,
  species_id      TEXT NOT NULL,
  pet_name        TEXT NOT NULL CHECK (char_length(pet_name) BETWEEN 1 AND 32),
  rarity          TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','legendary')),
  stage           TEXT NOT NULL DEFAULT 'baby'
                    CHECK (stage IN ('baby','learner','builder','shipper','hyperfocus_god','legend')),
  mood            TEXT NOT NULL DEFAULT 'idle'
                    CHECK (mood IN ('idle','learning','hyperfocus','evolving')),
  evolution_count INTEGER NOT NULL DEFAULT 0 CHECK (evolution_count >= 0),
  last_evolved_at TIMESTAMPTZ,
  mint_tx_hash    TEXT NOT NULL,
  ipfs_cid        TEXT NOT NULL,
  chain_id        INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE pets IS
  'Cache of on-chain BROskiPet ownership + off-chain stage/mood. Writes by mint-pet-auth Edge Fn (service_role). Reads RLS-gated to owner.';

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_wallet  ON pets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_pets_top     ON pets(evolution_count DESC, created_at DESC);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Users read their own pets only. service_role bypasses RLS for INSERT/UPDATE.
DROP POLICY IF EXISTS "users read own pets" ON pets;
CREATE POLICY "users read own pets" ON pets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Public squad row view — no wallet leakage, capped at 12 rows.
CREATE OR REPLACE VIEW top_pets
  WITH (security_invoker = true) AS
SELECT
  pet_id,
  species_id,
  pet_name,
  rarity,
  stage,
  evolution_count,
  created_at
FROM pets
ORDER BY evolution_count DESC, created_at DESC
LIMIT 12;

GRANT SELECT ON top_pets TO anon, authenticated;
