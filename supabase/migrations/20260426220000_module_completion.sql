create table if not exists public.module_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id uuid references public.hv_modules(id) on delete cascade not null,
  completed_at timestamptz default now(),
  quiz_score int,
  xp_awarded int default 0,
  coins_awarded int default 0,
  unique(user_id, module_id)
);

alter table public.module_completions enable row level security;

create policy "users_own_completions"
  on public.module_completions
  for all
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.complete_module(
  p_module_id uuid,
  p_quiz_score int default null
)
returns json
language plpgsql security definer
set search_path to public, auth
as $$
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

  return json_build_object(
    'status', 'completed',
    'xp', v_xp,
    'coins', v_coins,
    'quiz_score', p_quiz_score
  );
end;
$$;

revoke all on function public.complete_module(uuid, int) from public;
grant execute on function public.complete_module(uuid, int) to authenticated;
