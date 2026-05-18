# 🗄️ Skill: supabase-xp

XP tracking, BROski$ token rewards, and level-locking for Hyperfocus z0ne Vibe Labs.

> ⚠️ **Vite + Client-Side Only** — this repo is Vite + React, NOT Next.js.
> No app/api/ routes. No @/lib/supabase/server.
> Use Supabase Edge Functions (supabase/functions/) or direct client RPC.
> Wire into EXISTING award_tokens() + token_transactions ledger. Do NOT create a parallel economy.

---

## Supabase Project

- Project ID: `yhtmuibgdnxhbgboajhc`
- Platform: [Supabase](https://supabase.com)
- Auth: Supabase Auth (email + magic link)
- Existing token function: `award_tokens()` (SECURITY DEFINER — use this, don't replace it)
- Existing ledger: `public.users.broski_tokens` + `token_transactions`

---

## Existing Schema (DO NOT DUPLICATE)

```sql
-- Already exists. Wire into this.
-- public.users has: broski_tokens int
-- token_transactions has: user_id, amount, reason, created_at
-- award_tokens(user_id, amount, reason) is SECURITY DEFINER
-- USE award_tokens(). Never update broski_tokens directly.
```

---

## New Table — user_level_progress

```sql
-- Only tracks level completion + XP. Coins go through award_tokens().
CREATE TABLE user_level_progress (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_levels int[] DEFAULT '{}',
  xp               int  NOT NULL DEFAULT 0,
  badges           text[] DEFAULT '{}',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their progress"
  ON user_level_progress FOR ALL
  USING (auth.uid() = user_id);
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

## Supabase Edge Function — claim-level-reward

```ts
// supabase/functions/claim-level-reward/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const rewards: Record<number, { xp: number; coins: number; badge: string }> = {
  1: { xp: 100, coins: 50,  badge: '🧠 Claude Lab Graduate' },
  2: { xp: 150, coins: 75,  badge: '🚀 AI Studio Graduate' },
  3: { xp: 200, coins: 100, badge: '🤖 Trae Agent Master' },
  4: { xp: 250, coins: 125, badge: '⚔️ Big AI Stack Master' },
  5: { xp: 500, coins: 250, badge: '🌟 Meta-Architect' },
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // Verify JWT + get user
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { level } = await req.json()
  const reward = rewards[level]
  if (!reward) return new Response(JSON.stringify({ error: 'Invalid level' }), { status: 400 })

  // Check not already claimed
  const { data: progress } = await supabase
    .from('user_level_progress')
    .select('completed_levels')
    .eq('user_id', user.id)
    .single()

  if (progress?.completed_levels?.includes(level)) {
    return new Response(JSON.stringify({ error: 'Already claimed' }), { status: 409 })
  }

  // Award BROski$ via existing award_tokens() — DO NOT bypass this
  await supabase.rpc('award_tokens', {
    p_user_id: user.id,
    p_amount: reward.coins,
    p_reason: `Level ${level} complete: ${reward.badge}`,
  })

  // Upsert XP + badges + completed level
  await supabase.from('user_level_progress').upsert({
    user_id: user.id,
    xp: (progress?.xp ?? 0) + reward.xp,
    badges: [...(progress?.badges ?? []), reward.badge],
    completed_levels: [...(progress?.completed_levels ?? []), level],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return new Response(JSON.stringify({ success: true, reward }), { status: 200 })
})
```

---

## Vite Client — calling the Edge Function

```ts
// src/lib/claimReward.ts
import { supabase } from './supabaseClient'

export async function claimLevelReward(level: number) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not logged in')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim-level-reward`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ level }),
    }
  )
  return res.json()
}
```

---

## React Hook — useProgress

```ts
// src/hooks/useProgress.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { claimLevelReward } from '../lib/claimReward'

export function useProgress() {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return setLoading(false)
      supabase
        .from('user_level_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setProgress(data)
          setLoading(false)
        })
    })
  }, [])

  const claimReward = async (level: number) => {
    const data = await claimLevelReward(level)
    if (data.success) {
      setProgress((prev: any) => ({
        ...prev,
        xp: (prev?.xp ?? 0) + data.reward.xp,
        completed_levels: [...(prev?.completed_levels ?? []), level],
        badges: [...(prev?.badges ?? []), data.reward.badge],
      }))
    }
    return data
  }

  return { progress, loading, claimReward }
}
```

---

## Level Locking Logic

```ts
// Level 1 always unlocked. Each level needs the previous one claimed.
export function isLevelUnlocked(
  level: number,
  completedLevels: number[]
): boolean {
  if (level === 1) return true
  return completedLevels.includes(level - 1)
}
```

---

*Part of the Hyperfocus z0ne ecosystem. Vite + Supabase Edge Functions. Wires into award_tokens(). Built by @welshDog ♾️*
