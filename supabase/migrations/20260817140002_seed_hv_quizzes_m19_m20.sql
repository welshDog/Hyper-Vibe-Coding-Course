-- Batch 3 (final) quizzes for the Builder OS expansion. Must run after
-- the content migration (20260817140001).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M19",
  "title": "Quiz: 🔁 The Vibe Loop",
  "questions": [
    {
      "id": "m19q1",
      "type": "multiple_choice",
      "prompt": "What is 'Infinite Chat', and why is it a trap?",
      "choices": ["A fast way to ship code with no downsides", "Chatting for hours until the AI breaks something with no clear rollback point", "A Supabase realtime feature", "A required step in the Vibe Loop"],
      "answer_index": 1,
      "explanation": "The biggest vibe-coding trap: hours of unscoped chat until something breaks and nobody knows why or where to roll back to."
    },
    {
      "id": "m19q2",
      "type": "multiple_choice",
      "prompt": "What are the 5 steps of the Vibe Loop, in order?",
      "choices": ["Chat, Build, Ship, Hope, Repeat", "Plan, Prompt, Build, Test, Checkpoint", "Prompt, Test, Plan, Build, Deploy", "Build, Plan, Checkpoint, Test, Prompt"],
      "answer_index": 1,
      "explanation": "Plan (Mini-PRD) -> Prompt (bounded instructions) -> Build (one small change) -> Test (objective proof) -> Checkpoint (commit/push/log/snapshot)."
    },
    {
      "id": "m19q3",
      "type": "multiple_choice",
      "prompt": "What does a Mini-PRD's 'Files allowed' section actually do?",
      "choices": ["Lists files to delete", "Bounds the agent to only the files the change should touch", "Sets up CI permissions", "Nothing -- it's just documentation"],
      "answer_index": 1,
      "explanation": "It's the scope boundary the builder prompt enforces -- the agent must not touch anything outside that list."
    },
    {
      "id": "m19q4",
      "type": "true_false",
      "prompt": "A passing test is what proves a Vibe Loop change actually worked -- not just trusting the AI's word for it.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "Testing is the module's 'Live Truth' -- objective proof, not trust."
    },
    {
      "id": "m19q5",
      "type": "practical",
      "prompt": "Build a Toggle Switch on a feature branch, running the full Vibe Loop for real: Mini-PRD, bounded prompt, one build, a passing test, then commit + push + Micro-Win log + Session Snapshot.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've run the full loop for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M19'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M20",
  "title": "Quiz: 🗂️ Context Is Currency",
  "questions": [
    {
      "id": "m20q1",
      "type": "multiple_choice",
      "prompt": "What is the Project Dossier's critical safety rule?",
      "choices": ["Keep it under 100 lines", "Never put API keys, .env values, or secrets in any context file -- document variable names only", "Only the project owner may edit it", "Store it outside version control"],
      "answer_index": 1,
      "explanation": "Document environment variable NAMES only, never their values -- secrets never belong in a context file."
    },
    {
      "id": "m20q2",
      "type": "multiple_choice",
      "prompt": "What should an AI agent say when required context is genuinely missing from the dossier?",
      "choices": ["Its best guess", "\"Missing from dossier\" -- and ask a focused question", "Nothing -- silently skip the task", "Invent a plausible answer and proceed"],
      "answer_index": 1,
      "explanation": "The No-Guess Test explicitly requires the agent to say 'missing from dossier' rather than guess."
    },
    {
      "id": "m20q3",
      "type": "multiple_choice",
      "prompt": "How should large code blocks be handled in a context file to prevent bloat?",
      "choices": ["Paste the full file every time", "Link to the source file instead of pasting large code blocks", "Compress them with a script", "Duplicate them across every RULES.md"],
      "answer_index": 1,
      "explanation": "One file, one job, kept scannable -- link to source files instead of pasting large code blocks."
    },
    {
      "id": "m20q4",
      "type": "true_false",
      "prompt": "A specific SDK config field should be assumed to exist for loading the dossier into any AI tool.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "Don't assume a specific SDK config field exists -- use a plain, version-controlled folder loaded per each tool's own documented method."
    },
    {
      "id": "m20q5",
      "type": "practical",
      "prompt": "Add STACK.md, RULES.md, and STYLE_GUIDE.md to your own project. Give an AI agent a UI task with no extra chat context and confirm it correctly names the stack, follows style rules, names the right verification command, and asks when a fact is missing.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've run the No-Guess Test for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M20'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
