-- Batch 1 quizzes for the Builder OS expansion. Must run after the content
-- migration (20260817120001) -- questions are grounded in the adapted
-- module content, not the raw PR #46 spec prose, per
-- docs/QUIZ_SEED_HANDOFF_2026-07-18.md's authoring convention (4-5
-- questions per module: ~3 multiple_choice, 1 true_false, 1 practical;
-- true_false uses choices ["True","False"] with answer_index 0 = True).
--
-- The SELECT ... WHERE code = '...' pattern silently no-ops if the module
-- row doesn't exist yet -- it must exist by the time this migration runs
-- (it does, via 20260817120000 in this same PR).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M13",
  "title": "Quiz: 🏆 Micro-Wins Dev Flow",
  "questions": [
    {
      "id": "m13q1",
      "type": "multiple_choice",
      "prompt": "Which Git hook fires the automated Micro-Win logger?",
      "choices": ["pre-commit", "post-commit", "pre-push", "post-merge"],
      "answer_index": 1,
      "explanation": "post-commit fires after the commit is actually made, not on save -- so it only logs real, committed progress."
    },
    {
      "id": "m13q2",
      "type": "multiple_choice",
      "prompt": "Which column in the micro_wins table is marked UNIQUE, and why?",
      "choices": ["user_id, to scope RLS", "commit_sha, so retries/rebases can't double-award XP", "xp_earned, to cap rewards", "created_at, for sorting"],
      "answer_index": 1,
      "explanation": "commit_sha unique is the idempotency key -- the same commit can never be awarded twice, even after a rebase."
    },
    {
      "id": "m13q3",
      "type": "multiple_choice",
      "prompt": "What should you build FIRST, before the automated Supabase version?",
      "choices": ["The post-commit hook", "Level A -- the manual micro_wins.md file", "An AI hype-line generator", "A Supabase Edge Function"],
      "answer_index": 1,
      "explanation": "Level A (manual) comes first -- zero setup, and it proves the habit before you automate it."
    },
    {
      "id": "m13q4",
      "type": "true_false",
      "prompt": "It's safe to put your Supabase service-role key directly inside the Git hook script.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "Never embed a service-role key in a Git hook or commit it to the repo -- send commit data to a small API/Edge Function instead."
    },
    {
      "id": "m13q5",
      "type": "practical",
      "prompt": "Create micro_wins.md in one of your own projects and log 3 real wins from 3 real commits.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the Definition of Done for Level A -- self-assess once you've actually done it."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M13'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M14",
  "title": "Quiz: 🧩 HyperSplit Agent",
  "questions": [
    {
      "id": "m14q1",
      "type": "multiple_choice",
      "prompt": "What does HyperSplit actually offload, according to the module?",
      "choices": ["The act of writing code", "Executive-function planning and decomposition", "Testing", "Deployment"],
      "answer_index": 1,
      "explanation": "Planning what to do first is usually the real blocker, not the coding itself -- HyperSplit offloads that decision."
    },
    {
      "id": "m14q2",
      "type": "multiple_choice",
      "prompt": "What is the hard maximum time estimate allowed per task before it must be re-split?",
      "choices": ["5 minutes", "10 minutes", "20 minutes", "60 minutes"],
      "answer_index": 2,
      "explanation": "Any task over 20 minutes is invalid and must be split further -- short enough to start even on a low-energy day."
    },
    {
      "id": "m14q3",
      "type": "multiple_choice",
      "prompt": "If required info (like a missing file path) is missing when HyperSplit plans a task, what should it do?",
      "choices": ["Invent a plausible file path", "Skip the task entirely", "Generate a small discovery task first", "Ask the user to restart"],
      "answer_index": 2,
      "explanation": "The system instruction explicitly forbids inventing credentials, setup, or paths -- a missing-info gap becomes its own small discovery task."
    },
    {
      "id": "m14q4",
      "type": "true_false",
      "prompt": "HyperSplit's output should be free-form prose explaining the plan.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "Output must be structured JSON only -- predictable fields (estimate_minutes, difficulty, energy_cost, safe_first_step, definition_of_done), not prose."
    },
    {
      "id": "m14q5",
      "type": "practical",
      "prompt": "Generate 10-15 ordered tasks for one real stalled project of yours, then complete task 1 before closing this session.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- momentum matters more than a perfect list."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M14'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M15",
  "title": "Quiz: 📸 Session Snapshot & Morning Briefing",
  "questions": [
    {
      "id": "m15q1",
      "type": "multiple_choice",
      "prompt": "What does a Session Snapshot capture that plain Git history does not?",
      "choices": ["File sizes", "Your intent -- the 'why' behind the changes", "Branch names", "Commit timestamps"],
      "answer_index": 1,
      "explanation": "Git already remembers what changed -- it has no idea why. Capturing intent is what actually kills Context Fog."
    },
    {
      "id": "m15q2",
      "type": "multiple_choice",
      "prompt": "What should happen if Supabase is unreachable when you try to save a snapshot?",
      "choices": ["The snapshot is lost silently", "Save a local fallback and sync later", "Retry indefinitely until it connects", "Disable the feature"],
      "answer_index": 1,
      "explanation": "Graceful degradation is the accommodation -- a snapshot system that fails loudly on a flaky connection gets abandoned."
    },
    {
      "id": "m15q3",
      "type": "multiple_choice",
      "prompt": "How many starting tasks should the morning briefing command return?",
      "choices": ["1", "3", "10", "All of yesterday's context"],
      "answer_index": 1,
      "explanation": "Exactly 3 tiny 5-minute tasks -- a wall of yesterday's full context recreates the overwhelm the module exists to prevent."
    },
    {
      "id": "m15q4",
      "type": "true_false",
      "prompt": "The 30-second exit ritual includes checking whether there's one blocker.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "The 4 exit questions explicitly include 'Is there one blocker?' alongside intent, what changed, and the next safe first step."
    },
    {
      "id": "m15q5",
      "type": "practical",
      "prompt": "End one real session with a full snapshot, then start your next session using the briefing command and complete the first 5-minute task.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've closed the loop for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M15'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
