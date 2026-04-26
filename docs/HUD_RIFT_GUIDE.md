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
| `frontend/src/hooks/useRift.ts` | Hook that polls /rifts/active every 30s |
| `api/xp_events.py` | FastAPI: award XP, get user XP, leaderboard |
| `api/rifts.py` | FastAPI: create/get/close rifts |

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

function CodeEditor() {
  const { awardXP } = useHUD();

  const handleSubmit = async () => {
    // run their code...
    await fetch('/api/xp-events/award', {
      method: 'POST',
      body: JSON.stringify({ user_id, event_type: 'code_submit', amount: 25 })
    });
    awardXP(25); // triggers the toast immediately
  };
}
```

### 3. Fire a Rift from admin panel (or CLI)

```bash
curl -X POST http://localhost:8000/api/rifts/create \\
  -H 'Content-Type: application/json' \\
  -d '{"topic": "async/await", "multiplier": 2.0, "duration_minutes": 45}'
```

The purple banner appears on EVERY student's screen within 30 seconds. ⚡

---

## 🔌 Wire to Supabase (Next Step)

Both `xp_events.py` and `rifts.py` have `# TODO: Replace with real Supabase` comments.

Replace mock data with:
```python
from supabase import create_client
client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get user XP
result = client.table('user_xp').select('*').eq('user_id', user_id).single().execute()
```

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
