---
name: hyper-vibe-course
description: Frontend patterns, bug fixes, and build knowledge for the Hyper-Vibe-Coding-Course repo. Use when working on any Course frontend (React/Vite/Tailwind), fixing Course-specific bugs, updating pages, wiring Supabase auth, or doing UI tweaking on the course platform. Knows the file structure, Supabase client patterns, and open bugs.
---

# Hyper-Vibe-Coding-Course Skill

## Stack
- **Framework:** React 19 + Vite 8 + TypeScript
- **Styling:** Tailwind CSS 3.4
- **Auth + DB:** Supabase (supabase-js)
- **Payments:** Stripe (@stripe/react-stripe-js)
- **Routing:** react-router-dom
- **Forms:** react-hook-form + zod
- **State:** zustand
- **Testing:** Playwright (E2E)
- **Deploy:** Vercel

## Key File Locations

```
frontend/src/
  pages/          ← all page components
  components/     ← shared components
  hooks/          ← useAchievements, useAnalytics
  lib/            ← supabase.ts, payments.ts, curriculum-data.ts
  context/        ← auth.ts
  types/          ← database.ts (Supabase types)
  utils/          ← errorHandler.ts

supabase/
  functions/      ← Edge Functions (Deno)
  migrations/     ← SQL migrations (28 total, next: 000029)

discord-bot/
  bot.py          ← main bot
  cogs/           ← command modules
```

## Supabase Client Pattern

```typescript
// lib/supabase.ts — always import from here
import { supabase } from '@/lib/supabase'

// Auth
const { data: { user } } = await supabase.auth.getUser()

// DB query with RLS
const { data: courses } = await supabase
  .from('courses')
  .select('*')
  .eq('is_active', true)

// Realtime subscription
supabase
  .channel('token-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'users',
    filter: `id=eq.${user.id}`
  }, payload => {
    setTokenBalance(payload.new.broski_tokens)
  })
  .subscribe()
```

## Open Bugs (fix these first)

### BUG 1 — Dead link on LandingPage
```tsx
// frontend/src/pages/LandingPage.tsx
// Find this link:
<Link to="/courses/vibe-coding-foundations">...</Link>
// Change to:
<Link to="/courses">...</Link>
```

### BUG 2 — Hardcoded port 8081 (should be 8000)
```bash
# Find all occurrences:
grep -r "8081" frontend/src/
# Replace :8081 → :8000 in any fetch/WebSocket URLs
```

### BUG 3 — QuizWidget placeholder fetch
```tsx
// frontend/src/components/QuizWidget.tsx
// Current: fetches all attempts then filters client-side (hack)
// Fix: add question_id param to the API query
const { data } = await supabase
  .from('quiz_attempts')
  .select('*')
  .eq('user_id', user.id)
  .eq('question_id', questionId)  // ← add this
  .order('created_at', { ascending: false })
  .limit(1)
```

### BUG 4 — errorHandler.ts TODO
```typescript
// frontend/src/utils/errorHandler.ts
// TODO: Log to Supabase table: error_logs
// Fix: create error_logs table (migration 000029) and wire it up
await supabase.from('error_logs').insert({
  user_id: user?.id,
  error_message: error.message,
  error_stack: error.stack,
  page: window.location.pathname,
  created_at: new Date().toISOString()
})
```

## Page Components Reference

| Page | Path | Status |
|------|------|--------|
| LandingPage | `/` | ✅ Live — fix dead link |
| Pricing | `/pricing` | ✅ Live |
| TokensPage | `/tokens` | ✅ Live |
| Dashboard | `/dashboard` | ✅ Live |
| Courses | `/courses` | ✅ Live |
| LessonPlayer | `/courses/:slug/:lesson` | ⚠️ VideoPlayer placeholder |
| Certificate | `/certificate/:id` | ✅ Live |
| ShopPage | `/shop` | ✅ Live |
| PaymentSuccess | `/payment-success` | ✅ Live |
| Admin | `/admin` | ✅ Live |
| Profile | `/profile` | ✅ Live |

## Dev Commands

```bash
cd "H:\the hyper vibe coding hub\frontend"

npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # ESLint check
npm run test:e2e  # Playwright E2E tests

# Supabase local dev
supabase start
supabase functions serve --env-file .env.local
```

## Tailwind Design Tokens (Course)

```
Primary:   violet-600 (#7c3aed)
Secondary: cyan-500 (#06b6d4)
Success:   green-500
Warning:   amber-500
BG:        zinc-950 (dark mode base)
Surface:   zinc-900
Border:    zinc-800
Text:      zinc-100 (primary), zinc-400 (muted)
```

## courses Table Schema (LIVE — never guess this)

```
id           text (PK)
title        text
slug         text (UNIQUE)
price_pence  integer (GBP pence — £49 = 4900)
currency     text (default 'gbp')
is_active    boolean
```

## E2E Test Commands

```bash
cd frontend
npx playwright test                    # all tests
npx playwright test tests/auth.spec.ts # auth only
npx playwright test --ui               # visual mode
```

## Apps/web Archive

`apps/web/` is ARCHIVED. Never touch it. Never migrate it.
Per sprint plan: archive to separate branch in Week 2.
CLAUDE.md says: "Never migrate apps/web — it's dead."
