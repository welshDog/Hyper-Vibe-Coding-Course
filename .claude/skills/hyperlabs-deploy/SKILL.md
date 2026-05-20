---
name: hyperlabs-deploy
description: Sacred deploy rules for Hyper-Vibe — Vercel + Supabase + MCP only. Closes the #1 footgun.
triggers:
  - deploy
  - push to vercel
  - go live
  - ship it
  - vercel deploy
  - production push
---

# 🚀 hyperlabs-deploy — The Sacred Deploy Rules

> These rules are NON-NEGOTIABLE. Every deploy, every time. No exceptions.

---

## ⛔ NEVER DO THESE

- `supabase db push` — NEVER. Use MCP apply_migration only.
- `curl`-polling to check deployment status — use Vercel MCP `get_deployment`
- Hardcode secrets or IDs in migration files
- Push direct to `main` without a passing build
- Deploy frontend without checking Supabase edge functions are up
- Run migrations on production without testing on branch first

---

## ✅ THE SACRED DEPLOY CHECKLIST

### Step 1 — Pre-deploy checks
```
[ ] tsc 0 errors
[ ] eslint 0 errors
[ ] All tests green (npx playwright test)
[ ] No .env values hardcoded in any file
[ ] Supabase edge functions up (check logs)
```

### Step 2 — Database changes (if any)
```
[ ] Use MCP apply_migration — NEVER db push
[ ] Migration name is snake_case + descriptive
[ ] Migration tested on branch first
[ ] RLS policies checked (run get_advisors after)
```

### Step 3 — Frontend deploy
```
[ ] Vercel env vars confirmed set (VITE_STRIPE_* etc)
[ ] Use Vercel MCP get_deployment to check status — not curl
[ ] Check deployment URL resolves before calling done
```

### Step 4 — Post-deploy verification
```
[ ] Hit /pricing — all 5 tiers render
[ ] Stripe checkout button fires (not '#' fallback)
[ ] Auth flow works (sign up / sign in)
[ ] BROski$ tokens visible on dashboard
[ ] No console errors in browser
```

---

## 🔧 MCP TOOLS TO USE

```
supabase apply_migration   → ALL database schema changes
supabase get_advisors      → Check RLS + performance after migration
supabase get_logs          → Debug edge functions
vercel get_deployment      → Check deploy status (not curl)
```

---

## 📦 VERCEL ENV VARS REQUIRED

```
VITE_STRIPE_STARTER_URL
VITE_STRIPE_PRO_URL
VITE_STRIPE_BUILDER_URL
VITE_STRIPE_BUILDER_MONTHLY_URL
VITE_STRIPE_ARCHITECT_URL
VITE_STRIPE_ARCHITECT_MONTHLY_URL
VITE_STRIPE_HYPER_LEGEND_URL
VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

All must be set for ALL 3 environments: Production, Preview, Development.

---

## 🚨 KNOWN RISKS

- **R1 — Double webhook:** stripe-webhook edge fn + V2.4 backend both process events. Only ONE should write to DB.
- **R2 — Missing env vars:** If any VITE_STRIPE_* is missing, checkout silently falls back to '#'.
- **R-Plan — Price gap:** Pricing.tsx has OLD prices (£79/£149). Plan says £97/£247. Do NOT deploy without 5-tier migration approved by Lyndz.

---

*Part of the HFZ Claude Skill Pack | welshDog 🐶♾️*
