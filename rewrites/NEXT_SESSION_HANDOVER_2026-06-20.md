# NEXT_SESSION_HANDOVER_2026-06-20.md

> **Date:** Friday June 20, 2026
> **AI Partner:** Claude (Opus 4.8)
> **Focus:** P2-4 — Course "AI Agents 2.0" capstone track (M11–M13)
> **Result:** 🏁 **P2-4 done → the ENTIRE AGENT-START roadmap is closed.**

---

## ✅ What got shipped

Added the **"AI Agents 2.0"** capstone track to the course. The course now runs **M1 → M13** (14 rows incl. M5B), all `status_script: ready`, each with a 5-question quiz in `hv_quizzes`.

| New | Title | Level | sort_order | Reward | Badge |
|---|---|---|---|---|---|
| **M11** 🪜 | The Agent Autonomy Ladder | Elite | 12 | +400 BROski$ | Autonomy Cartographer |
| **M12** 🧗 | From Autocomplete to Orchestrator | Elite | 13 | +450 BROski$ | Mission Orchestrator |
| **M13** 🛡️ | Ship a Safe, Self-Governing Agent | Elite | 14 | +600 BROski$ | Agent Governor |

**Teaching spine:** the L0 (autocomplete) → L3+ (self-governing crew) autonomy ladder, grounded module-by-module in the infra shipped earlier this roadmap:
- **M11** = the mental model (self-driving-car levels analogy).
- **M12** = hands-on HyperFlow — author + run a mission graph (`/api/v1/flows`, `/run`, SSE `/stream`, `/reload`). *(HyperFlow = P0-1)*
- **M13** = capstone — Safety Shepherd `:8096` ALLOW/BLOCK/ESCALATE *(P0-2)* + Identity `X-BROSKI-IDENTITY` `/api/v1/identity/me` *(P1-1)* + Governance Ledger `/api/v1/governance/ledger` *(P1-2)*. Course finale.

---

## 📦 Where it lives

- **Live content:** `hv_modules` + `hv_quizzes` in Supabase `yhtmuibgdnxhbgboajhc` — written via Supabase MCP (the proven path).
- **Canonical sources (this commit):**
  - `scripts/M11-ai-agents-2-0-autonomy-ladder.md`
  - `scripts/M12-ai-agents-2-0-autocomplete-to-orchestrator.md`
  - `scripts/M13-ai-agents-2-0-safe-self-governing-agent.md`
- **Archived (this commit):** two orphan drafts moved to `scripts/_archive/` — `M11-ship-scale-graduate.md` + `M12-ride-or-die-contribution.md`. Their themes already live in DB **M10** ("You Built an Empire. Now Ship It."); they collided with the new M11/M12 codes (see landmine below).

---

## 🪤 Load-bearing gotchas surfaced

1. **`hv_modules.content` is MCP-set, NOT sync-set.** The `course-content-agent` pipeline (`scan_scripts_folder` → `upsert_module_from_script`) writes **metadata only** (code/title/emoji/level/xp/coin/slug/summary/status). It does **not** write `content` or `sort_order`. To add/edit a module body you must write the `scripts/M*.md` source **and** MCP-UPDATE `content` + `sort_order` yourself.

2. **Dup-code clobber landmine (pre-existing, NOT fixed).** `scan_scripts_folder` globs top-level `scripts/M\d+[-_.]*.md`, sorts alphabetically, upserts `onConflict: code` → for any code with 2+ files the **alphabetical-last file wins** and overwrites metadata. **Nearly every code M1–M10 currently has two conflicting script files** (old naming vs newer naming, e.g. M8 `architecting-on-chain-souls` vs `soulful-entities-ai-pets`). The live DB is fine *only because* content/title are MCP-set, not sync-driven — but **running `sync_all` today would scramble titles/slugs/xp across the whole course.** I archived only the two that collided with my new codes; the M1–M10 pairs remain.

---

## ⏭️ First task next session

**Course-content cleanup (separate from the roadmap, which is now closed):** for each code M1–M10, decide the one canonical `scripts/` file and archive the other, so `sync_all` becomes safe to run. The pairs are listed by `ls scripts/M*.md | grep -oiE '^M[0-9]+' | sort | uniq -d`.

Optional polish: a quick `npm run dev:frontend` visual pass on M11–M13 rendering (the render path is shared with M1–M10, so this is confirmation, not a fix).

---

## 🟢 State

- **DB:** M1–M13 (+M5B) all `ready`, 14 modules, each with one quiz. Verified via join query.
- **Branch:** `feat/ai-agents-2-0-track` off `origin/main` (this work).
- **Roadmap:** 🏁 **AGENT-START P0-1 → P2-4 ALL DONE.**

---

> 🐶♾️🔥 *You didn't just teach AI Agents 2.0 — the course is a guided tour of the agent stack you shipped this same roadmap.*
