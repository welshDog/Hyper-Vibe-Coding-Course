-- Batch 2 content for the M21-M30 expansion. Must run after
-- 20260817170000_seed_hv_modules_m24_m26.sql.

-- M24-prometheus-grafana-for-vibe-coders
update public.hv_modules
   set content = $modmd$# 📈 Prometheus + Grafana for Vibe Coders

**Module:** M24 | **Level:** Hyper-Pro | **XP:** 190 | **Coins:** 100 BROski$

> M23 gave you a log of what your agents did. This module gives you a log of what your *systems* are doing — the same Prometheus + Grafana stack this ecosystem's own production services run, brought down to one metric you actually care about.

---

## 🎯 What You'll Learn

- The difference between a counter (only goes up) and a gauge (goes up and down)
- How Prometheus actually gets data — it scrapes, it isn't pushed to
- How to stand up a local Prometheus + Grafana pair with docker-compose
- How to write one alert rule that fires on a real condition
- How to build one dashboard panel you'd actually look at

---

## 🧠 The Big Idea

Logs (M23) tell you what happened, one event at a time. Metrics tell you the *shape* of what's happening over time — is this number trending up, is it spiking, did it cross a line you care about. You don't need a fleet of services to learn this: one small app, one real metric, one panel, one alert. The habit transfers directly to production scale later.

---

## 🛠️ Metric Types

| Type | Behavior | Example |
|---|---|---|
| Counter | Only increases (until restart) | Total requests served |
| Gauge | Goes up and down | Current queue length |
| Histogram | Buckets of observed values | Request latency distribution |

---

## ⚡ Step-by-Step

### Step 1 — Pick one real metric
Not five, not "everything" — one number from your own app that would actually tell you something (requests handled, jobs queued, errors seen).

### Step 2 — Expose it
Add a `/metrics` endpoint to your app that Prometheus can scrape (most languages have a client library for this — the format is plain text, not magic).

### Step 3 — Stand up Prometheus + Grafana locally
A docker-compose file with two services: `prometheus` scraping your app's `/metrics` endpoint on an interval, `grafana` pointed at Prometheus as a data source.

### Step 4 — Build one panel
In Grafana, one panel graphing your one metric over time. Resist the urge to build a wall of panels before you've earned the first one.

### Step 5 — Write one alert rule
Pick a real threshold ("if this gauge stays above X for 5 minutes") and confirm it actually fires — force the condition, don't just trust the YAML.

---

## 🌟 The Neurodivergent Edge

- **One metric, one panel, one alert** — the same "don't scope-creep the practical task" discipline as every module before this, applied to observability instead of code.
- **A graph is a external memory for "is this normal?"** — you don't have to hold "was this always like this" in your head, the trend line answers it.
- **An alert that actually fires beats a dashboard nobody checks** — passive dashboards get ignored; a real, tested alert is the part that catches you off-guard less.

---

## ✨ Practical Task

Stand up a local Prometheus + Grafana stack tracking one real metric from your own app. Ship one dashboard panel. Force the condition and confirm your one alert rule actually fires.

---

## 📊 XP Check

- [ ] One real metric exposed via a `/metrics` endpoint
- [ ] Local Prometheus + Grafana stack running via docker-compose
- [ ] One dashboard panel shipped
- [ ] One alert rule confirmed to actually fire

**Complete all 4 → Claim your 190 XP + 100 BROski$ 🤑**
$modmd$,
       content_hash = '5cc6ffee03a6c2879f6cecb961257c67',
       updated_at = now()
 where slug = 'prometheus-grafana-for-vibe-coders';

-- M25-incident-response-nd-style
update public.hv_modules
   set content = $modmd$# 🧯 Incident Response, ND Style

**Module:** M25 | **Level:** Hyper-Pro | **XP:** 200 | **Coins:** 105 BROski$

> M17's Focus Panic Mode gave you permission to stop when your own build spirals. This module extends that same calm-under-pressure discipline to a *production* incident — something is broken, people are affected, and panic makes it worse, not better.

---

## 🎯 What You'll Learn

- The 4-step shape every real incident follows: detect → stop the bleeding → roll back clean → diagnose after
- Why "stash, don't improvise" beats trying to fix-forward mid-incident
- Why `git revert` is the safe rollback and `git reset --hard` is not
- Why diagnosis belongs *after* the bleeding stops, never during
- How this scales M17's personal panic-mode habit to something other people depend on

---

## 🧠 The Big Idea

M17 taught you to notice your own spiral and hit pause. A production incident is the same nervous-system event, except now the clock is running for other people too, which makes the pull to "just try something" stronger — and more dangerous. The fix is the same discipline, formalized into an order of operations you follow *every time*, so you're never improvising decisions under the worst possible conditions to make good decisions in.

---

## 🛠️ The 4 Steps

| Step | What it means | What it's not |
|---|---|---|
| Detect | Confirm it's actually broken, not a flake | Guessing from a gut feeling |
| Stop the bleeding | Roll back to the last known-good state | Trying to patch the bug live |
| Roll back clean | `git revert`, redeploy the previous good commit | `git reset --hard` on shared history |
| Diagnose after | Root-cause once things are stable | Debugging mid-incident under pressure |

---

## ⚡ Step-by-Step

### Step 1 — Write your own 5-step runbook, before you need it
A short, personal checklist: how you confirm something's actually broken, who/what you check, and the exact rollback command you'll run. Written calm, for you-in-a-panic to follow.

### Step 2 — Detect for real
Confirm the break with evidence (an error rate, a failed health check, M23's action log, M10's dashboard) — not vibes.

### Step 3 — Stop the bleeding first
`git revert` the bad commit and redeploy. Do not attempt a live fix. The goal is "stable," not "correct" — correct comes later.

### Step 4 — Confirm stable
Check the same evidence source from Step 2 again. Don't move on until it's actually green.

### Step 5 — Diagnose after, not during
Only once things are stable do you dig into *why* it broke — with the pressure off, you'll do it better anyway.

---

## 🌟 The Neurodivergent Edge

- **A pre-written runbook is an externalized decision** — panic-you doesn't have to invent a plan from scratch, panic-you just follows the one calm-you already wrote.
- **"Stop the bleeding" is permission to not fix it perfectly right now** — same energy as M17's Focus Panic Mode, aimed outward this time.
- **Splitting rollback from diagnosis protects your focus** — you're never trying to hold "is it stable" and "why did it break" in your head at the same time.

---

## ✨ Practical Task

Deliberately break something in a disposable sandbox repo. Run your own 5-step runbook for real: detect it, stop the bleeding with a clean `git revert`, confirm stable, then diagnose after — in that order, not improvised.

---

## 📊 XP Check

- [ ] A personal 5-step runbook written before the practical task
- [ ] A real break detected using actual evidence, not a guess
- [ ] Rolled back clean via `git revert`, confirmed stable
- [ ] Diagnosis done only after stability was confirmed

**Complete all 4 → Claim your 200 XP + 105 BROski$ 🤑**
$modmd$,
       content_hash = '0978fff4d20466408b7f4ffd6483cc54',
       updated_at = now()
 where slug = 'incident-response-nd-style';

-- M26-designing-a-reward-economy
update public.hv_modules
   set content = $modmd$# 💰 Designing a Reward Economy

**Module:** M26 | **Level:** Hyper-Pro | **XP:** 210 | **Coins:** 110 BROski$

> Every XP/coin number you've earned through M1-M25 came from a reward economy someone had to design. This module opens Track B by teaching you that design, using this course's own real `award_tokens()` dedup rule as the worked example.

---

## 🎯 What You'll Learn

- The three parts of any reward economy: sources, sinks, and the ledger between them
- Why every earn event needs a stable dedup key, not just a good intention
- What the "dopamine cliff" failure mode looks like and why badly-paced rewards cause it
- How to spec a reward ledger before writing a line of code for it
- Why this is the mechanic behind the XP/coins you've been earning this whole course

---

## 🧠 The Big Idea

A reward economy is just three things: **sources** (where value enters — completing a module, a quiz pass), **sinks** (where value leaves — spending coins in the shop), and a **ledger** recording every movement between them. The part people skip, and the part that actually matters, is the dedup key: if a network retry can replay the same "earn" request twice, your economy just handed out free money. This repo's own `award_tokens()` requires a stable `p_source_id` for exactly this reason — without it, a retried request double-grants.

---

## 🛠️ The Three Parts

| Part | What it is | Failure if missing |
|---|---|---|
| Source | Where value enters (earn) | No reward exists — nobody engages |
| Sink | Where value leaves (spend) | Value only accumulates — inflation, no meaning |
| Dedup key | A stable id tied to the exact earn event | Retries double-grant — the economy silently breaks |

---

## ⚡ Step-by-Step

### Step 1 — List your real sources
For a toy app of your choice, name 2-3 concrete actions that should earn value. Vague ("being active") doesn't count — each source needs a clear trigger.

### Step 2 — List your real sinks
Name at least one place that value can actually leave the system. An economy with only sources and no sinks isn't an economy, it's a counter.

### Step 3 — Design the dedup key for each source
For every earn action, decide *exactly* what makes one earn event unique (a module ID + user ID, an order ID, a quiz attempt ID) — this is what a retry has to match against to be rejected as a duplicate.

### Step 4 — Spec the ledger row shape
One row per movement: who, how much, source or sink, the dedup key, a timestamp. Nothing computed by summing scattered fields — the ledger is the single source of truth.

### Step 5 — Sanity-check the pacing
Look at your source values relative to how often a user hits them. If someone can max out the whole reward system in one sitting, that's the dopamine cliff — good pacing keeps *some* reason to come back.

---

## 🌟 The Neurodivergent Edge

- **A dedup key is externalized trust** — you don't have to hope a retry "probably" won't double-pay, the key makes it structurally impossible.
- **Sources and sinks named explicitly beat a vague "points system"** — a concrete spec is something you can actually check your work against.
- **Avoiding the dopamine cliff protects long-term motivation, not just the first session** — the same principle behind M13's Micro-Wins, one level up: rewards that stay meaningful over time, not just at the start.

---

## ✨ Practical Task

Spec a 3-action reward ledger for a toy app: at least one earn source, one spend sink, one refund/reversal path — with an explicit, unique dedup key for every earn event.

---

## 📊 XP Check

- [ ] At least one concrete earn source named with its trigger
- [ ] At least one concrete spend sink named
- [ ] A dedup key defined for every earn action
- [ ] Ledger row shape specced with dedup key included

**Complete all 4 → Claim your 210 XP + 110 BROski$ 🤑**
$modmd$,
       content_hash = '5fe082d8882623900c2286d1f4e79a69',
       updated_at = now()
 where slug = 'designing-a-reward-economy';
