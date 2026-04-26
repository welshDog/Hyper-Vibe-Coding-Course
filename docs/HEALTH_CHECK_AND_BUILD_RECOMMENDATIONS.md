# Hyper Vibe Platform — Health Check & Build Recommendations
> Audit date: 2026-04-26 | Audited against: CLAUDE.md, CLAUDE_CONTEXT.md, current source code, and Supabase migrations/functions.

---

## 1. Snapshot

**What is live/real in this repo:**
- `frontend/` — Vite + React + TypeScript + Tailwind + Supabase + Stripe (redirect via Checkout Sessions)
- `supabase/` — migrations + Edge Functions (notably `stripe-webhook/`, `shop-purchase/`, `sync-tokens-to-v24/`)
- `discord-bot/` — Python bot (cogs + db integration)
- `api/` — Vercel serverless route(s) for BROski chat (not currently referenced by the Vite frontend)

**Payments architecture (current):**
- Checkout sessions are created by HyperCode V2.4 (`POST /api/stripe/checkout`, default `http://localhost:8000`)
- Stripe events are handled by Supabase Edge Function `stripe-webhook`

---

## 2. Health Check Results (local)

Frontend checks executed:
- `npm run lint` ✅
- `npx tsc -p tsconfig.json --noEmit` ✅
- `npm run build` ✅ (bundle warning: main JS chunk > 500 kB)
- `npx playwright test --list` ✅ (tests discoverable: 33 tests)

---

## 3. Production Blockers (RED)

### 3.1 CI workflow likely runs in the wrong directory
`frontend/.github/workflows/playwright.yml` runs `npm ci` at repo root. Root `package.json` does not represent the frontend app and does not have a lockfile for CI, so this job is very likely to fail.

### 3.2 `docker-compose.yml` is not buildable as-is
`docker-compose.yml` references `./apps/api/Dockerfile`, but `apps/api/` currently contains only `src/` (no `Dockerfile`, no `package.json`).

### 3.3 Root test script always fails
Root `package.json` has `"test": "echo \"Error: no test specified\" && exit 1"`, which will fail any default CI that runs `npm test`.

---

## 4. Risks / Soon (YELLOW)

### 4.1 Large frontend bundle warning
The production build warns about a chunk > 500 kB. This is not a blocker, but it can impact first-load performance.

### 4.2 Payments config must be set in production
Frontend requires `VITE_HYPERCODE_API_URL` to point to a real HyperCode V2.4 deployment in production (local fallback is guarded to avoid accidentally shipping `localhost`).

---

## 5. Recommended Next Fixes (ordered)

1. Fix the Playwright GitHub Action to run in `frontend/` and use `frontend/package-lock.json`
2. Decide whether `apps/api/` is legacy or required:
   - If required: add missing `package.json` + `Dockerfile` and wire it cleanly
   - If legacy: remove it from `docker-compose.yml` to avoid broken onboarding
