# 🤖 Course Content Agent

> **Mission:** Keep Hyper-Vibe modules, quizzes, and media status in sync between Git, Supabase, and Claude — automatically.

---

## What it does

1. **Watches `scripts/`** — detects new or changed `M*.md` module files via hash comparison.
2. **Parses & upserts** — extracts `code`, `title`, `level`, `xp_reward`, `summary` and writes to `hv_modules` in Supabase.
3. **Generates quizzes** — calls Claude (via MCP) with the script + Quiz Pack format. Saves to `hv_quizzes`.
4. **Syncs tracker files** — regenerates `COURSE_MASTER_TRACKER.md` + `COURSE_VIDEO_TRACKER.md` from live DB state.
5. **Audit log** — every run is recorded in `hv_agent_runs`.

---

## Triggers

| Trigger | How | Fires |
|---------|-----|-------|
| ⏰ Cron | Every hour | `scan_scripts_folder` |
| 🚀 Manual | `npm run sync-course` | `sync_all` |
| 🪝 GitHub Webhook | Push to `scripts/` | `handle_push_event` |

---

## MCP Tools (what Claude can call)

| Tool | Purpose |
|------|---------|
| `course.list_modules` | See all modules + status |
| `course.get_module` | Get details for one module |
| `course.upsert_module_from_script` | Parse a script file → upsert DB |
| `course.save_quiz` | Save a quiz payload to DB |
| `course.update_status` | Mark script/video/podcast status |

---

## Quiz Payload Format

Matches the **Hyper-Vibe Quiz Pack** structure exactly:

```json
{
  "module_code": "M2",
  "title": "Quiz: 🌱 Your First Vibe",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "prompt": "What is the engine that holds your entire empire in a box?",
      "choices": ["Chrome", "Docker Desktop", "Windows Media Player"],
      "answer_index": 1,
      "explanation": "Docker Desktop is the engine. Whale icon must be running before anything starts."
    },
    {
      "id": "q5",
      "type": "practical",
      "prompt": "Run docker compose up -d and verify Mission Control loads at http://localhost:8088",
      "answer_index": null,
      "explanation": null
    }
  ]
}
```

---

## DB Tables

| Table | Purpose |
|-------|---------|
| `hv_modules` | One row per module (M1–M12) |
| `hv_quizzes` | Quiz payloads per module |
| `hv_agent_runs` | Audit log of every agent run |

Migration: `supabase/migrations/20260426000001_course_content_agent.sql`

---

## Env Vars

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GITHUB_REPO=welshDog/Hyper-Vibe-Coding-Course
SCRIPTS_DIR=scripts/
```

---

## Quick Start (MVP)

```bash
# 1. Apply the migration
supabase db push

# 2. Run a full sync
npm run sync-course

# 3. Or sync one module manually
npm run sync-course -- --path scripts/M2-your-first-vibe.md
```

---

## File structure

```
agents/
  course-content-agent/
    manifest.json        ← Agent definition + MCP tool schemas
    README.md            ← This file
    src/
      index.ts           ← Entry point (TODO)
      skills/
        scan_scripts_folder.ts       (TODO)
        upsert_module_from_script.ts (TODO)
        generate_quiz_for_module.ts  (TODO)
        sync_trackers_from_db.ts     (TODO)
        handle_push_event.ts         (TODO)
      tools/
        supabase.ts      ← Supabase service_role client (TODO)
        claude.ts        ← Claude MCP client (TODO)
        parser.ts        ← Markdown frontmatter + section extractor (TODO)
```

---

*Built for the Hyper-Vibe Ecosystem | welshDog | April 2026*
