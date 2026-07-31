-- Migration: fix evolve_pet() reading the wrong XP pool
--
-- evolve_pet() (20260616000037) checks user_level_progress.xp — the Vibe
-- Labs leveling system (its own claim_level_reward RPC, levels 1-5),
-- entirely unrelated to the course-wide XP the Pets page HUD/XP bars
-- actually display (user_xp.total_xp, populated by quests/modules/streaks
-- via xp_events). user_level_progress has 0 rows in production, so
-- evolve_pet has been silently returning 'not_ready' for every real pet
-- regardless of actual course XP earned — the Evolve button has likely
-- never successfully evolved a pet.
--
-- Fix: read the same XP source the rest of the pets page already uses.
-- No other logic changes — stage_rank/xp_to_stage untouched, still only
-- advances forward, still SECURITY DEFINER for the same reason (caller
-- doesn't need SELECT on user_xp for this to work).
--
-- Idempotent — safe to re-run.

CREATE OR REPLACE FUNCTION evolve_pet(p_pet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller  uuid   := auth.uid();
  v_pet     pets%ROWTYPE;
  v_xp      integer;
  v_earned  text;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  SELECT COALESCE(total_xp, 0) INTO v_xp
  FROM user_xp WHERE user_id = v_caller;
  IF NOT FOUND THEN v_xp := 0; END IF;

  v_earned := xp_to_stage(v_xp);

  IF stage_rank(v_earned) <= stage_rank(v_pet.stage) THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'error',   'not_ready',
      'stage',   v_pet.stage,
      'earned',  v_earned,
      'xp',      v_xp
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
    'ok',             true,
    'stage',          v_earned,
    'evolution_count', v_pet.evolution_count + 1
  );
END;
$$;

-- Re-verify (grants are unaffected by CREATE OR REPLACE, restated for clarity)
REVOKE EXECUTE ON FUNCTION evolve_pet(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION evolve_pet(uuid) TO authenticated;
