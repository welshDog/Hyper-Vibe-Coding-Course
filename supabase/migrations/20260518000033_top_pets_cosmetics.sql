-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000033: expose equipped cosmetics on the public top_pets view
--
-- Why:
--   The squad row (PetSquadRow) reads the anon-readable top_pets view. After
--   000032 pets can wear cosmetics, but the view didn't carry them — so the
--   public showcase stayed bare. This appends the cosmetics map.
--
-- Safe to expose: cosmetics is only a map of equipped shop_item UUIDs
--   ({ "aura": uuid, ... }). The art those resolve to lives in shop_items,
--   which is already anon-readable (shop_items_public_read). No PII — same
--   trust level as the pet_name / species the view already publishes.
--
-- CREATE OR REPLACE VIEW only allows appending columns after the existing
-- ones (column list + types of the originals unchanged) — cosmetics goes
-- last. Existing GRANTs survive a replace; re-granted here for idempotency.
--
-- Requires: 20260508120000 (top_pets view), 000032 (pets.cosmetics).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE OR REPLACE VIEW top_pets
  WITH (security_invoker = true) AS
SELECT
  pet_id,
  species_id,
  pet_name,
  rarity,
  stage,
  evolution_count,
  created_at,
  cosmetics
FROM pets
ORDER BY evolution_count DESC, created_at DESC
LIMIT 12;

GRANT SELECT ON top_pets TO anon, authenticated;

-- ── Verify (uncomment) ────────────────────────────────────────────────────────
-- SELECT pet_id, pet_name, cosmetics FROM top_pets LIMIT 5;

COMMIT;
