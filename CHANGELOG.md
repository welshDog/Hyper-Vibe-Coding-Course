# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.3.0] - 2026-04-11

### Added
- Discord bot (BROski Course Bot) — live on server
  - Slash commands: `/xp`, `/link`, `/leaderboard`, `/rank`, `/coins`, `/badges`, `/quest`, `/vibecheck`, `/course`, `/help`
  - Cogs: `xp.py`, `badges.py`, `quests.py`, `commands.py`
  - Weekly quest auto-post every Monday 09:00 UTC
  - Badge unlock announcements in leaderboard channel
- Supabase migration `20260410000010_discord_bot`
  - `discord_links` table with RLS + 2 indexes
  - `leaderboard_top()` RPC function
- AI video generation pipeline (`scripts/video/*.ps1`)
- Video scripts for all course modules (`assets/videos/scripts/MODULE-*.md`)
- Remotion video project (`my-video/`)
- Claude skills: `hyper-vibe-video-gen` skill + `CLAUDE_SKILLS_HYPER_VIBE.md`

### Fixed
- `db.py` schema mismatch — `achievements` queried non-existent `xp_awarded`/`badge_id` columns
- `db.py` — removed `full_name` reference (not in `users` schema)
- `xp.py` leaderboard — removed `full_name` fallback

### Changed
- Removed nested duplicate repo clone (`Hyper-Vibe-Coding-Course/` inside root)
- Reorganised Claude skills to `.claude/skills/`

## [0.2.0] - 2026-04-10

### Added
- Achievement/XP system schema
- Discord bot scaffold (cogs, config, db layer)
- PR #2 merged develop → main (36 commits)

## [0.1.0] - 2026-03-12

- Initial repository structure
- Course design documents and launch kit
- GitHub Actions CI + GitHub Pages deployment
- Issue templates and PR template

