# 🗄️ Skill: supabase-xp

XP tracking, BROski$ token rewards, and level-locking for Hyperfocus z0ne Vibe Labs.

> ⚠️ **Vite + Client-Side Only** — this repo is Vite + React, NOT Next.js.
> No `app/api/` routes. No `@/lib/supabase/server`.
> Reward logic = ONE atomic `SECURITY DEFINER` Postgres function, called from the
> client via `supabase.rpc()`. No Edge Function needed (no CORS, no JWT plumbing).
> Wire into the EXISTING `award_tokens()` + `token_transactions` ledger.
> **Never** create a parallel coin economy.

---

## Supabase Project

- Project ID: `yhtmuibgdnxhbgboajhc`
- Platform: [Supabase](https://supabase.com)
- Auth: Supabase Auth (email + magic link)
- Existing token fn: `award_tokens()` — `SECURITY DEFINER`, server-side only
- Existing ledger: `public.users.broski_tokens` + `token_transactions` (idempotency guards)

---

## Existing Schema (DO NOT DUPLICATE)

```sql
-- Already exists. Wire into this — never touch broski_tokens directly.
-- public.users        : broski_tokens int (balance)
-- token_transactions  : append-only ledger
-- award_tokens(...)   : SECURITY DEFINER — the ONLY way to grant BROski$
```

---

## New Table — user_level_progress

```sql
-- Tracks XP + badges + completed levels ONLY. Coins live in the canonical economy.
create table if not exists user_level_progress (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  completed_levels int[]  not null default '{}',
  xp               int    not null default 0,
  badges           text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table user_level_progress enable row level security;

-- Read-only to the owner. Writes happen ONLY via claim_level_reward() (definer).
create policy "Owner can read own progress"
  on user_level_progress for select
  using (auth.uid() = user_id);
```

---

## XP & BROski$ Values

| Level | XP Reward | BROski$ Reward | Badge |
|-------|-----------|----------------|-------|
| 1 — Claude Lab | +100 XP | +50 BROski$ | 🧠 Claude Lab Graduate |
| 2 — Google AI Studio | +150 XP | +75 BROski$ | 🚀 AI Studio Graduate |
| 3 — Trae IDE | +200 XP | +100 BROski$ | 🤖 Trae Agent Master |
| 4 — Comparisons | +250 XP | +125 BROski$ | ⚔️ Big AI Stack Master |
| 5 — Full Stack | +500 XP | +250 BROski$ | 🌟 Meta-Architect |

---

## The Atomic Reward Function — claim_level_reward

One transaction. Server-authoritative rewards. Server-side level lock.
Row lock kills the double-click double-award. If anything throws, the whole
thing — including the token award — rolls back.

```sql
-- supabase/migrations/2026XXXX_claim_level_reward.sql
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

  -- Server-authoritative reward table — client value is never trusted
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
    return jsonb_build_object('error', 'invalid level');
  end if;

  -- Ensure a row exists, then lock it for this transaction
  insert into user_level_progress (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select completed_levels into v_completed
  from user_level_progress
  where user_id = v_user
  for update;                      -- 🔒 blocks the concurrent double-claim

  -- Idempotency: already claimed?
  if v_completed @> array[p_level] then
    return jsonb_build_object('error', 'already_claimed');
  end if;

  -- 🔓 Server-side level lock — previous level must be done (L1 is free)
  if p_level > 1 and not (v_completed @> array[p_level - 1]) then
    return jsonb_build_object('error', 'locked');
  end if;

  -- Apply XP + badge + completion
  update user_level_progress
  set xp               = xp + v_xp,
      badges           = array_append(badges, v_badge),
      completed_levels = array_append(completed_levels, p_level),
      updated_at       = now()
  where user_id = v_user;

  -- BROski$ via the ONE economy — same txn, rolls back with everything else
  -- ⚠️ Confirm award_tokens() signature in your DB and match it here.
  --    Positional shown; repo may use named args (p_user_id, p_amount, p_reason).
  perform award_tokens(
    v_user,
    v_coins,
    format('Level %s complete: %s', p_level, v_badge)
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

-- Only logged-in users can call it; it acts only on auth.uid()
revoke all on function public.claim_level_reward(int) from public;
grant execute on function public.claim_level_reward(int) to authenticated;
```

> ⚠️ **Before deploy:** run `\df+ award_tokens` (or check the existing
> migrations) and align the `perform award_tokens(...)` call to the real
> signature. Wrong arg names = silent reward failure.

---

## Vite Client — call the RPC directly

No `fetch`, no Edge Function URL, no manual `Authorization` header.
`supabase-js` attaches the session JWT automatically.

```ts
// src/lib/claimReward.ts
import { supabase } from './supabaseClient'

type ClaimResult =
  | { success: true; level: number; xp: number; coins: number; badge: string }
  | { error: 'unauthorized' | 'invalid_level' | 'already_claimed' | 'locked' }

export async function claimLevelReward(level: number): Promise<ClaimResult> {
  const { data, error } = await supabase.rpc('claim_level_reward', {
    p_level: level,
  })
  if (error) throw error
  return data as ClaimResult
}
```

---

## React Hook — useProgress

```ts
// src/hooks/useProgress.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { claimLevelReward } from '../lib/claimReward'

type Progress = {
  xp: number
  badges: string[]
  completed_levels: number[]
} | null

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return setLoading(false)
      supabase
        .from('user_level_progress')
        .select('xp, badges, completed_levels')
        .eq('user_id', user.id)
        .maybeSingle()                 // no row yet on first visit = null, not error
        .then(({ data }) => {
          setProgress(data)
          setLoading(false)
        })
    })
  }, [])

  const claimReward = async (level: number) => {
    const result = await claimLevelReward(level)
    if ('success' in result) {
      setProgress((prev) => ({
        xp:               (prev?.xp ?? 0) + result.xp,
        badges:           [...(prev?.badges ?? []), result.badge],
        completed_levels: [...(prev?.completed_levels ?? []), level],
      }))
    }
    return result
  }

  return { progress, loading, claimReward }
}
```

---

## Level Locking Logic (UI gate — server enforces it too)

```ts
// Level 1 always unlocked. Each level needs the previous one claimed.
// This is for showing 🔒 in the UI. The RPC enforces the same rule
// server-side, so a forged request still gets { error: 'locked' }.
export function isLevelUnlocked(
  level: number,
  completedLevels: number[],
): boolean {
  if (level === 1) return true
  return completedLevels.includes(level - 1)
}
```

---

## Why this is safe (the 3 bugs it kills)

| Old bug | Fix |
|---|---|
| 💸 Double-click → tokens awarded twice | `select ... for update` row lock + single txn |
| 🔓 `POST {level:5}` skips levels 1–4 | Server-side `completed_levels @> array[p_level-1]` check |
| 🚫 Edge Fn CORS / JWT plumbing breaks in browser | No Edge Fn — `supabase.rpc()` with auto-attached session |

Bonus: reward values are server-authoritative (client can't ask for 9999 XP),
and the token award shares the transaction — partial state is impossible.

---

*Part of the Hyperfocus z0ne ecosystem. Vite + atomic Supabase RPC. Wires into award_tokens(). Built by @welshDog ♾️*
