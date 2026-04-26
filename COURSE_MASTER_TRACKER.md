# 🎬 HYPER VIBE CODING COURSE — MASTER PRODUCTION TRACKER
> welshDog 🐶♾️ | Updated: April 26, 2026 | Synced with WHATS_DONE.md + NOTEBOOKLM_PROMPT_PACK.md

---

## 📊 OVERALL SNAPSHOT

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| 🎓 Lesson Scripts (via NotebookLM) | 10 | 0 | 10 |
| 🎯 Promo Scripts | 5 | 5 ✅ | 0 |
| 🎙️ Videos Recorded | 15 | 0 | 15 |
| ✂️ Videos Edited | 15 | 0 | 15 |
| 🚀 Videos Published | 15 | 0 | 15 |
| 🛠️ Tech Platform (Supabase + Stripe + Auth) | - | ✅ LIVE | - |
| 💰 BROski$ Token Economy | - | ✅ LIVE | - |
| 🔧 CI / Docker / API blockers | 3 | ✅ ALL FIXED | 0 |
| 🧪 E2E Test Suite (Playwright) | 72 | ✅ 72/72 GREEN | 0 |

---

## ✅ PLATFORM STATUS (Tech side — all green!)

### Already Built & Working
- `/pricing` → Stripe checkout → `/payment-success` → enrolled ✅
- BROski$ token economy (starter=200, builder=800, hyper=2500) ✅
- 7 courses seeded in Supabase ✅
- Certificates, Quiz, Referral system ✅
- Dashboard BROski$ balance card ✅
- Supabase Edge Function `sync-tokens-to-v24` ✅
- CI fixed: Playwright runs inside `frontend/` ✅ ← April 26
- Docker: `apps/api/Dockerfile` + `package.json` created ✅ ← April 26
- Root `npm test` working ✅ ← April 26
- **Playwright E2E: 72/72 passing — chromium + firefox + webkit ✅ ← April 26**
- **`npm run lint` clean ✅ ← April 26**
- **`npx tsc --noEmit` clean ✅ ← April 26**

### What Was Fixed in E2E (April 26)
- `courses.spec.ts` — updated mocks to match `price_pence`, `is_active`, "Enroll — £xx.xx" button
- `auth.spec.ts` — register flow now matches success screen + "Go to login", HEAD requests handled
- `learning.spec.ts` — removed debug logging, stable Supabase mocks
- `landing.spec.ts` — lightweight `/rest/v1/**` mock added to silence Supabase fetch noise

### Manual Steps Still Needed (YOU do these)
- [ ] Register Supabase DB Webhook: `token_transactions` → INSERT → `sync-tokens-to-v24`
- [ ] Set `COURSE_WEBHOOK_SECRET` in V2.4 `.env` + Supabase Edge Function env vars
- [ ] Fix frontend hooks: hardcoded port 8081 → 8000
- [ ] Set `VITE_STRIPE_PAYMENT_LINK_URL` in `.env.local` + Vercel

---

## 🎯 PROMO VIDEOS — Scripts ✅ All Done

| # | Title | Length | Script | Recorded | Edited | Published |
|---|-------|--------|--------|----------|--------|-----------|
| P1 | HyperCode in 90 Seconds | 90s | ✅ | ⬜ | ⬜ | ⬜ |
| P2 | Your First Program | 2 min | ✅ | ⬜ | ⬜ | ⬜ |
| P3 | DuelCode Magic | 2.5 min | ✅ | ⬜ | ⬜ | ⬜ |
| P4 | Run Everywhere | 2 min | ✅ | ⬜ | ⬜ | ⬜ |
| P5 | Join the Crew | 2.5 min | ✅ | ⬜ | ⬜ | ⬜ |

---

## 🎓 LESSON MODULES — Scripts via NotebookLM

> **HOW TO USE:** Open notebooklm.google.com → Upload the 50-source list in:
> `docs/course/NOTEBOOKLM_MASTER_PROMPT_PACK.md`
>
> Then paste each module prompt from:
> `docs/course/NOTEBOOKLM_MASTER_PROMPT_PACK.md`

| # | Module Title | Topic | NotebookLM Prompt | Script | Recorded | Edited | Published |
|---|-------------|-------|-------------------|--------|----------|--------|-----------|
| M1 | 🌱 Your First Vibe | 32-container Docker empire + first heartbeat | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M2 | 🎤 Prompt Like a Pro | Natural language as code, ADHD brain unlock | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M3 | 🏗️ Build Your First App | Next.js + FastAPI, 3 micro-milestones | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M4 | 🧠 Full Stack Vibe | Supabase = app's memory, auth + edge | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M5 | 🔥 HyperCode The Hyper Way | Agent X swarm — superpower unlock | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M6 | 🛠️ Agent Architecture & Manifests | HyperAgent-SDK, agent passport metaphor | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M7 | 🐕 Soulful Entities: AI Pets & Memory | Redis-backed pets, memory magic moment | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M8 | 🔗 On-Chain Evolution | dNFTs, blockchain = permanent public memory | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M9 | 🛡️ Security & SRE Observability | Grafana = Mission Control at NASA | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |
| M10 | 🚀 Ship, Scale & Graduate | Stripe live + BROski Legend graduation | ✅ Ready | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 🎙️ RECORDING SETUP CHECKLIST (do once before Week 2)

- [ ] OBS Studio configured (1080p, 30fps min)
- [ ] Microphone tested (clear, no echo)
- [ ] Screen resolution set to 1920x1080
- [ ] Dyslexia-friendly font active (OpenDyslexic or Atkinson Hyperlegible)
- [ ] Browser bookmarks ready for each module demo
- [ ] Docker containers pre-pulled + healthy (29/29 confirmed)
- [ ] NotebookLM tab open with all 5 source docs loaded
- [ ] HyperCode dashboard open at localhost:3001
- [ ] Water on desk 💧 (hydrate bro!)

---

## ✂️ EDITING CHECKLIST (copy per video)

- [ ] Cut dead air / pauses > 2 seconds
- [ ] Add captions (100% mandatory — accessibility first)
- [ ] Add module title card (0–3 seconds)
- [ ] Add chapter markers matching timestamps
- [ ] Add lower-thirds for key terms
- [ ] Colour grade (vibrant, high contrast)
- [ ] Export: 1080p MP4 + SRT caption file
- [ ] Thumbnail created (BROski style 🐶)

---

## 🚀 PUBLISHING CHECKLIST (copy per video)

- [ ] Upload to course platform (Supabase-backed)
- [ ] Add to YouTube playlist "Hyper Vibe Coding Course"
- [ ] 30-second clip cut for TikTok / YouTube Shorts
- [ ] GitHub Release notes updated
- [ ] BROski$ XP reward amount set for module completion
- [ ] Discord announcement posted

---

## 📅 6-WEEK LAUNCH PLAN

| Week | Milestone | Status |
|------|-----------|--------|
| Week 1 (NOW 🔥) | Generate all 10 lesson scripts via NotebookLM | 🔥 Start TODAY |
| Week 2 | Record all 5 promo videos | ⬜ |
| Week 3 | Record Modules 1–5 | ⬜ |
| Week 4 | Record Modules 6–10 | ⬜ |
| Week 5 | Edit all 15 videos + captions | ⬜ |
| Week 6 | Publish everything — FULL COURSE LIVE 🎉 | ⬜ |

---

## 🧰 TOOLS STACK

| Tool | Purpose | Status |
|------|---------|--------|
| NotebookLM | Generate lesson scripts from your docs | ✅ Prompts ready |
| OBS Studio | Screen recording | ⬜ Set up needed |
| DaVinci Resolve / CapCut | Video editing | ⬜ Your choice |
| Supabase | Course platform + auth + DB | ✅ Live |
| Stripe | Payments | ✅ Live (test mode) |
| Vercel | Frontend hosting | ✅ Connected |
| GitHub Actions | CI (Playwright) | ✅ 33/33 green |

---

## 🥇 QUICK WIN — DO THIS FIRST (Week 1, Day 1)

1. Open [notebooklm.google.com](https://notebooklm.google.com)
2. Create new notebook → upload 5 source docs (see list above)
3. Paste **Module 1 prompt** from `NOTEBOOKLM_PROMPT_PACK.md`
4. Get script → save as `scripts/M1-your-first-vibe.md`
5. Repeat for M2–M10 (takes ~2 hours total)
6. All 10 scripts done = Week 1 ✅ = MOMENTUM UNLOCKED 🚀

---

# 🐶♾️ BROski Legend Status Loading... LET'S BUILD THIS!
