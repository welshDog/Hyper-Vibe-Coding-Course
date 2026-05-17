# 🎬 MODULE 5B — VIDEO SCRIPT
> **"Wire Up the Watchers"** (Part B — Observability / CCTV)
> Source: `rewrites/MODULE_05_REWRITE.md` (Part B)
> Script v1 — May 17, 2026
> Status: 🟡 Draft — ready for review
> 📺 Continues from `MODULE_05_VIDEO_SCRIPT.md` (Part A — Agent Crew)

---

## 📋 Production Notes

| Field | Value |
|---|---|
| **Target runtime** | 3:00 (hard cap 3:15) |
| **Spoken word count** | ~450 words |
| **Pace** | Calm control-room energy → satisfying "it runs itself" payoff. |
| **Tone** | You built the crew. Now you get eyes on everything. |
| **On-screen code** | Prometheus `up` query + Healer configure curl, highlight on speak |
| **Captions** | Burned-in (autoplay-safe) |
| **Music** | Low hum → resolves at "your empire runs itself" (2:20) |

---

## 🎥 THE SCRIPT

### ⏱️ 0:00 – 0:15 — COLD OPEN (Hook)

**🖼️ ON SCREEN:** Recap flash of the Part A crew → screen goes dark → a wall of CCTV monitors flickers on. Text: **"YOUR CREW RUNS. BUT CAN YOU SEE IT?"**

**🎙️ VO:**
> "In Part A you built your crew. It's running. But here's the question — how do you *know* it's running well? Right now you're flying blind. This is the part where your empire gets eyes. Three minutes. Let's wire up the watchers."

---

### ⏱️ 0:15 – 0:38 — THE CCTV IDEA (Plain English)

**🖼️ ON SCREEN:** Diagram: 📹 **Prometheus** (camera, recording) → 📺 **Grafana** (the monitor wall you watch).

**🎙️ VO:**
> "Two tools, one idea: CCTV for your empire. Prometheus is the security camera — it records the heartbeat of every service, every fifteen seconds, twenty-four-seven, never disturbing anything. Grafana is the monitor screen where you actually watch the footage. Without them, you're guessing. With them, you see everything."

---

### ⏱️ 0:38 – 1:08 — STEPS 5 & 6 (Prometheus + Grafana)

**🖼️ ON SCREEN:** `curl localhost:9090/-/healthy` → "Prometheus is Healthy." → Prometheus UI, type `up`, list of services with `1`/`0`. Cut to `localhost:3001` Grafana → "HyperCode Empire Overview" dashboard, live panels drawing.

**🎙️ VO:**
> "Step five — check Prometheus. One health curl, then open its UI and type *up.* Every service, listed, with a one if it's healthy or a zero if it's down. It's been silently taking your empire's pulse this whole time. Step six — open Grafana on localhost three-thousand-one. Browse to *HyperCode Empire Overview.* Live panels: services up or down, requests per second, memory per agent, errors this hour. That's your control room. Netflix has one. Spotify has one. Now you do too."

---

### ⏱️ 1:08 – 1:45 — STEP 7 (Wire the Healer)

**🖼️ ON SCREEN:** `curl -X POST localhost:8008/configure` with `watch_prometheus: true`, `recovery_threshold: 3`, `alert_discord: true` → `"Auto-recovery active. Discord alerts on."` Then a loop animation: Prometheus → Healer → fix → Discord ping.

**🎙️ VO:**
> "Step seven — close the loop. One configure call tells the Healer: watch Prometheus, auto-recover after three failures, ping Discord. Now the whole thing connects. Prometheus watches everything. The Healer reads Prometheus. The Healer fixes failures automatically. And Discord pings you only when something actually needs a human. Your empire runs itself."

---

### ⏱️ 1:45 – 2:20 — THE WIN MOMENT

**🖼️ ON SCREEN:** Music resolves. "What the tech says" vs "What actually happened" table. Final row punches: **"Your empire runs, monitors, and repairs itself."** Badge: **"SYSTEM SOVEREIGN"** +175 BROski$.

**🎙️ VO:**
> "Let's be real about what just happened. Every service has a live heartbeat monitor. You've got a real-time control room. Auto-repair is wired to live health data, and you'll know about problems before your users do. You built something self-healing. That's not a student project — that's production-grade infrastructure. Owned by you. System Sovereign badge — unlocked. Plus one-seventy-five BROski$."

---

### ⏱️ 2:20 – 3:00 — OUTRO + NEXT

**🖼️ ON SCREEN:** Both M5 badges sit side by side. End card: **"+350 BROski$ total · Empire is self-healing"** → "MODULE 6: Give Your Agent a Passport 🆔".

**🎙️ VO:**
> "Two badges. Three-fifty BROski$ across both parts. Your crew is assembled and your empire watches itself. Module 6 — we take everything off your local machine and make it portable: an identity card for every agent so it can deploy anywhere in the world. Let's give them passports."

---

## 🎬 B-ROLL / ASSET CHECKLIST

- [ ] Part A recap flash → CCTV wall power-on
- [ ] Prometheus (camera) → Grafana (monitor) diagram
- [ ] `curl /-/healthy` + Prometheus `up` query screen-record
- [ ] Grafana "Empire Overview" dashboard screen-record
- [ ] Healer `/configure` curl + closed-loop animation
- [ ] Win-moment comparison table animation
- [ ] System Sovereign badge + dual-badge end card
- [ ] Module 6 teaser

---

## 🗣️ VO TIMING CHEAT SHEET

| Section | Time | ~Words |
|---|---|---|
| Cold open | 0:00–0:15 | 45 |
| CCTV idea | 0:15–0:38 | 55 |
| Steps 5–6 | 0:38–1:08 | 80 |
| Step 7 loop | 1:08–1:45 | 65 |
| Win moment | 1:45–2:20 | 65 |
| Outro | 2:20–3:00 | 75 |
| **TOTAL** | **3:00** | **~450** |

---

> 📝 *Script notes: Part B of the split module as its own 3-min video. Kept the CCTV analogy (Prometheus = camera, Grafana = monitor) and the "Prometheus → Healer → fix → Discord" loop as the spine. Opens with a Part A recall beat so it stands alone. Ports spoken aloud ("three-thousand-one") for clean captions/TTS. ~450 words = ~3:00. All endpoints match `MODULE_05_REWRITE.md` Part B.*
