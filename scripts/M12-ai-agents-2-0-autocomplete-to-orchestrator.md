---
code: M12
title: From Autocomplete to Orchestrator
emoji: 🧗
level: Elite
slug: ai-agents-2-0-autocomplete-to-orchestrator
xp_reward: 450
coin_reward: 450
summary: Climb the ladder for real. You define a HyperFlow mission graph in plain English, run it, and watch a Level 2 → Level 3 agent execute your whole plan end-to-end — live in your own stack.
---

# 🧗 MODULE 12 — From Autocomplete to Orchestrator

> **🚀 AI Agents 2.0 — module 2 of 3.** M11 gave you the map. Now you climb it with your own hands: define a mission, hand it to an agent, watch it run the plan.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Written your **first HyperFlow mission graph** (a multi-step plan in plain English)
- ✅ **Run** it and watched the steps execute in order
- ✅ Followed a **live run stream** (SSE) as the agent works
- ✅ Felt the jump from L1 "ask one thing" → L2/L3 "run a whole mission"

**Time:** 25 minutes
**Vibe:** You write the plan. The crew executes it. You're the orchestrator now. 🧗

> 📺 **Middle of the AI Agents 2.0 trilogy.** M11 mapped the ladder · **M12 climbs it** · M13 makes it safe + self-governing.

---

## 💡 Before We Start — Recipe vs. Reflex

Level 1 agents are a **reflex**: you poke, they react, once.

Level 2/3 agents follow a **recipe**: an ordered set of steps that runs itself.

> 🍳 **Think of a chef vs. a recipe card.**
> - **L1** = you stand at the chef's shoulder saying "now chop… now fry… now plate." Every step is you.
> - **L2/L3** = you hand over the **recipe card**. The chef runs the whole dish, only calling you over if something's on fire.
>
> **A HyperFlow mission graph is that recipe card.** You write the steps once. The agent runs them in order, every time.

That's the whole climb: stop poking the agent step-by-step, start **handing it a plan**.

---

## 📋 The Anatomy of a Mission Graph

A HyperFlow graph is just **named steps, in order, each handed to an agent**:

| Part | What it is | Example |
|---|---|---|
| `name` | What the mission is called | `welcome-new-user` |
| `task` | The top-level goal, in plain English | "Onboard a new signup" |
| `steps[]` | Ordered jobs, each with an `agent` | plan → build → verify |
| `agent` | Which crew member runs that step | `orchestrator`, `agent-x`, `healer` |

> 🧠 **Plain English:** It's a to-do list where each to-do has a worker's name next to it — and the list runs itself top to bottom.

---

## ⚡ Step 1 — Look at a Working Mission First

> ⏱️ **Time: 4 minutes**

Never write a recipe from scratch when one's already on the counter. Your stack ships an example flow — `hyperflow-smoke`.

```bash
# Core up?
curl http://localhost:8000/health

# See the flows your stack already knows
curl http://localhost:8000/api/v1/flows
```

Find `hyperflow-smoke` in the list. It's the simplest possible mission — three steps, three agents:

```json
{
  "name": "hyperflow-smoke",
  "task": "Prove the mission engine runs end-to-end",
  "steps": [
    {"id": "plan",   "agent": "orchestrator"},
    {"id": "build",  "agent": "agent-x"},
    {"id": "verify", "agent": "healer"}
  ]
}
```

> 🧠 **Plain English:** `orchestrator` makes the plan, `agent-x` builds it, `healer` checks it. That's your recipe card. You're about to run it — then write your own.

---

## 🏃 Step 2 — Run the Mission

> ⏱️ **Time: 6 minutes**

Kick off a run of the smoke flow:

```bash
curl -X POST http://localhost:8000/api/v1/flows/hyperflow-smoke/run
```

You get back a **run id** — your mission is now executing:

```json
{
  "run_id": "run_8f3a21",
  "flow": "hyperflow-smoke",
  "status": "running",
  "message": "🚀 Mission accepted. Agents on it."
}
```

> 🎉 **You just launched a Level 2 agent.** You didn't run three scripts by hand. You said "run this mission" once — the graph is walking the steps for you.

---

## 📡 Step 3 — Watch It Work (Live Stream)

> ⏱️ **Time: 5 minutes**

HyperFlow streams each step as it happens (Server-Sent Events). Watch your run unfold in real time:

```bash
# Stream the live run (swap in your run_id)
curl -N http://localhost:8000/api/v1/flows/runs/run_8f3a21/stream
```

You'll see the steps tick over, one by one:

```
event: step
data: {"id": "plan",   "status": "running"}

event: step
data: {"id": "plan",   "status": "ok"}

event: step
data: {"id": "build",  "status": "running"}

event: step
data: {"id": "build",  "status": "ok"}

event: step
data: {"id": "verify", "status": "ok"}

event: done
data: {"status": "completed", "🎉": "Mission complete"}
```

> 🔥 **That's the climb, right there.** Three agents, one plan, running themselves while you watch. You went from "ask one thing" (L1) to "run a whole mission" (L2/L3) — and you can *see* every step.

---

## 🛠️ Step 4 — Write Your Own Mission Graph

> ⏱️ **Time: 8 minutes**

Now make one of your own. Create a file `flows/welcome-new-user.json` in your stack:

```json
{
  "name": "welcome-new-user",
  "task": "Onboard a brand-new signup: greet them, set up their profile, confirm it worked",
  "steps": [
    {"id": "greet",   "agent": "orchestrator", "prompt": "Draft a warm welcome message for a new ND-first coder"},
    {"id": "profile", "agent": "agent-x",      "prompt": "Create a starter profile record for the new user"},
    {"id": "verify",  "agent": "healer",       "prompt": "Confirm the profile was created and reply with status"}
  ]
}
```

Register and run it the same way:

```bash
# Reload flows so HyperFlow picks up your new file
curl -X POST http://localhost:8000/api/v1/flows/reload

# Run your mission
curl -X POST http://localhost:8000/api/v1/flows/welcome-new-user/run
```

> 🧠 **Plain English:** You just designed a 3-step crew mission in plain English and shipped it. That's not autocomplete. That's *orchestration*. You're standing on rung 2 — and it's the same engine that runs rung 3.

> 💬 **What about rung 3?** Same graph, but it runs to the end without pausing — *as long as a referee is watching the risky steps.* That referee is M13.

---

## 🏆 Your Win Moment

| What you did | What it actually means |
|---|---|
| Ran `hyperflow-smoke` | You launched a real multi-agent mission |
| Streamed the run | You watched a Level 2 agent execute a plan live |
| Wrote `welcome-new-user.json` | You *authored* an agent mission in plain English |
| Reloaded + ran your own flow | You're an orchestrator, not an autocompleter |

> 🔥 **You climbed two full rungs this module.**
> Yesterday: "AI that finishes my line."
> Today: "AI that runs my mission." That's the whole point of Agents 2.0.

**Claim your reward: +450 BROski$ — "Mission Orchestrator" badge unlocked 🧗**

---

## 🛑 Something Went Wrong?

**Problem: `POST /run` returns 404 flow not found**
```bash
# HyperFlow hasn't loaded your file yet — reload, then list
curl -X POST http://localhost:8000/api/v1/flows/reload
curl http://localhost:8000/api/v1/flows
```

**Problem: stream hangs with no events**
```bash
# Use -N (no buffering) and the exact run_id from the run response
curl -N http://localhost:8000/api/v1/flows/runs/<run_id>/stream
```

**Problem: a step shows `status: error`**
> Read the step's `error` field — it usually names the agent that's down. Start it:
```bash
docker-compose up -d orchestrator agent-x healer
```

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M12 mission".

---

## ✅ Module 12 Complete Checklist

- [ ] I ran `hyperflow-smoke` and got a `run_id`
- [ ] I streamed a live run and watched the steps tick over
- [ ] I wrote my own mission graph (`welcome-new-user.json`)
- [ ] I reloaded + ran my own flow
- [ ] 🪙 **+450 BROski$ claimed — "Mission Orchestrator" badge** 🧗

---

## 🔮 What's Next — Module 13

You can run whole missions now. But would you let one run **without watching**?

Not yet — and that's the right instinct. **Module 13 — Ship a Safe, Self-Governing Agent** gives your agent a referee (Safety Shepherd) and a flight recorder (Governance Ledger), so it can run free and you can still trust every move.

**Let's make it safe.** 🛡️

---

> 📝 *Author notes (AI Agents 2.0 track, M12 of 3): Hands-on climb. Recipe-card analogy extends M11's ladder. Grounded entirely in shipped HyperFlow infra — /api/v1/flows, /run, SSE /stream, /reload, the hyperflow-smoke example flow (all P0-1). Student authors a real mission graph. One clean win (+450, Mission Orchestrator). Hands off to M13 (Safety Shepherd + Governance Ledger). Supersedes orphaned scripts/M12-ride-or-die-contribution.md (never synced to live DB).*
