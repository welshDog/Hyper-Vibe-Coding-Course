# NEXT_SESSION_HANDOVER — 2026-05-26

## Status
- Course platform is considered stable; Sprint 4 shipped May 19 (do not touch shipped sprint code unless explicitly required).
- Active ops work is primarily in `WelshDog-Mission-Control`.

## Where The Latest “Truth” Lives
- `WHATS_DONE.md` (repo truth list)
- `AGENT-START.md` (boot file)
- `rewrites/NEXT_SESSION_HANDOVER_2026-05-26.md` (latest detailed cross-repo handover)

## Run (Local)
- Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
- Live: https://hyper-vibe-coding-course.vercel.app

## Next Tasks
- Finish Mission Control production wiring (API hosting + Vercel SPA rewrites).
- Smoke-test Grant Tokens + Refund end-to-end after API is deployed.
