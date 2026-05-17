---
name: vercel-deploy
description: Deploy, preview, and manage the Hyper-Vibe Coding Course on Vercel. Covers production deploys, preview links, env var sync, rollback, and live site QA.
triggers:
  - "deploy to vercel"
  - "check vercel"
  - "preview deploy"
  - "rollback vercel"
  - "vercel env"
  - "is the site live"
  - "check production"
metadata:
  project: hyper-vibe-coding-course
  platform: Vercel
  stack: Next.js + Supabase + Stripe
  live_url: https://hyper-vibe-coding-course.vercel.app
  repo: github.com/welshDog/Hyper-Vibe-Coding-Course
---

# 🚀 Skill: vercel-deploy

## Purpose
Handle all Vercel deployment tasks for the Hyper-Vibe Coding Course platform — from checking deploy status to syncing env vars and rolling back bad deploys.

## When to Use
- User says "deploy", "check Vercel", "is it live", "preview link", "rollback"
- After pushing new code to GitHub and needing to confirm the deploy
- When a page is broken on the live site and a rollback is needed
- When env vars need adding/checking before a deploy goes live

---

## 📋 Step-by-Step Workflow

### 1. Check Current Deploy Status
```bash
# Check Vercel deploy status via dashboard or CLI
vercel ls
# Or check the live URL directly
curl -I https://hyper-vibe-coding-course.vercel.app
```
✅ Confirm: HTTP 200 = live. HTTP 5xx = broken.

### 2. Trigger a Production Deploy
```bash
# Push to main branch — Vercel auto-deploys
git push origin main
# Or force deploy via CLI
vercel --prod
```
✅ Confirm: Vercel dashboard shows green deploy. Check live URL.

### 3. Create a Preview Deploy
```bash
# Push to any branch that isn't main
git push origin feature/your-branch
# Vercel auto-creates a preview URL
# Format: hyper-vibe-coding-course-[hash]-bro-skis.vercel.app
```
✅ Confirm: Preview URL works and shows expected changes.

### 4. Sync Environment Variables
```bash
# List current env vars
vercel env ls
# Add a new env var
vercel env add VARIABLE_NAME production
# Pull env vars to local .env.local
vercel env pull .env.local
```
⚠️ Never commit .env.local to git.

### 5. Rollback a Bad Deploy
```bash
# List recent deploys
vercel ls
# Promote a previous deploy to production
vercel promote [deployment-url]
```
✅ Confirm: Live URL shows the rolled-back version.

### 6. Check Build Logs
- Go to: https://vercel.com/bro-skis/hyper-vibe-coding-course
- Click the latest deploy → View Function Logs or Build Logs
- Look for: build errors, missing env vars, timeout errors

---

## ⚠️ Guardrails
- NEVER push broken code to `main` without testing on a preview branch first
- NEVER add secrets directly in code — use `vercel env add`
- ALWAYS check `vercel.json` security headers are present before prod deploy
- NEVER delete a production deploy without confirming a rollback target first
- If Stripe webhook URL changes, update it in Stripe dashboard immediately

---

## ✅ Success Checks
- [ ] Live URL returns HTTP 200
- [ ] No console errors in browser DevTools
- [ ] Auth flow works (sign in / sign out)
- [ ] Stripe checkout loads correctly
- [ ] Module content loads for logged-in users
- [ ] Navbar shows correct state (logged in vs logged out)

---

## 🔗 Key Links
- Live site: https://hyper-vibe-coding-course.vercel.app
- Vercel dashboard: https://vercel.com/bro-skis/hyper-vibe-coding-course
- GitHub repo: https://github.com/welshDog/Hyper-Vibe-Coding-Course
- Supabase project: https://supabase.com/dashboard/project/yhtmuibgdnxhbgboajhc
