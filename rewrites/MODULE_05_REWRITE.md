# 🧠 MODULE 5 — Build Your Agent Crew
> **Rewrite v1 — May 16, 2026**
> Status: 🟡 Draft — ready for review
> Original: "HyperCode The Hyper Way — Commanding the Self-Healing Swarm"
> Rewrite goal: Split agents core + observability into two digestible parts. One big win each.

---

## 🎯 Module Goal

By the end of Part A you will have:
- ✅ Met your Agent Crew — Agent X, the Orchestrator, the Healer
- ✅ Activated your first agent and watched it respond
- ✅ Understood what a self-healing swarm actually means
- ✅ Directed your first mission using natural language

By the end of Part B you will have:
- ✅ Prometheus collecting live health data from your empire
- ✅ Grafana showing a real dashboard of your system
- ✅ The Healer agent wired to auto-fix broken services
- ✅ Your empire watching itself so you don't have to

**Time:** Part A = 20 mins | Part B = 20 mins
**Vibe:** You stop writing code. You start directing a crew. 🎬

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

# 🅰️ PART A — Meet Your Crew

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

## 🏆 Part A Win Moment

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

# 🅱️ PART B — Wire Up the Watchers

## 💡 Before Part B — Why Observability Matters

Your crew is running. But how do you KNOW it's running well?

> 📹 **Grafana is your CCTV system.**
> Prometheus is the security camera recording everything.
> Grafana is the monitor screen where you watch the footage.

Without this, you're flying blind. With it, you see everything.

---

## 📊 Step 5 — Check Prometheus is Collecting Data

> ⏱️ **Time: 3 minutes**

```bash
# Prometheus should already be running
curl http://localhost:9090/-/healthy
# Returns: Prometheus is Healthy.
```

Open the Prometheus UI:
```
http://localhost:9090
```

In the search box type:
```
up
```

You'll see a list of all your services with `1` (healthy) or `0` (down) next to them.

> 🧠 **Plain English:** Prometheus is silently recording the heartbeat of every service, every 15 seconds, 24/7. Like a doctor checking your pulse constantly but never disturbing you.

---

## 📈 Step 6 — Open Your Grafana Dashboard

> ⏱️ **Time: 5 minutes**

```
http://localhost:3001
Username: admin
Password: broski123
```

1. Click **Dashboards → Browse**
2. Open **"HyperCode Empire Overview"**

You'll see live panels showing:
- ✅ All services up/down
- ✅ Requests per second
- ✅ Memory usage per agent
- ✅ Error rate over last hour

> 🎉 **This is your empire's control room.**
> Netflix has dashboards like this. Spotify has dashboards like this.
> Now you do too.

---

## 🩹 Step 7 — Wire Healer to Auto-Recover

> ⏱️ **Time: 5 minutes**

Now we connect the Healer to Prometheus so it acts on what it sees:

```bash
# Tell the Healer to watch Prometheus metrics
curl -X POST http://localhost:8008/configure \
  -H "Content-Type: application/json" \
  -d '{
    "watch_prometheus": true,
    "recovery_threshold": 3,
    "alert_discord": true
  }'
```

Returns:
```json
{
  "status": "configured",
  "message": "🩹 Healer now watching Prometheus. Auto-recovery active. Discord alerts on."
}
```

> 💬 **Now the loop is complete:**
> Prometheus watches everything → Healer reads Prometheus → Healer fixes failures automatically → Discord pings you if something needs human attention.
> **Your empire runs itself.**

---

## 🏆 Part B Win Moment

| What the tech says | What actually happened |
|---|---|
| "Prometheus scraping metrics" | Every service has a live heartbeat monitor |
| "Grafana dashboard loading" | You have a real-time control room for your empire |
| "Healer watching Prometheus" | Auto-repair is wired to live health data |
| "Discord alerts on" | You'll know about problems before your users do |

> 🔥 **Your empire now runs, monitors, and repairs itself.**
> You built something self-healing. That's not a student project.
> That's production-grade infrastructure. Yours. Owned by you.

**Claim your reward: +175 BROski$ — "System Sovereign" badge unlocked 📊**

---

## 🛑 Something Went Wrong?

**Problem: Agent X not responding at localhost:8001**
```bash
docker-compose restart agent-x
docker-compose logs agent-x --tail=20
```

**Problem: Grafana showing "No Data"**
```bash
# Check Prometheus is scraping
curl http://localhost:9090/api/v1/targets
# Look for "health": "up" on your services
```

**Problem: Healer showing services as down when they're up**
```bash
# Restart healer to refresh its service map
docker-compose restart healer
```

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M5 issue".

---

## ✅ Module 5 Complete Checklist

**Part A — Agent Crew**
- [ ] Agent X, Orchestrator, Healer all showing "Up"
- [ ] First mission sent to Agent X in plain English
- [ ] Orchestrator pipeline visible
- [ ] Healer confirmed watching all services
- [ ] +175 BROski$ claimed — "Agent Architect" badge

**Part B — Observability**
- [ ] Prometheus returning healthy status
- [ ] Grafana dashboard open and showing live data
- [ ] Healer wired to Prometheus for auto-recovery
- [ ] Discord alerts configured
- [ ] +175 BROski$ claimed — "System Sovereign" badge

**🏆 Total M5 reward: +350 BROski$ | Two badges | Empire is self-healing**

---

## 🔮 What's Next — Module 6

Your crew is assembled. Your empire watches itself.

Module 6 is where we take everything off your local machine and **deploy it to the world.**

Real domain. Real users. Real empire. 🌍

**Let's ship it.** 🐶♾️

---

> 📝 *Rewrite notes: Split original M5 into two clear parts (A = agents, B = observability). Each part has its own win moment and XP reward. Film director analogy replaces "Meta-Architect" abstract concept. Prometheus/Grafana/Healer introduced one at a time instead of simultaneously. Removed cognitive overload of 4 monitoring tools at once. Total XP kept the same (350 BROski$) split across two wins.*
