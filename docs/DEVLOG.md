# 📓 Dev Log: Hyper Vibe Rebuild

## What Changed vs The Original

| Original | Rebuild |
|----------|--------|
| Static GitHub Pages landing | Full-stack React + Node app |
| External tools (Gumroad, Airtable) | Custom backend + PostgreSQL |
| Markdown curriculum docs | Database-driven lessons with JSON content |
| No auth | JWT auth with accessibility preferences |
| Planned gamification (external) | Native XP/streaks/badge system |
| Manual setup | `docker-compose up` one-command setup |

## Why These Choices?

### Monorepo Structure
Keeps frontend + backend + database in sync.
Easier to refactor when everything is in one place.

### Explicit Naming Convention
All variables use full names: `userProgress` not `up`, `courseId` not `cid`.
This is intentional for neurodivergent devs - no mental decoding needed.

### Flat File Structure
No deep nesting. Max 3 levels deep.
Reduces cognitive load when navigating.

## Session Log

### 2026-04-11 — Discord Bot + Video Pipeline
**What shipped:**
- BROski Course Bot is LIVE on the Discord server
- 10 slash commands active: `/xp` `/link` `/leaderboard` `/rank` `/coins` `/badges` `/quest` `/vibecheck` `/course` `/help`
- Fixed schema bugs in `db.py` — `achievements` has no `xp_awarded`/`badge_id`, XP now derived from achievement count (100 XP each)
- Supabase: `discord_links` table + `leaderboard_top()` RPC deployed
- Video generation pipeline built (`scripts/video/*.ps1`) — HeyGen primary, Synthesia fallback
- All module scripts written (`assets/videos/scripts/MODULE-*.md`)
- Removed nested duplicate repo clone from root

**Next:**
- Record Module 1.1 (script ready)
- Real video player in LessonPlayer.tsx
- Seed courses to Supabase

### 2026-04-10 — Platform Foundation
**What shipped:**
- React 19 + Vite + Supabase platform deployed to Vercel
- Auth, course catalog, lesson player, dashboard all working
- 13/15 bugs fixed (BUG-013, BUG-014 open)
- Playwright E2E tests passing (learning.spec.ts skipped)
- PR #2 merged develop → main

## Known TODOs

- [ ] Record Module 1.1 video (script ready)
- [ ] Real video player (YouTube embed or MUX)
- [ ] Seed courses to Supabase
- [ ] Add Stripe payment success page + webhook enrollment
- [ ] Add quiz/assessment system
- [ ] User profile page (`/profile` route)
- [ ] Fix BUG-013 (password validation) + BUG-014 (post-signup message)
- [ ] Un-skip `learning.spec.ts`
