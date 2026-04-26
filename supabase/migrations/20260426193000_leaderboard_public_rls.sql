BEGIN;

GRANT SELECT ON public.leaderboard TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_anon_leaderboard_read" ON public.users;
CREATE POLICY "users_anon_leaderboard_read"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

REVOKE ALL ON TABLE public.users FROM anon;
GRANT SELECT (id, full_name, avatar_url, broski_tokens) ON public.users TO anon;

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_xp_anon_leaderboard_read" ON public.user_xp;
CREATE POLICY "user_xp_anon_leaderboard_read"
  ON public.user_xp
  FOR SELECT
  TO anon
  USING (true);

REVOKE ALL ON TABLE public.user_xp FROM anon;
GRANT SELECT (user_id, total_xp, level, streak_days) ON public.user_xp TO anon;

ALTER TABLE public.hv_modules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hv_modules FROM anon;
GRANT SELECT (
  id,
  code,
  title,
  emoji,
  level,
  xp_reward,
  coin_reward,
  slug,
  summary,
  script_path,
  sort_order,
  status_script,
  status_video,
  status_podcast,
  created_at,
  updated_at
) ON public.hv_modules TO anon;

ALTER TABLE public.hv_quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hv_quizzes_read_anon" ON public.hv_quizzes;
CREATE POLICY "hv_quizzes_read_anon"
  ON public.hv_quizzes
  FOR SELECT
  TO anon
  USING (true);

REVOKE ALL ON TABLE public.hv_quizzes FROM anon;
GRANT SELECT (id, module_id, source, version, created_at, updated_at) ON public.hv_quizzes TO anon;

COMMIT;

