# 📦 Archived module scripts — DO NOT re-activate

These are **stale, pre-rewrite** module source files. They are kept for history only.
**Do not move them back into `scripts/`.**

## Why they're here

The live course content is the **single source of truth in Supabase** (`hv_modules` /
`hv_quizzes`, project `yhtmuibgdnxhbgboajhc`), set via Supabase MCP during the May 2026
restructure. These archived files predate that rewrite and **do not match** the live
titles, numbering, or content.

There were two complete stale families for codes M1–M10:

- **Family A** — raw *"auto-transcribed from NotebookLM video"* transcripts (10-module numbering).
- **Family B** — structured drafts with emoji + Level/XP/Coins (12-module numbering; Family A shifted +1 by an added intro module).

Plus two orphan Elite drafts (`M11-ship-scale-graduate`, `M12-ride-or-die-contribution`)
whose themes were absorbed into live DB **M10** ("You Built an Empire. Now Ship It.").

## The hazard they caused

`course-content-agent` (`scan_scripts_folder` → `upsert_module_from_script`) globs
top-level `scripts/M\d+[-_.]*.md`, sorts alphabetically, and upserts `onConflict: code`.
With two files per code, **the alphabetical-last file wins and clobbers the DB metadata**.
Archiving them (out of the top-level scan path) removes that hazard.

## Active source going forward

`scripts/` top level now holds only files that match the live DB: `M0-welcome` and the
AI Agents 2.0 track (`M11`/`M12`/`M13`). Modules without a script file (e.g. `M5B`,
`M1`–`M10`) are **DB-canonical** — edit them via Supabase MCP, not here.
