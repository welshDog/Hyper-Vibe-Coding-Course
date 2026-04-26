# 🏆 Leaderboard + Quests + Admin Rift UI Guide

> Built: April 26, 2026 — Phase 12A/12B/12C

---

## What Was Built

### 1. Leaderboard (`/leaderboard`)
- **Public page** — no auth required
- Reads from `leaderboard` Supabase view/table (top 50)
- Shows: rank, avatar/initials, display name, level, streak, XP
- File: `frontend/src/pages/Leaderboard.tsx`

### 2. Quests (`/quests`)
- **Private page** — auth required
- Reads the signed-in user’s quest rows from `public.user_quests` and joins `quests` for title/description
- Shows an empty state when there are no active quests for the user
- File: `frontend/src/pages/Quests.tsx`

### 3. Admin Rift Panel
- **Embedded inside existing `Admin` page** (not a new route)
- Component: `frontend/src/components/AdminRiftPanel.tsx`
- Admin can open rift (topic, description, multiplier 1.5–3x, duration 15–90 min)
- Admin can close active rift immediately
- Polls every 15s to refresh active rift status
- RLS: INSERT/UPDATE on rifts restricted to `users.role = 'admin'`
- **Add `<AdminRiftPanel />` to `Admin.tsx`** to activate it

---

## Supabase Migration

File: `supabase/migrations/20260426180000_leaderboard_quests.sql`

What it creates:
- `public_profiles` view (safe, security_invoker)
- `leaderboard` view (top 50, ordered by XP)
- `quests` table + seed data (7 quests)
- `user_quests` table (completion tracking)
- `complete_quest(uuid)` RPC — SECURITY DEFINER, atomic
- Admin write policy on `rifts`
- All RLS enabled

---

## Adding AdminRiftPanel to Admin.tsx

```tsx
import AdminRiftPanel from '../components/AdminRiftPanel';

// Inside your Admin page JSX, add:
<AdminRiftPanel />
```

---

## Navbar Links (optional — add when ready)

```tsx
// Leaderboard — public, add to main nav
<Link to="/leaderboard">🏆 Leaderboard</Link>

// Quests — auth only
<Link to="/quests">⚔️ Quests</Link>
```

---

## XP Award Values

| Event | XP | Tokens |
|---|---|---|
| First Lesson | 50 | 0 |
| Code Starter | 25 | 10 |
| Quiz Master | 100 | 25 |
| 5-Day Streak | 150 | 50 |
| Course Complete | 500 | 100 |
| Rift Rider | 75 | 15 |
| Hyper Vibe Intro | 100 | 20 |

---

## Test IDs (for Playwright)

| Component | data-testid |
|---|---|
| Course module card (Courses) | `module-card` |
| Quiz section (Module detail) | `quiz` |
| Quest item row (Quests) | `quest-item` |

---

## What's Next

- Add `<AdminRiftPanel />` to `Admin.tsx`
- Add Leaderboard + Quests links to Navbar/Dashboard
- Playwright e2e tests added:
  - `frontend/tests/courses.spec.ts`
  - `frontend/tests/course-module.spec.ts`
  - `frontend/tests/leaderboard.spec.ts`
  - `frontend/tests/quests.spec.ts`
- Module 1.1 content generation
