# 🌟 Hyper Vibe Coding Course: Showcase

Welcome to the Hyper Vibe Coding Course platform. This repository contains the production code for the course experience (auth, courses, lesson player, gamification, tokens), backed by Supabase and deployed on Vercel.

## 🚀 Live Demo
**Platform**: [https://hyper-vibe-coding-course.vercel.app/](https://hyper-vibe-coding-course.vercel.app/)

## 📸 Key Features

### 1. Supabase-Backed Platform
- **Auth + Database**: Supabase (Postgres + RLS)
- **Schema**: versioned migrations in `supabase/migrations/`
- **Edge Functions**: Stripe webhook handling in `supabase/functions/`

### 2. "Vibe" Design System
- **Frontend**: React + Tailwind in `frontend/`
- **UI**: small focused components + screen-level pages
- **Responsiveness**: mobile-first layouts

### 3. Automated Quality Assurance
- **E2E tests**: Playwright (`frontend/`)
- **Local lint/build**: `npm run lint`, `npm run build`

### 4. Course Content Structure
Organized for modular learning:
- `docs/course/`: Core curriculum (Proprietary).
- `docs/guides/`: Public resources (Creative Commons).
- `frontend/`: Platform UI + pages.

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Supabase (Auth + Postgres + Edge Functions)
- **Payments**: Stripe
- **Hosting**: Vercel
- **License**: AGPL-3.0 (see `LICENSE`)

## 📊 Project Status
- [x] Platform foundation (auth, courses, lesson player)
- [x] Gamification (XP/tokens/leaderboards)
- [x] Payments + webhook-based enrollment
- [ ] Continuous improvements + content expansion

---
*Built with ❤️ by the Hyper Vibe Team*
