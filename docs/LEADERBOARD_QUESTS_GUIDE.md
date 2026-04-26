# 🏆 Leaderboard + Quests + Admin Rift UI Guide

> Built: April 26, 2026 — Phase 12A/12B/12C

---

## What Was Built

### 1. Leaderboard (`/leaderboard`)
- **Public page** — no auth required
- Reads from `public.leaderboard` Supabase view
- View joins `user_xp` + `public_profiles` (safe — no email/id exposed)
- Shows: rank medal, avatar, display_name, level, streak, XP, BROski$
- File: `frontend/src/pages/LeaderboardPage.tsx`

### 2. QuestPage (`/quests`)
- **Private page** — auth required
- Reads from `public.quests` (active only)
- Reads user completions from `public.user_quests`
- Complete button calls `complete_quest(quest_id)` RPC
- RPC is atomic: inserts user_quests + xp_events + upserts user_xp + applies rift multiplier
- After completion: calls `awardXP(n)` to update HUD live
- File: `frontend/src/pages/QuestPage.tsx`

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
| Leaderboard rows container | `leaderboard-rows` |
| Quest row | `quest-row` |
| Complete quest button | `complete-quest-{id}` |
| Admin rift panel | `admin-rift-panel` |
| Open rift button | `open-rift-btn` |
| Close rift button | `close-rift-btn` |
| Topic input | `rift-topic-input` |
| Multiplier select | `rift-multiplier-select` |
| Duration select | `rift-duration-select` |

---

## What's Next

- Add `<AdminRiftPanel />` to `Admin.tsx`
- Add Leaderboard + Quests links to Navbar/Dashboard
- Write Playwright tests (stubs for leaderboard + quest flow)
- Module 1.1 content generation
