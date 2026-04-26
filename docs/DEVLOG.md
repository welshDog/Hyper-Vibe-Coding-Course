# 📓 Dev Log: Hyper Vibe Rebuild

## What Changed vs The Original

| Original | Rebuild |
|----------|--------|
| Static GitHub Pages landing | Vite + React platform deployed to Vercel |
| External tools (Gumroad, Airtable) | Supabase + Stripe + Edge Functions |
| Markdown-only curriculum docs | DB-backed courses/lessons + docs in-repo |
| No auth | Supabase Auth + RLS-protected data |
| Planned gamification (external) | Native XP/tokens/quests/leaderboards |
| Manual setup | Frontend dev server + Supabase CLI migrations |

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

- [ ] Keep docs synchronized with the codebase (architecture/runbooks/guides)
- [ ] Consolidate overlapping permissive RLS policies (performance)
- [ ] Align frontend DB types with the current Supabase schema
- [ ] Decide whether `apps/api/` + `docker-compose.yml` remain supported or become legacy
- [ ] Un-skip `learning.spec.ts` (or remove if obsolete)
