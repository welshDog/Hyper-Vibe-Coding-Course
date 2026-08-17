-- Issue #51 full rollout, Batch 3 of 4 (Aura category). Same mixed
-- treatment as Batch 2 (Background): checked each remaining item via
-- direct visual inspection rather than assuming the category-template
-- hypothesis holds uniformly.
--
-- Electric Crackle and Matrix Rain had genuine dead starfield margin
-- around the ring/sphere, same class of problem Flame Aura (the
-- category's proof-case item) had -- cropped tight via the same
-- Pillow pattern, verified visually before committing.
--
-- Cosmic Swirl and Hyperfocus Pulse are already full-bleed compositions
-- (the ring/spiral fills the frame edge-to-edge already) -- confirmed
-- via direct inspection, no crop needed. overlay_image_url points at
-- the same already-clean image_url for these two, explicitly recording
-- "checked, confirmed safe" rather than leaving them ambiguously null.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = image_url
  WHERE id = '33330003-0000-0000-0000-000000000001';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Cosmic Swirl Aura (33330003-0000-0000-0000-000000000001) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-aura/shop_aura_electric_crackle_overlay.png'
  WHERE id = '33330003-0000-0000-0000-000000000002';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Electric Crackle Aura (33330003-0000-0000-0000-000000000002) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = image_url
  WHERE id = '33330003-0000-0000-0000-000000000004';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Hyperfocus Pulse Aura (33330003-0000-0000-0000-000000000004) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-aura/shop_aura_matrix_rain_overlay.png'
  WHERE id = '33330003-0000-0000-0000-000000000005';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Matrix Rain Aura (33330003-0000-0000-0000-000000000005) not found -- overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
