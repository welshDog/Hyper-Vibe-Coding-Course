-- Bro flagged that the frame equip-button icons (and shop thumbnails,
-- same preview_image_url field) don't look like the frames themselves --
-- because they don't. preview_image_url was still pointed at the
-- original opaque promo-card art (baked rarity text, unrelated theme
-- art, e.g. Holo Foil's icon reads "CELESTIAL DRACONIS / LEGENDARY
-- COSMETIC" over a phoenix logo -- nothing to do with the rainbow-ring
-- overlay actually rendered on the pet). Confirmed by direct visual
-- inspection of shop_frame_glitch_rgb.png and shop_frame_holo_foil.png
-- before writing this migration.
--
-- Fix: point preview_image_url at the same overlay_image_url already
-- used for the real portrait render, for all 5 frames (not just the 3
-- touched by the Glitch RGB / orange-rule PR). Rendered a quick 5-up
-- icon-size composite first to confirm the transparent ring art reads
-- fine as a small swatch on the equip button's cream background --
-- it does.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET preview_image_url = overlay_image_url
  WHERE metadata->>'pet_slot' = 'frame'
    AND overlay_image_url IS NOT NULL;

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 5 THEN
    RAISE EXCEPTION 'expected 5 frame shop_items rows updated, got %', affected;
  END IF;
END $$;

COMMIT;
