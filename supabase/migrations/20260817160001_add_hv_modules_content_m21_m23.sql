-- Batch 1 content for the M21-M30 expansion. Must run after
-- 20260817160000_seed_hv_modules_m21_m23.sql.

-- M21-multi-agent-crews
update public.hv_modules
   set content = $modmd$# 🐝 Multi-Agent Crews

**Module:** M21 | **Level:** Hyper-Pro | **XP:** 160 | **Coins:** 85 BROski$

> One agent doing everything is one agent losing context. This module builds a small crew of specialized agents — each with a narrow job — that hand work to each other cleanly instead of one do-everything chat drowning in scope.

---

## 🎯 What You'll Learn

- Why one agent handling planning + building + reviewing loses focus fast
- How to give each agent a single, named role
- How to design a real handoff protocol between agents
- Why an agent should only consume what the previous one produced — never freelance outside it
- How this builds directly on M7's Agent Architecture & Manifests

---

## 🧠 The Big Idea

A single agent juggling "plan this, build it, review it, fix it" behaves like a person context-switching every 30 seconds — it drops threads. A crew of narrow-role agents doesn't have that problem, because each one only ever has to hold *its own* job in its head. The planner never touches code. The builder never re-decides the plan. The handoff between them is the discipline that makes this work.

---

## 🛠️ The Crew

| Role | Job | Never does |
|---|---|---|
| Planner | Turns a goal into a scoped Mini-PRD | Write implementation code |
| Builder | Implements only what the Mini-PRD says | Change the plan mid-build |
| Reviewer | Checks the diff against the Mini-PRD | Add new scope |

---

## ⚡ Step-by-Step

### Step 1 — Give the Planner its manifest
Role: "Planner — turns one goal into one scoped Mini-PRD (Goal / Non-goals / Done means / Files allowed). Never writes code."

### Step 2 — Give the Builder its manifest
Role: "Builder — implements only the attached Mini-PRD, touching only its allowed files. If the Mini-PRD is unclear or incomplete, stop and ask — never guess or expand scope."

### Step 3 — Define the handoff artifact
The Planner's *only* output is a Mini-PRD (same shape as M19's). The Builder's *only* input is that Mini-PRD — no side-channel context, no "also do this while you're in there."

### Step 4 — Run a real 2-agent handoff
Use two separate chat sessions or CLI agent instances as the harness. Feed the Planner a real goal. Paste its Mini-PRD output, unedited, into the Builder. Watch whether the Builder stays inside the lines.

### Step 5 — Add the Reviewer
Feed the Reviewer the Mini-PRD and the Builder's diff. Its only question: does the diff match the Mini-PRD, file for file? Nothing else.

---

## 🌟 The Neurodivergent Edge

- **Narrow roles reduce your own context-holding load too** — you're not tracking "did the plan change" AND "is the code right" at once, you check one handoff at a time.
- **A clean handoff is a checkpoint you can trust** — if the Builder went off-script, it's visible immediately, not buried in a huge diff later.
- **This scales your own HyperSplit Agent (M14) habit** — from one task list to a real division of labor.

---

## ✨ Practical Task

Run a real 2-agent handoff: Planner produces a Mini-PRD for a small real feature, Builder implements only from it. Confirm the Builder's diff touches nothing outside the Mini-PRD's allowed files.

---

## 📊 XP Check

- [ ] Planner and Builder each given a narrow, single-purpose manifest
- [ ] A real Mini-PRD handed off unedited between them
- [ ] Builder's diff matches the Mini-PRD's allowed files exactly

**Complete all 3 → Claim your 160 XP + 85 BROski$ 🤑**
$modmd$,
       content_hash = 'f1509a950a79095b98daa976f08bbe74',
       updated_at = now()
 where slug = 'multi-agent-crews';

-- M22-approval-gates-guardrails
update public.hv_modules
   set content = $modmd$# 🚦 Approval Gates & Guardrails

**Module:** M22 | **Level:** Hyper-Pro | **XP:** 170 | **Coins:** 90 BROski$

> Nothing an agent builds should ship unreviewed. This module builds a real "propose → wait for approval → execute" gate, so an agent's write actions never happen without your explicit yes.

---

## 🎯 What You'll Learn

- The difference between dry-run/read-only mode and write mode
- Why "diff-before-apply" matters more than "trust the agent"
- How to bound an agent's blast radius with an explicit allowed-file list
- How to build a real approval checkpoint that blocks execution without a signal
- Why this is the missing piece between M14's task-splitting and actually shipping

---

## 🧠 The Big Idea

An agent that can both propose AND execute a change is an agent that can also execute a *bad* change, unsupervised. An approval gate breaks that pairing apart: the agent proposes (shows you exactly what it would do), and only a real, explicit human signal lets it actually do it. This isn't about distrust — it's the same discipline M20's RULES.md already teaches ("never guess, ask"), applied to execution instead of just planning.

---

## 🛠️ Concepts

| Mode | What it does |
|---|---|
| Dry-run | Shows the diff, touches nothing |
| Write mode | Actually applies the change |
| Blast-radius limit | A hard list of files the agent may ever touch (from M20's RULES.md) |

---

## ⚡ Step-by-Step

### Step 1 — Build dry-run mode first
Whatever your agent task is, make its default behavior "compute and print the diff, change nothing." This should be the mode you can't accidentally skip.

### Step 2 — Add the approval checkpoint
The script/prompt contract should refuse to proceed past the diff until it receives an explicit, typed "approved" — not an assumed yes, not a timeout.

### Step 3 — Bound the blast radius
List the exact files the agent may touch, same shape as M19's Mini-PRD "Files allowed." Anything outside that list is refused outright, before the diff is even shown.

### Step 4 — Wire write mode
Only once "approved" is received does the agent apply the change for real — using the exact diff that was shown, not a re-generated one (an approved diff should never silently change between approval and execution).

### Step 5 — Test the refusal path
Try to get the agent to write without approval. It should refuse every time, cleanly, not just "usually."

---

## 🌟 The Neurodivergent Edge

- **You review one diff, not a wall of trust-based assumptions** — a small, concrete decision beats an open-ended "did that go okay?"
- **The gate is calm, not adversarial** — it's not "the agent might betray you," it's "nothing executes without a clear yes," the same energy as M17's Focus Panic Mode's permission-to-stop.
- **Bounded blast radius means a bad diff is small and safe to reject** — never a sprawling, scary mess to untangle.

---

## ✨ Practical Task

Wire a toy agent task so it must print a diff and wait for typed approval before any file write happens. Confirm it refuses to write when you don't approve.

---

## 📊 XP Check

- [ ] Dry-run mode built and confirmed as the default
- [ ] Approval checkpoint refuses to proceed without an explicit signal
- [ ] Blast-radius file list enforced before the diff is even shown

**Complete all 3 → Claim your 170 XP + 90 BROski$ 🤑**
$modmd$,
       content_hash = '1367884bc2a1d65efdf65914c4b0d29a',
       updated_at = now()
 where slug = 'approval-gates-guardrails';

-- M23-watching-your-agents-action-logs
update public.hv_modules
   set content = $modmd$# 🔍 Watching Your Agents: Action Logs

**Module:** M23 | **Level:** Hyper-Pro | **XP:** 180 | **Coins:** 95 BROski$

> M10 taught you to watch whether your app is healthy. This module teaches you to watch whether your agents behaved — a structured log of exactly what ran, what changed, and what was approved.

---

## 🎯 What You'll Learn

- The real difference between app observability (M10) and agent behavior logging (this module)
- How to instrument an agent script to emit structured events, not free-text logs
- What's actually worth capturing per agent action
- How to turn a raw event stream into a real timeline you can answer questions from
- Why this is the evidence layer behind M22's approval gate

---

## 🧠 The Big Idea

M10's observability answers "is the app up?" It says nothing about "what did my agent actually do an hour ago, and why?" That's a different question, and it needs a different log: not server metrics, but a structured record of every agent action — proposed, approved, executed, rejected — that you can actually reconstruct a session from.

---

## 🛠️ What Gets Logged

| Field | Why it matters |
|---|---|
| `action` | What the agent proposed or did |
| `status` | proposed / approved / executed / rejected |
| `files_touched` | Ties directly to M22's blast-radius list |
| `timestamp` | Reconstructs the real order of events |

---

## ⚡ Step-by-Step

### Step 1 — Define the event shape
One JSON object per action: `{action, status, files_touched, timestamp}`. Nothing free-text or vague — structured fields you can actually filter and grep.

### Step 2 — Instrument the agent script
Every time your M22 approval gate proposes, approves, executes, or rejects something, emit one of these events. Append-only, never overwritten.

### Step 3 — Store it somewhere durable
A flat JSONL file is enough to start — one event per line, easy to tail and grep.

### Step 4 — Build the timeline
Turn a real session's event stream into a plain-English sequence: what was proposed, what got approved, what actually executed, in order.

### Step 5 — Answer a real question from it
Pick a real past agent session and answer "what exactly changed and why" using *only* the log — no memory, no guessing.

---

## 🌟 The Neurodivergent Edge

- **Externalized memory again, one level up from M13's Micro-Wins** — you don't have to remember what an agent did, the log remembers for you.
- **Structured beats free-text** — a field you can grep beats a paragraph you have to re-read to understand.
- **This is the evidence an approval gate needs to actually mean something** — "I approved that" is provable, not just remembered.

---

## ✨ Practical Task

Instrument a real agent script to emit structured JSON events for one real task. Tail and grep the resulting log into a plain timeline, then answer "what changed and why" using only the log.

---

## 📊 XP Check

- [ ] Structured event shape defined and used consistently
- [ ] A real session logged, append-only
- [ ] Produced a plain-English timeline from the raw log
- [ ] Answered "what changed and why" using only the log

**Complete all 4 → Claim your 180 XP + 95 BROski$ 🤑**
$modmd$,
       content_hash = 'a61823337736f48724a8c2292cd7be36',
       updated_at = now()
 where slug = 'watching-your-agents-action-logs';
