BEGIN;

ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS preview_image_url text,
  ADD COLUMN IF NOT EXISTS overlay_image_url text;

COMMENT ON COLUMN public.shop_items.preview_image_url IS
  'Opaque shop-card/promo artwork for catalogue tiles and the equip picker. Mirrors image_url for now.';
COMMENT ON COLUMN public.shop_items.overlay_image_url IS
  'Transparent PNG/WebP art safe to composite directly over a pet portrait (PetPortrait.tsx). NULL until an item has real overlay art — compositing falls back to image_url.';

UPDATE public.shop_items
SET preview_image_url = image_url
WHERE preview_image_url IS NULL;

-- Fail loudly rather than silently leaving overlay_image_url unset if the
-- Basic Neon Frame row is ever missing (e.g. re-seeded catalogue, wrong env).
DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-frame/shop_frame_basic_neon_overlay.png'
  WHERE id = '33330008-0000-0000-0000-000000000001';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Basic Neon Frame (33330008-0000-0000-0000-000000000001) not found — overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
