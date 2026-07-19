# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-07-19 by Claude (Cowork) ⚡

## 2026-07-19 — Quizzes re-seeded from git (root-cause fix)

- **hv_quizzes was empty after the yhtmui→tlav rebuild** — quiz content had only ever
  lived in the old DB, never in git, so the rebuild lost it. **Root fix:** quiz content
  is now a committed seed migration (`supabase/migrations/20260718210000_seed_hv_quizzes.sql`),
  so it survives future rebuilds.
- **M3 (🎤 Prompt Like a Pro) + M4 (🏗️ Build Your First App) live on tlav** — 5 questions each,
  keyed to the correct live modules, applied idempotently. Disk = DB.
- **Caught two drift traps before applying:** (1) master-pack numbering ≠ live tlav numbering
  (a new intro module shifted everything down); (2) matching titles hid *different lesson content* —
  questions were rewritten from the LIVE lesson text (`scripts/_archive/M3-*.md`, `M4-*.md`),
  every answer grounded in a real line. **Lesson: verify content, not the label.**
- **Still open:** M1, M2, M5–M12 `hv_quizzes` (author from live content — HELD list in the seed file);
  the separate `quiz_questions` lesson-level system is still empty. See `docs/QUIZ_SEED_HANDOFF_2026-07-18.md`.

## Done & Locked — Do NOT re-suggest

- Course platform architecture: Supabase + Vercel + Web3
- Frontend dev command: `npm run dev:frontend` (NOT `npm run dev`)
- Sacred import rules enforced: `from app.X import Y`
- .env files never committed to git
- Stripe webhook rate-limit exempt confirmed

## Sacred Rules (NEVER break)

- `npm run dev:frontend` — NOT `npm run dev`
- `.env` files — NEVER committed to git
- Stripe webhook — rate-limit EXEMPT, always
- `from app.X import Y` — NEVER `from backend.app.X`
