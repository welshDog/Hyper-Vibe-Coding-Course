BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_lab_dark_overlay.png'
  WHERE id = '33330004-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Dark Lab (33330004-0000-0000-0000-000000000003) not found — overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-aura/shop_aura_flame_overlay.png'
  WHERE id = '33330003-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Flame Aura (33330003-0000-0000-0000-000000000003) not found — overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_broski_holo_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000001';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for BROski Holo Badge (33330005-0000-0000-0000-000000000001) not found — overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
