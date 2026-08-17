-- Issue #51 full rollout, Batch 4 of 4 (final) -- Frame category. Closes
-- the whole issue: this is the last of 20 pet-slot cosmetics to get
-- overlay_image_url wired.
--
-- Unlike aura/background/badge, frame source art all has baked
-- promo-card content (Glitch RGB: "PET::01"/"SYS_CRITICAL"/etc. text
-- scattered across the border; Holo Foil: "CELESTIAL DRACONIS /
-- LEGENDARY COSMETIC" title card; Quantum Crack: "LEGENDARY"/"ULTRA
-- RARE"/"PET FRAME" labels; Welsh Celtic: an opaque navy panel behind
-- the knotwork) -- confirmed via direct visual inspection of all 4,
-- same class of problem Basic Neon Frame (the category's proof-case
-- item, PR #52) had. Cropping can't remove baked text/opaque
-- backgrounds, so all 4 needed the same procedural-generation approach
-- Basic Neon Frame used: Pillow/numpy rounded-rectangle border + glow
-- + gradient, alpha-composited, restyled per frame's own theme
-- (RGB channel-split glitch / rainbow holo / gold crack lines / Welsh
-- gold-red). Verified via checkerboard-composite test before wiring in
-- (real alpha transparency, no baked text) -- same verification method
-- used for Basic Neon Frame.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-frame/shop_frame_glitch_rgb_overlay.png'
  WHERE id = '33330008-0000-0000-0000-000000000002';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Glitch RGB Frame (33330008-0000-0000-0000-000000000002) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-frame/shop_frame_holo_foil_overlay.png'
  WHERE id = '33330008-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Holo Foil Frame (33330008-0000-0000-0000-000000000003) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-frame/shop_frame_quantum_crack_overlay.png'
  WHERE id = '33330008-0000-0000-0000-000000000004';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Quantum Crack Frame (33330008-0000-0000-0000-000000000004) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-frame/shop_frame_welsh_celtic_overlay.png'
  WHERE id = '33330008-0000-0000-0000-000000000005';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Welsh Celtic Frame (33330008-0000-0000-0000-000000000005) not found -- overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
