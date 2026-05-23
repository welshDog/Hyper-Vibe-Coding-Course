# SESSION_SNAPSHOT_2026-05-23.md

> **Date:** Saturday May 23, 2026
> **Time:** 14:00 – 15:00 BST
> **AI Partners:** Perplexity (lead) + Claude (Sprint 4 cleanup + Catch Stragglers wire-up in MC sibling repo)
> **Commit HEAD:** 3d7c72e

---

## 🧠 Session Summary

Double-workstream session that hit a contradiction. Perplexity drafted Catch Stragglers backend code (`api/routes/catch_stragglers.py` + `discord-bot/dm_sender.py` + `frontend/components/mission-control/CatchStragglers.jsx`) in the course repo, but none of it was deployed (course is a Vite SPA — no FastAPI runs there) and the JSX sat outside the Vite tree. Perplexity also opened a duplicate Sprint 4 build (root-level `useAnonymousProgress.ts` / `migrateAnonProgress.ts` / `ClaimXPModal.tsx`) on an RPC-bypassing architecture — would have been a security regression. Claude reconciled: Sprint 4 was already LIVE since May 19 (`a12ecd0`) on the RPC-gated architecture; the duplicate was deleted (`c4a9274`). Catch Stragglers was then rebuilt properly in **WelshDog-Mission-Control** with an Express `/api/send-dm` backend + full glass-panel operator overlay (commits `00aa770` / `ceadad2` / `c5b36c2` over there).

---

## ✅ What Got Done

### Built + Pushed
- `api/routes/catch_stragglers.py` — scans idle students, generates 3-tone DM drafts, Discord send, email fallback, mc_missions audit log
- `discord-bot/dm_sender.py` — async Discord Bot API DM sender, rate limit handling, channel open
- `frontend/components/mission-control/CatchStragglers.jsx` — full operator UI, tone picker, editable drafts, bulk approve, snooze 24h, skip
- `rewrites/NEXT_SESSION_HANDOVER_2026-05-23.md` — full handover written + pushed
- `rewrites/SESSION_SNAPSHOT_2026-05-23.md` — this file

### Verified
- AGENT-START.md v1.1 confirmed live (commit 73f413 from earlier today)
- NotebookLM briefed with AGENT-START.md + May 23 handover — responding correctly
- May 19 priorities confirmed still valid (no blocking commits May 20–22)
- Handover chain integrity test: NotebookLM returned exact commit SHAs ✔️

---

## ✅ Sprint 4 — already LIVE (`a12ecd0`, May 19)

Was listed here as "in flight" — incorrect; it shipped May 19 on a server-authoritative
architecture (RPC-gated). The May 23 parallel attempt (`d7ca644`) was a duplicate using a
different (RPC-bypassing) approach — removed in cleanup. See CLAUDE.md §0b for the truth.

---

## 🔴 Load-Bearing Rules (Repeat Every Session)

1. Never `supabase db push`
2. Web3 = `/pets` only
3. `set-state-in-effect` = lint fail
4. Three chrome systems — funnel ≠ course ≠ labs
5. `DISCORD_BOT_TOKEN` in `.env` only
6. `docker-ce-cli` not `docker.io`

---

## 🎯 Next Session First Task

**Smoke-test Catch Stragglers in WelshDog-Mission-Control** (real `DISCORD_TOKEN` / `DISCORD_BOT_TOKEN` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, then `npm run dev:full` → Scan → Send). After that: `mc_events` event-sourcing migration. **Don't re-verify Sprint 4** — it was already LIVE since May 19 (`a12ecd0`), see CLAUDE.md §0b.

---

*🐶♾️ @welshDog + Perplexity AI — May 23, 2026*
