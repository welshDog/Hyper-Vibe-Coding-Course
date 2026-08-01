# M15 -- Session Snapshot & Morning Briefing

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +130 XP / +70 BROski$
Build status: Draft spec

## STOP -- What is this?

A "Save Game" button for your brain. Bookmarks Git state, uncommitted
work, and your intent, so tomorrow-you can resume without rebuilding
context from zero.

## Why this matters

Context Fog can eat 30-60 minutes of morning focus. Capturing intent
(the "why"), not just code diffs, is what actually kills the fog.

## Data captured (local Git CLI, not a hosted Git API)

```json
{
  "project_name": "hyper-vibe-coding-course",
  "branch": "main",
  "recent_commits": ["abc123 Add progress badge"],
  "changed_files": ["src/components/ProgressBadge.jsx"],
  "working_tree_status": "2 uncommitted files",
  "intent": "Finish the empty state before styling the badge.",
  "safe_first_step": "Open ProgressBadge.jsx and read the TODO.",
  "blockers": ["Need the final empty-state copy."],
  "created_at": "2026-08-02T00:00:00Z"
}
```

Use plain Git CLI commands, no tokens or network access required:

```bash
git log -3 --oneline
git diff --name-only HEAD~1
git status --short
```

## The 30-second exit ritual (Step 3)

1. What was I trying to achieve?
2. What changed or what did I learn?
3. What is the smallest safe first step next time?
4. Is there one blocker?

## Morning Briefing (Step 4)

Command: `npm run vibe-start` fetches the latest snapshot and returns
exactly 3 tiny 5-minute starting tasks.

## Safety rules

- Never upload .env filenames, secret values, tokens, or full diffs.
- Scope every snapshot row by user_id with Supabase RLS.
- If Supabase is unreachable, save a local fallback snapshot and show
  "saved locally -- sync later."
- The dashboard (M18) must render saved data even if the AI summary
  call is slow or unavailable.

## Help

Symptom: Briefing says "No data found."
Cause: end-of-session script didn't finish saving before terminal closed.
Fix: check for a local fallback snapshot; verify the Supabase row exists
for your own user_id.

## Definition of done

End one real session with a snapshot containing Git state, intent, one
blocker, and a safe first step. Start the next session via the briefing
command and complete the first 5-minute action first.

## Next

M16 -- Energy-Aware Build Mode: match tasks to your brain battery.
