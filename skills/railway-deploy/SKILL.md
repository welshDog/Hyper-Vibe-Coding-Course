---
name: railway-deploy
description: Deploy, manage, and monitor backend services for the Hyper-Vibe ecosystem on Railway. Covers service deploy, env vars, logs, scaling, and health checks.
triggers:
  - "railway"
  - "deploy backend"
  - "railway deploy"
  - "check railway"
  - "railway logs"
  - "service down"
  - "railway env"
  - "railway status"
metadata:
  platform: Railway
  project: hyper-vibe-coding-course
  stack: FastAPI + Python + PostgreSQL + Redis
  docs: https://docs.railway.com/ai/agent-skills
---

# 🚂 Skill: railway-deploy

## Purpose
Deploy and manage backend services for the Hyper-Vibe platform on Railway — FastAPI agents, background workers, DB services, and anything that doesn't live on Vercel.

## When to Use
- Deploying or redeploying a backend service
- Checking if a service is down or erroring
- Adding or updating environment variables
- Viewing logs to debug an issue
- Scaling a service up/down
- Setting up a new service from a GitHub repo

---

## 📋 Step-by-Step Workflow

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
# Login
railway login
```

### 2. Deploy a Service
```bash
# Link to existing project
railway link
# Deploy current directory
railway up
# Or deploy a specific service
railway up --service=api
```
✅ Confirm: Railway dashboard shows green deploy. Service URL responds.

### 3. Check Service Status
```bash
railway status
```
✅ Confirm: All services show `ACTIVE`. If `CRASHED` — check logs immediately.

### 4. View Logs
```bash
# Live logs for a service
railway logs
# Or specific service
railway logs --service=api
```
Look for: startup errors, missing env vars, port conflicts, DB connection failures.

### 5. Add / Update Environment Variables
```bash
# Add a variable
railway variables set MY_VAR=my_value
# List all variables
railway variables
# Remove a variable
railway variables delete MY_VAR
```
⚠️ Redeploy after changing env vars for changes to take effect.

### 6. Redeploy a Service
```bash
railway redeploy
# Or target specific service
railway redeploy --service=api
```
✅ Confirm: Service restarts cleanly. Logs show no errors on boot.

### 7. Scale a Service
```bash
# Via Railway dashboard:
# Service → Settings → Scaling → Adjust replicas
```
✅ Confirm: Correct number of replicas running. No memory limit errors.

### 8. Open Service URL
```bash
railway open
```
✅ Confirm: Service URL is live and responding correctly.

---

## ⚠️ Guardrails
- NEVER commit `.env` files — use `railway variables set` only
- ALWAYS check logs after a redeploy before marking it done
- NEVER scale to 0 replicas in production — service becomes unavailable
- If DB is on Railway (PostgreSQL), NEVER delete a service without backing up data first
- ALWAYS confirm the service health endpoint responds after deploy
- Railway auto-deploys on push to linked branch — confirm this is intentional before pushing

---

## ✅ Success Checks
- [ ] `railway status` shows all services ACTIVE
- [ ] Service URL returns expected response
- [ ] Logs show clean startup with no errors
- [ ] Env vars are set correctly (`railway variables`)
- [ ] Health endpoint responds (e.g. `/health` or `/api/health`)
- [ ] DB connections are alive (no timeout errors in logs)

---

## 🔗 Key Links
- Railway Dashboard: https://railway.app/dashboard
- Railway Docs — Agent Skills: https://docs.railway.com/ai/agent-skills
- Railway Docs — CLI Skills: https://docs.railway.com/cli/skills
- Railway Docs — Agents: https://docs.railway.com/agents
- GitHub repo: https://github.com/welshDog/Hyper-Vibe-Coding-Course
