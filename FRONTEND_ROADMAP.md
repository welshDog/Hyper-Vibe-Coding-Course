# 🗺️ HyperFocus Z0ne — Frontend Roadmap
> Built by @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁀 | Neurodivergent-first. Always.
> Last updated: May 3, 2026

---

## ✅ ALREADY SHIPPED

### Phase 1 — HVZ Design System + Core Pages
- [x] HVZ Primitives — HVZBrand, HVZButton, HVZCard, HVZTag, HVZProgress, Starfield
- [x] LandingPage.tsx — dark-only, hero, stats, features, testimonials, waitlist
- [x] Pets.tsx — /pets route, inventory rail, pet detail panel, activity feed
- [x] Supabase waitlist wiring — hero + footer sources

### Phase 2 — Full Dark System
- [x] tailwind.config.js — full HFZ token bible (colours, fonts, spacing, shadows, gradients, keyframes)
- [x] Layout.tsx — bg-gray-50 GONE → bg-hfz-space-black
- [x] Navbar.tsx — glass sticky nav, HVZBrand, BROski$ pill, mobile drawer, ARIA
- [x] Footer.tsx — Welsh dark footer, ENTER · THE · Z0NE signature
- [x] Auth.tsx — deep-space login/register, Welsh microcopy, nudge errors
- [x] Input.tsx — dark by default, every form auto-darkens
- [x] Pricing.tsx — Free/Pro/Hyper dark tier cards, gold CTA
- [x] Courses.tsx — quest-card grid, XP/BROski$ payouts

### Phase 3 — Legacy Sweep
- [x] Profile, Dashboard, ShopPage, TokensPage
- [x] CourseCatalog, CourseDetail, LessonPlayer
- [x] NotFound, PaymentSuccess
- [x] Footer copy → "Built in Wales" (not Llanelli)

---

## 🔧 PHASE 4 — Make It Functional (DO THIS NEXT)

### 4A — Quick Fixes (< 1 hour each)
- [ ] Fix `/register` — `Failed to fetch` error on sign-up form
- [ ] Footer copy: change "Built in Llanelli" → "Built in Wales" everywhere
- [ ] Privacy.tsx — neurodivergent-friendly, TL;DR bullets, emoji anchors, HFZ dark card
- [ ] Terms.tsx — same format as Privacy, friendly Welsh voice
- [ ] Wire Privacy + Terms links in Footer

### 4B — BROski$ Shop Backend (GBP £)
- [ ] Supabase `shop_products` table seeded:
  - Pro Tier £25/mo
  - Hyper Tier £249/yr
  - Pet Egg £7
  - XP Booster Pack £15
  - Starter Pack £39 (bundle)
- [ ] Upgrade `/pricing` page — add "BROski$ Shop" section below tiers
- [ ] Wire ALL buttons to Stripe Checkout (`currency: 'gbp'`)
- [ ] Supabase Edge Function `shop_webhook` — Stripe success → mint BROski$
- [ ] Use existing SHOP_SYNC_SECRET
- [ ] Payment success → confetti + BROski$ balance update

### 4C — Neurodivergent Accessibility Boosters
- [ ] Font Toggle — OpenDyslexic font option in Navbar (ADHD/Dyslexia)
- [ ] Focus Mode button — collapses nav/distractions during lessons
- [ ] Adjustable text size toggle (small/medium/large)
- [ ] User-controlled animations toggle (beyond prefers-reduced-motion)
- [ ] Cookie consent banner — chunked, plain English, HFZ styled

---

## 🎮 PHASE 5 — Gamification Engine

### 5A — Quest System
- [ ] Supabase `quests` + `user_quests` tables
- [ ] Quest progress tracking — % complete → XP award
- [ ] QuestCard component — active/complete/locked states
- [ ] `/quests` page — weekly + daily quest feed
- [ ] Streak counter — visible in Navbar (Duolingo-style)
- [ ] Daily streak saver — spend BROski$ to rescue lost streak
- [ ] Streak milestone rewards — 7/30/100 day badges

### 5B — Leaderboard
- [ ] Supabase `leaderboard` view — top users by XP + BROski$
- [ ] `/leaderboard` page — tier chips (Silver/Gold/Hyper♾️), realtime via Supabase
- [ ] Weekly reset + all-time rankings
- [ ] Welsh top-10 regional filter

### 5C — BROski$Pets Evolution
- [ ] Pet XP gain from quest completions
- [ ] Evolution trigger UI — animation + level burst
- [ ] Rarity upgrade flow — Rarity Upgrade Token mechanic
- [ ] Pet NFT mint on evolution (Sepolia testnet first)
- [ ] `/pets` real Supabase data — replace seeded mock pets

---

## 🤖 PHASE 6 — AI Features

### 6A — Spider AI Mentor
- [ ] Floating Spider AI chat widget on `/courses` + `/lesson` pages
- [ ] Context-aware — knows which module/lesson user is on
- [ ] ADHD mode — short answers, bullet points, emoji anchors
- [ ] Wire to HyperAgent-SDK + HyperCode-V2.4 LLM router
- [ ] Idle nudge — "Hey bro, still with me? 👀" after 5 mins

### 6B — NFT Certificates
- [ ] Auto-mint Supabase Edge Function on course completion
- [ ] Certificate design — HFZ branded, Welsh dragon watermark
- [ ] Pinata IPFS storage (PINATA_JWT ready)
- [ ] Sepolia testnet → mainnet path
- [ ] `/profile` — show earned certificates with mint date

---

## 💎 PHASE 7 — Premium Shop Expansion

### Full Product Catalogue (GBP £)
- [ ] Welsh Dragon Pet Skin — £15
- [ ] Custom Discord Role — £25
- [ ] Priority Support Token — £49
- [ ] Quest Skip Token x5 — £35
- [ ] Founder Badge — £99 (limited 100 supply)
- [ ] Welsh Flag Profile Frame — £12
- [ ] HyperFocus Z0ne OG — £199 (lifetime + custom pet + NFT)
- [ ] Pet XP Candy x10 — £22
- [ ] Rarity Upgrade Token — £45
- [ ] Pet Collector Bundle — £89 (10 Eggs + XP Candy x10)
- [ ] Hyper Bundle — £349 (Hyper 1yr + Founder + Dragon Skin)

---

## 🌐 PHASE 8 — Community + Social

### 8A — Community Features
- [ ] Public learner profiles — XP, pets, badges visible
- [ ] Discord integration — auto-role on tier upgrade
- [ ] Referral system — earn BROski$ for invites
- [ ] Weekly community challenges — BROski$ prize pool

### 8B — Course Instructor Tools
- [ ] Instructor profiles page — dark HFZ card layout
- [ ] Course authoring dashboard (Hyper tier only)
- [ ] Module analytics — completion rates, avg XP earned

---

## 📐 DESIGN RULES (never break these)

```
✅ Dark-only — no light mode fallbacks ever
✅ No raw hex — tokens only (Tailwind classes or var(--color-*))
✅ Gold = BROski$/XP/Hyper tier only
✅ Red = danger only
✅ 44px min touch targets everywhere
✅ ARIA on every interactive element
✅ prefers-reduced-motion honored globally
✅ Sentence case CTAs (except proper nouns)
✅ Nudge-style errors ("Hmm, let's try that again 🔄")
✅ Neurodivergent-first at the core. Always.
✅ Built in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁀
```

---

## 🎯 RECOMMENDED NEXT SESSION ORDER

```
1. Phase 4A — Quick Fixes (register fix, footer, privacy, terms)
2. Phase 4B — BROski$ Shop Backend (Stripe GBP)
3. Phase 4C — Accessibility boosters (font toggle, focus mode)
4. Phase 5A — Quest System
5. Phase 5B — Leaderboard (real data)
6. Phase 5C — Pets evolution (real Supabase data)
7. Phase 6A — Spider AI mentor widget
8. Phase 6B — NFT certificates
9. Phase 7 — Full shop catalogue
10. Phase 8 — Community features
```

---

> 🐶 "Built for brains that build differently."
> 🏴󠁧󠁢󠁷󠁬󠁳󠁀 ENTER · THE · Z0NE
