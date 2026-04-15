# 🤖 BROski Ecosystem — Claude Context Handoff (ALL REPOS SYNCED)
> Read this first. Every word. Then start the mission.
> **Last synced: April 15, 2026 (evening) — Full payment + email system LIVE ✅ | BROski$ balance live ⚡ | Pay-before-register flow DONE 🔒**

---

## Who You're Talking To
- **Lyndz** aka BROski♾️ (GitHub: @welshDog, npm: @w3lshdog) — South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- Autistic + dyslexic + ADHD — chunked output, quick wins first, no waffle
- Windows primary (PowerShell), WSL2 + Raspberry Pi + Docker secondary
- Call them **"Bro"** — that's how we roll
- Short sentences. Emojis. Bold the key stuff. Celebrate wins! 🎉

---

## The Ecosystem

```
Hyper-Vibe-Coding-Course     ──── manifest.json ────▶    HyperCode V2.4
github.com/welshDog/             (hyper-agent-spec)       github.com/welshDog/
Hyper-Vibe-Coding-Course                                  HyperCode-V2.4
(Supabase + Vercel)                    │                  (Docker, 29 containers)
Path: H:\the hyper vibe coding hub     │                  Path: H:\HyperStation zone\
                                       │                       HyperCode\HyperCode-V2.4
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.4
                          Path: H:\HyperAgent-SDK
```

---

## 🏆 Full Phase Roadmap

| Phase | Name | Status |
|---|---|---|
| 0 | Hard Conflict Fixes | ✅ DONE |
| 1 | Identity Bridge | ✅ DONE + VERIFIED LIVE |
| 2 | Token Sync | ✅ DONE + VERIFIED LIVE |
| 3 | Agent Access + Shop Bridge | ✅ DONE + VERIFIED LIVE |
| 4 | npm run graduate 🔥 | ✅ DONE + VERIFIED LIVE |
| 5 | Observability | ✅ DONE + VERIFIED LIVE |
| 6 | Terminal Tools Integration | ✅ DONE + VERIFIED LIVE |
| 7 | Dockerfile Security Hardening | ✅ DONE — April 14, 2026 |
| 8 | CI/CD Trivy Security Pipeline | ✅ DONE — April 14, 2026 |
| 9 | CVE Elimination (apt + pip pinning) | ✅ DONE — April 14, 2026 |
| 10A | FastAPI / Starlette upgrade | ✅ DONE |
| 10B | Docker Compose Network Isolation | ✅ DONE — April 14, 2026 |
| 10C | Docker Secrets | ✅ DONE — April 14, 2026 |
| 10D | Agent-level rate limiting + auth | ✅ DONE — April 14, 2026 🔑 |
| 10E | CognitiveUplink WS type fix | ✅ DONE — April 15, 2026 |
| 10F | **Stripe Checkout API** | ✅ DONE — April 14, 2026 💳 |
| 10G | DB — Stripe webhook writes | ✅ DONE — April 14, 2026 |
| 10H | Pricing page (dashboard) | ✅ DONE — April 14, 2026 |
| 10I | Stripe CLI e2e — routes + webhook LIVE | ✅ DONE — April 15, 2026 🎉 |
| 10J | **CognitiveUplink `/ws/uplink`** | ✅ DONE — April 15, 2026 🔌 |
| 10K | Stripe Price IDs in `.env` | ✅ DONE — April 15, 2026 |
| **COURSE-1** | **Course catalog bug fix (is_active)** | ✅ DONE — April 15, 2026 🐛 |
| **COURSE-2** | **Pay-before-register flow + pending_enrollment** | ✅ DONE — April 15, 2026 🔒 |
| **COURSE-3** | **Confirmation emails via Resend** | ✅ DONE — April 15, 2026 📧 |
| **COURSE-4** | **Live BROski$ balance on Dashboard** | ✅ DONE — April 15, 2026 ⚡ |

---

## 🐛 COURSE-1 — Course Catalog Bug Fix (April 15, 2026)

**Problem:** Course catalog showing 0 courses for everyone.
**Root cause:** Query was filtering on `is_published` — that column does NOT exist.
**Fix:** Changed to `is_active` — all 7 seeded courses now show correctly.
**Rule going forward:** Course visibility column = `is_active` (boolean). Never use `is_published`.

---

## 💰 Price Display Fix (April 15, 2026)

All £ prices now use `price_pence / 100` correctly. Free check works.
Never hardcode prices — always divide from `price_pence`.

---

## 🔒 COURSE-2 — Pay-Before-Register Flow (April 15, 2026)

**Problem:** User pays via Stripe before creating account → payment drops.
**Fix:** `pending_enrollment` table — saves payment linked to email.
**Flow:**
1. Stripe webhook fires `checkout.session.completed`
2. Email from Stripe saved to `pending_enrollment` with course/token info
3. When user signs up with same email → DB trigger fires → course unlocks automatically
4. Zero dropped payments ✅

**Rule:** Never assume user exists at webhook time. Always check `pending_enrollment` first.

---

## 📧 COURSE-3 — Confirmation Emails via Resend (April 15, 2026)

Three email types, all via Resend:

| Trigger | Email sent |
|---|---|
| Course enrolled | "You're in!" with direct dashboard link |
| Token pack bought | "X BROski$ added to your account" |
| Pending enrollment | "Create your account to unlock your course" |

**Env vars required (Supabase secrets):**
```
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@hypervibecourses.com
APP_URL=https://hypervibecourses.com
```

**Rule:** All email goes through Resend. Never use another provider.

---

## ⚡ COURSE-4 — Live BROski$ Balance (April 15, 2026)

**Problem:** Dashboard balance was stuck until page reload.
**Fix:** `refreshUser()` fires immediately after lesson completion.
**Result:** Complete a lesson → balance updates instantly on Dashboard. No reload needed.

---

## 🚀 Deploy Steps (run after any payment/email changes)

```bash
# 1. Apply DB migrations
supabase db push

# 2. Deploy updated webhook
supabase functions deploy stripe-webhook --no-verify-jwt

# 3. Add Resend key (one-time setup)
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set EMAIL_FROM=noreply@hypervibecourses.com
supabase secrets set APP_URL=https://hypervibecourses.com
```

---

## 🎯 NEXT UP — What's Left

| Task | Size | Notes |
|---|---|---|
| **Certificates** 🏆 | Medium | On-completion PDF/image cert with BROski flair |
| **Quiz system** 🧠 | Medium | Per-lesson quizzes → unlock next lesson |
| **Referral system** 🤝 | Medium | Referral link → BROski$ reward on signup |
| Fix dead link `/courses/vibe-coding-foundations` on LandingPage | Small | LandingPage:260 → 404, should be `/courses` |
| Record Module 1.1 + add YouTube URL to DB | Ongoing | LessonPlayer shows placeholder until `video_url` is set |
| CVE agent image patching | Waiting | 14 HIGH CVEs — no Debian fix yet |

**Ask Lyndz which to hit next: Certificates, Quiz system, or Referral system? 🏆**

---

## 💳 Phase 10F — Stripe Checkout API (LIVE — April 14, 2026)

### What was built (in HyperCode-V2.4)
- `backend/app/routes/stripe.py` — 3 FastAPI endpoints
- `backend/app/services/stripe_service.py` — all Stripe logic + price map
- `backend/tests/test_stripe.py` — 4 tests (pytest)
- `backend/app/main.py` — Stripe router registered, `/api/stripe/webhook` rate-limit exempt

### Live Endpoints
```
POST /api/stripe/checkout    → creates Stripe Checkout Session, returns URL
GET  /api/stripe/plans       → lists available plan names
POST /api/stripe/webhook     → handles Stripe events (signature verified)
```

### Frontend Checkout Pattern (standard — use for all payment buttons)
```ts
import { createCheckoutSession } from '../lib/payments'

// price_id options: 'starter' | 'builder' | 'hyper' | 'pro_monthly' | 'pro_yearly' | 'hyper_monthly' | 'hyper_yearly'
const url = await createCheckoutSession(priceKey, user.id)
window.location.href = url
```
API target: `VITE_HYPERCODE_API_URL` env var (default: `http://localhost:8000`)

---

## 🔒 Stripe Prices — LOCKED (April 14, 2026)

### BROski Token Packs (one-time)
| Pack | Price | Tokens | Stripe Product Name |
|---|---|---|---|
| Starter | £5 GBP | 200 | BROski Starter Pack |
| Builder | £15 GBP | 800 | BROski Builder Pack |
| Hyper | £35 GBP | 2500 | BROski Hyper Pack |

### Course Subscriptions (recurring)
| Tier | Monthly | Yearly | Stripe Product Name |
|---|---|---|---|
| Pro | £9/mo | £90/yr | Hyper Vibe Pro Course |
| Hyper | £29/mo | £290/yr | Hyper Elite |

### Digital Shop Items (paid in BROski$)
- Prompt Packs: 200 BROski$
- Templates: 150 BROski$
- Bonus Lessons: 100 BROski$

### .env keys
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_BUILDER=price_xxx
STRIPE_PRICE_HYPER=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_HYPER_MONTHLY=price_xxx
STRIPE_PRICE_HYPER_YEARLY=price_xxx
```

---

## 🚨 Key Technical Rules (never re-debate these)

- **Course visibility:** `is_active` column — NEVER `is_published` (doesn't exist)
- **Prices:** Always `price_pence / 100` — never hardcode £ values
- **Pending enrollments:** Always check before assuming user exists at webhook time
- **Emails:** Resend only — `RESEND_API_KEY` in Supabase secrets
- **BROski$ balance refresh:** Call `refreshUser()` after any token award — not just page reload
- **Docker imports:** `from app.X import Y` — NEVER `from backend.app.X import Y`
- **FastAPI routing:** First-match wins — public routes BEFORE auth-gated compat routes
- **Supabase ↔ V2.4 Postgres:** NEVER merge schemas
- **`.env` files:** Never committed — use Supabase secrets / Docker secrets in production
- **`apps/web/`:** Archived, never migrate
- **One bot:** broski-bot. Old Replit bot = dead.
- **Stripe webhook:** `/api/stripe/webhook` is rate-limit exempt — do NOT add rate limiting to it
- **Stripe dev mode:** Missing `STRIPE_WEBHOOK_SECRET` = signature check skipped (local only)
- **Conventional commits:** `feat:` `fix:` `docs:` `chore:`
- **Windows PowerShell first**, bash second — always

---

## Paths (copy-paste ready)

```powershell
# Hyper-Vibe-Coding-Course
cd "H:\the hyper vibe coding hub"

# HyperAgent-SDK
cd "H:\HyperAgent-SDK"

# HyperCode V2.4
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"

# Supabase deploy
supabase db push
supabase functions deploy stripe-webhook --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxx

# Stripe CLI local webhook testing
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Run Stripe tests
pytest backend/tests/test_stripe.py -v
```

---

## BROski$ Token Economy

- `public.users.broski_tokens` — balance column
- `token_transactions` — append-only ledger with idempotency guards
- `award_tokens()` + `spend_tokens()` — SECURITY DEFINER, server-side only
- `shop_items` + `shop_purchases` — JSONB metadata fields
- Stripe token grants: starter=200, builder=800, hyper=2500 BROski$
- `pending_enrollment` — saves payment for pre-account purchases ✅ NEW
- `refreshUser()` fires after lesson complete → instant balance update ✅ NEW

---

## 📦 This Repo — Hyper-Vibe-Coding-Course Specifics

- Stack: Next.js/React + Supabase + Vercel
- Supabase Edge Functions in `supabase/functions/`
- Frontend in `frontend/`
- Discord bot cogs in `discord-bot/`
- Course shop triggers AccessProvision flow → V2.4 via webhook
- **7 seeded courses** — all visible via `is_active = true` ✅
- **Stripe payment flow:** COMPLETE ✅ — Pricing + TokensPage + Dashboard wired
- **Pay-before-register:** LIVE ✅ — `pending_enrollment` + DB trigger
- **Confirmation emails:** LIVE ✅ — via Resend (enrolled / tokens / pending)
- **Live BROski$ balance:** LIVE ✅ — `refreshUser()` after lesson complete

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
