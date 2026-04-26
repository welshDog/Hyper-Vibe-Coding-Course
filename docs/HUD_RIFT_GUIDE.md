# ⚡ Live HUD + Rift Events — Build Guide

> The dopamine engine for Hyper Vibe Coding Courses.

---

## 🎮 What's in This Drop

| File | What it does |
|------|--------------|
| `frontend/src/components/HUD.tsx` | Sticky top bar — XP bar, tokens, streak |
| `frontend/src/components/XPToast.tsx` | Animated +XP popup on code submit |
| `frontend/src/components/RiftBanner.tsx` | Live rift event banner with countdown |
| `frontend/src/context/HUDContext.tsx` | Global HUD state provider |
| `frontend/src/hooks/useHUD.ts` | Hook to read HUD state anywhere |
| `frontend/src/hooks/useRift.ts` | Hook that polls the `public.rifts` table for an active rift |
| `supabase/migrations/20260426162000_xp_rifts_gamification.sql` | Supabase schema for `user_xp`, `xp_events`, `rifts` |

---

## 🚀 Quick Start

### 1. Wrap your app with HUDProvider

```tsx
// main.tsx or App.tsx
import { HUDProvider } from './context/HUDContext';
import { HUD } from './components/HUD';

function App() {
  return (
    <HUDProvider userId={currentUser?.id}>
      <HUD />
      {/* rest of your app */}
    </HUDProvider>
  );
}
```

### 2. Award XP when student submits code

```tsx
import { useHUD } from '../hooks/useHUD';
import { supabase } from '../lib/supabase';

function CodeEditor() {
  const { awardXP } = useHUD();

  const handleSubmit = async () => {
    // run their code...
    const amount = 25;
    awardXP(amount);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase.from('xp_events').insert({
      user_id: user.id,
      event_type: 'code_submit',
      amount,
    });

    const { data: xpRow } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', user.id)
      .maybeSingle();

    const total = (xpRow?.total_xp ?? 0) + amount;
    await supabase.from('user_xp').upsert({ user_id: user.id, total_xp: total });
  };
}
```

### 3. Fire a Rift (admin / ops)

Create a row in `public.rifts` (e.g. via Supabase SQL editor or an admin tool):

```sql
insert into public.rifts (topic, multiplier, expires_at, description)
values ('async/await', 2.0, now() + interval '45 minutes', 'Double XP for async/await drills');
```

The purple banner appears for everyone as `useRift()` polls and detects an active, unexpired rift.

---

## 🔌 Notes
- `awardXP()` is a UI affordance (instant feedback). Persisting XP requires writing to Supabase (`xp_events` and `user_xp`).
- `rifts` are public-readable, so the banner can render for anonymous users too.

---

## 📅 7-Day Roadmap Status

- [x] **Day 1** — HUD component + XP endpoints (THIS DROP)
- [x] **Day 1** — Rift system prototype (THIS DROP)
- [ ] **Day 2** — Wire to Supabase user/XP tables
- [ ] **Day 3** — Quest-based learning modules + animations
- [ ] **Day 4** — `/economy/award-from-course` endpoint
- [ ] **Day 5** — Global leaderboard page
- [ ] **Day 6** — Admin Rift control panel
- [ ] **Day 7** — Hero onboarding + first real student 🎉
