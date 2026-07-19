-- Restore hv_modules.content — dropped in the yhtmui->tlav rebuild.
--
-- WHY: frontend/src/pages/CourseModule.tsx queries hv_modules.content and renders
--   it as markdown (react-markdown). The rebuild recreated hv_modules WITHOUT the
--   content column (only content_hash + script_path), so every module-detail query
--   400'd and lesson bodies were blank. This adds the column back and backfills each
--   module from its OWN slug-matched lesson file (scripts/_archive/M<n>-<slug>.md) —
--   NOT the divergent NOTEBOOKLM pack. Content now lives in git -> survives rebuilds.
-- Generated 2026-07-19. Idempotent: ADD COLUMN IF NOT EXISTS + UPDATE by slug.

ALTER TABLE public.hv_modules ADD COLUMN IF NOT EXISTS content text;

-- content is a PAYWALLED column: authenticated (logged-in students) may read the
-- lesson body; anon deliberately may NOT (they get title/summary/script_path preview
-- only). Explicit grant so this survives a rebuild even if base grants go column-by-column.
GRANT SELECT (content) ON public.hv_modules TO authenticated;

-- M1-designing-your-focus-zone.md
update public.hv_modules
   set content = $modmd$# 🧘 Designing Your Focus Zone

**Module:** M1 | **Level:** Beginner | **XP:** 30 | **Coins:** 10 BROski$

> Stop fighting your brain. Build WITH it. This module sets up your environment so your ADHD/dyslexic mind runs at full power — not against the tools.

---

## 🎯 What You'll Learn

- Set up a high-contrast, low-distraction code editor environment
- Install AI-powered accessibility tools (Otter.ai, Read&Write)
- Use the "Instruction Decoder" prompt to turn dense docs into chunked action plans
- Build your personal Focus Zone checklist
- Turn off notification noise FOREVER

---

## 🧠 Why This Module Exists

Most coding courses dump a wall of text on you and say "good luck." That causes **instruction freeze** — when your brain locks up because the input is too dense, too random, or too long.

This module is the **antidote**. We set up your workspace FIRST so every module after this feels smooth, not painful.

**The pattern:** Environment shapes behaviour. A cluttered IDE = cluttered brain. A clean, focused workspace = hyperfocus ON.

---

## 🛠️ Tools We Use

| Tool | What it does | Why it helps |
|------|-------------|-------------|
| VS Code | Code editor | Lightweight, theme-able, extension-rich |
| Otter.ai | Live transcription | Never miss what was said in a meeting/video |
| Read&Write | Text-to-speech | Reads docs aloud so your brain can process |
| GitHub Copilot | Inline AI | Suggests code as you type |

---

## ⚡ Step-by-Step

### Step 1 — Pick Your Theme
Open VS Code settings and search for **"Color Theme"**. Choose something high-contrast and low-distraction:
- **One Dark Pro** (popular)
- **Catppuccin Mocha** (soft, easy on eyes)
- **GitHub Dark** (familiar)

### Step 2 — Kill Notification Noise
In VS Code: `File > Preferences > Settings > search "telemetry"` → disable.
In Windows/Mac: turn off all non-essential app notifications.

### Step 3 — Install the Instruction Decoder Prompt
Save this as a snippet in your editor:
```
Take this documentation/instructions and turn it into:
- A numbered checklist
- Use emojis on each step
- Max 1 sentence per step
- Bold the key action word
[PASTE DOCS HERE]
```

### Step 4 — Set Up Otter.ai
Go to [otter.ai](https://otter.ai) → create free account → install browser extension.
Now every YouTube tutorial, meeting, or lecture auto-transcribes.

---

## 🌟 The Neurodivergent Edge

Your ADHD/dyslexic brain is **not broken** — it's just optimised for patterns, not syntax.

- **Pattern brain:** You see how whole systems connect before anyone else.
- **Hyperfocus:** Once the environment is right, you build FASTER than neurotypical devs.
- **Read&Write:** Removes the "reading wall" from technical docs forever.

---

## ✨ Practical Task

Choose a high-contrast, low-distraction theme in your code editor.
Turn off ALL non-essential notifications.
Install ONE accessibility tool (Otter.ai or Read&Write).
Run the Instruction Decoder prompt on any piece of documentation that has confused you before.

**You've built your Focus Zone. The rest of the course runs ON TOP of this.** 🏗️

---

## 📊 XP Check

- [ ] Theme installed and active
- [ ] Notifications disabled
- [ ] Instruction Decoder prompt saved
- [ ] Accessibility tool installed

**Complete all 4 → Claim your 30 XP + 10 BROski$ 🤑**
$modmd$,
       content_hash = '3df25de5f090cebcc90f741b81f1d916',
       updated_at = now()
 where slug = 'designing-your-focus-zone';

-- M2-your-first-vibe.md
update public.hv_modules
   set content = $modmd$# 🌱 Your First Vibe

**Module:** M2 | **Level:** Beginner | **XP:** 50 | **Coins:** 20 BROski$

> The biggest win in coding is getting your first thing RUNNING. Not perfect. RUNNING. This module gets your entire AI empire alive in one session.

---

## 🎯 What You'll Learn

- Install Docker Desktop and understand why it's the engine of everything
- Clone the HyperCode V2.4 repository
- Configure your `.env` file with API keys and secrets
- Run `docker compose up -d` and launch 32 containers simultaneously
- Verify Mission Control, BROski Terminal, and core agent interfaces are live

---

## 🧠 The Big Idea

Think of Docker as a **shipping container for software**. Your entire AI empire — 32 services, databases, AI agents, dashboards — lives inside one repo. One command boots the whole thing.

**The pattern:** `docker compose up -d` = flip the power switch on your empire.

When the Docker whale icon is running in your taskbar, your mission begins. When it's sleeping, nothing works. Simple.

---

## 🛠️ What You're Launching

| Service | Port | What it is |
|---------|------|------------|
| Mission Control | 8088 | Your main dashboard |
| BROski Terminal | 3000 | AI chat interface |
| FastAPI Core | 8000 | Brain of the operation |
| Supabase (local) | 54321 | Your database |
| Grafana | 3001 | System health monitor |

---

## ⚡ Step-by-Step

### Step 1 — Install Docker Desktop
Download from [docker.com](https://docker.com/products/docker-desktop). Install. Restart your machine.
Check the whale icon appears in your taskbar — that's your engine running.

### Step 2 — Clone the Repo
```bash
git clone https://github.com/welshDog/HyperCode-V2.4.git
cd HyperCode-V2.4
```

### Step 3 — Set Up Your .env
```bash
cp .env.example .env
```
Open `.env` and fill in your API keys. **Never share this file. Never commit it.**

### Step 4 — Boot the Empire
```bash
docker compose up -d
```
This pulls images and starts all containers. First run takes ~5 minutes. After that, it's instant.

### Step 5 — Verify It's Alive
Open your browser:
- [http://localhost:8088](http://localhost:8088) → Mission Control should load
- [http://localhost:3000](http://localhost:3000) → BROski Terminal
- [http://localhost:8000/docs](http://localhost:8000/docs) → FastAPI Swagger

---

## 🌟 The Neurodivergent Edge

Traditional dev setup: install this, then that, then configure this, then debug that = **instruction freeze**.

HyperCode setup: one repo, one file to fill in, one command = **immediate win**.

The dopamine hit of seeing Mission Control load for the first time? **That's intentional.** That's the first BROski$ reward.

---

## ✨ Practical Task

Run `docker compose up -d` and verify Mission Control loads at `http://localhost:8088`.

**When that page loads — you are officially a HyperCode operator.** 🚀

---

## 📊 XP Check

- [ ] Docker Desktop installed + whale icon running
- [ ] Repo cloned
- [ ] `.env` configured
- [ ] `docker compose up -d` ran successfully
- [ ] Mission Control visible at localhost:8088

**Complete all 5 → Claim your 50 XP + 20 BROski$ 🤑**
$modmd$,
       content_hash = '9e6fb2fcaffb143509b09eabba981b84',
       updated_at = now()
 where slug = 'your-first-vibe';

-- M3-prompt-like-a-pro.md
update public.hv_modules
   set content = $modmd$# 🎤 Prompt Like a Pro

**Module:** M3 | **Level:** Beginner | **XP:** 30 | **Coins:** 10 BROski$

> Natural language IS a programming language. You already speak it. This module teaches you to use it to build real software.

---

## 🎯 What You'll Learn

- Understand the "Vibe Coding" philosophy: natural language → AI code → shipped product
- Write prompts that produce deployable code, not just snippets
- Use the "North Star" workflow for every build session
- Break big tasks into small, focused prompts (anti-freeze technique)
- Treat the AI as a ride-or-die coding partner, not a search engine

---

## 🧠 The Big Idea

**Vibe Coding** = describing what you want in plain English to an AI, then shipping what comes back.

You don't memorise syntax. You don't read 500-page manuals. You **describe the pattern** you want and guide the AI to build it.

**The North Star Workflow:**
```
Natural Language → AI Code → Shipped Product
```
Every session. Every feature. Every time.

---

## 🔥 The Prompting Levels

| Level | Example Prompt | What You Get |
|-------|---------------|-------------|
| 🐣 Rookie | "make a button" | Basic HTML button |
| 🐦 Vibe Coder | "make a button that calls my FastAPI /save endpoint and shows a toast on success" | Wired, functional component |
| 🦅 Agent Builder | "build a React component with optimistic UI, error boundary, retry logic, and Supabase auth check" | Production-ready feature |

---

## ⚡ Step-by-Step

### Step 1 — The Context Header
Start every AI session with:
```
You are working on the HyperCode V2.4 ecosystem.
Stack: Next.js frontend, FastAPI backend, Supabase DB, Docker containers.
Tone: direct, no fluff, ADHD-friendly output (bullet points, emoji, short sentences).
```

### Step 2 — One Task Per Prompt
Don't ask for 10 things at once. Your brain fragments, the AI fragments, the code fragments.
One prompt. One task. One win. Repeat.

### Step 3 — The Instruction Decoder (revisited)
When AI output confuses you:
```
Explain this to me like I'm pattern-thinking, not syntax-thinking.
Use a metaphor. Max 5 bullet points.
[PASTE CODE OR CONCEPT]
```

### Step 4 — The "Agent Crew" Metaphor
Think of your AI agents like a sports team:
- **Claude** = The strategist. Big picture. Architecture.
- **Copilot** = The sprinter. Inline, fast, code completion.
- **Ollama** = The local player. Private, no API costs, runs offline.

---

## 🌟 The Neurodivergent Edge

The AI never judges you. You can ask the same question five times. You can say "I don't understand" and get a different explanation every time.

**This is your safe space to build at the speed of thought.** Stop apologising for your brain. Use it.

---

## ✨ Practical Task

Write a prompt that asks the AI to explain the "Agent Crew" using a pattern that makes sense to YOUR brain (sports team, music band, family, whatever works for you).

Then write a second prompt that asks the AI to build a simple "Hello World" button using your stack.

---

## 📊 XP Check

- [ ] Context Header saved and used in a session
- [ ] Wrote 3 single-task prompts (not 1 mega-prompt)
- [ ] Used the Agent Crew metaphor to explain the stack to yourself
- [ ] Built something (anything) using Natural Language → AI Code workflow

**Complete all 4 → Claim your 30 XP + 10 BROski$ 🤑**
$modmd$,
       content_hash = 'baf4f23f9331fdce00e5495ab0872537',
       updated_at = now()
 where slug = 'prompt-like-a-pro';

-- M4-build-your-first-app.md
update public.hv_modules
   set content = $modmd$# 🏗️ Build Your First App

**Module:** M4 | **Level:** Beginner | **XP:** 40 | **Coins:** 15 BROski$

> You've got the engine running and you know how to talk to it. Now let's BUILD something real. A working app. Your app. Shipped.

---

## 🎯 What You'll Learn

- Use the Natural Language → AI Code → Shipped workflow to build a full feature
- Build a Next.js frontend component connected to a FastAPI endpoint
- Use fast feedback loops: generate → test → iterate in under 5 minutes
- Earn your first "constant small win" — a working, interactive UI
- Understand why building is the best way to learn for neurodivergent minds

---

## 🧠 The Big Idea

You're not here to read about building. You're here to BUILD.

**The fast feedback loop:**
```
Describe feature → AI generates code → Paste + test locally → Works? Ship it. Broken? Fix prompt → repeat.
```

Typical loop time: **under 5 minutes per feature**. That's not an exaggeration.

**The pattern:** Next.js = your face. FastAPI = your brain. Together they talk via HTTP requests.

---

## 🛠️ The Stack You're Using

| Layer | Tool | Port |
|-------|------|------|
| Frontend | Next.js | 3000 |
| Backend | FastAPI | 8000 |
| Database | Supabase | 54321 |
| AI | Claude via MCP | 8001 |

---

## ⚡ Step-by-Step: Build a Task Widget

### Step 1 — Create the FastAPI endpoint
Prompt:
```
Create a FastAPI endpoint POST /tasks that accepts { title: string } 
and returns { id: uuid, title: string, created_at: datetime }.
No auth needed. Just the endpoint.
```

### Step 2 — Create the Next.js component
Prompt:
```
Create a React component <TaskWidget /> that:
- Has a text input and a submit button
- On submit, POST to http://localhost:8000/tasks
- Shows the returned task in a list below
- Uses Tailwind CSS
- Shows a loading state while the request runs
```

### Step 3 — Wire them together
Drop the component into your Next.js app (`app/page.tsx`). Run both services. Click the button.

### Step 4 — Celebrate
You just built a full-stack feature. Frontend talks to backend. Data flows both ways.
**That's the pattern. Now you can build ANYTHING.**

---

## 🌟 The Neurodivergent Edge

Building a working app is a **major milestone** for neurodivergent learners because:
- It provides the **constant small wins** needed to maintain hyperfocus
- It proves your brain IS capable (because it just built something real)
- It creates a **tangible reference point** — you can see it, touch it, show it

---

## ✨ Practical Task

Use the Natural Language → AI Code workflow to generate a simple "Hello World" button that changes colour when clicked.

Then extend it: make the button call your FastAPI endpoint and display the response.

---

## 📊 XP Check

- [ ] FastAPI endpoint created and returning data
- [ ] Next.js component built and rendering
- [ ] Frontend and backend connected (HTTP request flows)
- [ ] Full feature built using AI prompts, not manual code

**Complete all 4 → Claim your 40 XP + 15 BROski$ 🤑**
$modmd$,
       content_hash = 'b8517206a82fc42711f4f81f40b8f8c6',
       updated_at = now()
 where slug = 'build-your-first-app';

-- M5-full-stack-vibe.md
update public.hv_modules
   set content = $modmd$# 🧠 Full Stack Vibe

**Module:** M5 | **Level:** Intermediate | **XP:** 50 | **Coins:** 20 BROski$

> You've built apps. Now let's wire them to a real database, real auth, and real serverless functions. Welcome to full stack.

---

## 🎯 What You'll Learn

- Connect your app to Supabase for database + authentication
- Write and deploy Edge Functions (serverless TypeScript, globally distributed)
- Route AI interactions through the Vercel AI Gateway
- Use PostgreSQL database functions for low-latency server-side logic
- Sync user data (BROski$ tokens) between frontend, backend, and DB

---

## 🧠 The Big Idea

A full-stack app has three layers talking to each other:
```
Frontend (Next.js) ↔ Backend (Supabase/FastAPI) ↔ Database (PostgreSQL)
```

**Supabase** handles the backend plumbing so you don't have to build it from scratch:
- Auth (login/logout/sessions)
- Database (PostgreSQL with row-level security)
- Edge Functions (TypeScript that runs at the edge, near your users)
- Realtime (live data updates via WebSockets)

---

## 🛠️ Key Concepts

| Concept | What it is | When to use it |
|---------|-----------|----------------|
| Edge Functions | Serverless TypeScript at the edge | Webhooks (Stripe), scheduled jobs |
| Database Functions | SQL logic that runs server-side | Low-latency calculations, token sync |
| Row Level Security | Per-user data access rules | EVERYTHING that touches user data |
| Vercel AI Gateway | Routes AI API calls | Abstracting Claude/GPT/Ollama calls |

---

## ⚡ Step-by-Step

### Step 1 — Connect Supabase to your app
```bash
npm install @supabase/supabase-js
```
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Step 2 — Add authentication
Prompt:
```
Add Supabase email/password auth to my Next.js app.
Create a /login page with email + password fields.
On success redirect to /dashboard.
Use @supabase/ssr for server-side session management.
```

### Step 3 — Deploy an Edge Function
```bash
supabase functions new token-sync
```
Prompt:
```
Write a Supabase Edge Function that listens to a Stripe webhook.
When a payment.succeeded event arrives, update the user's brosk_coins
column in the profiles table by the amount purchased.
```

### Step 4 — Wire the Vercel AI Gateway
In your API route (`app/api/chat/route.ts`):
```typescript
const response = await fetch(process.env.VERCEL_AI_GATEWAY_URL!, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.VERCEL_AI_TOKEN}` },
  body: JSON.stringify({ model: 'claude-3-5-sonnet', messages })
})
```

---

## 🌟 The Neurodivergent Edge

Supabase removes the most ADHD-hostile part of web dev: **infrastructure setup**. No configuring servers, no managing databases manually, no writing auth from scratch.

You focus on **what your app does**. Supabase handles **how it stays alive**.

---

## ✨ Practical Task

Connect your app from M4 to Supabase. Add a `tasks` table. Make the TaskWidget save tasks to the database and fetch them on load. Now your data persists across page refreshes.

---

## 📊 XP Check

- [ ] Supabase client initialised in the app
- [ ] Auth working (login + protected route)
- [ ] At least one Edge Function deployed
- [ ] Data persisting to PostgreSQL

**Complete all 4 → Claim your 50 XP + 20 BROski$ 🤑**
$modmd$,
       content_hash = '5076c98b4594b9abde4f70c3daa77314',
       updated_at = now()
 where slug = 'full-stack-vibe';

-- M6-hypercode-the-hyper-way.md
update public.hv_modules
   set content = $modmd$# 🔥 HyperCode The Hyper Way

**Module:** M6 | **Level:** Advanced | **XP:** 75 | **Coins:** 30 BROski$

> You've built apps and wired databases. Now you step into the living, breathing AI architecture that runs itself. Welcome to the Advanced tier.

---

## 🎯 What You'll Learn

- Understand the 32-container HyperCode V2.4 architecture as a whole system
- Direct Agent X (the Meta-Architect) to design and deploy new agents
- Implement the Healer Agent for auto-recovery of failed services
- Manage the Crew Orchestrator for mission execution across the swarm
- See the entire stack as a **living cognitive architecture**, not just code

---

## 🧠 The Big Idea

Most developers manage code. HyperCode operators **direct intelligent systems**.

You are no longer a coder. You are a **Meta-Architect** — you describe the vision, and the agent swarm builds it.

**The pattern:**
```
Your vision → Agent X designs it → Crew Orchestrator deploys it → Healer keeps it alive
```

---

## 🐝 The Agent Swarm

| Agent | Role | What it does |
|-------|------|--------------|
| Agent X | Meta-Architect | Designs + deploys new agents autonomously |
| Healer Agent | Self-healing | Monitors services, auto-recovers failures |
| Crew Orchestrator | Mission control | Manages agent lifecycle and task routing |
| Memory Agent | Context keeper | Stores and retrieves agent context across sessions |
| FastAPI Core | The backbone | Handles all inter-agent communication |

---

## ⚡ Step-by-Step

### Step 1 — Read the swarm from the top
Open Mission Control (localhost:8088). Look at every service. Understand what each container does before you touch anything.

Prompt:
```
Explain the HyperCode V2.4 container architecture as a pattern diagram.
Show me which agents talk to which, what protocols they use, and what
fails if each one goes down. ADHD-friendly format: emoji, short bullets.
```

### Step 2 — Trigger the Healer
```bash
# Simulate a service failure
docker stop hypercode-memory-agent
# Watch the Healer detect and restart it
docker logs hypercode-healer --follow
```

### Step 3 — Deploy a new agent via Agent X
Prompt to Agent X (via Mission Control chat):
```
Design and deploy a new agent called "course-tracker-agent".
It should: watch the hv_modules table in Supabase for status changes
and post a Discord notification when a module goes from 'recorded' to 'published'.
Manifest + Dockerfile + registration in the swarm.
```

### Step 4 — Wire SRE Observability
Open Grafana (localhost:3001). Set up a dashboard that shows:
- Container health (up/down)
- API request rate
- Error rate per agent

---

## 🌟 The Neurodivergent Edge

The HyperCode architecture is designed around **pattern recognition** — the same brain wiring that makes ADHD minds brilliant at seeing whole systems at once.

You don't need to understand every line of code. You need to understand **the pattern**. Once you see it, you can direct it.

---

## ✨ Practical Task

Stop one non-critical container. Watch the Healer respond. Restart it. Check Grafana shows the recovery event.

You just did SRE operations on a 32-container AI system. **That's not beginner stuff.** 🔥

---

## 📊 XP Check

- [ ] Full container map understood (can explain each agent's role)
- [ ] Healer Agent triggered and recovery observed
- [ ] New agent deployed via Agent X (or designed via prompt)
- [ ] Grafana dashboard showing swarm health

**Complete all 4 → Claim your 75 XP + 30 BROski$ 🤑**
$modmd$,
       content_hash = '3a5c7f1a52d2ba68e071cb4bc1038962',
       updated_at = now()
 where slug = 'hypercode-the-hyper-way';

-- M7-agent-architecture-manifests.md
update public.hv_modules
   set content = $modmd$# 🛠️ Agent Architecture & Manifests

**Module:** M7 | **Level:** Advanced | **XP:** 70 | **Coins:** 25 BROski$

> Every agent in the HyperCode ecosystem is defined by a manifest. Learn to write them, read them, and use them to deploy agents like a pro.

---

## 🎯 What You'll Learn

- Understand the HyperAgent-SDK manifest format
- Write a complete `manifest.json` from scratch
- Define skills, MCP tools, triggers, and memory backends
- Register a new agent in the swarm using the manifest
- Move from single-agent to cluster deployment using `cluster.json`

---

## 🧠 The Big Idea

A **manifest** is a contract. It tells the swarm:
- What this agent does
- What tools it can call
- What triggers it
- Where it stores memory
- How to start, stop, and monitor it

**The pattern:** Manifest → SDK reads it → Agent spawns with correct wiring.

No manifest = no agent. Wrong manifest = broken agent. Correct manifest = agent that runs itself.

---

## 📄 Manifest Structure

```json
{
  "name": "my-agent",
  "version": "0.1.0",
  "description": "What this agent does in one sentence",
  "runtime": { "port": 8020, "timeout_ms": 30000 },
  "memory": { "backend": "supabase", "tables": ["agent_memory"] },
  "triggers": [
    { "type": "cron", "schedule": "0 * * * *", "skill": "hourly_job" },
    { "type": "webhook", "path": "/webhook/event", "skill": "handle_event" }
  ],
  "skills": [
    {
      "name": "hourly_job",
      "description": "Runs every hour",
      "input": {}
    }
  ],
  "mcp_tools": [],
  "env_required": ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
}
```

---

## ⚡ Step-by-Step

### Step 1 — Anatomy of a manifest
Read the `course-content-agent/manifest.json` we built. Understand every field.

### Step 2 — Write a manifest from scratch
Design a `notification-agent` that:
- Watches a Supabase table for changes
- Sends a Discord webhook when a row is inserted
- Runs on a cron every 10 minutes as a fallback

### Step 3 — Register in the swarm
```bash
npm run register-agent -- --manifest agents/notification-agent/manifest.json
```

### Step 4 — Cluster deployment
Create `cluster.json` referencing multiple agents:
```json
{
  "cluster": "hyper-vibe-course",
  "agents": [
    { "path": "agents/course-content-agent", "enabled": true },
    { "path": "agents/notification-agent", "enabled": true }
  ]
}
```

---

## 🌟 The Neurodivergent Edge

Manifests are **visual, structured, and pattern-based**. Once you understand the shape of one manifest, you understand ALL manifests. Your pattern brain will love this.

---

## ✨ Practical Task

Write a manifest for an agent that does something useful for YOUR workflow. It doesn't have to be complex — a Discord notifier, a daily task reminder, a file watcher. Write the manifest. Then implement one skill.

---

## 📊 XP Check

- [ ] Existing manifest fully understood (every field explained)
- [ ] New manifest written from scratch
- [ ] At least one skill implemented
- [ ] Agent registered in the swarm (or cluster.json created)

**Complete all 4 → Claim your 70 XP + 25 BROski$ 🤑**
$modmd$,
       content_hash = '53edb9db6358e370ed1aa679f6494db2',
       updated_at = now()
 where slug = 'agent-architecture-manifests';

-- M8-soulful-entities-ai-pets.md
update public.hv_modules
   set content = $modmd$# 🐕 Soulful Entities & AI Pets

**Module:** M8 | **Level:** Advanced | **XP:** 70 | **Coins:** 25 BROski$

> What if your AI agent had a personality? A memory? A mood? This module is where tech meets soul.

---

## 🎯 What You'll Learn

- Understand the BROskiPets-LLM-dNFT architecture
- Give an agent a persistent personality using Supabase memory tables
- Implement mood states and behavioural drift over time
- Connect agent personality to on-chain NFT metadata
- Build an AI pet that remembers you, grows with you, and has a vibe

---

## 🧠 The Big Idea

A **soulful entity** is an AI agent that:
1. Has a **persistent memory** (remembers past conversations)
2. Has a **personality** (defined traits, communication style)
3. Has **mood states** (changes behaviour based on interactions)
4. Has an **on-chain identity** (NFT that evolves as the agent grows)

**The pattern:** Agent = code + memory + personality + on-chain soul.

---

## 🐾 BROskiPet Architecture

```
On-chain NFT (Solana/EVM)
    │
    ├─ Pet metadata (name, traits, level, mood)
    ├─ Evolution triggers (XP milestones, interactions)
    └─ LLM personality layer
            │
            ├─ Supabase memory (conversation history)
            ├─ Mood state machine (happy/tired/hyperfocused)
            └─ Personality prompt (SYSTEM message injected per conversation)
```

---

## ⚡ Step-by-Step

### Step 1 — Create the personality SYSTEM prompt
```typescript
const PERSONALITY_SYSTEM = `
You are ${pet.name}, a BROski AI pet.
Personality: ${pet.traits.join(', ')}.
Current mood: ${pet.mood}.
You remember: ${pet.memory_summary}.
Respond in character. Keep responses under 3 sentences unless asked for more.
`;
```

### Step 2 — Build the memory table
```sql
create table pet_memories (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  role text, -- 'user' | 'assistant'
  content text,
  created_at timestamptz default now()
);
```

### Step 3 — Implement mood drift
```typescript
function calculateMood(interactions: number, lastActive: Date): Mood {
  const hoursSince = (Date.now() - lastActive.getTime()) / 3600000;
  if (hoursSince > 48) return 'lonely';
  if (interactions > 20) return 'hyperfocused';
  return 'happy';
}
```

### Step 4 — Connect to NFT metadata
When the pet levels up, trigger an on-chain metadata update:
```typescript
await updateNFTMetadata(pet.token_id, {
  level: pet.level,
  mood: pet.mood,
  traits: pet.traits,
  image: generatePetImage(pet) // AI-generated based on current state
});
```

---

## 🌟 The Neurodivergent Edge

AI pets aren't just fun — they're **accountability partners** that don't judge you.

For ADHD minds that struggle with consistency, a pet that gets "lonely" if you don't check in creates a gentle, non-punishing motivation loop.

---

## ✨ Practical Task

Create a BROski pet with a name, 3 personality traits, and a basic memory system. Have a conversation with it. Watch it remember something from earlier in the conversation.

---

## 📊 XP Check

- [ ] Pet personality SYSTEM prompt written
- [ ] Memory table created in Supabase
- [ ] Mood state machine implemented (at least 3 states)
- [ ] Conversation with your pet that demonstrates memory

**Complete all 4 → Claim your 70 XP + 25 BROski$ 🤑**
$modmd$,
       content_hash = '6016894d12fc66fb2a8f44ffc7d9d6e3',
       updated_at = now()
 where slug = 'soulful-entities-ai-pets';

-- M9-web3-integration-on-chain.md
update public.hv_modules
   set content = $modmd$# 🔗 Web3 Integration & On-Chain

**Module:** M9 | **Level:** Hyper-Pro | **XP:** 80 | **Coins:** 35 BROski$

> The BROski$ economy is real. On-chain NFTs are real. This module connects your AI ecosystem to the blockchain.

---

## 🎯 What You'll Learn

- Understand the BROski$ token economy architecture
- Integrate Stripe payments that trigger on-chain token minting
- Implement dynamic NFT metadata that evolves with agent state
- Connect Supabase off-chain data to on-chain smart contracts
- Build the payment → token → NFT pipeline end-to-end

---

## 🧠 The Big Idea

Web3 in the HyperCode ecosystem isn't about speculation. It's about **ownership**.

- **BROski$ tokens** = proof of work, proof of learning, proof of contribution
- **dNFTs** (dynamic NFTs) = your AI pet's on-chain identity that evolves
- **The pipeline:** User pays Stripe → Edge Function fires → Supabase updated → On-chain minted

---

## 💰 The BROski$ Economy

| Action | BROski$ Earned |
|--------|---------------|
| Complete a module | 10–100 coins |
| Daily login | +5 coins |
| Create a task | +2 coins |
| Contribute to repo | +20 coins |
| Purchase (Stripe) | Variable pack |

| Pack | Price | Coins |
|------|-------|-------|
| Starter | £4.99 | 500 |
| Builder | £14.99 | 2,000 |
| Hyper | £49.99 | 10,000 |

---

## ⚡ Step-by-Step

### Step 1 — Wire Stripe Checkout
```typescript
// app/api/checkout/route.ts
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
  metadata: { user_id: userId, pack: packName }
});
```

### Step 2 — Handle the webhook
```typescript
// Supabase Edge Function: stripe-webhook
const event = stripe.webhooks.constructEvent(body, sig, secret);
if (event.type === 'checkout.session.completed') {
  const { user_id, pack } = event.data.object.metadata;
  const coins = PACK_COINS[pack];
  await supabase.from('profiles').update({ brosk_coins: supabase.rpc('increment', { amount: coins }) }).eq('id', user_id);
}
```

### Step 3 — Dynamic NFT metadata endpoint
```typescript
// app/api/nft/[tokenId]/route.ts
const pet = await supabase.from('pets').select('*').eq('token_id', tokenId).single();
return Response.json({
  name: pet.name,
  description: `Level ${pet.level} BROski Pet`,
  image: generatePetImage(pet),
  attributes: [
    { trait_type: 'Level', value: pet.level },
    { trait_type: 'Mood', value: pet.mood },
    { trait_type: 'XP', value: pet.xp }
  ]
});
```

---

## 🌟 The Neurodivergent Edge

The token economy is designed for **ADHD reward loops**. Small, frequent, tangible rewards. The coins you earn by completing modules have **real value** in the ecosystem.

---

## ✨ Practical Task

Set up Stripe in test mode. Create a checkout for the Starter pack. Complete a test payment. Verify your `brosk_coins` balance increases in Supabase.

---

## 📊 XP Check

- [ ] Stripe Checkout working in test mode
- [ ] Webhook handler deployed (Supabase Edge Function)
- [ ] Coins update in DB on successful payment
- [ ] NFT metadata endpoint returning dynamic attributes

**Complete all 4 → Claim your 80 XP + 35 BROski$ 🤑**
$modmd$,
       content_hash = '69be09229564ffe4ab092316861a72f4',
       updated_at = now()
 where slug = 'web3-integration-on-chain';

-- M10-security-sre-observability.md
update public.hv_modules
   set content = $modmd$# 🛡️ Security & SRE Observability

**Module:** M10 | **Level:** Hyper-Pro | **XP:** 80 | **Coins:** 35 BROski$

> You built the empire. Now let's make sure it doesn't fall. Security. Monitoring. Self-healing. This is how pros run production.

---

## 🎯 What You'll Learn

- Implement Row Level Security (RLS) on every Supabase table
- Set up the full observability stack: Prometheus + Grafana + Loki + Tempo
- Configure alerting for critical service failures
- Conduct a security audit of your agent architecture
- Understand the principle of least privilege for service accounts

---

## 🧠 The Big Idea

**SRE** (Site Reliability Engineering) = the practice of keeping systems alive, fast, and secure in production.

For an AI agent ecosystem, this means:
- **Visibility:** You can SEE what every agent is doing in real-time
- **Alerting:** You know BEFORE users do when something breaks
- **Recovery:** The system fixes itself where possible
- **Security:** Only the right entities can access the right data

---

## 📊 The Observability Stack

| Tool | Role | What it monitors |
|------|------|------------------|
| Prometheus | Metrics scraper | CPU, memory, request rates per container |
| Grafana | Visualisation | Dashboards for all of the above |
| Loki | Log aggregation | All container logs, searchable |
| Tempo | Distributed tracing | Request flow across agents |
| Alertmanager | Alerting | Fires Slack/Discord/email on thresholds |

---

## ⚡ Step-by-Step

### Step 1 — Enable RLS on every table
```sql
-- Run this for EVERY table you create
alter table your_table enable row level security;

-- Users can only see their own data
create policy "users_own_data" on your_table
  for all to authenticated
  using (auth.uid() = user_id);
```

### Step 2 — Verify Prometheus is scraping
Open [http://localhost:9090](http://localhost:9090) → Status → Targets.
All targets should show `UP`. Any `DOWN` = investigate.

### Step 3 — Build your first Grafana dashboard
Open [http://localhost:3001](http://localhost:3001).
Create a dashboard with panels for:
- Container up/down status
- FastAPI request rate (req/s)
- Error rate (5xx responses)

### Step 4 — Set up an alert
In Grafana: Alerting → Alert Rules → New Rule.
Alert: "FastAPI error rate > 5% for 2 minutes" → send to Discord webhook.

### Step 5 — Security audit checklist
- [ ] No API keys in git history (`git log -p | grep API_KEY`)
- [ ] All tables have RLS enabled
- [ ] Service role key ONLY in agent `.env` files (never frontend)
- [ ] All Docker containers `cap_drop: ["ALL"]` + `no-new-privileges:true`

---

## 🌟 The Neurodivergent Edge

Grafana dashboards are **visual, colour-coded, and pattern-rich** — perfect for ADHD brains that scan for anomalies instinctively. You'll spot problems before alerts fire.

---

## ✨ Practical Task

Run the security audit checklist above on your current setup. Fix any findings. Screenshot your Grafana dashboard showing all containers healthy.

---

## 📊 XP Check

- [ ] RLS enabled on all Supabase tables
- [ ] Prometheus showing all targets UP
- [ ] Grafana dashboard built with at least 3 panels
- [ ] One alert rule configured
- [ ] Security audit checklist completed

**Complete all 5 → Claim your 80 XP + 35 BROski$ 🤑**
$modmd$,
       content_hash = 'c859d04815cf2e8d9fb14c3a8bb4aa0f',
       updated_at = now()
 where slug = 'security-sre-observability';

-- M11-ship-scale-graduate.md
update public.hv_modules
   set content = $modmd$# 🚀 Ship, Scale & Graduate

**Module:** M11 | **Level:** Elite | **XP:** 150 | **Coins:** 100 BROski$

> You've built it. You've secured it. You've monitored it. Now it's time to SHIP it to the world and become a HyperCode Graduate.

---

## 🎯 What You'll Learn

- Deploy your full Next.js frontend to Vercel (production)
- Configure production environment variables securely
- Set up custom domains and SSL
- Run `npm run graduate` — the cluster graduation workflow
- Onboard your first real user and watch the system handle them
- Earn the **HyperCode Graduate** achievement and title

---

## 🧠 The Big Idea

**Shipping** is the only metric that matters.

You can have the most beautiful code in the world. If it's not live, it doesn't exist.

This module is about the final 10% that separates builders from shippers:
- Production config is different from local config
- Real users find bugs you never imagined
- Scaling means your architecture choices come home to roost

**The pattern:** Local → Staging → Production. Each step is a gate. Pass all three.

---

## 🚀 The Graduation Workflow

```bash
# From repo root
npm run graduate
```

This command:
1. Reads your `cluster.json`
2. Validates all agent manifests
3. Runs the full test suite
4. Builds the Next.js app
5. Deploys to Vercel
6. Registers all agents in production
7. Runs a smoke test against live endpoints
8. Awards your Graduate achievement in Supabase

---

## ⚡ Step-by-Step

### Step 1 — Prep production environment
```bash
# Never use local .env for production
# Set these in Vercel dashboard: Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your-prod-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Server-side only:
SUPABASE_SERVICE_ROLE_KEY=your-service-role
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2 — Deploy frontend
```bash
npx vercel --prod
```
Or connect your GitHub repo to Vercel for automatic deployments on push.

### Step 3 — Test the live URL
- [ ] Login works
- [ ] Data loads from Supabase
- [ ] Stripe checkout completes
- [ ] AI chat responds

### Step 4 — Run graduation
```bash
npm run graduate
```
Watch the output. Fix any failures. Re-run. When it passes completely — you're a Graduate.

---

## 🌟 The Neurodivergent Edge

Shipping creates the **biggest dopamine hit** in the entire course. Seeing YOUR app live on a real URL, used by real people, is the ultimate hyperfocus reward.

This is why we built everything in small steps. Every module was a small win leading to **the big win**.

---

## ✨ Practical Task

Deploy your app to Vercel. Share the live URL with someone. Watch them use it. Fix the first thing they break. That's production dev.

---

## 📊 XP Check

- [ ] Frontend deployed to Vercel (live URL)
- [ ] All environment variables set in production (not local `.env`)
- [ ] Login + data + Stripe all working on live URL
- [ ] `npm run graduate` passes all checks
- [ ] HyperCode Graduate achievement unlocked in Supabase

**Complete all 5 → Claim your MASSIVE 150 XP + 100 BROski$ 🤑🚀**
$modmd$,
       content_hash = '114e108d655c4e8df9d0afc829b4275c',
       updated_at = now()
 where slug = 'ship-scale-graduate';

-- M12-ride-or-die-contribution.md
update public.hv_modules
   set content = $modmd$# 🤝 The Ride or Die Contribution

**Module:** M12 | **Level:** Elite | **XP:** 100 | **Coins:** 50 BROski$

> You didn't just learn to code. You joined a community. Now give back, contribute, and help the next BROski find their First Vibe.

---

## 🎯 What You'll Learn

- Make your first open source contribution to the HyperCode ecosystem
- Write documentation that helps neurodivergent learners
- Review a pull request with empathy and precision
- Mentor someone else through Module 1 (paying it forward)
- Earn the **Ride or Die** badge — the highest honour in the ecosystem

---

## 🧠 The Big Idea

The best way to cement knowledge is to **teach it**.

The best communities aren't just consumers — they're **contributors**. Every great tool you used in this course was built by someone who started exactly where you started.

**The pattern:** Learner → Builder → Contributor → Leader.

You're now at Contributor. Leadership is earned by coming back.

---

## 🤝 What "Ride or Die" Means

In this ecosystem, "ride or die" isn't a phrase. It's a **commitment**:
- No judgment. Ever.
- Help the person behind you.
- Build things that last.
- Show up, even when it's hard.

This is what makes the HyperCode community different from every other dev community.

---

## ⚡ Step-by-Step

### Step 1 — Find something to improve
Look through the repo. Find:
- A bug you hit during the course
- A doc that confused you (and write a better version)
- A missing test for something you built
- A feature you built that others would benefit from

### Step 2 — Fork, branch, fix, PR
```bash
git checkout -b fix/your-improvement-name
# Make your change
git add .
git commit -m "fix: [what you fixed and why it helps]"
git push origin fix/your-improvement-name
# Open PR on GitHub → fill in the template
```

### Step 3 — Write neurodivergent-friendly docs
When writing documentation, follow the HyperCode doc rules:
- **Why** first, then **how**
- Short sentences. Bullet points. Emojis.
- One concept per section
- Include a working code example for EVERY concept

### Step 4 — Mentor someone
Find a new student in the Discord. Offer to pair-program Module 1 with them.
Teaching Module 1 to someone else will reveal gaps in your own understanding — and fill them.

### Step 5 — Claim your badge
Open a PR that adds your name to `CONTRIBUTORS.md` with:
```markdown
| [@yourhandle](https://github.com/yourhandle) | Module completed | Your contribution |
```

---

## 🌟 The Neurodivergent Edge

Neurodivergent contributors often make the **best documentation writers** because they remember what it felt like to be confused. That empathy makes docs that actually help.

Your "weird" perspective — the one that made learning hard — is the same perspective that will help the next person feel less alone.

---

## ✨ Practical Task

Merge your first PR into the HyperCode ecosystem. It can be small. A typo fix counts. A one-line improvement counts. The act of contributing is what matters.

**Welcome to the Ride or Die crew.** 🤝

---

## 📊 XP Check

- [ ] First PR opened (any size)
- [ ] Documentation written following the HyperCode doc rules
- [ ] PR reviewed (either yours reviewed by others, or you reviewed someone else's)
- [ ] Name added to `CONTRIBUTORS.md`
- [ ] At least one person helped through Module 1

**Complete all 5 → Claim your 100 XP + 50 BROski$ + Ride or Die Badge 🤝🤑**
$modmd$,
       content_hash = 'b48bc6c94d85b4303eb5e13bbd0e18f9',
       updated_at = now()
 where slug = 'ride-or-die-contribution';
