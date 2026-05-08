---
name: vercel-vite-deploy
description: Vercel deployment for the Hyper-Vibe-Coding-Course frontend (Vite + React) — Root Directory must be `frontend/`, VITE_ env var prefix, build config, preview deploys, env per-environment. Use when the user says "deploy to Vercel", "Vercel build failing", "env not exposed", "VITE_ undefined", "Root Directory", "preview deploy", or wires a new env var.
---

# vercel-vite-deploy

The Course frontend is Vite + React, deployed to Vercel. **Vercel's "Root Directory" setting MUST be `frontend`** — the repo root is a monorepo (frontend, backend, supabase functions, discord bot all coexist).

## Vercel Project Config (one-time setup, never re-debate)

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` (auto) |
| Node Version | 18.x or 20.x |

If "Root Directory" is unset → Vercel tries to build from repo root → fails because no `package.json` for Vite there.

## Required Env Vars (per Environment)

Set in Vercel Dashboard → Project → Settings → Environment Variables. **Add each to all 3 environments** (Production, Preview, Development) unless the value differs.

### Production (must-haves)

```
VITE_SUPABASE_URL=https://yhtmuibgdnxhbgboajhc.supabase.co
VITE_SUPABASE_ANON_KEY=<production anon key>
VITE_HYPERCODE_API_URL=https://api.hypercode.broski.dev
```

### Preview / Development

Same keys, may point to staging Supabase + local V2.4:

```
VITE_HYPERCODE_API_URL=http://localhost:8000   # for local dev
```

## The `VITE_` Prefix Rule

**Vite only exposes env vars to the client bundle if they start with `VITE_`.** This is a security feature — server-only secrets (without prefix) stay out of the browser.

| Var | Exposed to browser? |
|---|---|
| `VITE_SUPABASE_URL` | ✅ yes |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ no — and it MUST stay this way |
| `VITE_HYPERCODE_API_URL` | ✅ yes |
| `STRIPE_SECRET_KEY` | ❌ no — and MUST stay this way |

If `import.meta.env.VITE_X` returns `undefined` at runtime → either the var isn't set in Vercel, or the prefix is wrong.

## Deploy Triggers

| Trigger | Outcome |
|---|---|
| Push to `main` | Production deploy |
| Push to any branch | Preview deploy with unique URL |
| PR opened | Preview deploy + bot comment with URL |
| Manual via dashboard | Pin a specific commit to production |

To redeploy without code changes (e.g. after env var update):

1. Vercel Dashboard → Project → Deployments
2. Find the most recent deployment
3. ... → Redeploy
4. Confirm

## Local Dev Mirror of Vercel Build

```powershell
cd "H:\Hyper-Vibe-Coding-Course\frontend"

# Set env vars for the session
$env:VITE_SUPABASE_URL    = "https://yhtmuibgdnxhbgboajhc.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "<your anon>"
$env:VITE_HYPERCODE_API_URL = "http://localhost:8000"

# Dev server (HMR)
npm run dev
# → http://localhost:5173

# Production build (run before pushing big changes)
npm run build
npm run preview
# → http://localhost:4173
```

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| Vercel build fails: "no package.json" | Root Directory not `frontend` | Settings → General → Root Directory → set to `frontend` → redeploy |
| Build OK but `VITE_X` undefined at runtime | Env var missing or wrong prefix | Settings → Env Vars → confirm `VITE_` prefix + value, redeploy |
| `Failed to fetch` on Supabase calls | `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing | First debug step ALWAYS — see `frontend-auth-debug` skill |
| Production works, Preview broken | Env var only set for "Production" environment | Re-add for "Preview" too |
| Build hangs / times out | Heavy dependency, or memory limit | Vercel free tier = 1GB RAM during build; bump tier or optimize |
| "Cannot find module 'X'" in build | Dep missing from `package.json` (only in node_modules locally) | `npm install X --save` and commit `package.json` |
| Source maps in production | Vite default = source maps off in prod | Confirm `vite.config.ts` has `build.sourcemap: false` for prod |
| 404 on routes that work locally | SPA routing not configured | Add `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }` |
| CSS missing on deployed site | Tailwind not building | Confirm `tailwind.config.js` content paths include the right files |

## Per-Environment Env Patterns

Vercel lets you scope env vars to:
- **Production** (only for prod deploys from `main`)
- **Preview** (every other branch + PR)
- **Development** (Vercel CLI `vercel dev`)

For staging Supabase + staging V2.4:
- Production env: production keys
- Preview env: staging keys
- Development env: local URLs

## Companion Skills

- `frontend-auth-debug` — most "broken in prod" issues are env vars
- `stripe-checkout-frontend` — uses `VITE_HYPERCODE_API_URL`
- `supabase-edge-functions` — backend hooks Vercel doesn't see

## Hard Rules

- **Root Directory MUST be `frontend`** — non-negotiable, monorepo layout demands it
- **`VITE_` prefix mandatory** for any client-exposed env var
- **NEVER put `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in Vercel env** — they'd leak to the browser
- **Always set env vars in all 3 environments** — production, preview, development (unless intentionally scoped)
- **Check `vercel.json` exists** for SPA routing — without it, deep links 404
