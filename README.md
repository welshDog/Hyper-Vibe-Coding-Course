# 🎓 Hyper-Vibe-Coding-Course
### Learn to Vibe Code. The Hyper Way. 🚀

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://hyper-vibe-coding-course.vercel.app)
[![Made by WelshDog](https://img.shields.io/badge/Made_by-WelshDog_🦅-orange)](https://github.com/welshDog)

> **"Natural language → AI code → shipped product. No gatekeeping. No fluff."**

A full-stack gamified coding course platform built for neurodivergent learners.
Stripe-powered token packs. Supabase backend. HyperCode AI engine. Vercel frontend. 🔥

---

## 🌐 Live Platform
[https://hyper-vibe-coding-course.vercel.app](https://hyper-vibe-coding-course.vercel.app)

---

## 🔌 Powered By

| Service | Purpose |
|---------|----------|
| ⚡ [Vercel](https://vercel.com) | Next.js frontend hosting |
| 🗄️ [Supabase](https://supabase.com) | Database + Auth + Edge Functions |
| 💳 [Stripe](https://stripe.com) | Token pack payments |
| 🧠 [HyperCode V2.4](https://github.com/welshDog/HyperCode-V2.4) | AI backend engine |
| 🤖 [HyperAgent-SDK](https://github.com/welshDog/HyperAgent-SDK) | AI tutor agents |

---

## 🎮 Platform Features

- ✅ 6 courses with 11+ lessons seeded
- ✅ Gamified XP + BROski token economy
- ✅ Stripe-powered Starter / Builder / Hyper token packs
- ✅ Profile + shop pages
- ✅ Video player with lesson tracker
- ✅ Auth with password validation

---

## ⚡ Local Setup

```bash
git clone https://github.com/welshDog/Hyper-Vibe-Coding-Course
cd Hyper-Vibe-Coding-Course
cp .env.local.example .env.local
npm install
npm run dev
```

### Required `.env.local` Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
HYPERCODE_V24_URL=https://hypercode-v24-production.up.railway.app
```

---

## 🏗️ Full Stack Architecture

```
User visits → Vercel (Next.js)
↓ auth
Supabase (Auth + DB)
↓ payment
Stripe → Supabase Webhook → DB INSERT
↓ triggers
HyperCode V2.4 → Token sync + Access provisioned ✅
```

---

## 📚 Courses Available

| # | Course | Level |
|---|--------|---------|
| 1 | 🌱 Your First Vibe | Beginner |
| 2 | 🎤 Prompt Like a Pro | Beginner |
| 3 | 🏗️ Build Your First App | Beginner → Mid |
| 4 | 🧠 Full Stack Vibe | Intermediate |
| 5 | 🔥 HyperCode The Hyper Way | Advanced |
| 6 | 🚀 Ship & Scale | Hyper-Pro |

---

## 🛡️ License
[AGPL-3.0](LICENSE) — Open source forever. Built with ❤️ in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
