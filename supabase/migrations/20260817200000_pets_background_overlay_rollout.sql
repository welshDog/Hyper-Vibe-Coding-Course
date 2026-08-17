-- Issue #51 full rollout, Batch 2 of 4 (Background category). Unlike Dark
-- Lab (the category's proof-case item, which had a baked rounded-card
-- vignette border needing a crop), the 4 remaining backgrounds were
-- checked via direct visual inspection and are already full-bleed scene
-- art with no card border or baked promo text. Per issue #51's own text
-- ("verify per-category before assuming exempt"), that check is done
-- here -- overlay_image_url is pointed at the same already-clean
-- image_url rather than generating a duplicate/redundant asset, which
-- explicitly records "checked, confirmed safe to render edge-to-edge"
-- instead of leaving these ambiguously null.

BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = image_url
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
  SET overlay_image_url = image_url
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
  SET overlay_image_url = image_url
  WHERE id = '33330004-0000-0000-0000-000000000004';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Nebula Drift (33330004-0000-0000-0000-000000000004) not found -- overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = image_url
  WHERE id = '33330004-0000-0000-0000-000000000005';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Reality Fracture (33330004-0000-0000-0000-000000000005) not found -- overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
