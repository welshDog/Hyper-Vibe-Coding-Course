# LOOP_CONTEXT.md — Hyper-Vibe-Coding-Course
> Claude reads this before every loop on this repo.

---

## Stack
- **Vite React** — NOT Next.js, never generate App Router code
- Supabase — project ID: `yhtmuibgdnxhbgboajhc`
- Vercel — live at hyper-vibe-coding-course.vercel.app
- Stripe — webhook must be rate-limit EXEMPT, --no-verify-jwt
- BROski token economy — XP, streaks, level rewards

## Key Rules
- `npm run dev:frontend` NOT `npm run dev`
- Supabase migrations: MCP `apply_migration` ONLY — never `supabase db push` (history desynced)
- Stripe is **TEST mode** today (price IDs resolve to `/test/` URLs) — verify before trusting any "LIVE" banner
- Stripe webhook signing secret: use `whsec_...` printed by `stripe listen`
- Sprint 4 anon signup LIVE since May 19 (a12ecd0) — do NOT re-implement
- Anchored at `frontend/src/lib/anonProgress.ts` → `useProgress.reconcile`

## Course Modules (all rewritten — do not touch)
M0 Welcome · M1 AI Brain · M2 Speaking Agent · M3 Win Summary
M4 Stripe Walkthrough · M5 Observability · M5B Observability Pt2
M6 Agent Architecture · M7 Prompt Injection · M8 Web3 · M9 Security SRE · M10 Graduation
**AI Agents 2.0 capstone (P2-4, added 2026-06-20):** M11 Autonomy Ladder · M12 Autocomplete→Orchestrator · M13 Safe Self-Governing Agent (each w/ quiz)
> ⚠️ course-content-agent sync writes METADATA ONLY — content + sort_order are MCP-set. Don't let stale scripts/ dup files clobber it.

## Key Files
- `rewrites/NEXT_SESSION_HANDOVER_*.md` + `rewrites/SESSION_SNAPSHOT_*.md` — newest wins, ALWAYS read first
- `CLAUDE.md` — sacred rules + tech gotchas
- `WHATS_DONE.md` — never rebuild anything here
