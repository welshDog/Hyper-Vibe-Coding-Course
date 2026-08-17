-- Batch 2 quizzes for the Builder OS expansion. Must run after the content
-- migration (20260817130001).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M16",
  "title": "Quiz: 🔋 Energy-Aware Build Mode",
  "questions": [
    {
      "id": "m16q1",
      "type": "multiple_choice",
      "prompt": "At a brain battery score of 0 (Recovery), what tasks should be shown?",
      "choices": ["Only energy_cost 1 tasks", "No coding tasks at all", "All tasks, marked as optional", "Only tasks marked 'easy'"],
      "answer_index": 1,
      "explanation": "Recovery mode hides all coding tasks entirely and offers real choices instead -- rest, water, stretch, or closing the laptop without guilt."
    },
    {
      "id": "m16q2",
      "type": "multiple_choice",
      "prompt": "How should a task with no energy_cost set be treated by the filter?",
      "choices": ["Shown to everyone as 'easy'", "Hidden by default", "Shown only at Hyperfocus", "Automatically deleted"],
      "answer_index": 1,
      "explanation": "Untagged tasks default to hidden -- never silently treated as easy, since that could push an inappropriate task onto a low-energy day."
    },
    {
      "id": "m16q3",
      "type": "multiple_choice",
      "prompt": "The task filter should compare energy_cost against battery score using what?",
      "choices": ["The text label (e.g. 'Standard')", "The numeric score only", "A random sample", "The task's estimate_minutes"],
      "answer_index": 1,
      "explanation": "Filtering on the label instead of the numeric score is called out as the exact bug that lets hard tasks leak through at Low Power."
    },
    {
      "id": "m16q4",
      "type": "true_false",
      "prompt": "The vibe-check command should auto-fire every time you open a terminal.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "It's an explicit, run-it-yourself command -- never auto-fired, so it doesn't become one more thing forced on you."
    },
    {
      "id": "m16q5",
      "type": "practical",
      "prompt": "Check in at battery 2, complete one energy_cost-1 task, and confirm nothing above energy_cost 2 was visible.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've run it for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M16'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M17",
  "title": "Quiz: 🪂 Focus Panic Mode",
  "questions": [
    {
      "id": "m17q1",
      "type": "multiple_choice",
      "prompt": "Why shouldn't Focus Panic Mode force-close your browser or editor by default?",
      "choices": ["It's slower than closing manually", "It can kill unsaved work outside Git and behaves differently across OS/editors", "It uses too much memory", "Users find it annoying"],
      "answer_index": 1,
      "explanation": "This is the module's explicit safety correction -- save and snapshot first, let the human close things manually after confirmation."
    },
    {
      "id": "m17q2",
      "type": "multiple_choice",
      "prompt": "Which Git command safely captures BOTH tracked and untracked work?",
      "choices": ["git commit -am", "git stash push --include-untracked", "git add . && git reset", "git clean -fd"],
      "answer_index": 1,
      "explanation": "--include-untracked is required, or new files never touched by Git would be left behind entirely."
    },
    {
      "id": "m17q3",
      "type": "multiple_choice",
      "prompt": "Where does a Git stash live?",
      "choices": ["Backed up to GitHub automatically", "Local only", "In the cloud via Supabase", "Nowhere -- it's deleted after use"],
      "answer_index": 1,
      "explanation": "A stash is local only -- for work that matters, come back later, inspect it, commit normally, fetch, then push (never force-push)."
    },
    {
      "id": "m17q4",
      "type": "true_false",
      "prompt": "Focus Panic Mode is a substitute for real crisis support if you feel unsafe.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "It's explicitly a work-recovery tool, not crisis support -- if you feel unsafe, contact local emergency or crisis services."
    },
    {
      "id": "m17q5",
      "type": "practical",
      "prompt": "On a disposable practice branch, make one tracked edit and one untracked file, then run Focus Panic Mode for real.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- confirm git status is clean and the stash + recovery note both exist."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M17'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M18",
  "title": "Quiz: 🎛️ Personal Dev Dashboard",
  "questions": [
    {
      "id": "m18q1",
      "type": "multiple_choice",
      "prompt": "What should the DEFAULT dashboard screen show?",
      "choices": ["Every table's full history at once", "Just a Focus View: next action, brain battery, last save", "A blank screen until you configure it", "Only the safe-landing history"],
      "answer_index": 1,
      "explanation": "Focus View is the default -- next action, brain battery, and last save. Everything else sits behind a 'See progress' toggle."
    },
    {
      "id": "m18q2",
      "type": "multiple_choice",
      "prompt": "How should dashboard data be fetched?",
      "choices": ["One giant client-side cross-table query", "A small Supabase view/RPC scoped to the signed-in user_id", "Directly with the service-role key from the browser", "Polling every table every second"],
      "answer_index": 1,
      "explanation": "A scoped view/RPC keeps it fast, secure, and simple -- never stitch a giant cross-table query together client-side."
    },
    {
      "id": "m18q3",
      "type": "multiple_choice",
      "prompt": "If a learner has more than 2 safe-landings this week, what should the dashboard show?",
      "choices": ["A red alarm banner", "Nothing -- stay silent", "A supportive card offering Recovery Mode or a lighter task load", "Automatically lock the account"],
      "answer_index": 2,
      "explanation": "The panic-light rule is deliberately kind, not shaming -- a supportive nudge, never an alarm."
    },
    {
      "id": "m18q4",
      "type": "true_false",
      "prompt": "The dashboard should block rendering until the AI summary call finishes.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "Saved data must render first; any AI summary is optional enrichment, never a blocker."
    },
    {
      "id": "m18q5",
      "type": "practical",
      "prompt": "Open the dashboard route and confirm you can see one safe first step, today's brain battery, and your last saved context within 5 seconds. Verify with npm --prefix frontend run build.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've verified it for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M18'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
