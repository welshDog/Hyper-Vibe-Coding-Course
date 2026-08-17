-- Batch 2 quizzes for the M21-M30 expansion. Must run after the content
-- migration (20260817170001).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M24",
  "title": "Quiz: 📈 Prometheus + Grafana for Vibe Coders",
  "questions": [
    {
      "id": "m24q1",
      "type": "multiple_choice",
      "prompt": "What's the key difference between a counter and a gauge metric?",
      "choices": ["A counter can go down, a gauge can't", "A gauge can go up and down, a counter only increases", "They're the same thing", "Counters are for Grafana, gauges are for Prometheus"],
      "answer_index": 1,
      "explanation": "A counter only ever increases (until restart); a gauge can move up and down, like a queue length."
    },
    {
      "id": "m24q2",
      "type": "multiple_choice",
      "prompt": "How does Prometheus actually get metric data from your app?",
      "choices": ["Your app pushes data to it", "It scrapes a /metrics endpoint on an interval", "You email it a CSV", "It reads your database directly"],
      "answer_index": 1,
      "explanation": "Prometheus is pull-based -- it scrapes a /metrics endpoint your app exposes, on a regular interval."
    },
    {
      "id": "m24q3",
      "type": "multiple_choice",
      "prompt": "How many dashboard panels should you build for your first real metric?",
      "choices": ["As many as possible immediately", "One", "Zero, panels are optional", "Ten, one per metric type"],
      "answer_index": 1,
      "explanation": "One metric, one panel, one alert -- the same no-scope-creep discipline as every practical task in this course."
    },
    {
      "id": "m24q4",
      "type": "true_false",
      "prompt": "You should trust that an alert rule works based on the YAML looking correct, without forcing the condition to test it.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "Force the condition and confirm the alert actually fires -- don't just trust the config on paper."
    },
    {
      "id": "m24q5",
      "type": "practical",
      "prompt": "Stand up a local Prometheus + Grafana stack tracking one real metric from your own app. Ship one dashboard panel. Force the condition and confirm your one alert rule actually fires.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- prove the alert fires for real, not just in theory."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M24'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M25",
  "title": "Quiz: 🧯 Incident Response, ND Style",
  "questions": [
    {
      "id": "m25q1",
      "type": "multiple_choice",
      "prompt": "What is the correct order of the 4-step incident shape?",
      "choices": ["Diagnose, detect, roll back, stop the bleeding", "Detect, stop the bleeding, roll back clean, diagnose after", "Roll back, detect, diagnose, stop the bleeding", "Stop the bleeding, diagnose, detect, roll back"],
      "answer_index": 1,
      "explanation": "Detect -> stop the bleeding -> roll back clean -> diagnose after -- always in that order, never improvised."
    },
    {
      "id": "m25q2",
      "type": "multiple_choice",
      "prompt": "What should you do the moment you confirm something is actually broken?",
      "choices": ["Start debugging the root cause live", "Roll back to the last known-good state", "Wait and see if it resolves itself", "Announce it publicly before doing anything"],
      "answer_index": 1,
      "explanation": "Stop the bleeding first -- roll back to known-good. Trying to patch the bug live is exactly what the runbook forbids."
    },
    {
      "id": "m25q3",
      "type": "multiple_choice",
      "prompt": "Which git command is the safe rollback for a shared branch?",
      "choices": ["git reset --hard", "git revert", "git push --force", "git clean -f"],
      "answer_index": 1,
      "explanation": "git revert creates a new commit undoing the bad one -- safe on shared history. git reset --hard rewrites history and is not."
    },
    {
      "id": "m25q4",
      "type": "true_false",
      "prompt": "Root-cause diagnosis should happen only after stability is confirmed, never during the incident itself.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "Diagnosing under pressure mid-incident produces worse decisions -- diagnosis is explicitly a post-stability step."
    },
    {
      "id": "m25q5",
      "type": "practical",
      "prompt": "Deliberately break something in a disposable sandbox repo. Run your own 5-step runbook for real: detect it, stop the bleeding with a clean git revert, confirm stable, then diagnose after -- in that order.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- run the real runbook under a real (safe) failure, not just in theory."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M25'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M26",
  "title": "Quiz: 💰 Designing a Reward Economy",
  "questions": [
    {
      "id": "m26q1",
      "type": "multiple_choice",
      "prompt": "What are the three parts of any reward economy?",
      "choices": ["Login, logout, session", "Sources, sinks, and the ledger", "Frontend, backend, database", "Coins, XP, badges"],
      "answer_index": 1,
      "explanation": "Sources (where value enters), sinks (where value leaves), and a ledger recording every movement between them."
    },
    {
      "id": "m26q2",
      "type": "multiple_choice",
      "prompt": "Why does every earn event need a stable dedup key?",
      "choices": ["To make the database schema look nicer", "To prevent a retried request from double-granting the reward", "It's only needed for spend actions", "It's optional if the app is small"],
      "answer_index": 1,
      "explanation": "Without a stable dedup key, a network retry can replay the same earn request and double-grant -- this repo's own award_tokens() requires one for exactly this reason."
    },
    {
      "id": "m26q3",
      "type": "multiple_choice",
      "prompt": "What happens to a reward economy that has sources but no sinks?",
      "choices": ["Nothing, it works fine long-term", "It isn't really an economy -- value only accumulates, meaning inflates away", "It becomes more secure", "Sinks are only needed for real-money systems"],
      "answer_index": 1,
      "explanation": "An economy with only sources and no sinks is just a counter -- value piles up with nowhere to go and stops meaning anything."
    },
    {
      "id": "m26q4",
      "type": "true_false",
      "prompt": "It's fine if a user can max out an entire reward system in one sitting.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "That's the dopamine cliff -- good pacing keeps some reason to come back, rather than front-loading everything into one session."
    },
    {
      "id": "m26q5",
      "type": "practical",
      "prompt": "Spec a 3-action reward ledger for a toy app: at least one earn source, one spend sink, one refund/reversal path -- with an explicit, unique dedup key for every earn event.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- the dedup key for each earn action is the part that actually has to be explicit."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M26'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
