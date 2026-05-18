-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000035: vibe-labs level rewards (claim_level_reward)
--
-- Why:
--   The Vibe Labs path (5 levels) needs to award XP + a badge + BROski$ when a
--   learner completes a level. The supabase-xp skill originally shipped this as
--   an Edge Function doing check-then-act: read completed_levels → award_tokens
--   → upsert. That has three holes:
--     1. Double-click = tokens awarded twice (no lock, not idempotent).
--     2. No server-side level lock — a forged POST {level:5} skips levels 1-4.
--     3. Browser CORS / manual JWT plumbing on the Edge Fn.
--
-- Change:
--   1. user_level_progress — per-user XP, badges, completed_levels. RLS:
--      owner SELECT only; all writes go through the definer function below.
--   2. claim_level_reward(p_level int) — ONE atomic SECURITY DEFINER function:
--      - acts only on auth.uid() (un-spoofable; client value never trusted)
--      - server-authoritative reward table (client can't ask for 9999 XP)
--      - SELECT ... FOR UPDATE row lock → kills the double-claim race
--      - server-side level lock: level N needs N-1 already completed (L1 free)
--      - awards BROski$ via the EXISTING award_tokens() in the SAME txn, so a
--        failure rolls the whole thing back — no partial state, no orphan coins.
--   3. Grants: execute to `authenticated` only; revoked from public.
--
-- The frontend calls this directly: supabase.rpc('claim_level_reward',{p_level})
-- No Edge Function, no CORS, no manual Authorization header.
--
-- Idempotent — IF NOT EXISTS / DROP POLICY IF EXISTS / CREATE OR REPLACE.
-- Requires: auth.users, award_tokens() (canonical BROski$ economy).
--
-- award_tokens() VERIFIED (project yhtmuibgdnxhbgboajhc, 2026-05-19):
--   award_tokens(p_user_id uuid, p_amount int, p_reason text,
--                p_stripe_payment_intent_id text DEFAULT NULL,
--                p_source_id text DEFAULT NULL) RETURNS jsonb, SECURITY DEFINER.
--   It INSERTs token_transactions ON CONFLICT DO NOTHING. Ledger dedup is a
--   PARTIAL unique index (user_id, reason, source_id) WHERE source_id IS NOT
--   NULL (idx_token_transactions_dedup). We pass a stable p_source_id so the
--   ledger ALSO rejects a duplicate award — defense in depth on the row lock.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Progress table ──────────────────────────────────────────────────────
create table if not exists public.user_level_progress (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  completed_levels int[]  not null default '{}',
  xp               int    not null default 0,
  badges           text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.user_level_progress enable row level security;

-- Owner can read their own row. Writes happen ONLY via the definer fn below.
drop policy if exists "Owner can read own progress" on public.user_level_progress;
create policy "Owner can read own progress"
  on public.user_level_progress for select
  using (auth.uid() = user_id);

-- ── 2. Atomic claim function ───────────────────────────────────────────────
create or replace function public.claim_level_reward(p_level int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_xp        int;
  v_coins     int;
  v_badge     text;
  v_completed int[];
begin
  if v_user is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  -- Server-authoritative reward table — client p_level is only an index
  select r.xp, r.coins, r.badge into v_xp, v_coins, v_badge
  from (values
    (1, 100,  50, '🧠 Claude Lab Graduate'),
    (2, 150,  75, '🚀 AI Studio Graduate'),
    (3, 200, 100, '🤖 Trae Agent Master'),
    (4, 250, 125, '⚔️ Big AI Stack Master'),
    (5, 500, 250, '🌟 Meta-Architect')
  ) as r(lvl, xp, coins, badge)
  where r.lvl = p_level;

  if v_xp is null then
    return jsonb_build_object('error', 'invalid_level');
  end if;

  -- Ensure a row exists, then lock it for the rest of this transaction
  insert into public.user_level_progress (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select completed_levels into v_completed
  from public.user_level_progress
  where user_id = v_user
  for update;                      -- 🔒 serialises concurrent claims

  -- Idempotency: already claimed this level?
  if v_completed @> array[p_level] then
    return jsonb_build_object('error', 'already_claimed');
  end if;

  -- 🔓 Server-side level lock: previous level must be done (L1 is free)
  if p_level > 1 and not (v_completed @> array[p_level - 1]) then
    return jsonb_build_object('error', 'locked');
  end if;

  -- Apply XP + badge + completion
  update public.user_level_progress
  set xp               = xp + v_xp,
      badges           = array_append(badges, v_badge),
      completed_levels = array_append(completed_levels, p_level),
      updated_at       = now()
  where user_id = v_user;

  -- BROski$ via the ONE economy — same txn, rolls back with everything else.
  -- Named args + stable p_source_id → idx_token_transactions_dedup backstops
  -- the row lock above (ledger refuses a second 'vibe-level-N' for this user).
  perform award_tokens(
    p_user_id   => v_user,
    p_amount    => v_coins,
    p_reason    => format('Level %s complete: %s', p_level, v_badge),
    p_source_id => format('vibe-level-%s', p_level)
  );

  return jsonb_build_object(
    'success', true,
    'level',   p_level,
    'xp',      v_xp,
    'coins',   v_coins,
    'badge',   v_badge
  );
end;
$$;

-- ── 3. Grants ──────────────────────────────────────────────────────────────
revoke all on function public.claim_level_reward(int) from public;
grant execute on function public.claim_level_reward(int) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Rollback (manual):
--   drop function if exists public.claim_level_reward(int);
--   drop table if exists public.user_level_progress;
-- ═══════════════════════════════════════════════════════════════════════════
