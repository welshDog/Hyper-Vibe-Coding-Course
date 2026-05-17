-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000032: BROskiPet cosmetics — equip / unequip
--
-- Why:
--   Shop catalogue 000031 sells pet cosmetics (aura / frame / badge /
--   background, tagged shop_items.metadata->>'pet_slot'). Owning one was a
--   dead end — there was nowhere to put it ON a pet. This wires equipping.
--
-- Change:
--   1. pets.cosmetics jsonb — per-pet equipped map, e.g.
--        { "aura": "<shop_item_uuid>", "frame": "<uuid>", ... }
--   2. equip_pet_cosmetic(p_pet_id, p_item_id)   — validated equip
--   3. unequip_pet_cosmetic(p_pet_id, p_slot)    — clear a slot
--
-- Security model:
--   pets has no UPDATE policy for authenticated users (writes are
--   service_role-only via mint-pet-auth). These two functions are
--   SECURITY DEFINER so they can write pets, but each self-checks
--   user_id = auth.uid() AND that the caller owns the cosmetic in
--   shop_purchases — so a user can only restyle their own pet with
--   cosmetics they actually bought. EXECUTE granted to authenticated
--   (no Edge Function needed — all validation is internal & uid-keyed).
--   Mirrors the purchase_shop_item() SECURITY DEFINER pattern (000014).
--
-- Idempotent — ADD COLUMN IF NOT EXISTS + CREATE OR REPLACE FUNCTION.
-- Requires: 000014 (shop_items, shop_purchases), 000031 (pet_slot metadata),
--           20260508120000 (pets table).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. pets.cosmetics column ──────────────────────────────────────────────────
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS cosmetics jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.pets.cosmetics IS
  'Equipped cosmetics by slot: { "aura": shop_item_uuid, "frame": uuid, "badge": uuid, "background": uuid }. Written only via equip_pet_cosmetic/unequip_pet_cosmetic.';

-- ── 2. equip_pet_cosmetic() ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.equip_pet_cosmetic(
  p_pet_id  uuid,
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_slot    text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Pet must belong to the caller
  IF NOT EXISTS (
    SELECT 1 FROM public.pets
    WHERE id = p_pet_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  -- Caller must own the cosmetic (bought it from the shop)
  IF NOT EXISTS (
    SELECT 1 FROM public.shop_purchases
    WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
  END IF;

  -- Item must be a pet cosmetic — its slot comes from the catalogue metadata
  SELECT metadata->>'pet_slot' INTO v_slot
  FROM public.shop_items
  WHERE id = p_item_id;

  IF v_slot IS NULL OR v_slot NOT IN ('aura', 'frame', 'badge', 'background') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_pet_cosmetic');
  END IF;

  UPDATE public.pets
  SET    cosmetics = cosmetics || jsonb_build_object(v_slot, p_item_id::text)
  WHERE  id = p_pet_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true, 'slot', v_slot, 'item_id', p_item_id, 'pet_id', p_pet_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ── 3. unequip_pet_cosmetic() ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.unequip_pet_cosmetic(
  p_pet_id uuid,
  p_slot   text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_slot NOT IN ('aura', 'frame', 'badge', 'background') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_slot');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.pets
    WHERE id = p_pet_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  UPDATE public.pets
  SET    cosmetics = cosmetics - p_slot
  WHERE  id = p_pet_id AND user_id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'slot', p_slot, 'pet_id', p_pet_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ── 4. Grants ─────────────────────────────────────────────────────────────────
-- Authenticated callers may invoke directly (validation is internal and
-- keyed to auth.uid()). anon cannot.

REVOKE EXECUTE ON FUNCTION public.equip_pet_cosmetic(uuid, uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.unequip_pet_cosmetic(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.equip_pet_cosmetic(uuid, uuid)   TO authenticated;
GRANT  EXECUTE ON FUNCTION public.unequip_pet_cosmetic(uuid, text) TO authenticated;

-- ── Verify (uncomment) ────────────────────────────────────────────────────────
-- SELECT id, pet_name, cosmetics FROM public.pets LIMIT 5;
-- SELECT has_function_privilege('authenticated',
--   'public.equip_pet_cosmetic(uuid,uuid)', 'EXECUTE');  -- expect t

COMMIT;
