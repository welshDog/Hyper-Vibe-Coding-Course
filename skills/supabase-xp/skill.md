# 🗄️ Skill: supabase-xp

Supabase XP tracking, BROski$ token rewards, and level-locking for Hyperfocus z0ne Vibe Labs.

---

## Supabase Project

- Project ID: `yhtmuibgdnxhbgboajhc`
- Platform: [Supabase](https://supabase.com)
- Auth: Supabase Auth (email + magic link)

---

## Database Schema

```sql
-- User progress table
CREATE TABLE user_progress (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  level        int NOT NULL DEFAULT 1,         -- 1-5
  xp           int NOT NULL DEFAULT 0,
  broski_coins int NOT NULL DEFAULT 0,
  badges       text[] DEFAULT '{}',
  completed_levels int[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own progress"
  ON user_progress FOR ALL
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

## API Routes (Next.js)

### Claim Level Reward
```ts
// app/api/claim-reward/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { level } = await req.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rewards = {
    1: { xp: 100, coins: 50,  badge: '🧠 Claude Lab Graduate' },
    2: { xp: 150, coins: 75,  badge: '🚀 AI Studio Graduate' },
    3: { xp: 200, coins: 100, badge: '🤖 Trae Agent Master' },
    4: { xp: 250, coins: 125, badge: '⚔️ Big AI Stack Master' },
    5: { xp: 500, coins: 250, badge: '🌟 Meta-Architect' },
  }

  const reward = rewards[level as keyof typeof rewards]
  if (!reward) return Response.json({ error: 'Invalid level' }, { status: 400 })

  const { error } = await supabase.rpc('claim_level_reward', {
    p_user_id: user.id,
    p_level: level,
    p_xp: reward.xp,
    p_coins: reward.coins,
    p_badge: reward.badge,
  })

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ success: true, reward })
}
```

### Get User Progress
```ts
// app/api/progress/route.ts
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return Response.json(data)
}
```

---

## Level Locking Logic

```ts
// A level is unlocked if the previous level is in completed_levels[]
function isLevelUnlocked(level: number, completedLevels: number[]): boolean {
  if (level === 1) return true  // Level 1 always unlocked
  return completedLevels.includes(level - 1)
}
```

---

## React Hook

```ts
// hooks/useProgress.ts
import { useEffect, useState } from 'react'

export function useProgress() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(data => { setProgress(data); setLoading(false) })
  }, [])

  const claimReward = async (level: number) => {
    const res = await fetch('/api/claim-reward', {
      method: 'POST',
      body: JSON.stringify({ level }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (data.success) setProgress(prev => ({
      ...prev,
      xp: prev.xp + data.reward.xp,
      broski_coins: prev.broski_coins + data.reward.coins,
      completed_levels: [...prev.completed_levels, level]
    }))
    return data
  }

  return { progress, loading, claimReward }
}
```

---

*Part of the Hyperfocus z0ne ecosystem. Supabase project: yhtmuibgdnxhbgboajhc. Built by @welshDog ♾️*
