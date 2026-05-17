# 🎬 MODULE 5 — VIDEO SCRIPT
> **"Build Your Agent Crew"** (Part A — Agent Crew Core)
> Source: `rewrites/MODULE_05_REWRITE.md` (Part A)
> Script v1 — May 17, 2026
> Status: 🟡 Draft — ready for review
> 📺 Pairs with `MODULE_05B_VIDEO_SCRIPT.md` (Part B — Observability)

---

## 📋 Production Notes

| Field | Value |
|---|---|
| **Target runtime** | 3:00 (hard cap 3:15) |
| **Spoken word count** | ~455 words |
| **Pace** | The "you stop coding, you start directing" turning point. |
| **Tone** | Cinematic. Film-director energy throughout. |
| **On-screen code** | Mission JSON + pipeline JSON, highlight on speak |
| **Captions** | Burned-in (autoplay-safe) |
| **Music** | Film-score bed → hero swell at WIN MOMENT (2:25) |

---

## 🎥 THE SCRIPT

### ⏱️ 0:00 – 0:18 — COLD OPEN (Hook)

**🖼️ ON SCREEN:** Director's chair, clapperboard snaps 🎬. Behind it, three agent avatars light up. Text: **"YOU STOP WRITING CODE. YOU START DIRECTING."**

**🎙️ VO:**
> "Up to now, you've built everything by hand. That changes here. A film director doesn't hold the camera or do the lighting — they say *give me a wide shot, moody, cinematic,* and the crew makes it real. That's what Agent X does for your code. Meet your crew."

---

### ⏱️ 0:18 – 0:45 — THE CREW (Plain English)

**🖼️ ON SCREEN:** Three cards: 🧠 **Agent X** — Meta-Architect. 🔄 **Orchestrator** — Lifecycle Manager. 🩹 **The Healer** — Auto-Recovery (port 8008).

**🎙️ VO:**
> "Three crew members. Agent X — the Meta-Architect. Designs and deploys new agents from your instructions. The Crew Orchestrator — your production manager. Breaks one big idea into an ordered pipeline. And the Healer — your overnight medic on port eight-thousand-eight. It watches every service and fixes failures while you sleep. None of them need you to hold their hand."

---

### ⏱️ 0:45 – 1:20 — STEPS 1 & 2 (Wake + Mission)

**🖼️ ON SCREEN:** `docker-compose up -d agent-x orchestrator healer` → three "Up" rows. Cut to `localhost:8001/docs`, paste mission JSON, hit Execute → `"status": "mission_accepted"`.

**🎙️ VO:**
> "Step one — wake the swarm. One command starts Agent X, the Orchestrator, the Healer. Three specialists clock in. Step two — give Agent X its first mission. Open its control panel, paste a mission in plain English: *create a health check endpoint, beginner friendly.* Hit Execute. Agent X accepts it and breaks it into micro-tasks. You didn't write a function. You didn't touch a config. You described what you wanted."

---

### ⏱️ 1:20 – 2:00 — STEPS 3 & 4 (Pipeline + Healer)

**🖼️ ON SCREEN:** `curl localhost:8007/pipeline` → tasks: in_progress / queued / queued. Cut to `curl localhost:8008/health` → `"healer_status": "active"`, watching 5 services, "Grade A+".

**🎙️ VO:**
> "Step three — watch the Orchestrator. Hit its pipeline endpoint. There's your mission, broken into ordered tasks — one in progress, the rest queued. Nothing gets dropped. Step four — meet the Healer. Check its status: active, watching five services, Grade A-plus. It checks every service every thirty seconds and restarts anything that falls over — before you even notice."

---

### ⏱️ 2:00 – 2:40 — THE WIN MOMENT

**🖼️ ON SCREEN:** Hero swell. "What the tech says" vs "What actually happened" table. Final row punches: **"You went from coder to director."** Badge: **"AGENT ARCHITECT"** +175 BROski$.

**🎙️ VO:**
> "Let's be real about what just happened. You directed an AI worker in plain English. Your crew is coordinating tasks automatically. Your empire has a twenty-four-seven auto-repair system, running Grade A-plus. Most developers spend weeks building automation this sophisticated. You got here in twenty minutes — by describing what you wanted. You just went from coder to director. Agent Architect badge — unlocked. Plus one-seventy-five BROski$."

---

### ⏱️ 2:40 – 3:00 — OUTRO + NEXT

**🖼️ ON SCREEN:** Part A checklist ticks. End card: **"+175 BROski$ — Part A Complete"** → "MODULE 5B: Wire Up the Watchers 📊".

**🎙️ VO:**
> "Your crew is assembled and it's running. But how do you *know* it's running well? That's Part B — Module 5B. We give your empire eyes: a live control room and a Healer wired to act on what it sees. Same module, second win. Let's watch it."

---

## 🎬 B-ROLL / ASSET CHECKLIST

- [ ] Director's chair + clapperboard cold open
- [ ] 3 crew cards (Agent X / Orchestrator / Healer)
- [ ] `docker-compose up` 3-services "Up" screen-record
- [ ] `localhost:8001/docs` mission paste + Execute
- [ ] `/pipeline` + `/health` JSON zoom
- [ ] Win-moment comparison table animation
- [ ] Agent Architect badge unlock
- [ ] End card + Module 5B teaser

---

## 🗣️ VO TIMING CHEAT SHEET

| Section | Time | ~Words |
|---|---|---|
| Cold open | 0:00–0:18 | 55 |
| The crew | 0:18–0:45 | 65 |
| Steps 1–2 | 0:45–1:20 | 75 |
| Steps 3–4 | 1:20–2:00 | 70 |
| Win moment | 2:00–2:40 | 75 |
| Outro | 2:40–3:00 | 50 |
| **TOTAL** | **3:00** | **~455** |

---

> 📝 *Script notes: This is Part A only — the agent crew half of the split module. Kept the film-director analogy as the spine and the "coder to director" win line. Ports spoken aloud ("eight-thousand-eight") for clean captions/TTS. Outro hands explicitly to MODULE_05B. ~455 words = ~3:00 at a cinematic pace. All endpoints match `MODULE_05_REWRITE.md` Part A.*
