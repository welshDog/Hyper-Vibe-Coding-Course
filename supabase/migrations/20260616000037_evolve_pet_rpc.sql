-- Migration: evolve_pet RPC
--
-- Lets an authenticated user evolve their pet to the stage their XP has
-- unlocked. Only advances forward — can never demote a pet.
--
-- Helper functions are IMMUTABLE so Postgres can inline them.
-- evolve_pet is SECURITY DEFINER so it can read user_level_progress
-- without requiring the caller to have SELECT on that table.

CREATE OR REPLACE FUNCTION stage_rank(s text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
  SELECT CASE s
    WHEN 'baby'           THEN 0
    WHEN 'learner'        THEN 1
    WHEN 'builder'        THEN 2
    WHEN 'shipper'        THEN 3
    WHEN 'hyperfocus_god' THEN 4
    WHEN 'legend'         THEN 5
    ELSE -1
  END;
$$;

CREATE OR REPLACE FUNCTION xp_to_stage(p_xp integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
  SELECT CASE
    WHEN p_xp >= 10000 THEN 'legend'
    WHEN p_xp >= 5000  THEN 'hyperfocus_god'
    WHEN p_xp >= 3000  THEN 'shipper'
    WHEN p_xp >= 1500  THEN 'builder'
    WHEN p_xp >= 500   THEN 'learner'
    ELSE 'baby'
  END;
$$;

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

  SELECT COALESCE(xp, 0) INTO v_xp
  FROM user_level_progress WHERE user_id = v_caller;
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

REVOKE EXECUTE ON FUNCTION evolve_pet(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION evolve_pet(uuid) TO authenticated;
