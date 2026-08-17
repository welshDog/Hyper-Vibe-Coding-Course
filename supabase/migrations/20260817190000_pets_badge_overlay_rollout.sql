-- Issue #51 full rollout, Batch 1 of 4 (Badge category). Wires
-- overlay_image_url for the 4 remaining badge cosmetics, same guarded
-- pattern as 20260803140000_pets_cosmetics_overlay_polish.sql (which did
-- BROski Holo Badge, the category's proof-case item). Each row raises if
-- missing rather than silently no-op-ing.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_dev_legend_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000002';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Dev Legend Badge (33330005-0000-0000-0000-000000000002) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_founder_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Founder Badge (33330005-0000-0000-0000-000000000003) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_hyperfocus_crest_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000004';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Hyperfocus Crest (33330005-0000-0000-0000-000000000004) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_welsh_dragon_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000005';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Welsh Dragon Badge (33330005-0000-0000-0000-000000000005) not found -- overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
