# 📊 MODULE 5B — Wire Up the Watchers
> **Rewrite v1 — May 17, 2026 (split from MODULE_05_REWRITE.md Part B)**
> Status: 🟡 Draft — ready for review
> Original: "HyperCode The Hyper Way — Commanding the Self-Healing Swarm" (observability half)
> Rewrite goal: Observability as its own digestible module. One big win. Continues from M5.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Prometheus collecting live health data from your empire
- ✅ Grafana showing a real dashboard of your system
- ✅ The Healer agent wired to auto-fix broken services
- ✅ Your empire watching itself so you don't have to

**Time:** 20 minutes
**Vibe:** You built the crew. Now you get eyes on everything. 👁️

> 📺 **Continues from Module 5 — Build Your Agent Crew.** Do that first; this wires the watchers on top of it.

---

## 🌉 The Bridge From Module 5

In Module 5 you built your crew — Agent X, the Orchestrator, the Healer. It's alive. It's running.

But there's one question left:

> **Your crew is running. But how do you KNOW it's running well?**

Right now you're flying blind. This module gives your empire eyes.

> 📹 **Grafana is your CCTV system.**
> Prometheus is the security camera recording everything.
> Grafana is the monitor screen where you watch the footage.

Without this, you're guessing. With it, you see everything.

---

## 📊 Step 1 — Check Prometheus is Collecting Data

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

## 📈 Step 2 — Open Your Grafana Dashboard

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

## 🩹 Step 3 — Wire Healer to Auto-Recover

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

## 🏆 Your Win Moment

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

**Problem: Grafana showing "No Data"**
```bash
# Check Prometheus is scraping
curl http://localhost:9090/api/v1/targets
# Look for "health": "up" on your services
```

**Problem: Prometheus not healthy**
```bash
docker-compose restart prometheus
curl http://localhost:9090/-/healthy
```

**Problem: Healer not acting on Prometheus data**
```bash
# Re-send the configure call, then restart healer
docker-compose restart healer
```

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M5B issue".

---

## ✅ Module 5B Complete Checklist

- [ ] Prometheus returning healthy status
- [ ] Grafana dashboard open and showing live data
- [ ] Healer wired to Prometheus for auto-recovery
- [ ] Discord alerts configured
- [ ] 🪙 **+175 BROski$ claimed — "System Sovereign" badge** 📊

> 🏆 **M5 + M5B combined: +350 BROski$ · Two badges · Empire is self-healing.**

---

## 🔮 What's Next — Module 6

Your crew is assembled. Your empire watches itself.

Module 6 is where we take everything off your local machine and **deploy it to the world.**

Real domain. Real users. Real empire. 🌍

**Let's ship it.** 🐶♾️

---

> 📝 *Rewrite notes: Split from MODULE_05_REWRITE.md Part B. CCTV analogy (Prometheus = camera, Grafana = monitor) kept as the spine. Added explicit M5→M5B bridge so it stands alone. One clean win (+175, System Sovereign). Troubleshooting trimmed to observability-relevant items. Hands off to M6.*
