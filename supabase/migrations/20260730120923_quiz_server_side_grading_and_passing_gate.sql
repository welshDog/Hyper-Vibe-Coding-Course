-- 1. New quiz-fetch RPC: strips answer_index so the browser never receives correct
--    answers before grading. Replaces direct table reads.
create or replace function public.get_quiz_for_module(p_module_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_payload jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required to load a quiz.';
  end if;

  select payload into v_payload
  from public.hv_quizzes
  where module_id = p_module_id
  order by version desc
  limit 1;

  if v_payload is null then
    return null;
  end if;

  return jsonb_build_object(
    'module_code', v_payload->'module_code',
    'title', v_payload->'title',
    'questions', coalesce(
      (select jsonb_agg(q.value - 'answer_index' order by q.ordinality)
       from jsonb_array_elements(v_payload->'questions') with ordinality as q(value, ordinality)),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_quiz_for_module(uuid) from public;
grant execute on function public.get_quiz_for_module(uuid) to authenticated, service_role;

-- 2. hv_quizzes: no more direct table reads. hv_quizzes_read_anon exposed every
--    quiz's answer key to fully logged-out requests; hv_quizzes_read let any
--    signed-in user pull answer_index straight from the network response before
--    answering. All access now goes through get_quiz_for_module(), which strips
--    answers. Also drop authenticated's stray write grants (no legitimate
--    authenticated-user write path exists for quiz content).
drop policy if exists hv_quizzes_read on public.hv_quizzes;
drop policy if exists hv_quizzes_read_anon on public.hv_quizzes;
revoke insert, update, delete, truncate on public.hv_quizzes from authenticated;

-- 3. complete_module: old signature trusted a client-computed quiz_score and
--    awarded full reward regardless of its value (UI advertised "Passing score:
--    70%" but nothing ever enforced it). Drop the old signature so the
--    score-trusting entry point can't be called in parallel with the new one.
drop function if exists public.complete_module(uuid, integer);

create or replace function public.complete_module(p_module_id uuid, p_answers jsonb default '{}'::jsonb)
returns json
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_module record;
  v_already_completed boolean;
  v_xp int;
  v_coins int;
  v_quiz_payload jsonb;
  v_total int := 0;
  v_correct int := 0;
  v_percent int := 100;
  v_q jsonb;
  v_qid text;
  v_correct_idx int;
  v_given_idx int;
begin
  if v_user_id is null then
    raise exception 'Authentication required to complete a module.';
  end if;

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

  select payload into v_quiz_payload
  from public.hv_quizzes
  where module_id = p_module_id
  order by version desc
  limit 1;

  if v_quiz_payload is not null then
    for v_q in select * from jsonb_array_elements(v_quiz_payload->'questions')
    loop
      v_correct_idx := nullif(v_q->>'answer_index', '')::int;
      if v_correct_idx is not null then
        v_total := v_total + 1;
        v_qid := v_q->>'id';
        v_given_idx := nullif(p_answers->>v_qid, '')::int;
        if v_given_idx is not null and v_given_idx = v_correct_idx then
          v_correct := v_correct + 1;
        end if;
      end if;
    end loop;

    if v_total > 0 then
      v_percent := round((v_correct::numeric / v_total::numeric) * 100);
    end if;
  end if;

  if v_percent < 70 then
    return json_build_object('status', 'failed_quiz', 'xp', 0, 'coins', 0, 'quiz_score', v_percent);
  end if;

  v_xp := coalesce(v_module.xp_reward, 0);
  v_coins := coalesce(v_module.coin_reward, 0);

  insert into public.module_completions
    (user_id, module_id, quiz_score, xp_awarded, coins_awarded)
  values
    (v_user_id, p_module_id, v_percent, v_xp, v_coins);

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
    'quiz_score', v_percent
  );
end;
$function$;

revoke all on function public.complete_module(uuid, jsonb) from public;
grant execute on function public.complete_module(uuid, jsonb) to authenticated, service_role;
