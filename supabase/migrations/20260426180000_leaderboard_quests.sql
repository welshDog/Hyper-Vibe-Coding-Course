-- ============================================================
-- Migration: 20260426180000_leaderboard_quests
-- Leaderboard public view + quests + user_quests tables
-- ============================================================

-- 1. Public profiles view (safe leaderboard surface)
-- Exposes only display_name + avatar_url — never email/id directly
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT
  u.id          AS user_id,
  u.display_name,
  u.avatar_url
FROM public.users u;

-- 2. Leaderboard view — joins user_xp with public_profiles
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = on) AS
SELECT
  pp.display_name,
  pp.avatar_url,
  ux.total_xp,
  ux.level,
  ux.streak_days,
  ux.tokens,
  ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) AS rank
FROM public.user_xp ux
JOIN public.public_profiles pp ON pp.user_id = ux.user_id
ORDER BY ux.total_xp DESC
LIMIT 50;

-- 3. RLS: allow anyone (incl. anon) to SELECT from leaderboard view
ALTER VIEW public.leaderboard OWNER TO postgres;
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4. Admin INSERT/UPDATE on rifts (only role = 'admin')
CREATE POLICY "admin_write_rifts"
  ON public.rifts
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Keep existing public SELECT on rifts (set in previous migration)

-- 5. Quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  xp_reward    integer NOT NULL DEFAULT 100,
  token_reward integer NOT NULL DEFAULT 0,
  quest_type   text NOT NULL DEFAULT 'manual', -- 'manual' | 'auto' | 'streak'
  course_id    text,
  is_active    boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 6. User quests (completion tracking)
CREATE TABLE IF NOT EXISTS public.user_quests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id     uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_active ON public.quests(is_active);

-- 7. RLS on quests + user_quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quests_public_read"
  ON public.quests FOR SELECT
  USING (is_active = true);

CREATE POLICY "user_quests_own_read"
  ON public.user_quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_quests_own_insert"
  ON public.user_quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. Atomic RPC: complete_quest
-- Awards XP + tokens + inserts xp_event atomically
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_quest quests%ROWTYPE;
  v_already_done boolean;
  v_rift_mult float := 1.0;
  v_active_rift rifts%ROWTYPE;
  v_final_xp integer;
BEGIN
  -- Check quest exists and is active
  SELECT * INTO v_quest FROM quests WHERE id = p_quest_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not found or inactive');
  END IF;

  -- Check not already completed
  SELECT EXISTS(
    SELECT 1 FROM user_quests WHERE user_id = v_user_id AND quest_id = p_quest_id
  ) INTO v_already_done;
  IF v_already_done THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest already completed');
  END IF;

  -- Check for active rift multiplier
  SELECT * INTO v_active_rift
  FROM rifts
  WHERE expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  IF FOUND THEN v_rift_mult := v_active_rift.multiplier; END IF;

  v_final_xp := FLOOR(v_quest.xp_reward * v_rift_mult);

  -- Insert completion
  INSERT INTO user_quests (user_id, quest_id) VALUES (v_user_id, p_quest_id);

  -- Log XP event
  INSERT INTO xp_events (user_id, event_type, amount, rift_multiplier, quest_id)
  VALUES (v_user_id::text, 'quest_complete', v_final_xp, v_rift_mult, p_quest_id::text);

  -- Upsert user_xp
  INSERT INTO user_xp (user_id, total_xp, tokens)
  VALUES (v_user_id::text, v_final_xp, v_quest.token_reward)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_xp.total_xp + v_final_xp,
    tokens   = user_xp.tokens + v_quest.token_reward,
    level    = GREATEST(1, FLOOR((user_xp.total_xp + v_final_xp) / 500) + 1),
    last_active = now();

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_final_xp,
    'tokens_awarded', v_quest.token_reward,
    'rift_multiplier', v_rift_mult
  );
END;
$$;

-- 9. Seed example quests
INSERT INTO public.quests (title, description, xp_reward, token_reward, quest_type, sort_order) VALUES
  ('First Lesson', 'Watch your first lesson video', 50, 0, 'auto', 1),
  ('Code Starter', 'Submit your first code snippet', 25, 10, 'auto', 2),
  ('Quiz Master', 'Score 100% on any quiz', 100, 25, 'auto', 3),
  ('5-Day Streak', 'Log in 5 days in a row', 150, 50, 'streak', 4),
  ('Course Complete', 'Complete your first full course', 500, 100, 'auto', 5),
  ('Rift Rider', 'Submit code during an active Rift', 75, 15, 'auto', 6),
  ('Hyper Vibe Intro', 'Finish Module 1.1', 100, 20, 'auto', 7)
ON CONFLICT DO NOTHING;
