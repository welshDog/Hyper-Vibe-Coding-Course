# 🚀 The Complete Vercel Mastery Guide: From Zero to Production Expert

> **Status:** Draft — tweak later  
> **Author:** @welshDog + Perplexity AI  
> **Date:** May 28, 2026  
> **Format:** Hyperfocus Zone — Neurodivergent-first, chunked, WIN-moment structure

---

## 📋 Table of Contents

1. [Foundations (Days 1-7)](#foundations-days-1-7)
2. [Frontend Deployment (Days 8-14)](#frontend-deployment-days-8-14)
3. [Backend & Full-Stack (Days 15-21)](#backend--full-stack-days-15-21)
4. [AI Infrastructure (Days 22-28)](#ai-infrastructure-days-22-28)
5. [Advanced Deployment Patterns (Days 29-35)](#advanced-deployment-patterns-days-29-35)
6. [Observability & Monitoring (Days 36-42)](#observability--monitoring-days-36-42)
7. [Security & Compliance (Days 43-49)](#security--compliance-days-43-49)
8. [Data & Storage (Days 50-56)](#data--storage-days-50-56)
9. [Team Collaboration & DX (Days 57-63)](#team-collaboration--dx-days-57-63)
10. [Production Excellence (Days 64-70)](#production-excellence-days-64-70)

---

## 🏗️ Foundations (Days 1-7)

### Day 1: Understand What Vercel Is

**Goal:** Know exactly what Vercel does and why it matters

**Key Concepts:**
- Vercel solves infrastructure problems for full-stack apps and AI products
- You don't manage servers — just push code
- Global edge network with 126 PoPs
- Zero-config deployment across 35+ frameworks

**Hands-On:**
- Create a Vercel account
- Link a GitHub repository
- Deploy a static HTML site (push → watch it deploy)

**WIN:** Your first live URL from a git push 🎯

---

### Day 2: Master Git Integration & Deployments

**Goal:** Understand the Git-to-deployment workflow

**Key Concepts:**
- Every Git push = automatic deployment
- Preview deployments for PR testing
- Production branch deployments to live domain
- Fork protection by default

**Hands-On:**
1. Connect your GitHub repo to Vercel
2. Push to a feature branch → see preview deployment
3. Create a PR → watch preview update automatically
4. Merge to main → production deployment triggers

**WIN:** You can explain preview vs production without notes 🛡️

---

### Day 3: Environment Variables & Secrets

**Goal:** Manage secrets safely across all environments

**Key Concepts:**
- Three environments: Development, Preview, Production
- Sensitive variables are encrypted and non-readable
- Branch-specific overrides for targeted testing
- Never commit `.env` files

**Hands-On:**
```bash
# Add sensitive API key for production
vercel env add API_KEY production --sensitive

# Add preview-specific database URL
vercel env add DATABASE_URL preview staging-db --sensitive

# Pull all development variables locally
vercel env pull

# Run a command with prod-like environment
vercel env run -e production -- npm run build
```

**WIN:** Secrets live in Vercel, not in your git history 🔐

---

### Day 4: Vercel CLI Mastery

**Goal:** Use the Vercel CLI for local development and deployments

**Key Concepts:**
- `vercel dev` = local server with serverless functions
- `vercel deploy` = manual deployments
- `vercel env` = environment variable management
- `vercel logs` = real-time function logs
- `vercel link` = connect local project to Vercel

**Hands-On:**
```bash
npm i -g vercel
vercel link
vercel dev
vercel logs --follow
vercel ls
vercel env ls production
vercel deploy --prod
```

**WIN:** You can deploy, inspect, and debug without touching the dashboard 🖥️

---

### Day 5: Understanding Vercel's Infrastructure

**Goal:** Know how Vercel's compute and CDN work

**Key Concepts:**
- **Vercel Functions:** Serverless compute (scales from 0)
- **Fluid Compute:** Optimized concurrency for AI/IO-heavy workloads
- **Active CPU Pricing:** Only charged during execution, not idle
- **Edge Network:** 126 PoPs deliver content globally

**Request flow:**
```
User → Nearest PoP (Edge)
       ↓
  Cache Hit? → Serve cached response
       ↓
  No Cache → Vercel Function executes
       ↓
  CDN caches → Serves future requests
```

**WIN:** You can explain cold starts + CDN caching to a teammate 🌍

---

### Day 6: Plans & Pricing

**Goal:** Know what's included in each tier

| Feature | Hobby | Pro | Enterprise |
|---|---|---|---|
| Deployments | Unlimited | Unlimited | Unlimited |
| Bandwidth | 100GB/mo | Flexible | Custom |
| Serverless Functions | 6GB/mo | $0.50/GB | Custom |
| Feature Flags | Basic | Advanced | Advanced + SSO |
| HIPAA/SAML | No | Add-on | Included |
| Support | Community | Standard | Priority |

**WIN:** You can calculate your monthly cost and justify the plan you're on 💰

---

### Day 7: Project Setup Best Practices

**Goal:** Set up a project the right way from day one

**Checklist:**
- [ ] Repo linked to Vercel
- [ ] All secrets in env vars, none in git
- [ ] `.env.local` in `.gitignore`
- [ ] Preview + Production tokens are different
- [ ] Fork protection enabled
- [ ] `vercel env pull` working locally

**WIN:** Your project is set up so that nothing can accidentally leak or break production 🏆

---

## 🎨 Frontend Deployment (Days 8-14)

> *Coming soon — framework-specific deployment, image optimisation, ISR, partial prerendering*

---

## ⚙️ Backend & Full-Stack (Days 15-21)

> *Coming soon — Vercel Functions, API routes, FastAPI on Vercel, streaming responses*

---

## 🤖 AI Infrastructure (Days 22-28)

> *Coming soon — AI Gateway, AI SDK, streamText, tool calling, model routing*

---

## 🚢 Advanced Deployment Patterns (Days 29-35)

> *Coming soon — Rolling releases, instant rollback, skew protection, canary deploys*

---

## 📊 Observability & Monitoring (Days 36-42)

> *Coming soon — Speed Insights, Web Analytics, Runtime Logs, OpenTelemetry*

---

## 🔐 Security & Compliance (Days 43-49)

> *Coming soon — Vercel Firewall, WAF, OIDC, Git Fork Protection, 2FA, HIPAA*

---

## 🗄️ Data & Storage (Days 50-56)

> *Coming soon — Vercel Blob, Edge Config, Supabase integration, Upstash Redis*

---

## 👥 Team Collaboration & DX (Days 57-63)

> *Coming soon — RBAC, preview comments, Vercel Toolbar, Code Owners*

---

## 🏁 Production Excellence (Days 64-70)

> *Coming soon — spend management, deployment retention, monitoring, SRE practices*

---

## 🔗 Related Modules

- `MODULE_VERCEL_SHIP_SAFE.md` — Secrets, previews & production (deep dive on Day 3)
- `WHATS_DONE.md` — Full project history
- `CLAUDE.md` — Sacred rules + tech gotchas

---

*🐶♾️ Built by @welshDog + Perplexity AI — May 28, 2026*  
*"Stop apologising for your brain. Start building."*
