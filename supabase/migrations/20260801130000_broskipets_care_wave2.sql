-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: BROskiPets Care System — Wave 2 (Play + Happiness + mood support)
--
-- Adds the Happiness stat (identical shape to Wave 1's Hunger/Cleanliness),
-- prices the 4 shop items Wave 1 pre-tagged play/happiness but left
-- unpriced, and extends use_care_item from 2-way to 3-way (feed/care/play).
-- Upgrades the daily bonus from duo (+5, Feed+Clean) to trio (+10,
-- Feed+Clean+Play) — last_duo_bonus_date is renamed to reflect its new
-- semantics. The mood layer itself needs NO schema here — it's a pure
-- frontend-derived value computed from the stats this migration produces.
--
-- See docs/superpowers/specs/2026-08-01-broskipets-care-wave2-design.md
-- for full design rationale.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. pets: Happiness stat + play tracking ─────────────────────────────────
ALTER TABLE public.pets
  ADD COLUMN happiness            integer NOT NULL DEFAULT 50
    CHECK (happiness BETWEEN 0 AND 100),
  ADD COLUMN happiness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_play_at         timestamptz NULL;

-- Semantics changed (duo -> trio bonus below) - rename rather than leave a
-- stale name for the next reader.
ALTER TABLE public.pets
  RENAME COLUMN last_duo_bonus_date TO last_care_bonus_date;

-- ── 2. shop_items.metadata — price the 4 Wave-1-deferred play items ────────
-- Same tiering rule as Wave 1 (<25 -> +8, 25-40 -> +14, 45+ -> +22).
-- These rows already carry effect_type:"play", target_stat:"happiness" from
-- Wave 1 - this only adds the missing effect_value key via jsonb merge.
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_value":14}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000006', -- Debug Duck (30 tokens)
  '33330007-0000-0000-0000-000000000009'  -- Rainbow Treat (40 tokens)
);

UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_value":22}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000004', -- Holo Puzzle (50 tokens)
  '33330007-0000-0000-0000-000000000005'  -- Quantum Toy (60 tokens)
);

-- ── 3. use_care_item — extended from 2-way to 3-way (same function, same
--       signature; CREATE OR REPLACE preserves the existing REVOKE/GRANT
--       ACL from Wave 1 - Postgres keeps a function's privileges across a
--       REPLACE since the object identity by signature is unchanged. This
--       is verified live in Step 5 below, not just assumed.) ──────────────
CREATE OR REPLACE FUNCTION public.use_care_item(
  p_purchase_id uuid, p_pet_id uuid, p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller        uuid := auth.uid();
  v_purchase      shop_purchases%ROWTYPE;
  v_item          shop_items%ROWTYPE;
  v_pet           pets%ROWTYPE;
  v_effect_type   text;
  v_target_stat   text;
  v_effect_value  integer;
  v_current       integer;
  v_new_value     integer;
  v_bonus_awarded boolean := false;
  v_rows          integer;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_action NOT IN ('feed', 'care', 'play') THEN
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
  IF v_target_stat NOT IN ('hunger', 'cleanliness', 'happiness') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_stat');
  END IF;

  IF v_target_stat = 'hunger' THEN
    v_current := drifted_stat(v_pet.hunger, v_pet.hunger_updated_at);
  ELSIF v_target_stat = 'cleanliness' THEN
    v_current := drifted_stat(v_pet.cleanliness, v_pet.cleanliness_updated_at);
  ELSE
    v_current := drifted_stat(v_pet.happiness, v_pet.happiness_updated_at);
  END IF;
  v_new_value := LEAST(100, v_current + v_effect_value);

  -- Atomic guard against the check-then-act race on used_at (unchanged from
  -- Wave 1 - see that migration's comment for the concurrency-race
  -- rationale, live-verified via scripts/Test-CareAction.ps1).
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
  ELSIF v_target_stat = 'cleanliness' THEN
    UPDATE pets SET
      cleanliness = v_new_value, cleanliness_updated_at = now(),
      xp = xp + 2, last_clean_at = now()
    WHERE id = p_pet_id;
  ELSE
    UPDATE pets SET
      happiness = v_new_value, happiness_updated_at = now(),
      xp = xp + 3, last_play_at = now()
    WHERE id = p_pet_id;
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;
  IF v_pet.last_feed_at::date = CURRENT_DATE
     AND v_pet.last_clean_at::date = CURRENT_DATE
     AND v_pet.last_play_at::date = CURRENT_DATE
     AND v_pet.last_care_bonus_date IS DISTINCT FROM CURRENT_DATE THEN
    UPDATE pets SET xp = xp + 10, last_care_bonus_date = CURRENT_DATE
      WHERE id = p_pet_id;
    v_bonus_awarded := true;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'target_stat', v_target_stat,
    'new_value',   v_new_value,
    'xp_awarded',  (CASE WHEN v_target_stat = 'happiness' THEN 3 ELSE 2 END)
                   + (CASE WHEN v_bonus_awarded THEN 10 ELSE 0 END),
    'care_bonus',  v_bonus_awarded
  );
END;
$$;

COMMIT;
