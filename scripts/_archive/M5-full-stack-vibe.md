# 🧠 Full Stack Vibe

**Module:** M5 | **Level:** Intermediate | **XP:** 50 | **Coins:** 20 BROski$

> You've built apps. Now let's wire them to a real database, real auth, and real serverless functions. Welcome to full stack.

---

## 🎯 What You'll Learn

- Connect your app to Supabase for database + authentication
- Write and deploy Edge Functions (serverless TypeScript, globally distributed)
- Route AI interactions through the Vercel AI Gateway
- Use PostgreSQL database functions for low-latency server-side logic
- Sync user data (BROski$ tokens) between frontend, backend, and DB

---

## 🧠 The Big Idea

A full-stack app has three layers talking to each other:
```
Frontend (Next.js) ↔ Backend (Supabase/FastAPI) ↔ Database (PostgreSQL)
```

**Supabase** handles the backend plumbing so you don't have to build it from scratch:
- Auth (login/logout/sessions)
- Database (PostgreSQL with row-level security)
- Edge Functions (TypeScript that runs at the edge, near your users)
- Realtime (live data updates via WebSockets)

---

## 🛠️ Key Concepts

| Concept | What it is | When to use it |
|---------|-----------|----------------|
| Edge Functions | Serverless TypeScript at the edge | Webhooks (Stripe), scheduled jobs |
| Database Functions | SQL logic that runs server-side | Low-latency calculations, token sync |
| Row Level Security | Per-user data access rules | EVERYTHING that touches user data |
| Vercel AI Gateway | Routes AI API calls | Abstracting Claude/GPT/Ollama calls |

---

## ⚡ Step-by-Step

### Step 1 — Connect Supabase to your app
```bash
npm install @supabase/supabase-js
```
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Step 2 — Add authentication
Prompt:
```
Add Supabase email/password auth to my Next.js app.
Create a /login page with email + password fields.
On success redirect to /dashboard.
Use @supabase/ssr for server-side session management.
```

### Step 3 — Deploy an Edge Function
```bash
supabase functions new token-sync
```
Prompt:
```
Write a Supabase Edge Function that listens to a Stripe webhook.
When a payment.succeeded event arrives, update the user's brosk_coins
column in the profiles table by the amount purchased.
```

### Step 4 — Wire the Vercel AI Gateway
In your API route (`app/api/chat/route.ts`):
```typescript
const response = await fetch(process.env.VERCEL_AI_GATEWAY_URL!, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.VERCEL_AI_TOKEN}` },
  body: JSON.stringify({ model: 'claude-3-5-sonnet', messages })
})
```

---

## 🌟 The Neurodivergent Edge

Supabase removes the most ADHD-hostile part of web dev: **infrastructure setup**. No configuring servers, no managing databases manually, no writing auth from scratch.

You focus on **what your app does**. Supabase handles **how it stays alive**.

---

## ✨ Practical Task

Connect your app from M4 to Supabase. Add a `tasks` table. Make the TaskWidget save tasks to the database and fetch them on load. Now your data persists across page refreshes.

---

## 📊 XP Check

- [ ] Supabase client initialised in the app
- [ ] Auth working (login + protected route)
- [ ] At least one Edge Function deployed
- [ ] Data persisting to PostgreSQL

**Complete all 4 → Claim your 50 XP + 20 BROski$ 🤑**
