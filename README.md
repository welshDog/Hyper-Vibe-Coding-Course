# 🚀 Hyper Vibe Coding Course Platform

> Built the Hyper Way. For neurodivergent coders. By a neurodivergent coder.

---

## ⚡ Quick Start (Copy-Paste These)

```bash
git clone https://github.com/welshDog/Hyper-Vibe-Coding-Course.git
cd Hyper-Vibe-Coding-Course
cp .env.example .env
docker-compose up
```

Then open:
- 🌐 Frontend → http://localhost:3000
- 🔌 API → http://localhost:4000
- 🗄️ Database GUI → http://localhost:5555

**Demo Login:** `demo@example.com` / `password`

---

## 🧠 What Is This?

A full-stack course platform with:
- ✅ JWT Auth (login, register, protected routes)
- ✅ Course browsing → enroll → track progress → complete
- ✅ Gamification (XP, levels, streaks, badges, BROski$ coins)
- ✅ Accessibility controls (dyslexia font, reduced motion, high contrast)
- ✅ One-command Docker setup
- ✅ Vitest + Playwright testing

---

## 📁 File Structure

```
hyper-vibe-coding-course/
├── apps/
│   ├── web/                    # React frontend
│   │   └── src/
│   │       ├── components/     # UI components
│   │       ├── routes/         # Page components
│   │       ├── store/          # Zustand state
│   │       └── main.tsx        # Entry point
│   └── api/                    # Node.js backend
│       └── src/
│           ├── routes/         # Express routes
│           ├── controllers/    # Business logic
│           └── index.ts        # Server entry
├── packages/
│   └── database/
│       └── prisma/schema.prisma # DB schema
├── tests/e2e/                  # Playwright tests
├── docs/                       # Architecture docs
├── docker-compose.yml
└── .env.example
```

---

## 🏆 Gamification Levels

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Vibe Newbie | 0 |
| 2 | Prompt Padawan | 100 |
| 3 | Code Curious | 300 |
| 4 | Builder BRO | 600 |
| 5 | Vibe Master | 1000 |
| 6 | Hyper Coder | 1500 |
| 7 | AI Whisperer | 2200 |
| 8 | Vibe Legend | 3000 |

---

## 🎨 Customise YOUR Brand

Change these files to make it yours:
1. `tailwind.config.js` → Brand colours
2. `apps/api/src/seed.ts` → Course content + pricing
3. `apps/web/src/store/gamificationStore.ts` → XP curve
4. `apps/api/src/controllers/authController.ts` → Email copy

---

## 🧪 Tests

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests (opens browser)
npm run lint          # ESLint
npm run typecheck     # TypeScript check
```

---

*Code is temporary. Vibes are forever.* 🌈
