-- Fix: /pets "Recent activity" always shows the empty placeholder even after
-- a real module completion. The XpFeed component reads public.xp_events (see
-- frontend/src/hooks/useXpEvents.ts + components/pets/XpFeed.tsx), which
-- already has a ready-to-render 'module_complete' event mapping ("📚 Module
-- complete") -- but complete_module() never inserted a row there. It only
-- ever wrote module_completions, user_xp, and users.broski_tokens, so the
-- cause->effect dopamine loop XpFeed exists for never fired for course
-- modules, only for quest_complete (which does log to xp_events, in
-- 20260426180000_leaderboard_quests.sql).
--
-- Fix: log an xp_events row alongside the existing writes. `amount` holds
-- v_coins (BROski$), matching what EventRow actually renders next to the
-- event label ("+{amount} BROski$"). No FK exists on course_id/quest_id, and
-- rift_multiplier defaults to 1.0 -- plain module rewards aren't rift-boosted,
-- so both are left at their defaults.
--
-- CREATE OR REPLACE keeps the function's OID, so the EXECUTE grant from
-- 20260724231130_grant_complete_module_execute.sql is preserved unchanged.
--
-- Confirmed live 2026-07-25, tlavrxiaegbtyfmjfdcz.
CREATE OR REPLACE FUNCTION public.complete_module(p_module_id uuid, p_quiz_score integer DEFAULT NULL::integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_module record;
  v_already_completed boolean;
  v_xp int;
  v_coins int;
begin
  select xp_reward, coin_reward into v_module
  from public.hv_modules where id = p_module_id;
  if not found then
    return json_build_object('status', 'not_found', 'xp', 0, 'coins', 0);
  end if;
  select exists(
    select 1 from public.module_completions
    where user_id = v_user_id and module_id = p_module_id
  ) into v_already_completed;
  if v_already_completed then
    return json_build_object('status', 'already_completed', 'xp', 0, 'coins', 0);
  end if;
  v_xp := coalesce(v_module.xp_reward, 0);
  v_coins := coalesce(v_module.coin_reward, 0);
  insert into public.module_completions
    (user_id, module_id, quiz_score, xp_awarded, coins_awarded)
  values
    (v_user_id, p_module_id, p_quiz_score, v_xp, v_coins);
  insert into public.user_xp (user_id, total_xp, level, streak_days, last_active)
  values (v_user_id, v_xp, 1, 0, now())
  on conflict (user_id) do update
    set total_xp = user_xp.total_xp + v_xp,
        last_active = now(),
        level = case
          when user_xp.total_xp + v_xp >= 2000 then 6
          when user_xp.total_xp + v_xp >= 1000 then 5
          when user_xp.total_xp + v_xp >= 500  then 4
          when user_xp.total_xp + v_xp >= 250  then 3
          when user_xp.total_xp + v_xp >= 100  then 2
          else 1 end;
  update public.users
  set broski_tokens = broski_tokens + v_coins
  where id = v_user_id;
  insert into public.xp_events (user_id, event_type, amount)
  values (v_user_id, 'module_complete', v_coins);
  return json_build_object(
    'status', 'completed',
    'xp', v_xp,
    'coins', v_coins,
    'quiz_score', p_quiz_score
  );
end;
$function$;
