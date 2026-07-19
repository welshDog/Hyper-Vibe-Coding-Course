-- Seed hv_quizzes for M1, M2, M5-M12 — questions grounded in each module's LIVE
-- lesson content (scripts/_archive/M<n>-<slug>.md), matched by SLUG (never the
-- divergent NOTEBOOKLM pack). Companion to 20260718210000 (M3/M4). Applied to tlav
-- via supabase-js 2026-07-19. Idempotent via ON CONFLICT (module_id, version).

-- M1 · designing-your-focus-zone
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M1",
  "title": "Quiz: 🧘 Designing Your Focus Zone",
  "questions": [
    {
      "id": "m1q1",
      "type": "multiple_choice",
      "prompt": "According to this module, what causes 'instruction freeze'?",
      "choices": [
        "Your internet connection dropping",
        "Input that is too dense, random, or long",
        "Running too many Docker containers",
        "A missing semicolon"
      ],
      "answer_index": 1,
      "explanation": "Instruction freeze is your brain locking up because the input is too dense, too random, or too long — a design problem, not a you problem."
    },
    {
      "id": "m1q2",
      "type": "multiple_choice",
      "prompt": "What does the Instruction Decoder prompt turn dense docs into?",
      "choices": [
        "A numbered checklist with emojis, one sentence per step",
        "A single long paragraph",
        "A video summary",
        "A spreadsheet of data"
      ],
      "answer_index": 0,
      "explanation": "It rewrites dense documentation into a numbered, emoji-tagged checklist with one bold action per step."
    },
    {
      "id": "m1q3",
      "type": "multiple_choice",
      "prompt": "Which tool in this module is for text-to-speech (reading docs aloud)?",
      "choices": [
        "Otter.ai",
        "Read&Write",
        "GitHub Copilot",
        "VS Code"
      ],
      "answer_index": 1,
      "explanation": "Read&Write reads docs aloud; Otter.ai does live transcription; Copilot suggests code inline."
    },
    {
      "id": "m1q4",
      "type": "true_false",
      "prompt": "This module says environment shapes behaviour — a cluttered IDE means a cluttered brain.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "A clean, focused workspace switches hyperfocus on. You set the environment up first so every later module feels smooth."
    },
    {
      "id": "m1q5",
      "type": "practical",
      "prompt": "Pick a high-contrast theme, kill non-essential notifications, install one accessibility tool, and run the Instruction Decoder on a doc that once confused you. Did the dense doc turn into a clear checklist?",
      "answer_index": null,
      "explanation": "Your Focus Zone is the foundation the rest of the course runs on top of."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'designing-your-focus-zone'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M2 · your-first-vibe
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M2",
  "title": "Quiz: 🌱 Your First Vibe",
  "questions": [
    {
      "id": "m2q1",
      "type": "multiple_choice",
      "prompt": "What single command boots the whole 32-container HyperCode empire?",
      "choices": [
        "npm start",
        "docker compose up -d",
        "git clone",
        "python main.py"
      ],
      "answer_index": 1,
      "explanation": "docker compose up -d is the power switch — it pulls images and starts every container in the background."
    },
    {
      "id": "m2q2",
      "type": "multiple_choice",
      "prompt": "In this module's metaphor, Docker is like...?",
      "choices": [
        "A shipping container for software",
        "A web browser",
        "A text editor",
        "A single database table"
      ],
      "answer_index": 0,
      "explanation": "Docker packages your whole app — services, databases, agents — so one command boots the lot."
    },
    {
      "id": "m2q3",
      "type": "multiple_choice",
      "prompt": "Where does Mission Control load once the empire is running?",
      "choices": [
        "http://localhost:3000",
        "http://localhost:8088",
        "http://localhost:8000",
        "http://localhost:54321"
      ],
      "answer_index": 1,
      "explanation": "Mission Control is at localhost:8088; 3000 is BROski Terminal, 8000 is FastAPI Core, 54321 is Supabase."
    },
    {
      "id": "m2q4",
      "type": "true_false",
      "prompt": "You should commit your .env file to git so teammates get your API keys.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 1,
      "explanation": "False — never share and never commit your .env; it holds your secrets."
    },
    {
      "id": "m2q5",
      "type": "practical",
      "prompt": "Run docker compose up -d and open localhost:8088. Did Mission Control load — making you officially a HyperCode operator?",
      "answer_index": null,
      "explanation": "Seeing Mission Control load for the first time is the Module 2 win (and your first dopamine hit)."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'your-first-vibe'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M5 · full-stack-vibe
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M5",
  "title": "Quiz: 🧠 Full Stack Vibe",
  "questions": [
    {
      "id": "m5q1",
      "type": "multiple_choice",
      "prompt": "What does Row Level Security (RLS) do?",
      "choices": [
        "Encrypts the whole database at rest",
        "Sets per-user data access rules — use it for everything that touches user data",
        "Caches queries for speed",
        "Backs up the database nightly"
      ],
      "answer_index": 1,
      "explanation": "RLS enforces per-user access rules and should guard everything that touches user data."
    },
    {
      "id": "m5q2",
      "type": "multiple_choice",
      "prompt": "Which Supabase feature runs serverless TypeScript at the edge (e.g. a Stripe webhook)?",
      "choices": [
        "Realtime",
        "Edge Functions",
        "Row Level Security",
        "The AI Gateway"
      ],
      "answer_index": 1,
      "explanation": "Edge Functions are serverless TypeScript running near your users — ideal for webhooks and scheduled jobs."
    },
    {
      "id": "m5q3",
      "type": "multiple_choice",
      "prompt": "What are the three layers of a full-stack app in this module?",
      "choices": [
        "HTML, CSS and JavaScript",
        "Frontend (Next.js) ↔ Backend (Supabase/FastAPI) ↔ Database (PostgreSQL)",
        "Dev, Staging and Prod",
        "Model, View and Controller"
      ],
      "answer_index": 1,
      "explanation": "The three layers talk to each other: Next.js frontend ↔ Supabase/FastAPI backend ↔ PostgreSQL database."
    },
    {
      "id": "m5q4",
      "type": "true_false",
      "prompt": "Supabase gives you auth, database, edge functions and realtime so you don't build the backend plumbing from scratch.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "Supabase handles the backend plumbing so you focus on what your app does."
    },
    {
      "id": "m5q5",
      "type": "practical",
      "prompt": "Connect your M4 app to Supabase, add a tasks table, and make the TaskWidget save and reload tasks. Do your tasks now persist across a page refresh?",
      "answer_index": null,
      "explanation": "Persistence across refresh is the proof your data lives in PostgreSQL, not just memory."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'full-stack-vibe'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M6 · hypercode-the-hyper-way
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M6",
  "title": "Quiz: 🔥 HyperCode The Hyper Way",
  "questions": [
    {
      "id": "m6q1",
      "type": "multiple_choice",
      "prompt": "Which agent auto-recovers failed services (self-healing)?",
      "choices": [
        "Agent X",
        "The Healer Agent",
        "The Crew Orchestrator",
        "The Memory Agent"
      ],
      "answer_index": 1,
      "explanation": "The Healer Agent monitors services and auto-recovers failures; Agent X designs agents; the Crew Orchestrator routes tasks."
    },
    {
      "id": "m6q2",
      "type": "multiple_choice",
      "prompt": "What is Agent X's role in the swarm?",
      "choices": [
        "Meta-Architect — designs and deploys new agents autonomously",
        "Log aggregator",
        "Payment processor",
        "Frontend renderer"
      ],
      "answer_index": 0,
      "explanation": "Agent X is the Meta-Architect: you describe the vision, it designs and deploys the agents."
    },
    {
      "id": "m6q3",
      "type": "multiple_choice",
      "prompt": "In this module you stop being a coder and become a...?",
      "choices": [
        "Meta-Architect who directs the agent swarm",
        "Database administrator",
        "Manual QA tester",
        "Scrum master"
      ],
      "answer_index": 0,
      "explanation": "HyperCode operators direct intelligent systems — you describe the vision, the swarm builds it."
    },
    {
      "id": "m6q4",
      "type": "true_false",
      "prompt": "In HyperCode you must understand every line of code before you can direct the system.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 1,
      "explanation": "False — you need to understand the pattern, not every line. Once you see the pattern you can direct it."
    },
    {
      "id": "m6q5",
      "type": "practical",
      "prompt": "Stop one non-critical container, watch the Healer detect and restart it, and confirm Grafana shows the recovery. Did the Healer bring it back automatically?",
      "answer_index": null,
      "explanation": "That's real SRE on a 32-container AI system — not beginner stuff."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'hypercode-the-hyper-way'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M7 · agent-architecture-manifests
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M7",
  "title": "Quiz: 🛠️ Agent Architecture & Manifests",
  "questions": [
    {
      "id": "m7q1",
      "type": "multiple_choice",
      "prompt": "What is an agent manifest?",
      "choices": [
        "A list of installed npm packages",
        "A contract telling the swarm what the agent does, its tools, triggers, memory and lifecycle",
        "A database backup",
        "A CSS stylesheet"
      ],
      "answer_index": 1,
      "explanation": "The manifest is the contract the SDK reads to spawn an agent with the correct wiring."
    },
    {
      "id": "m7q2",
      "type": "multiple_choice",
      "prompt": "Which trigger type runs an agent on a schedule?",
      "choices": [
        "webhook",
        "cron",
        "manual",
        "memory"
      ],
      "answer_index": 1,
      "explanation": "A cron trigger runs on a schedule; a webhook trigger fires on an incoming request."
    },
    {
      "id": "m7q3",
      "type": "multiple_choice",
      "prompt": "Which file defines a multi-agent cluster deployment?",
      "choices": [
        "manifest.json",
        "cluster.json",
        "docker-compose.yml",
        "package.json"
      ],
      "answer_index": 1,
      "explanation": "cluster.json references multiple agent paths to deploy them together; each agent still has its own manifest.json."
    },
    {
      "id": "m7q4",
      "type": "true_false",
      "prompt": "Without a manifest, an agent can still spawn correctly in the swarm.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 1,
      "explanation": "False — no manifest = no agent. The SDK needs the manifest to wire the agent up."
    },
    {
      "id": "m7q5",
      "type": "practical",
      "prompt": "Write a manifest.json for an agent useful to your workflow (a Discord notifier, task reminder, or file watcher) and implement one skill. Does the SDK read it and spawn the agent?",
      "answer_index": null,
      "explanation": "Once you understand the shape of one manifest, you understand them all."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'agent-architecture-manifests'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M8 · soulful-entities-ai-pets
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M8",
  "title": "Quiz: 🐕 Soulful Entities & AI Pets",
  "questions": [
    {
      "id": "m8q1",
      "type": "multiple_choice",
      "prompt": "What four things make an AI a 'soulful entity' in this module?",
      "choices": [
        "HTML, CSS, JS and a server",
        "Persistent memory, a personality, mood states, and an on-chain identity",
        "A name, avatar, bio and wallet",
        "Speed, uptime, security and logging"
      ],
      "answer_index": 1,
      "explanation": "Agent = code + memory + personality + on-chain soul."
    },
    {
      "id": "m8q2",
      "type": "multiple_choice",
      "prompt": "In the mood state machine, what mood does a pet get if you don't check in for over 48 hours?",
      "choices": [
        "hyperfocused",
        "lonely",
        "happy",
        "tired"
      ],
      "answer_index": 1,
      "explanation": "Over 48 hours since last active returns 'lonely'; over 20 interactions returns 'hyperfocused'; otherwise 'happy'."
    },
    {
      "id": "m8q3",
      "type": "multiple_choice",
      "prompt": "Where is a pet's conversation memory stored?",
      "choices": [
        "Inside the NFT image",
        "In a Supabase memory table (pet_memories)",
        "In the browser's localStorage",
        "Directly on the blockchain"
      ],
      "answer_index": 1,
      "explanation": "Conversation history lives in a Supabase pet_memories table; the on-chain NFT holds evolving metadata."
    },
    {
      "id": "m8q4",
      "type": "true_false",
      "prompt": "A pet's personality is injected as a SYSTEM prompt on each conversation.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "The personality SYSTEM prompt (name, traits, mood, memory summary) is injected per conversation so the pet stays in character."
    },
    {
      "id": "m8q5",
      "type": "practical",
      "prompt": "Create a pet with a name, 3 traits and a memory system, then have a conversation with it. Did it remember something from earlier in the chat?",
      "answer_index": null,
      "explanation": "A pet that remembers you is a non-judging accountability partner — the whole point of a soulful entity."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'soulful-entities-ai-pets'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M9 · web3-integration-on-chain
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M9",
  "title": "Quiz: 🔗 Web3 Integration & On-Chain",
  "questions": [
    {
      "id": "m9q1",
      "type": "multiple_choice",
      "prompt": "What is the correct order of the payment-to-token pipeline?",
      "choices": [
        "On-chain mint → Supabase → Stripe → user",
        "User pays Stripe → Edge Function fires → Supabase updated → on-chain minted",
        "Supabase → Stripe → user → NFT",
        "User mints NFT → Stripe refunds → Supabase logs"
      ],
      "answer_index": 1,
      "explanation": "User pays Stripe → the Edge Function fires → Supabase is updated → tokens/NFT are minted on-chain."
    },
    {
      "id": "m9q2",
      "type": "multiple_choice",
      "prompt": "This module says Web3 in HyperCode is about ___, not speculation.",
      "choices": [
        "ownership",
        "gambling",
        "hype",
        "mining"
      ],
      "answer_index": 0,
      "explanation": "BROski$ and dNFTs are about ownership — proof of work, learning and contribution."
    },
    {
      "id": "m9q3",
      "type": "multiple_choice",
      "prompt": "What is a 'dNFT'?",
      "choices": [
        "A deleted NFT",
        "A dynamic NFT — an on-chain identity that evolves with the agent's state",
        "A discounted NFT",
        "A duplicate NFT"
      ],
      "answer_index": 1,
      "explanation": "A dynamic NFT's metadata (level, mood, traits) updates as your AI pet grows."
    },
    {
      "id": "m9q4",
      "type": "true_false",
      "prompt": "BROski$ tokens represent proof of work, learning and contribution.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "The token economy rewards real actions — completing modules, daily logins, contributing to the repo."
    },
    {
      "id": "m9q5",
      "type": "practical",
      "prompt": "Set up Stripe in test mode, run a Starter-pack checkout, complete a test payment, and confirm your brosk_coins balance rises in Supabase. Did the coins land?",
      "answer_index": null,
      "explanation": "That's the payment → token pipeline working end to end (in TEST mode)."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'web3-integration-on-chain'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M10 · security-sre-observability
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M10",
  "title": "Quiz: 🛡️ Security & SRE Observability",
  "questions": [
    {
      "id": "m10q1",
      "type": "multiple_choice",
      "prompt": "In the observability stack, which tool scrapes metrics like CPU, memory and request rate?",
      "choices": [
        "Grafana",
        "Prometheus",
        "Loki",
        "Tempo"
      ],
      "answer_index": 1,
      "explanation": "Prometheus scrapes metrics; Grafana visualises them; Loki aggregates logs; Tempo does distributed tracing."
    },
    {
      "id": "m10q2",
      "type": "multiple_choice",
      "prompt": "Which tool aggregates all container logs into one searchable place?",
      "choices": [
        "Prometheus",
        "Loki",
        "Tempo",
        "Alertmanager"
      ],
      "answer_index": 1,
      "explanation": "Loki is the log aggregator; Tempo traces requests across agents."
    },
    {
      "id": "m10q3",
      "type": "multiple_choice",
      "prompt": "Where should the Supabase service role key live?",
      "choices": [
        "In the frontend so the app can read data",
        "Only in agent .env files, never the frontend",
        "In git so the team can find it",
        "In browser localStorage"
      ],
      "answer_index": 1,
      "explanation": "Least privilege: the service role key belongs only in server-side agent .env files, never exposed to the frontend."
    },
    {
      "id": "m10q4",
      "type": "true_false",
      "prompt": "Every Supabase table should have Row Level Security enabled.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "RLS on every table is the baseline — run alter table ... enable row level security for each one."
    },
    {
      "id": "m10q5",
      "type": "practical",
      "prompt": "Run the security audit checklist, enable RLS on every table, and build a Grafana dashboard with at least 3 panels. Are all your Prometheus targets showing UP?",
      "answer_index": null,
      "explanation": "Every target UP and a healthy dashboard is production-grade SRE."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'security-sre-observability'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M11 · ship-scale-graduate
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M11",
  "title": "Quiz: 🚀 Ship, Scale & Graduate",
  "questions": [
    {
      "id": "m11q1",
      "type": "multiple_choice",
      "prompt": "What does this module say is the only metric that truly matters?",
      "choices": [
        "Lines of code written",
        "Shipping — if it's not live, it doesn't exist",
        "Number of GitHub stars",
        "Test coverage percentage"
      ],
      "answer_index": 1,
      "explanation": "Beautiful code that isn't live doesn't exist. Shipping is the metric."
    },
    {
      "id": "m11q2",
      "type": "multiple_choice",
      "prompt": "What are the three deploy gates, in order?",
      "choices": [
        "Local → Staging → Production",
        "Dev → Test → Delete",
        "Build → Break → Fix",
        "Plan → Code → Ship"
      ],
      "answer_index": 0,
      "explanation": "Local → Staging → Production — each step is a gate you must pass."
    },
    {
      "id": "m11q3",
      "type": "multiple_choice",
      "prompt": "Which command runs the full graduation workflow (validate manifests, test, build, deploy, smoke test)?",
      "choices": [
        "npm run build",
        "npm run graduate",
        "npx vercel --prod",
        "docker compose up -d"
      ],
      "answer_index": 1,
      "explanation": "npm run graduate reads cluster.json, validates manifests, runs tests, builds, deploys to Vercel, registers agents, smoke-tests, and awards your Graduate achievement."
    },
    {
      "id": "m11q4",
      "type": "true_false",
      "prompt": "You should reuse your local .env file for production environment variables.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 1,
      "explanation": "False — set production variables in the Vercel dashboard; never use the local .env for prod."
    },
    {
      "id": "m11q5",
      "type": "practical",
      "prompt": "Deploy your app to Vercel, share the live URL with someone, and run npm run graduate until every check passes. Did you unlock the HyperCode Graduate achievement?",
      "answer_index": null,
      "explanation": "Your app live on a real URL, used by real people, is the biggest dopamine hit in the course."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'ship-scale-graduate'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();

-- M12 · ride-or-die-contribution
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M12",
  "title": "Quiz: 🤝 The Ride or Die Contribution",
  "questions": [
    {
      "id": "m12q1",
      "type": "multiple_choice",
      "prompt": "What is the progression path this module names?",
      "choices": [
        "Intern → Junior → Senior → Staff",
        "Learner → Builder → Contributor → Leader",
        "Bronze → Silver → Gold → Platinum",
        "Reader → Writer → Editor → Publisher"
      ],
      "answer_index": 1,
      "explanation": "You're now at Contributor; leadership is earned by coming back and helping the next person."
    },
    {
      "id": "m12q2",
      "type": "multiple_choice",
      "prompt": "According to the HyperCode doc rules, what comes first when writing documentation?",
      "choices": [
        "How, then why",
        "Why, then how",
        "Code, then explanation",
        "Theory, then practice"
      ],
      "answer_index": 1,
      "explanation": "Why first, then how — short sentences, one concept per section, a working example for every concept."
    },
    {
      "id": "m12q3",
      "type": "multiple_choice",
      "prompt": "What does this module say is the best way to cement your knowledge?",
      "choices": [
        "Re-read your notes",
        "Teach it to someone else",
        "Take another course",
        "Memorise the docs"
      ],
      "answer_index": 1,
      "explanation": "Teaching Module 1 to someone else reveals gaps in your own understanding — and fills them."
    },
    {
      "id": "m12q4",
      "type": "true_false",
      "prompt": "A one-line typo-fix PR counts as a real contribution.",
      "choices": [
        "True",
        "False"
      ],
      "answer_index": 0,
      "explanation": "Any size counts — the act of contributing is what matters."
    },
    {
      "id": "m12q5",
      "type": "practical",
      "prompt": "Open your first PR to the ecosystem (a typo fix counts), add your name to CONTRIBUTORS.md, and help one person through Module 1. Did your PR get merged?",
      "answer_index": null,
      "explanation": "Welcome to the Ride or Die crew — no judgment, help the person behind you."
    }
  ]
}
$json$::jsonb
from public.hv_modules where slug = 'ride-or-die-contribution'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();
