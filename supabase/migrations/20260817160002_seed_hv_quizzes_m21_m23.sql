-- Batch 1 quizzes for the M21-M30 expansion. Must run after the content
-- migration (20260817160001).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M21",
  "title": "Quiz: 🐝 Multi-Agent Crews",
  "questions": [
    {
      "id": "m21q1",
      "type": "multiple_choice",
      "prompt": "What is the Planner's ONE job in a multi-agent crew?",
      "choices": ["Write implementation code", "Turn a goal into a scoped Mini-PRD", "Review the final diff", "Deploy the change"],
      "answer_index": 1,
      "explanation": "The Planner only produces a scoped Mini-PRD -- it never writes code, and the Builder never re-decides the plan."
    },
    {
      "id": "m21q2",
      "type": "multiple_choice",
      "prompt": "What should the Builder do if the Mini-PRD it receives is unclear or incomplete?",
      "choices": ["Guess the intent and proceed", "Expand scope to cover the gap", "Stop and ask -- never guess or expand scope", "Silently skip the unclear part"],
      "answer_index": 2,
      "explanation": "The Builder's manifest explicitly says: if unclear, stop and ask -- never guess or expand scope."
    },
    {
      "id": "m21q3",
      "type": "multiple_choice",
      "prompt": "What is the Reviewer's only real question?",
      "choices": ["Is the code elegant?", "Does the diff match the Mini-PRD, file for file?", "Did the Builder work fast enough?", "Should we add more features?"],
      "answer_index": 1,
      "explanation": "The Reviewer checks the diff against the Mini-PRD only -- nothing else, no scope creep in review either."
    },
    {
      "id": "m21q4",
      "type": "true_false",
      "prompt": "The Builder should freely add extra improvements it notices while implementing the Mini-PRD.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "The Builder implements only what the Mini-PRD says -- 'also do this while you're in there' is exactly what the handoff discipline forbids."
    },
    {
      "id": "m21q5",
      "type": "practical",
      "prompt": "Run a real 2-agent handoff: Planner produces a Mini-PRD for a small real feature, Builder implements only from it. Confirm the diff touches nothing outside the Mini-PRD's allowed files.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- self-assess once you've run a real handoff."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M21'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M22",
  "title": "Quiz: 🚦 Approval Gates & Guardrails",
  "questions": [
    {
      "id": "m22q1",
      "type": "multiple_choice",
      "prompt": "What should an agent's DEFAULT mode be before an approval gate exists?",
      "choices": ["Write mode", "Dry-run -- show the diff, touch nothing", "Auto-approve after 5 seconds", "Silent execution"],
      "answer_index": 1,
      "explanation": "Dry-run should be the mode you can't accidentally skip -- compute and print the diff, change nothing, by default."
    },
    {
      "id": "m22q2",
      "type": "multiple_choice",
      "prompt": "What counts as a valid approval signal?",
      "choices": ["No response after a timeout", "An explicit, typed 'approved'", "The agent assuming yes if the diff looks small", "A previous approval from a different task"],
      "answer_index": 1,
      "explanation": "The gate must refuse to proceed without an explicit, typed signal -- never an assumed yes or a timeout."
    },
    {
      "id": "m22q3",
      "type": "multiple_choice",
      "prompt": "When should the blast-radius file list be enforced?",
      "choices": ["After the change is applied", "Before the diff is even shown", "Only if the diff looks risky", "It's optional"],
      "answer_index": 1,
      "explanation": "Anything outside the allowed-file list is refused outright, before the diff is even shown -- not an after-the-fact check."
    },
    {
      "id": "m22q4",
      "type": "true_false",
      "prompt": "Once approved, write mode should re-generate the diff fresh rather than applying the exact diff that was shown.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "An approved diff must never silently change between approval and execution -- apply the exact diff that was shown."
    },
    {
      "id": "m22q5",
      "type": "practical",
      "prompt": "Wire a toy agent task so it must print a diff and wait for typed approval before any file write happens. Confirm it refuses to write when you don't approve.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- test the refusal path for real, not just the happy path."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M22'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M23",
  "title": "Quiz: 🔍 Watching Your Agents: Action Logs",
  "questions": [
    {
      "id": "m23q1",
      "type": "multiple_choice",
      "prompt": "How does this module's agent-behavior logging differ from M10's observability?",
      "choices": ["They're the same thing", "M10 = app/infra health, M23 = what your agents actually did", "M23 replaces M10 entirely", "M23 is only for production, M10 only for dev"],
      "answer_index": 1,
      "explanation": "M10 answers 'is the app up?' -- this module answers 'what did my agent do and why', a structured behavior log, not server metrics."
    },
    {
      "id": "m23q2",
      "type": "multiple_choice",
      "prompt": "What shape should each logged event take?",
      "choices": ["A free-text paragraph", "A structured JSON object with fixed fields", "A screenshot", "Whatever the agent feels like writing"],
      "answer_index": 1,
      "explanation": "Structured fields (action, status, files_touched, timestamp) beat free-text -- you can actually filter and grep them."
    },
    {
      "id": "m23q3",
      "type": "multiple_choice",
      "prompt": "Which field in the event log ties directly to M22's blast-radius list?",
      "choices": ["timestamp", "status", "files_touched", "action"],
      "answer_index": 2,
      "explanation": "files_touched records exactly what M22's approval gate allowed or blocked."
    },
    {
      "id": "m23q4",
      "type": "true_false",
      "prompt": "Action log events should be append-only, never overwritten.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "Append-only is explicit in the module -- a real audit trail can't have events silently edited or removed."
    },
    {
      "id": "m23q5",
      "type": "practical",
      "prompt": "Instrument a real agent script to emit structured JSON events for one real task. Tail and grep the resulting log into a plain timeline, then answer 'what changed and why' using only the log.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- prove the log alone is enough to reconstruct what happened."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M23'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
