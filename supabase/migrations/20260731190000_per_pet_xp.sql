-- Migration: per-pet XP
--
-- Gives each pet its own XP counter instead of every pet a user owns
-- sharing one account-wide progress bar. A trigger on user_xp fans every
-- XP increase out to all of that user's pets, and evolve_pet() is updated
-- to gate evolution on the pet's own XP instead of the account total —
-- necessary once pets can diverge, or a newly-minted (lower-XP) pet could
-- leapfrog evolution using XP it hasn't itself earned.
--
-- Full design rationale: docs/superpowers/specs/2026-07-31-per-pet-xp-design.md
--
-- Idempotent — safe to re-run.

ALTER TABLE pets ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pets_xp_non_negative'
      AND conrelid = 'public.pets'::regclass
  ) THEN
    ALTER TABLE pets ADD CONSTRAINT pets_xp_non_negative CHECK (xp >= 0);
  END IF;
END;
$$;

-- ── Fan-out trigger ──────────────────────────────────────────────────────
-- Fires whenever user_xp.total_xp is inserted or increases, and adds the
-- same delta to every pet that user owns. Positive-only guard means
-- decreases (corrections, bugs) never claw XP back out of pets.

CREATE OR REPLACE FUNCTION fan_out_pet_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delta integer;
BEGIN
  v_delta := NEW.total_xp - COALESCE(OLD.total_xp, 0);
  IF v_delta > 0 THEN
    UPDATE pets SET xp = xp + v_delta WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fan_out_pet_xp ON user_xp;

CREATE TRIGGER trg_fan_out_pet_xp
  AFTER INSERT OR UPDATE OF total_xp ON user_xp
  FOR EACH ROW EXECUTE FUNCTION fan_out_pet_xp();

-- ── evolve_pet v2 — reads pets.xp instead of user_xp.total_xp ───────────
-- Same signature, same forward-only guarantee, same grants. v_pet.xp is
-- already in scope from the existing SELECT * INTO v_pet — no new query.

CREATE OR REPLACE FUNCTION evolve_pet(p_pet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller  uuid   := auth.uid();
  v_pet     pets%ROWTYPE;
  v_earned  text;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  v_earned := xp_to_stage(v_pet.xp);

  IF stage_rank(v_earned) <= stage_rank(v_pet.stage) THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'error',   'not_ready',
      'stage',   v_pet.stage,
      'earned',  v_earned,
      'xp',      v_pet.xp
    );
  END IF;

  UPDATE pets
  SET
    stage           = v_earned,
    evolution_count = evolution_count + 1,
    last_evolved_at = now(),
    mood            = 'idle'
  WHERE id = p_pet_id AND user_id = v_caller;

  RETURN jsonb_build_object(
    'ok',              true,
    'stage',           v_earned,
    'evolution_count', v_pet.evolution_count + 1
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION evolve_pet(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION evolve_pet(uuid) TO authenticated;

-- ── Restrict fan_out_pet_xp to trigger-only execution ──────────────────────
-- This function is a trigger and should never be called directly by users.
-- All three REVOKEs are needed — Supabase grants EXECUTE to `anon` and
-- `authenticated` independently of PUBLIC on function creation, so revoking
-- from PUBLIC alone leaves both roles still able to call it directly.
REVOKE EXECUTE ON FUNCTION fan_out_pet_xp() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION fan_out_pet_xp() FROM anon;
REVOKE EXECUTE ON FUNCTION fan_out_pet_xp() FROM authenticated;
