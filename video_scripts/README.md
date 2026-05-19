# 🎬 Video Scripts — Hyper-Vibe Coding Course

3-minute spoken video scripts generated from the canonical May rewrites in [`../rewrites/`](../rewrites/). Two tracks: the **11 course modules** and the **5 Vibe Labs** (HyperLabs on-ramp).

> Status: 🟡 All v1 drafts complete — 11 module scripts (May 17, 2026) + 5 Vibe Labs scripts (May 19, 2026). Ready for review + recording.

---

## 📺 The 11 scripts

| # | Script | Module | Source rewrite | Runtime |
|---|---|---|---|---|
| 1 | `MODULE_01_VIDEO_SCRIPT.md` | 🧠 Turn On Your AI Brain | `MODULE_01_REWRITE.md` | 3:00 |
| 2 | `MODULE_02_VIDEO_SCRIPT.md` | 🎤 Prompt Like a Pro | `MODULE_02_REWRITE.md` | 3:00 |
| 3 | `MODULE_03_VIDEO_SCRIPT.md` | 🏗️ Build Your First App | `MODULE_03_REWRITE.md` | 3:00 |
| 4 | `MODULE_04_VIDEO_SCRIPT.md` | 💳 Build Your Money Engine | `MODULE_04_REWRITE.md` | 3:00 |
| 5 | `MODULE_05_VIDEO_SCRIPT.md` | 🎬 Build Your Agent Crew (Part A) | `MODULE_05_REWRITE.md` (A) | 3:00 |
| 6 | `MODULE_05B_VIDEO_SCRIPT.md` | 📊 Wire Up the Watchers (Part B) | `MODULE_05_REWRITE.md` (B) | 3:00 |
| 7 | `MODULE_06_VIDEO_SCRIPT.md` | 🆔 Give Your Agent a Passport | `MODULE_06_REWRITE.md` | 3:00 |
| 8 | `MODULE_07_VIDEO_SCRIPT.md` | 🐾 Build a Pet That Remembers You | `MODULE_07_REWRITE.md` | 3:00 |
| 9 | `MODULE_08_VIDEO_SCRIPT.md` | 🌐 Make Your AI Agent Worth Something | `MODULE_08_REWRITE.md` | 3:00 |
| 10 | `MODULE_09_VIDEO_SCRIPT.md` | 🛡️ Protect Your Empire | `MODULE_09_REWRITE.md` | 3:00 |
| 11 | `MODULE_10_VIDEO_SCRIPT.md` | 🎓 You Built an Empire. Now Ship It. | `MODULE_10_REWRITE.md` | 3:15 (finale) |

> M5 is intentionally split into **M5** (agent crew) + **M5B** (observability) — two standalone 3-min videos from one rewrite file. M10 gets 3:15 so the graduation ceremony + final word can breathe.

---

## 🧪 The 5 Vibe Labs scripts (HyperLabs track)

The free no-signup on-ramp — Big AI stack labs that funnel into the course. Each follows the **neurodivergent 7-beat pedagogy** (STOP · WHY · HOW · WIN · NEXT · HELP · REWARD), not the module timed-scene template.

| # | Script | Lab | Source rewrite | Reward (verified vs RPC) | Runtime |
|---|---|---|---|---|---|
| 1 | `VIBE_LAB_LEVEL1_VIDEO_SCRIPT.md` | 🧠 Claude Vibe Lab | `CLAUDE_VIBE_LAB_LEVEL1_PAGE.md` | +100 XP · +50 BROski$ · Claude Lab Graduate | 3:00 |
| 2 | `VIBE_LAB_LEVEL2_VIDEO_SCRIPT.md` | 🚀 Google AI Studio Lab | `GOOGLE_AI_STUDIO_LAB_LEVEL2_PAGE.md` | +150 XP · +75 BROski$ · AI Studio Graduate | 3:00 |
| 3 | `VIBE_LAB_LEVEL3_VIDEO_SCRIPT.md` | 🤖 Trae IDE + Agents Lab | `TRAE_IDE_AGENTS_LAB_LEVEL3_PAGE.md` | +200 XP · +100 BROski$ · Trae Agent Master | 3:00 |
| 4 | `VIBE_LAB_LEVEL4_VIDEO_SCRIPT.md` | ⚔️ Big AI Comparisons | `BIG_AI_COMPARISONS_LEVEL4_PAGE.md` | +250 XP · +125 BROski$ · Big AI Stack Master | 3:00 |
| 5 | `VIBE_LAB_LEVEL5_VIDEO_SCRIPT.md` | 🌟 Hyperfocus z0ne Full Stack | `HYPERFOCUS_FULLSTACK_LEVEL5_PAGE.md` | +500 XP · +250 BROski$ · Meta-Architect | 3:15 (finale) |

> Rewards/badges verified against the deployed `claim_level_reward` RPC (project `yhtmuibgdnxhbgboajhc`, real-user tested 2026-05-19). Levels unlock in order; reward is claimed **on the lab page** (`/vibe-labs/level-N`), not a dashboard. Theme is master palette (#0A0E1A / #7B2FBE violet / #00D4FF cyan) — no orange. See `../rewrites/SESSION_SNAPSHOT_2026-05-19.md`.

---

## 📐 Script template (every file follows this)

1. **Production Notes** — runtime, word count, pace, tone, on-screen code, music cues
2. **The Script** — timed scenes, each with `🖼️ ON SCREEN` (visuals) + `🎙️ VO` (voiceover)
3. **B-roll / Asset Checklist** — what to shoot/build
4. **VO Timing Cheat Sheet** — per-section word budget (~450–480 words = 3:00)
5. **Script notes** — what was compressed/kept vs the rewrite

Voice: BROski energy — short sentences, plain-English analogies kept from the rewrites, code/ports spoken aloud for clean captions + TTS. No invented technical facts.

---

## 🔗 Pipeline

`rewrites/MODULE_0X_REWRITE.md` → `video_scripts/MODULE_0X_VIDEO_SCRIPT.md` → recording.

Vibe Labs: `rewrites/<LAB>_PAGE.md` → `video_scripts/VIBE_LAB_LEVELN_VIDEO_SCRIPT.md` → recording. Live lab pages + reward claim run client-side in `frontend/src/pages/vibe-labs/` against the `claim_level_reward` RPC.

Live course state (titles, rewards, status, quizzes) lives in Supabase `hv_modules` + `hv_quizzes` (project `yhtmuibgdnxhbgboajhc`), synced to the May model on 2026-05-17. See `../rewrites/SESSION_SNAPSHOT_2026-05-17.md`.
