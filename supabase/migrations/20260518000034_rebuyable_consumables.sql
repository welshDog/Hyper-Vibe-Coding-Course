-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000034: rebuyable consumables
--
-- Why:
--   shop_purchases had UNIQUE (user_id, item_id) — "one purchase per item per
--   user" (000014). Great for cosmetics / coaching / agent access, but it
--   makes a Donut or a Treat a once-in-a-lifetime event. Catalogue 000031
--   tags the snack/treat/booster/toy/hygiene items metadata.consumable=true;
--   those should be re-buyable while everything else stays one-per-user.
--
-- Change:
--   1. shop_purchases.is_consumable boolean — stamped per row from the item's
--      metadata at purchase time (denormalised so the uniqueness rule can be
--      a partial index — a partial index can't reach into shop_items).
--   2. Backfill existing rows from shop_items.metadata.
--   3. Drop the blanket UNIQUE (user_id, item_id) constraint.
--   4. Re-add it as a PARTIAL unique index WHERE is_consumable = false.
--      → non-consumables: still exactly one per user (DB-enforced).
--      → consumables: unlimited repeat buys.
--   5. purchase_shop_item(): skip the already-owned guard for consumables and
--      stamp is_consumable on insert (mirrors the shop-purchase Edge Fn, which
--      is the path the frontend actually uses).
--
-- Idempotent — IF EXISTS / IF NOT EXISTS / CREATE OR REPLACE throughout.
-- Requires: 000014 (shop_purchases, purchase_shop_item), 000021 (metadata),
--           000031 (consumable tags).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. is_consumable column ───────────────────────────────────────────────────
ALTER TABLE public.shop_purchases
  ADD COLUMN IF NOT EXISTS is_consumable boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.shop_purchases.is_consumable IS
  'Snapshot of the item''s metadata.consumable at purchase time. Drives the partial-unique rule: only is_consumable=false rows are one-per-user.';

-- ── 2. Backfill from the catalogue ────────────────────────────────────────────
UPDATE public.shop_purchases sp
SET    is_consumable = true
FROM   public.shop_items si
WHERE  si.id = sp.item_id
  AND  COALESCE((si.metadata->>'consumable')::boolean, false) = true
  AND  sp.is_consumable = false;

-- ── 3. Drop the blanket UNIQUE constraint ─────────────────────────────────────
-- 000014 created it inline as UNIQUE (user_id, item_id) → default name below.
ALTER TABLE public.shop_purchases
  DROP CONSTRAINT IF EXISTS shop_purchases_user_id_item_id_key;

-- ── 4. Partial unique index — one-per-user for non-consumables only ───────────
CREATE UNIQUE INDEX IF NOT EXISTS shop_purchases_one_per_user_nonconsumable
  ON public.shop_purchases (user_id, item_id)
  WHERE is_consumable = false;

-- ── 5. purchase_shop_item() — consumable-aware ────────────────────────────────
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       uuid := auth.uid();
  v_item          public.shop_items%ROWTYPE;
  v_is_consumable boolean;
  v_spend_result  jsonb;
  v_purchase_id   uuid;
  v_content_ref   text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_item FROM public.shop_items WHERE id = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_not_found');
  END IF;

  IF NOT v_item.is_available THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_unavailable');
  END IF;

  v_is_consumable := COALESCE((v_item.metadata->>'consumable')::boolean, false);

  -- Already-purchased guard applies to non-consumables only.
  IF NOT v_is_consumable AND EXISTS (
    SELECT 1 FROM public.shop_purchases
    WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_purchased');
  END IF;

  v_spend_result := public.spend_tokens(
    v_user_id, v_item.price_tokens, 'shop_purchase', p_item_id::text
  );

  IF NOT (v_spend_result->>'ok')::boolean THEN
    RETURN jsonb_build_object(
      'ok', false, 'error', COALESCE(v_spend_result->>'error', 'spend_failed')
    );
  END IF;

  -- No ON CONFLICT: the partial unique index is the race backstop for
  -- non-consumables (raises unique_violation → caught below); consumables
  -- have no uniqueness rule so every buy is a fresh row.
  INSERT INTO public.shop_purchases (user_id, item_id, spent_tokens, is_consumable)
  VALUES (v_user_id, p_item_id, v_item.price_tokens, v_is_consumable)
  RETURNING id INTO v_purchase_id;

  IF v_item.category = 'bonus_content' THEN
    v_content_ref := 'shop_item:' || p_item_id::text;
    INSERT INTO public.content_unlocks (user_id, content_ref)
    VALUES (v_user_id, v_content_ref)
    ON CONFLICT (user_id, content_ref) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'purchase_id', v_purchase_id,
    'item_id',     p_item_id,
    'spent',       v_item.price_tokens,
    'consumable',  v_is_consumable,
    'new_balance', (v_spend_result->>'new_balance')::integer
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- Privileges unchanged (service_role only — see 000014). CREATE OR REPLACE
-- preserves them; re-assert for idempotency.
REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.purchase_shop_item(uuid) TO service_role;

-- ── Verify (uncomment) ────────────────────────────────────────────────────────
-- SELECT indexdef FROM pg_indexes
--   WHERE tablename = 'shop_purchases'
--     AND indexname = 'shop_purchases_one_per_user_nonconsumable';

COMMIT;
