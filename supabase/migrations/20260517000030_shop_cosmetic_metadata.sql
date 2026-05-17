-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000030: Cosmetic fulfillment key for the Gold Profile Frame
--
-- Why:
--   The shop fulfillment surface needs a stable, item-level signal to know
--   which purchase grants the gold avatar frame. Owning the purchase alone
--   isn't enough — the UI must not hard-code the item UUID.
--
-- Change:
--   Backfill shop_items.metadata with { "cosmetic": "gold_frame" } on the
--   Gold Profile Frame item, WITHOUT clobbering any other metadata keys.
--   Recognised key (documented on the column in 000021):
--     cosmetic (text): cosmetic id the purchase equips (e.g. "gold_frame").
--
-- Idempotent — the `||` merge + guard make re-runs a no-op.
-- Requires: 000021 (shop_items.metadata column)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.shop_items
SET    metadata = metadata || '{"cosmetic":"gold_frame"}'::jsonb
WHERE  id = '11111111-0004-0000-0000-000000000004'
  AND  COALESCE(metadata->>'cosmetic', '') <> 'gold_frame';

-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT id, name, category, metadata
-- FROM public.shop_items
-- WHERE metadata @> '{"cosmetic":"gold_frame"}';

COMMIT;
