-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: BROskiPets Care System — Wave 1 (Feed + Clean)
--
-- Adds Hunger/Cleanliness stats + a drift-toward-neutral formula, tags 18
-- existing shop_items with effect_type/target_stat/effect_value (behaviour
-- separate from display category), adds inventory-usage tracking to
-- shop_purchases, and adds the use_care_item() RPC.
--
-- See docs/superpowers/specs/2026-08-01-broskipets-care-wave1-design.md
-- for full design rationale.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. pets: care stat columns ──────────────────────────────────────────────
ALTER TABLE public.pets
  ADD COLUMN hunger                 integer NOT NULL DEFAULT 50
    CHECK (hunger BETWEEN 0 AND 100),
  ADD COLUMN hunger_updated_at      timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN cleanliness            integer NOT NULL DEFAULT 50
    CHECK (cleanliness BETWEEN 0 AND 100),
  ADD COLUMN cleanliness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_feed_at           timestamptz NULL,
  ADD COLUMN last_clean_at          timestamptz NULL,
  ADD COLUMN last_duo_bonus_date    date NULL;

-- ── 2. shop_purchases: inventory/usage tracking ─────────────────────────────
ALTER TABLE public.shop_purchases
  ADD COLUMN used_at         timestamptz NULL,
  ADD COLUMN used_on_pet_id  uuid NULL REFERENCES public.pets(id);

-- ── 3. Drift helper — DB canonical, 5-day linear return-to-neutral(50) ──────
-- SET search_path pinned to avoid the Supabase linter's
-- function_search_path_mutable WARN (live-verified during Task 1 apply).
CREATE OR REPLACE FUNCTION public.drifted_stat(
  v_raw integer, v_updated_at timestamptz
) RETURNS integer
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT LEAST(100, GREATEST(0, ROUND(
    v_raw + (50 - v_raw) * LEAST(
      1.0, EXTRACT(EPOCH FROM (now() - v_updated_at)) / (5 * 86400)
    )
  )))::integer;
$$;

-- ── 4. shop_items.metadata patches — Wave-1 item-effect matrix ──────────────
-- Snacks & Fuel (food) — small tier (+8)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":8}'::jsonb
WHERE id IN (
  '33330001-0000-0000-0000-000000000001', -- API Apple
  '33330001-0000-0000-0000-000000000004', -- Hyper Donut
  '33330001-0000-0000-0000-000000000005'  -- Markdown Muffin
);

-- Snacks & Fuel (food) — medium tier (+14)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":14}'::jsonb
WHERE id IN (
  '33330001-0000-0000-0000-000000000002', -- BROski Burger
  '33330001-0000-0000-0000-000000000003', -- Hyper Energy Drink
  '33330001-0000-0000-0000-000000000006'  -- Pixel Sushi
);

-- Clean & Tidy (hygiene) — small tier (+8), all 3
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"care","target_stat":"cleanliness","effect_value":8}'::jsonb
WHERE id IN (
  '33330002-0000-0000-0000-000000000001', -- Cache Shampoo
  '33330002-0000-0000-0000-000000000002', -- Lint Brush
  '33330002-0000-0000-0000-000000000003'  -- Log Floss
);

-- Pet Care (pet_care) — small tier (+8)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":8}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000002'; -- Classic Kibble

-- Pet Care — medium tier (+14)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":14}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000003', -- Power Snack
  '33330007-0000-0000-0000-000000000007'  -- Choc Drop Treat
);

-- Pet Care — large tier (+22)
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"feed","target_stat":"hunger","effect_value":22}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000001'; -- HyperFuel

-- Pet Care — deferred to Wave 2 (play/happiness), still purchasable, inert
-- until a happiness stat + Play action exist
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"play","target_stat":"happiness"}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000004', -- Holo Puzzle
  '33330007-0000-0000-0000-000000000005', -- Quantum Toy
  '33330007-0000-0000-0000-000000000006', -- Debug Duck
  '33330007-0000-0000-0000-000000000009'  -- Rainbow Treat
);

-- Pet Care — deferred to Wave 2/3 boost review
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_type":"boost"}'::jsonb
WHERE id = '33330007-0000-0000-0000-000000000008'; -- Legendary Vibe Treat

-- ── 5. use_care_item RPC ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.use_care_item(
  p_purchase_id uuid, p_pet_id uuid, p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller       uuid := auth.uid();
  v_purchase     shop_purchases%ROWTYPE;
  v_item         shop_items%ROWTYPE;
  v_pet          pets%ROWTYPE;
  v_effect_type  text;
  v_target_stat  text;
  v_effect_value integer;
  v_current      integer;
  v_new_value    integer;
  v_duo_awarded  boolean := false;
  v_rows         integer;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_action NOT IN ('feed', 'care') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;

  SELECT * INTO v_purchase FROM shop_purchases
    WHERE id = p_purchase_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
  END IF;
  IF v_purchase.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  SELECT * INTO v_item FROM shop_items WHERE id = v_purchase.item_id;
  v_effect_type  := v_item.metadata ->> 'effect_type';
  v_target_stat  := v_item.metadata ->> 'target_stat';
  v_effect_value := COALESCE((v_item.metadata ->> 'effect_value')::integer, 0);

  IF v_effect_type IS DISTINCT FROM p_action THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_effect_type');
  END IF;
  IF v_target_stat NOT IN ('hunger', 'cleanliness') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_stat');
  END IF;

  IF v_target_stat = 'hunger' THEN
    v_current := drifted_stat(v_pet.hunger, v_pet.hunger_updated_at);
  ELSE
    v_current := drifted_stat(v_pet.cleanliness, v_pet.cleanliness_updated_at);
  END IF;
  v_new_value := LEAST(100, v_current + v_effect_value);

  -- Atomic guard against the check-then-act race on used_at: two
  -- near-simultaneous calls could both pass the already_used SELECT check
  -- above before either commits. Making the UPDATE itself the guard (WHERE
  -- ... AND used_at IS NULL) and checking ROW_COUNT means the loser of the
  -- race gets 0 rows updated here and bails out with already_used instead
  -- of proceeding to award XP / apply the stat effect a second time
  -- (live-verified during Task 1 apply via a concurrent-calls regression
  -- check in scripts/Test-CareAction.ps1).
  UPDATE shop_purchases
    SET used_at = now(), used_on_pet_id = p_pet_id
    WHERE id = p_purchase_id AND used_at IS NULL;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  IF v_target_stat = 'hunger' THEN
    UPDATE pets SET
      hunger = v_new_value, hunger_updated_at = now(),
      xp = xp + 2, last_feed_at = now()
    WHERE id = p_pet_id;
  ELSE
    UPDATE pets SET
      cleanliness = v_new_value, cleanliness_updated_at = now(),
      xp = xp + 2, last_clean_at = now()
    WHERE id = p_pet_id;
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;
  IF v_pet.last_feed_at::date = CURRENT_DATE
     AND v_pet.last_clean_at::date = CURRENT_DATE
     AND v_pet.last_duo_bonus_date IS DISTINCT FROM CURRENT_DATE THEN
    UPDATE pets SET xp = xp + 5, last_duo_bonus_date = CURRENT_DATE
      WHERE id = p_pet_id;
    v_duo_awarded := true;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'target_stat', v_target_stat,
    'new_value',   v_new_value,
    'xp_awarded',  2 + (CASE WHEN v_duo_awarded THEN 5 ELSE 0 END),
    'duo_bonus',   v_duo_awarded
  );
END;
$$;

-- Supabase grants EXECUTE to PUBLIC and to anon/authenticated directly at
-- function-creation time. Revoke both before granting only to authenticated,
-- matching the existing repo pattern on evolve_pet/equip_pet_cosmetic
-- (live-verified via get_advisors during Task 1 apply — without this,
-- use_care_item was anon-executable, flagged by the
-- anon_security_definer_function_executable lint).
REVOKE EXECUTE ON FUNCTION public.use_care_item(uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.use_care_item(uuid, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.use_care_item(uuid, uuid, text) TO authenticated;

COMMIT;
