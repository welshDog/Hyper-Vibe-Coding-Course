-- Seed hv_quizzes — hand-authored quiz content, committed to git.
--
-- WHY THIS FILE EXISTS
--   Quiz content was originally AI-generated straight into the OLD Supabase
--   project (yhtmuibgdnxhbgboajhc) and NEVER committed. When that project was
--   deleted + rebuilt on tlav, hv_quizzes came back EMPTY. Root fix: quiz
--   content now lives in git so it survives future rebuilds.
--
-- ⚠️ NUMBERING — READ THIS
--   The master pack (rewrites/NOTEBOOKLM_MASTER_PACK.md) uses an OLD numbering
--   that no longer matches the LIVE tlav curriculum. A new intro module
--   ("🧘 Designing Your Focus Zone") was inserted as M1 on tlav, shifting
--   everything down, and the two curricula DIVERGE from M4 onward. Verified on
--   live tlav 2026-07-18 (Claude Code, MCP):
--
--     pack M2 "🎤 Prompt Like a Pro"   → tlav M3  (exact title+emoji match)
--     pack M3 "🏗️ Build Your First App" → tlav M4  (exact title+emoji match)
--     pack M1 "🧠 Turn On Your AI Brain" → NO live equivalent (dropped here)
--     pack M4+ (Money Engine, Agent Crew…) ≠ tlav M5+ (Full Stack, HyperCode…)
--
--   So this seed keys ONLY the two quizzes whose CONTENT is confirmed to match
--   the live module (title + emoji identical). Everything else must be authored
--   from tlav's LIVE module content — see docs/QUIZ_SEED_HANDOFF_2026-07-18.md.
--   DO NOT bulk-extend from the pack; it will misfile wrong-topic quizzes.
--
-- GATE BEFORE APPLYING
--   Spot-check that tlav M3 / M4 lesson content actually teaches these concepts
--   (it should — titles+emojis are identical). If a module's content diverges,
--   do not apply that block.
--
-- SHAPE  (matches HvQuizPayload in frontend/src/pages/CourseModule.tsx)
--   payload = { module_code, title, questions:[{id,type,prompt,choices?,answer_index,explanation}] }
--   type ∈ multiple_choice | true_false | practical
--     multiple_choice/true_false → answer_index = 0-based index into choices
--     true_false → choices ["True","False"], 0=True
--     practical  → answer_index null (UI self-assesses a boolean)
--
-- IDEMPOTENT: keyed via SELECT on hv_modules.code (missing module = skipped, no
--   error); ON CONFLICT (module_id, version) re-seeds payload. Safe to re-run.
-- APPLY VIA: Supabase MCP apply_migration against tlav — NEVER supabase db push.

-- ── tlav M3 · 🎤 Prompt Like a Pro ───────────────────────────────────
-- Questions REWRITTEN 2026-07-19 from the LIVE lesson (scripts/_archive/
-- M3-prompt-like-a-pro.md): North Star workflow, Agent Crew, one-task-per-
-- prompt, Context Header. The pack's 3-Part Formula / Instruction Freeze /
-- Atomic Scoping are NOT in the live lesson — removed.
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M3",
  "title": "Quiz: 🎤 Prompt Like a Pro",
  "questions": [
    {
      "id": "m3q1",
      "type": "multiple_choice",
      "prompt": "What is the North Star Workflow this module tells you to use every session?",
      "choices": [
        "Memorise syntax then debug then ship",
        "Natural Language then AI Code then Shipped Product",
        "Read docs then copy code then hope it works",
        "Design then wireframe then handoff"
      ],
      "answer_index": 1,
      "explanation": "The North Star Workflow is Natural Language then AI Code then Shipped Product — describe the outcome, the AI handles syntax, you ship."
    },
    {
      "id": "m3q2",
      "type": "multiple_choice",
      "prompt": "In the Agent Crew, which tool is described as 'the strategist' — big picture and architecture?",
      "choices": ["Copilot", "Claude", "Ollama", "Docker"],
      "answer_index": 1,
      "explanation": "Agent Crew: Claude = strategist (architecture), Copilot = sprinter (fast inline completion), Ollama = local player (private, offline)."
    },
    {
      "id": "m3q3",
      "type": "multiple_choice",
      "prompt": "What is the 'one task per prompt' rule from Step 2?",
      "choices": [
        "Ask the AI for ten things at once to save time",
        "One prompt, one task, one win — then repeat",
        "Never write more than one prompt per day",
        "Let the AI decide how many tasks to do"
      ],
      "answer_index": 1,
      "explanation": "Don't ask for 10 things at once — your brain fragments, the AI fragments, the code fragments. One prompt, one task, one win, repeat."
    },
    {
      "id": "m3q4",
      "type": "true_false",
      "prompt": "True or false: the Context Header tells the AI your stack (Next.js, FastAPI, Supabase, Docker) at the start of a session.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "True — you open every session with a Context Header naming your stack and tone so the AI's output fits your project."
    },
    {
      "id": "m3q5",
      "type": "practical",
      "prompt": "Save your Context Header, then write three single-task prompts using the Natural Language then AI Code workflow. Did the AI build closer to what you actually meant?",
      "answer_index": null,
      "explanation": "A saved Context Header plus focused one-task prompts is the whole Pro Prompter skill — that's the Module win."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M3'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- ── tlav M4 · 🏗️ Build Your First App ────────────────────────────────
-- Questions REWRITTEN 2026-07-19 from the LIVE lesson (scripts/_archive/
-- M4-build-your-first-app.md): face/brain metaphor, HTTP requests, <5-min
-- feedback loop, Task Widget (/tasks). The pack's Kitchen/Waiter metaphor,
-- Netflix/Uber analogy and /hello endpoint are NOT in the live lesson — removed.
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M4",
  "title": "Quiz: 🏗️ Build Your First App",
  "questions": [
    {
      "id": "m4q1",
      "type": "multiple_choice",
      "prompt": "In this module's metaphor, what is FastAPI?",
      "choices": ["Your face", "Your brain", "The waiter", "The database"],
      "answer_index": 1,
      "explanation": "Next.js = your face (what users see), FastAPI = your brain (does the thinking). They talk via HTTP requests."
    },
    {
      "id": "m4q2",
      "type": "multiple_choice",
      "prompt": "How do the Next.js frontend and the FastAPI backend talk to each other?",
      "choices": ["Through a shared file", "Via HTTP requests", "Through a Docker volume", "They don't — they run separately"],
      "answer_index": 1,
      "explanation": "The frontend sends an HTTP request to the backend (e.g. POST http://localhost:8000/tasks) — that request is how they communicate."
    },
    {
      "id": "m4q3",
      "type": "multiple_choice",
      "prompt": "What is the target time for one fast-feedback loop (describe then generate then test)?",
      "choices": ["Under 5 minutes", "About an hour", "A full day", "Under 30 seconds"],
      "answer_index": 0,
      "explanation": "The loop — describe feature, AI generates, paste and test, ship or fix — is meant to run in under 5 minutes per feature."
    },
    {
      "id": "m4q4",
      "type": "true_false",
      "prompt": "True or false: you built the Task Widget by hand-writing all the code yourself.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "False — you build the feature using AI prompts, not manual code. That's the whole point of the workflow."
    },
    {
      "id": "m4q5",
      "type": "practical",
      "prompt": "Build the Task Widget: a POST /tasks endpoint plus a <TaskWidget/> component, wired together and running. Does clicking submit show your task in the list below?",
      "answer_index": null,
      "explanation": "Frontend talks to backend, data flows both ways — that's a full-stack feature and the Module 4 win."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M4'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- ── HELD (author from LIVE tlav content, NOT the pack) ───────────────
--   tlav M1 🧘 Designing Your Focus Zone   — no pack equivalent
--   tlav M2 🌱 Your First Vibe             — no pack equivalent
--   tlav M5 🧠 Full Stack Vibe             — pack diverges here
--   tlav M6 🔥 HyperCode The Hyper Way      — "
--   tlav M7 🛠️ Agent Architecture & Manifests
--   tlav M8 🐕 Soulful Entities & AI Pets
--   … M9–M12                               — pull live titles + content first
