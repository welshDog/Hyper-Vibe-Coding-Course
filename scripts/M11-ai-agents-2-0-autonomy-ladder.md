---
code: M11
title: The Agent Autonomy Ladder
emoji: 🪜
level: Elite
slug: ai-agents-2-0-autonomy-ladder
xp_reward: 400
coin_reward: 400
summary: AI Agents 2.0 starts here. Learn the 5 rungs of agent autonomy — from autocomplete (Level 0) to a self-governing crew (Level 3+) — using HyperCode itself as the live reference build.
---

# 🪜 MODULE 11 — The Agent Autonomy Ladder

> **🚀 Welcome to the AI Agents 2.0 track.** You built an empire in M1–M10. Now you learn to make it *run itself* — safely. This is the first of three capstone modules.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Learned the **5 rungs** of the Agent Autonomy Ladder (Level 0 → Level 3+)
- ✅ Pinpointed which rung **you** code on today (most people live on rung 0–1)
- ✅ Seen a **real Level 2 agent run** inside your own HyperCode stack
- ✅ Understood *why* climbing higher needs a safety net (sets up M12 + M13)

**Time:** 20 minutes
**Vibe:** You stop thinking "AI that helps me type" and start thinking "AI that runs missions." 🪜

> 📺 **First of the AI Agents 2.0 trilogy.** M11 = the map · M12 = climb it hands-on · M13 = make it safe + self-governing.

---

## 💡 Before We Start — The Self-Driving Car Trick

Everyone already understands agent autonomy. You just learned it from **cars**.

> 🚗 **Self-driving cars have levels, 0 to 5.**
> - **Level 0** — you do everything. The car just beeps if you're too close.
> - **Level 2** — cruise control + lane-keep. The car drives, *you keep your hands ready*.
> - **Level 4** — the car does the whole trip. You only step in at the edges.
>
> **AI agents work the exact same way.**
> "AI Agents 2.0" isn't a new model. It's **moving up the ladder** — from AI that suggests, to AI that *acts*, to AI that runs whole missions while you supervise.

The mistake most developers make: they stay on **Level 0** (autocomplete) forever and call it "using AI." You're about to see the whole ladder — and you already own a stack that climbs it.

---

## 🪜 The Agent Autonomy Ladder

| Rung | Name | What the AI does | Who's driving | HyperCode reference |
|---|---|---|---|---|
| **L0** | **Autocomplete** | Suggests the next line. You accept/reject. | **You** (100%) | Copilot-style inline hints |
| **L1** | **Task Assistant** | You ask, it does **one** bounded job and stops. | You, one ask at a time | `/ask` → Core orchestrator |
| **L2** | **Supervised Agent** | Runs a **multi-step** plan, pausing at gates for your OK. | You approve each gate | **HyperFlow** + Safety Shepherd `ESCALATE` |
| **L3** | **Semi-Autonomous** | Runs a whole **mission graph** to the end, only stopping at real risk. | The agent, you supervise | HyperFlow mission graph (enforce mode) |
| **L3+** | **Self-Governing Crew** | Agents with an **identity**, logging **every action**, under policy. | The crew, you govern | Identity Agent + **Governance Ledger** |

> 🧠 **Plain English:** Going up a rung = handing over *more steps before the AI checks in with you*. L0 checks in every keystroke. L3+ checks in only when it's about to do something that matters.

---

## ⚡ Step 1 — Find Your Current Rung

> ⏱️ **Time: 3 minutes**

Be honest. Answer these:

1. When you use AI to code, do you accept suggestions **one line at a time**? → **L0**
2. Do you ask it a question, get one answer, then ask the next thing yourself? → **L1**
3. Have you ever handed it a **multi-step mission** and watched it work a plan? → **L2+**

> 💬 **Most developers — even great ones — live on L0 and L1.** That's not a failure. It's just the bottom of a ladder almost nobody knows is there.

You're about to climb. And here's the cheat code: **your HyperCode stack already runs L2–L3+ agents.** You built the rungs in M5. Now you'll *name* them.

---

## 🎬 Step 2 — See a Level 2 Agent Run

> ⏱️ **Time: 6 minutes**

A Level 2 agent runs a **plan**, not a single reply. In HyperCode, that's **HyperFlow** — declarative agent mission graphs.

Make sure your core is up, then list the flows your stack knows about:

```bash
# Core API should be healthy
curl http://localhost:8000/health

# List declarative agent mission flows (HyperFlow)
curl http://localhost:8000/api/v1/flows
```

You'll see flow definitions — each one is a **mission broken into ordered steps**:

```json
{
  "flows": [
    {
      "name": "hyperflow-smoke",
      "steps": [
        {"id": "plan",   "agent": "orchestrator", "status": "ok"},
        {"id": "build",  "agent": "agent-x",      "status": "ok"},
        {"id": "verify", "agent": "healer",       "status": "ok"}
      ]
    }
  ]
}
```

> 🧠 **Plain English:** That's a Level 2 agent. You didn't write `plan → build → verify`. You described the mission once; the graph runs the steps in order. It's cruise-control for whole tasks — but it still pauses at a gate when something needs your eyes.

> 🪜 **You just looked at rung 2.** A multi-step plan, running itself, checking in at the gates.

---

## 🚦 Step 3 — Understand the Jump to Level 3

> ⏱️ **Time: 5 minutes**

The difference between **L2** and **L3** is one word: **gates**.

- **L2:** the graph pauses and waits for *you* at every meaningful step.
- **L3:** the graph runs **all the way to the end** — and only stops when it hits something genuinely risky.

So what decides "genuinely risky"? A **policy brain**. In HyperCode that's the **Safety Shepherd** — it watches each agent action and returns `ALLOW`, `BLOCK`, or `ESCALATE`.

```bash
# The policy brain that lets an L3 agent run safely on its own
curl http://localhost:8096/health
```

```json
{ "service": "safety-shepherd", "mode": "monitor", "status": "ok" }
```

> 💬 **This is the whole secret of AI Agents 2.0.**
> You don't make an agent autonomous by trusting it more.
> You make it autonomous by giving it a **referee** that catches the dangerous moves — so it can run free everywhere else.

We'll wire that referee for real in **M13**. For now, just hold the idea: *autonomy = freedom to act + a gate on the things that matter.*

---

## 🏛️ Step 4 — Why Level 3+ Needs a Memory

> ⏱️ **Time: 3 minutes**

A self-governing crew (L3+) does two more things L3 doesn't:

1. **Each agent has an identity** — it acts *as someone*, not anonymously.
2. **Every action is logged** to a governance ledger — an append-only record of what the crew did and why.

> 🧠 **Plain English:** If your agents are going to act without asking, you need a flight recorder. *Who did what, when, and was it allowed?* That's the ledger.

You don't build this yet — **M13** does. M11 just plants the flag: **the top of the ladder isn't "more powerful AI." It's "AI you can trust because you can see everything it did."**

---

## 🏆 Your Win Moment

| What you saw | What it actually means |
|---|---|
| The 5-rung ladder | You now have a *map* almost no developer has |
| `api/v1/flows` returned a plan | You watched a real Level 2 agent in your own stack |
| Safety Shepherd `ALLOW/BLOCK/ESCALATE` | You know the one thing that makes L3 safe |
| "Every action logged" | You understand why L3+ is trustworthy, not scary |

> 🔥 **You just leveled up how you *think* about AI.**
> Most people are stuck on rung 0 arguing about which autocomplete is best.
> You're holding the whole ladder — and you own the stack that climbs it.

**Claim your reward: +400 BROski$ — "Autonomy Cartographer" badge unlocked 🪜**

---

## 🛑 Something Went Wrong?

**Problem: `localhost:8000/api/v1/flows` returns nothing / connection refused**
```bash
# Core isn't up — start it, then retry
docker-compose up -d hypercode-core
curl http://localhost:8000/health
```

**Problem: `localhost:8096` (Safety Shepherd) refused**
```bash
# Safety Shepherd runs under its own profile
docker-compose --profile safety up -d safety-shepherd
curl http://localhost:8096/health
```

**Problem: flows list is empty `{ "flows": [] }`**
> That's fine — it means no missions are defined yet. You'll define one hands-on in **M12**. The empty list still proves the L2 engine is live.

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M11 ladder".

---

## ✅ Module 11 Complete Checklist

- [ ] I can name all 5 rungs: L0 Autocomplete → L3+ Self-Governing
- [ ] I know which rung I code on today
- [ ] I saw a real Level 2 flow via `api/v1/flows`
- [ ] I know the Safety Shepherd is what makes Level 3 safe
- [ ] 🪙 **+400 BROski$ claimed — "Autonomy Cartographer" badge** 🪜

---

## 🔮 What's Next — Module 12

You've got the map. Time to climb it with your own hands.

**Module 12 — From Autocomplete to Orchestrator** walks you up the ladder for real: you'll define a HyperFlow mission graph and watch a Level 2 → Level 3 agent run your plan end-to-end.

**Let's climb.** 🧗

---

> 📝 *Author notes (AI Agents 2.0 track, M11 of 3): Self-driving-levels analogy chosen as the ND-friendly spine (universally understood, maps 1:1 to agent autonomy). Teaches the L0→L3+ ladder as a mental model and grounds every rung in shipped HyperCode infra — HyperFlow (/api/v1/flows), Safety Shepherd (:8096), Identity + Governance Ledger (M13). One clean win (+400, Autonomy Cartographer). Hands off to M12 (hands-on climb) → M13 (safe + self-governing). Supersedes the orphaned scripts/M11-ship-scale-graduate.md, whose content already lives in live DB M10.*
