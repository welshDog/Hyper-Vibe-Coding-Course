-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: production-consistency repair — cosmetic RPC grants + catalog
-- asset paths
--
-- Two unrelated live-vs-tracked-truth drifts found during a manual visual
-- QA pass on /pets, root-caused via systematic debugging before this fix
-- was written (see conversation history — not guessed at):
--
-- 1. equip_pet_cosmetic / unequip_pet_cosmetic surface a raw Postgres
--    "permission denied for function ..." error to real users. The original
--    migration (20260518000032_pet_cosmetics_equip.sql) has always
--    correctly GRANTed EXECUTE to authenticated since its first commit, and
--    no later migration ever touches these two functions — yet live
--    has_function_privilege('authenticated', ...) is false for both. The
--    grant was removed out-of-band (outside any tracked migration, likely a
--    manual dashboard action) at some unknown point after the migration
--    was applied. Re-asserting it here is safe and idempotent regardless
--    of current state.
--
-- 2. Every one of the 49 shop_items.image_url values ends in a duplicated
--    ".png.png" (a known wart flagged in the original catalog migration's
--    own comment: "safe to rename in a later sweep"). At some point the
--    actual files on disk were renamed to drop the duplicate extension,
--    but shop_items was never updated to match — every shop/pet image on
--    the live site has been 404ing since. Confirmed catalog-wide (all 10
--    categories, all 49 rows), not isolated to any one category.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Re-assert cosmetic RPC grants (matches evolve_pet/use_care_item's
--       existing, correctly-live ACL shape) ─────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.equip_pet_cosmetic(uuid, uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unequip_pet_cosmetic(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.equip_pet_cosmetic(uuid, uuid)   TO authenticated;
GRANT  EXECUTE ON FUNCTION public.unequip_pet_cosmetic(uuid, text) TO authenticated;

-- ── 2. Correct the catalog-wide duplicate .png.png suffix ──────────────────
-- Guarded to only touch rows that actually end in the duplicated suffix
-- (anchored regexp, not a plain substring replace, so nothing mid-string
-- could ever be mismatched).
UPDATE public.shop_items
SET image_url = regexp_replace(image_url, '\.png\.png$', '.png')
WHERE image_url LIKE '%.png.png';

COMMIT;
