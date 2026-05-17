# 🎬 MODULE 5 — Build Your Agent Crew
> **Rewrite v1 — May 16, 2026 · Split into M5 (crew) + M5B (observability) — May 17**
> Status: 🟡 Draft — ready for review
> Original: "HyperCode The Hyper Way — Commanding the Self-Healing Swarm"
> Rewrite goal: Agents core as its own digestible module. One big win. Observability moved to M5B.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Met your Agent Crew — Agent X, the Orchestrator, the Healer
- ✅ Activated your first agent and watched it respond
- ✅ Understood what a self-healing swarm actually means
- ✅ Directed your first mission using natural language

**Time:** 20 minutes
**Vibe:** You stop writing code. You start directing a crew. 🎬

> 📺 **Pairs with Module 5B — Wire Up the Watchers.** This module builds the crew; M5B gives your empire eyes.

---

## 💡 Before We Start — What's Actually Happening?

Up to now YOU have been building everything manually.

Module 5 is where that changes forever.

> 🎬 **Imagine you're a film director.**
> You don't hold the camera. You don't do the lighting. You don't edit the footage.
> You say: *"I want a wide shot of the city at sunset, moody, cinematic."*
> Your crew makes it happen.
>
> **That's what Agent X does for your code.**
> You describe the vision. The agent crew builds it.

Three crew members you're about to meet:

| Agent | Role | Plain English |
|---|---|---|
| **Agent X** | Meta-Architect | Designs + deploys new agents based on your instructions |
| **Crew Orchestrator** | Lifecycle Manager | Breaks your big idea into an ordered pipeline of tasks |
| **The Healer** | Auto-Recovery | Watches for failures and fixes them while you sleep |

---

## ⚡ Step 1 — Start the Agent Swarm

> ⏱️ **Time: 3 minutes**

Your agents are already in the stack. You just need to wake them up.

```bash
# Make sure your brain is running
docker-compose ps

# Start the agent services specifically
docker-compose up -d agent-x orchestrator healer

# Check they're all alive
docker-compose ps | grep -E "agent|orchestrator|healer"
```

You should see three services showing **"Up"**:
```
agent-x        Up    0.0.0.0:8001->8001/tcp
orchestrator   Up    0.0.0.0:8007->8007/tcp
healer         Up    0.0.0.0:8008->8008/tcp
```

> 🧠 **Plain English:** Three specialist workers just clocked in. Each one has a job. None of them need you to hold their hand.

---

## 🎬 Step 2 — Give Agent X Your First Mission

> ⏱️ **Time: 5 minutes**

Open your browser and go to:
```
http://localhost:8001/docs
```

This is Agent X's control panel. Find the `/mission` endpoint and click **"Try it out"**.

Paste this mission:
```json
{
  "mission": "Create a simple health check endpoint that returns the status of all running services",
  "style": "plain English, no jargon, beginner friendly",
  "output": "FastAPI route with JSON response"
}
```

Hit **Execute**.

Agent X will respond with:
```json
{
  "status": "mission_accepted",
  "micro_tasks": [
    "1. Create /health route in FastAPI",
    "2. Query each service for status",
    "3. Return JSON with all statuses"
  ],
  "estimated_time": "15 minutes",
  "message": "🧠 Agent X on it. Directing the crew now."
}
```

> 🎉 **That's your crew accepting a mission in plain English.**
> You didn't write a function. You didn't touch a config file.
> You described what you wanted. The agent broke it down.

---

## 🔄 Step 3 — Watch the Orchestrator Pipeline

> ⏱️ **Time: 5 minutes**

The Orchestrator is managing the flow. Check what it's doing:

```bash
# See the live mission pipeline
curl http://localhost:8007/pipeline
```

Returns:
```json
{
  "active_missions": 1,
  "pipeline": [
    {"task": "Create /health route", "status": "in_progress", "agent": "Agent X"},
    {"task": "Query service statuses", "status": "queued"},
    {"task": "Return JSON response", "status": "queued"}
  ]
}
```

> 🧠 **Plain English:** The Orchestrator is your production manager. It tracks every task, makes sure they happen in the right order, and nothing gets dropped.

---

## 🩹 Step 4 — Meet the Healer

> ⏱️ **Time: 3 minutes**

The Healer watches every service. If something breaks, it fixes it automatically.

Test it by checking its status:
```bash
curl http://localhost:8008/health
```

Returns:
```json
{
  "healer_status": "active",
  "watching": ["agent-x", "orchestrator", "fastapi", "redis", "postgres"],
  "last_recovery": null,
  "message": "🩹 All systems Grade A+. Nothing to fix."
}
```

> 💬 **The Healer is your overnight security guard.**
> It doesn't sleep. It checks every service every 30 seconds.
> If something falls over, it tries to restart it automatically before you even notice.

---

## 🏆 Your Win Moment

| What the tech says | What actually happened |
|---|---|
| "Agent X mission accepted" | You directed an AI worker in plain English |
| "Pipeline active" | Your crew is coordinating tasks automatically |
| "Healer watching 5 services" | Your empire has a 24/7 auto-repair system |
| "Grade A+ health" | Everything is running perfectly, no action needed |

> 🔥 **You just went from coder to director.**
> Most developers spend weeks building automation this sophisticated.
> You got here in 20 minutes by describing what you wanted.

**Claim your reward: +175 BROski$ — "Agent Architect" badge unlocked 🧠**

---

## 🛑 Something Went Wrong?

**Problem: Agent X not responding at localhost:8001**
```bash
docker-compose restart agent-x
docker-compose logs agent-x --tail=20
```

**Problem: Orchestrator pipeline empty after a mission**
```bash
# Re-send the mission, then re-check
curl http://localhost:8007/pipeline
```

**Problem: Healer showing services as down when they're up**
```bash
# Restart healer to refresh its service map
docker-compose restart healer
```

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M5 issue".

---

## ✅ Module 5 Complete Checklist

- [ ] Agent X, Orchestrator, Healer all showing "Up"
- [ ] First mission sent to Agent X in plain English
- [ ] Orchestrator pipeline visible
- [ ] Healer confirmed watching all services
- [ ] 🪙 **+175 BROski$ claimed — "Agent Architect" badge** 🧠

---

## 🔮 What's Next — Module 5B

Your crew is assembled and running. But how do you *know* it's running well?

**Module 5B — Wire Up the Watchers** gives your empire eyes: Prometheus, Grafana, and a Healer wired to act on what it sees.

**Let's watch it.** 📊

---

> 📝 *Rewrite notes: Original M5 split into M5 (this — agent crew core) + M5B (observability). Film-director analogy kept as the spine. One clean win (+175, Agent Architect). Troubleshooting trimmed to crew-relevant items. Hands off to M5B.*
