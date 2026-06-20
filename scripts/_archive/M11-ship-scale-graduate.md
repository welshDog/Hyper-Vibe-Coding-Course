# 🚀 Ship, Scale & Graduate

**Module:** M11 | **Level:** Elite | **XP:** 150 | **Coins:** 100 BROski$

> You've built it. You've secured it. You've monitored it. Now it's time to SHIP it to the world and become a HyperCode Graduate.

---

## 🎯 What You'll Learn

- Deploy your full Next.js frontend to Vercel (production)
- Configure production environment variables securely
- Set up custom domains and SSL
- Run `npm run graduate` — the cluster graduation workflow
- Onboard your first real user and watch the system handle them
- Earn the **HyperCode Graduate** achievement and title

---

## 🧠 The Big Idea

**Shipping** is the only metric that matters.

You can have the most beautiful code in the world. If it's not live, it doesn't exist.

This module is about the final 10% that separates builders from shippers:
- Production config is different from local config
- Real users find bugs you never imagined
- Scaling means your architecture choices come home to roost

**The pattern:** Local → Staging → Production. Each step is a gate. Pass all three.

---

## 🚀 The Graduation Workflow

```bash
# From repo root
npm run graduate
```

This command:
1. Reads your `cluster.json`
2. Validates all agent manifests
3. Runs the full test suite
4. Builds the Next.js app
5. Deploys to Vercel
6. Registers all agents in production
7. Runs a smoke test against live endpoints
8. Awards your Graduate achievement in Supabase

---

## ⚡ Step-by-Step

### Step 1 — Prep production environment
```bash
# Never use local .env for production
# Set these in Vercel dashboard: Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your-prod-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Server-side only:
SUPABASE_SERVICE_ROLE_KEY=your-service-role
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2 — Deploy frontend
```bash
npx vercel --prod
```
Or connect your GitHub repo to Vercel for automatic deployments on push.

### Step 3 — Test the live URL
- [ ] Login works
- [ ] Data loads from Supabase
- [ ] Stripe checkout completes
- [ ] AI chat responds

### Step 4 — Run graduation
```bash
npm run graduate
```
Watch the output. Fix any failures. Re-run. When it passes completely — you're a Graduate.

---

## 🌟 The Neurodivergent Edge

Shipping creates the **biggest dopamine hit** in the entire course. Seeing YOUR app live on a real URL, used by real people, is the ultimate hyperfocus reward.

This is why we built everything in small steps. Every module was a small win leading to **the big win**.

---

## ✨ Practical Task

Deploy your app to Vercel. Share the live URL with someone. Watch them use it. Fix the first thing they break. That's production dev.

---

## 📊 XP Check

- [ ] Frontend deployed to Vercel (live URL)
- [ ] All environment variables set in production (not local `.env`)
- [ ] Login + data + Stripe all working on live URL
- [ ] `npm run graduate` passes all checks
- [ ] HyperCode Graduate achievement unlocked in Supabase

**Complete all 5 → Claim your MASSIVE 150 XP + 100 BROski$ 🤑🚀**
