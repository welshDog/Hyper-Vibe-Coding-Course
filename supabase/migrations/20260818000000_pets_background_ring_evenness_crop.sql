-- Follow-up to the band-budget reconciliation in PetPortrait.tsx (bg
-- inset 8% -> 3%, pet padding 16% -> 20%). Bro flagged Cosmic Vortex
-- looking uneven in the newly-widened background ring; a side-by-side
-- render of all 5 backgrounds against the same frame+aura pairing showed
-- the same problem in Dark Lab, Deep Circuit, and Nebula Drift too
-- (Reality Fracture's radiating-from-center composition happened to
-- already suit a thin ring). Measured it (avg brightness sampled at 8
-- points around the visible 3%-10% ring band) rather than eyeballing --
-- confirmed real unevenness (up to ~24x swing between brightest/dimmest
-- point), then grid-searched each source image for a tighter, better-
-- centered crop and re-measured until the swing dropped to ~2-5x.
--
-- Dark Lab's overlay_image_url path is unchanged (same filename,
-- content replaced) -- only these 3 need their overlay_image_url pointed
-- at a newly generated file.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_cosmic_vortex_overlay.png'
  WHERE id = '33330004-0000-0000-0000-000000000001';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Cosmic Vortex (33330004-0000-0000-0000-000000000001) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_deep_circuit_overlay.png'
  WHERE id = '33330004-0000-0000-0000-000000000002';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Deep Circuit (33330004-0000-0000-0000-000000000002) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_nebula_drift_overlay.png'
  WHERE id = '33330004-0000-0000-0000-000000000004';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Nebula Drift (33330004-0000-0000-0000-000000000004) not found -- overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
