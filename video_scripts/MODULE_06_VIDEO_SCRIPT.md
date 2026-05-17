# 🎬 MODULE 6 — VIDEO SCRIPT
> **"Give Your Agent a Passport"**
> Source: `rewrites/MODULE_06_REWRITE.md`
> Script v1 — May 17, 2026
> Status: 🟡 Draft — ready for review

---

## 📋 Production Notes

| Field | Value |
|---|---|
| **Target runtime** | 3:00 (hard cap 3:15) |
| **Spoken word count** | ~460 words |
| **Pace** | Clear, builder-confident. The "works everywhere" episode. |
| **Tone** | Professional-grade pride without the jargon. |
| **On-screen code** | `manifest.json` with commented fields, highlight on speak |
| **Captions** | Burned-in (autoplay-safe) |
| **Music** | Steady bed → lift at "deploy anywhere" (2:00) |

---

## 🎥 THE SCRIPT

### ⏱️ 0:00 – 0:18 — COLD OPEN (Bridge + Hook)

**🖼️ ON SCREEN:** The M5 crew running happily on one laptop → dragged to a different server → they glitch and freeze ❌. Text: **"NO IDENTITY = THEY BREAK."**

**🎙️ VO:**
> "In Module 5 you met your crew — Agent X, the Orchestrator, the Healer. They're alive. But move them off your machine — a different server, a Discord bot, production — and they break. They don't know where they are. M5 met your agents. M6 gives them an identity. One file: `manifest.json`."

---

### ⏱️ 0:18 – 0:45 — WHAT IS A MANIFEST (Plain English)

**🖼️ ON SCREEN:** "Hiring someone" split: 📋 job description · 🧰 allowed tools · 🪑 desk (memory) · 🏷️ name badge → morph into the matching `manifest.json` fields.

**🎙️ VO:**
> "Forget the word *manifest.* Think about hiring someone. You give them a job description, a list of tools they can use, a desk where their memory lives, and a name badge so the system recognises them. The `manifest.json` does all of that for your agent — name, version, entry point, memory backend, tools, the env vars it needs. It's your agent's CV, passport, and instruction manual in one file."

---

### ⏱️ 0:45 – 1:25 — STEPS 1 & 2 (Create + Validate)

**🖼️ ON SCREEN:** Create `agents/agent-x/manifest.json`, paste the JSON, `auto_recover: true` highlighted. Cut to terminal: `hyper-agent validate ...` → all-green checklist, "ready to deploy anywhere!"

**🎙️ VO:**
> "Step one — create the manifest. Name, entry point, memory on Redis, its tools, its env vars. Set `auto_recover` to true — now if this agent crashes, the Healer from M5 restarts it automatically. Your manifest and your monitoring just connected. Step two — validate it with the CLI. No guessing. It checks every single thing and shows you green ticks — entry point found, memory verified, tools registered. Or it tells you exactly what to fix."

---

### ⏱️ 1:25 – 2:00 — STEPS 3 & 4 (Strict + Plugin)

**🖼️ ON SCREEN:** `hyper-agent validate --strict` → "🔒 STRICT MODE PASSED — production-ready." Cut to `hyper-agent plugin add web_search` → test curl → live web result with a cited source.

**🎙️ VO:**
> "Step three — strict mode. Deeper checks: every env var has a real value, memory's reachable, health endpoint responds. It's your pre-flight checklist — you don't take off until everything's green. That's the difference between *works on my machine* and *works everywhere.* Step four — give it powers. Attach the web search plugin, test it. Your agent just searched the internet and cited its source. That's not a chatbot. That's an autonomous agent."

---

### ⏱️ 2:00 – 2:35 — STEP 5 + WIN MOMENT (Deploy Anywhere)

**🖼️ ON SCREEN:** Music lifts. Same manifest → three deploy targets fan out: `--env local`, `--env production`, `--env discord`. Then table: tech-says vs actually-happened. Badge: **"AGENT ARCHITECT — LVL 3"** +300 BROski$.

**🎙️ VO:**
> "Step five — the payoff. Same manifest, same agent: deploy to local Docker, to a production server, or as a Discord bot. Zero rewriting. That's *write once, deploy anywhere.* Let's be real about what happened — your agent has a proper identity card, it's production-ready, it has real-world powers, and it travels where you go. You just graduated from Vibe Coder to Agent Architect. Three hundred BROski$, Level 3 badge."

---

### ⏱️ 2:35 – 3:00 — OUTRO + NEXT

**🖼️ ON SCREEN:** Checklist ticks. End card: **"+300 BROski$ — Module 6 Complete"** → "MODULE 7: Build a Pet That Remembers You 🐾".

**🎙️ VO:**
> "Your agents have identities, tools, and the ability to deploy anywhere. But there's one threat we haven't faced — what happens when someone tries to *trick* your agent into breaking its own rules? Module 7: prompt injection, the con-artist attack, and how VenomEep stops it cold. Time to armour your agent's brain."

---

## 🎬 B-ROLL / ASSET CHECKLIST

- [ ] M5 crew → moved server → glitch/freeze cold open
- [ ] "Hiring someone" → manifest fields morph
- [ ] `manifest.json` create + `auto_recover` zoom
- [ ] `hyper-agent validate` all-green screen-record
- [ ] `--strict` pass + `plugin add web_search` test
- [ ] 3-target deploy fan-out animation
- [ ] Win-moment table + Agent Architect Lvl 3 badge
- [ ] End card + Module 7 teaser

---

## 🗣️ VO TIMING CHEAT SHEET

| Section | Time | ~Words |
|---|---|---|
| Cold open + bridge | 0:00–0:18 | 60 |
| What is a manifest | 0:18–0:45 | 70 |
| Steps 1–2 | 0:45–1:25 | 75 |
| Steps 3–4 | 1:25–2:00 | 75 |
| Step 5 + win | 2:00–2:35 | 75 |
| Outro | 2:35–3:00 | 55 |
| **TOTAL** | **3:00** | **~460** |

---

> 📝 *Script notes: Compressed the 5-step module into 6 timed scenes. Led with the explicit M5→M6 bridge ("met your agents → give them identity"). Kept the hiring/passport analogy and the pre-flight-checklist framing for strict mode. Folded Step 5 + win moment into one scene so "deploy anywhere" lands as the emotional payoff. ~460 words = ~3:00. All CLI commands match `MODULE_06_REWRITE.md`.*
