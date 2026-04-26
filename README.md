# 🎓 Hyper-Vibe-Coding-Course
### Learn to Vibe Code. The Hyper Way. 🚀

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://hyper-vibe-coding-course.vercel.app)
[![Made by WelshDog](https://img.shields.io/badge/Made_by-WelshDog_🦅-orange)](https://github.com/welshDog)
[![Sponsor](https://img.shields.io/badge/Sponsor-❤️_WelshDog-ea4aaa?logo=github-sponsors)](https://github.com/sponsors/welshDog)
[![Part of Hyperfocus Zone](https://img.shields.io/badge/Hyperfocus_Zone-♾️_Ecosystem-purple)](https://github.com/welshDog)

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
| ⚡ [Vercel](https://vercel.com) | Frontend hosting + serverless routes |
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
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Required `frontend/.env` Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_HYPERCODE_API_URL=http://localhost:8000
VITE_STRIPE_PAYMENT_LINK_URL=
```

### Notes
- `VITE_HYPERCODE_API_URL` points at the HyperCode V2.4 backend API (Stripe checkout), not `apps/api`.
- Supabase schema changes live in `supabase/migrations/` and are applied with the Supabase CLI to the linked project.

---

## 🏗️ Full Stack Architecture

```
User visits → Vercel (Vite SPA)
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

## 🌐 Part of the Hyperfocus Zone Ecosystem

This course platform is one piece of a bigger neurodivergent-first builder ecosystem:

| Repo | What it Does |
|------|--------------|
| 🧠 [HyperCode V2.4](https://github.com/welshDog/HyperCode-V2.4) | Self-evolving AI agent swarm — the engine behind everything |
| 🤖 [HyperAgent-SDK](https://github.com/welshDog/HyperAgent-SDK) | Write agents once, deploy anywhere — the SDK powering AI tutors |
| 🎓 **This Repo** | The course platform — learn, build, ship, earn BROski$ |

> All three repos work together. Learn here → build with HyperAgent-SDK → deploy on HyperCode V2.4. ♾️

---

## 🤝 Contributing

We welcome contributions from **everyone** — especially neurodivergent developers! 🧠⚡

Whether it's fixing a typo, adding a lesson, improving the UI, or building a new feature —
every contribution counts and earns you **BROski$ XP** in the ecosystem! 🎮

- 🐛 **Bugs & ideas** → [GitHub Issues](https://github.com/welshDog/Hyper-Vibe-Coding-Course/issues)
- 💬 **Discussions** → [GitHub Discussions](https://github.com/welshDog/Hyper-Vibe-Coding-Course/discussions)
- 📖 **How to contribute** → Fork → Branch → PR → Review → Merge 🔥

```bash
# Fork the repo, then:
git checkout -b feature/your-lush-idea
git commit -m "✨ Add: your lush idea here"
git push origin feature/your-lush-idea
# Open a Pull Request 🚀
```

---

## 💰 Support the Mission

This project is **free and open source** — built by a neurodivergent developer in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 for neurodivergent creators worldwide.

If this helps you, please consider sponsoring — it keeps the lights on and the agents evolving! ⚡

[![Sponsor WelshDog](https://img.shields.io/badge/Sponsor_WelshDog-❤️-ea4aaa?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/welshDog)

Every sponsor gets:
- 🦅 **BROski Sponsor** badge in the ecosystem
- ⭐ Listed in the project Hall of Fame
- ♾️ Warm fuzzy feeling knowing you're funding neurodivergent-first tech

---

## 💬 Community & Support

| Channel | Link |
|---------|------|
| 🐦 Twitter/X | [@welshDog](https://twitter.com/welshDog) |
| 💰 GitHub Sponsors | [github.com/sponsors/welshDog](https://github.com/sponsors/welshDog) |
| 📧 Email | lyndz@hyperfocus.zone |
| 🐛 Issues | [GitHub Issues](https://github.com/welshDog/Hyper-Vibe-Coding-Course/issues) |

---

## 🛡️ License
[AGPL-3.0](LICENSE) — Open source forever. Built with ❤️ in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by [@welshDog](https://github.com/welshDog) — Lyndz Williams*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

⭐ **Star this repo if you believe neurodivergent minds deserve better tools.** ⭐

</div>
