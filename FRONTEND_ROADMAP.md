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

---

## 🔧 PHASE 4 — Make It Functional (DO THIS NEXT)

### 4A — Quick Fixes (< 1 hour each)
- [ ] Fix `/register` — `Failed to fetch` error on sign-up form
- [ ] Footer copy: change "Built in Llanelli" → "Built in Wales" everywhere
- [ ] Privacy.tsx — neurodivergent-friendly, TL;DR bullets, emoji anchors, HFZ dark card
- [ ] Terms.tsx — same format as Privacy, friendly Welsh voice
- [ ] Wire Privacy + Terms links in Footer
- [ ] Cookie consent banner — chunked, plain English, HFZ dark styled

### 4B — BROski$ Shop Backend (GBP £)
- [ ] Supabase `shop_products` table seeded:
  - Pro Tier £25/mo
  - Hyper Tier £249/yr
  - Pet Egg £7
  - XP Booster Pack £15
  - Starter Pack £39 (bundle)
- [ ] Upgrade `/pricing` page — add BROski$ Shop section below tiers
- [ ] Wire ALL buttons to Stripe Checkout (`currency: 'gbp'`)
- [ ] Supabase Edge Function `shop_webhook` — Stripe success → mint BROski$
- [ ] Use existing SHOP_SYNC_SECRET
- [ ] **Coin Drop animation** on every BROski$ award (mandatory per design bible)
- [ ] Payment success → confetti + balance update

### 4C — Neurodivergent Accessibility Boosters
- [ ] **Font Toggle** — OpenDyslexic switch in Navbar
- [ ] **Focus Mode button** — collapses nav/distractions during lessons
- [ ] **Text size toggle** — small (16px) / medium (18px) / large (20px)
- [ ] **Animation toggle** — user-controlled on/off (beyond prefers-reduced-motion)
- [ ] **Dark + Darker mode** — standard `#0A0E1A` and ultra-dark `#020408` for night owls
- [ ] **WCAG AA contrast audit** — run across all pages before launch

---

## 🎮 PHASE 5 — Gamification Engine

### 5A — Quest System
- [ ] Supabase `quests` + `user_quests` tables
- [ ] Quest progress tracking — % complete → XP award
- [ ] QuestCard component — active/complete/locked states
- [ ] `/quests` page — weekly + daily quest feed
- [ ] **Streak counter** in Navbar at all times 🔥
- [ ] Daily streak saver — spend BROski$ to rescue lost streak
- [ ] Streak milestone rewards — 7/30/100 day badges + Level-Up Burst animation
- [ ] Always show next step — no dead-ends in quest flow ever

### 5B — Leaderboard (real data)
- [ ] Supabase `leaderboard` view — top users by XP + BROski$
- [ ] `/leaderboard` page — Silver/Gold/Hyper♾️ tier chips, realtime
- [ ] Weekly reset + all-time rankings
- [ ] Welsh top-10 regional filter 🏴󠁧󠁢󠁷󠁬󠁳󠁀
- [ ] Sonar pulse loader on fetch (replaces all spinners sitewide)

### 5C — BROski$Pets Evolution (real Supabase data)
- [ ] Pull real Supabase pet data — replace mock seeded pets
- [ ] Pet XP gain from quest completions
- [ ] **Coin Drop animation** on every BROski$ award (per design bible — no exceptions)
- [ ] Evolution trigger UI — Level-Up Burst + level badge update
- [ ] Rarity upgrade flow — Rarity Upgrade Token mechanic
- [ ] **3D Card Tilt** on pet cards (perspective 800px, 4deg rotate hover)
- [ ] **Cursor sparkle trail** on `/pets` page ONLY (6-8 particles, brand colours, 600ms fade)
- [ ] Pet NFT mint on evolution (Sepolia testnet first)
- [ ] "Earn to unlock" silhouettes — deep violet + violet `?` (NOT grey)
- [ ] Holographic foil on Legendary cards ONLY (overuse kills the magic)

### 5D — Dashboard Upgrade
- [ ] Left sidebar: 240px fixed, collapses to 64px icon-only
- [ ] Active route = violet glow indicator
- [ ] Streak + XP + BROski$ balance always in header
- [ ] liquidFill animation on XP progress bar load

---

## 🤖 PHASE 6 — AI Features

### 6A — Spider AI Mentor Widget
- [ ] Floating Spider chat widget on `/courses` + `/lesson` pages
- [ ] Context-aware — knows which module/lesson user is on
- [ ] ADHD mode — short answers, bullets, emoji anchors
- [ ] Wire to HyperAgent-SDK + HyperCode-V2.4 LLM router
- [ ] **Idle nudge** — "Hey bro, still with me? 👀" after 5 mins
- [ ] Sonar pulse loader while AI responds
- [ ] **Adaptive difficulty** — more whitespace + larger text when focus score dips

### 6B — NFT Certificates
- [ ] Auto-mint Edge Function on course completion
- [ ] Certificate design — HFZ branded, Welsh dragon watermark
- [ ] Pinata IPFS storage (PINATA_JWT already configured)
- [ ] Sepolia testnet → mainnet path
- [ ] `/profile` — certificates with mint date + holographic shimmer
- [ ] Level-Up Burst animation on mint

---

## 🏠 PHASE 7 — Lesson Player Polish
- [ ] Lesson background: `#0D1424` (slightly lighter — reduces eye strain per design bible)
- [ ] Body text: 18px Inter, line-height 1.8
- [ ] Code blocks: JetBrains Mono, neon token colours, full-width
- [ ] No sidebar during active lesson — auto full-focus mode
- [ ] Celebrate correct answers BEFORE anything else — always
- [ ] XP liquidFill animation on lesson complete
- [ ] Next lesson CTA always visible — no dead-ends

---

## 💎 PHASE 8 — Premium Shop Expansion (GBP £)
- [ ] Welsh Dragon Pet Skin — £15 🐉
- [ ] Custom Discord Role — £25
- [ ] Priority Support Token — £49
- [ ] Quest Skip Token x5 — £35
- [ ] **Founder Badge — £99** ⚠️ Limited 100 supply — LAUNCH THIS EARLY
- [ ] Welsh Flag Profile Frame — £12
- [ ] HyperFocus Z0ne OG — £199 (Lifetime + custom pet + NFT)
- [ ] Daily Streak Saver — £8
- [ ] Pet XP Candy x10 — £22
- [ ] Rarity Upgrade Token — £45
- [ ] Pet Collector Bundle — £89
- [ ] Hyper Bundle — £349

---

## 🏗️ PHASE 9 — Design System Infrastructure

### Component Storybook
- [ ] `/design-system` route — every HVZ component, all states, live props
- [ ] Figma tokens → JSON → tailwind.config.js auto-sync pipeline

### Brand Assets (need creating + committing to `/brand/`)
- [ ] `logo-primary.svg` — full logo + wordmark
- [ ] `logo-mark.svg` — circle mark only (app icon + favicon)
- [ ] `logo-hyper-vibe.svg`, `logo-hypercore.svg`, `logo-broski-pets.svg` — sub-brands
- [ ] `palette.css` — all CSS custom properties exported
- [ ] `effects.css` — all animation keyframes exported
- [ ] **Custom HFZ icon set** — Phosphor-based: brain, lightning, circuit, coin, portal, paw

### BROski$Pets 3D (future)
- [ ] WebGL / CSS 3D card flip — full holographic back-of-card design
- [ ] Legendary tier: `hue-rotate` full rainbow (not just gradient)

---

## 🌐 PHASE 10 — Community + Social
- [ ] Public learner profiles — XP, pets, badges visible
- [ ] Discord integration — auto-role on tier upgrade
- [ ] Referral system — earn BROski$ for invites
- [ ] Weekly community challenges — BROski$ prize pool
- [ ] **Scrolling social proof marquee** on Landing (not static blocks)
- [ ] Instructor profiles page — dark HFZ card layout
- [ ] Course authoring dashboard (Hyper tier only)
- [ ] Module analytics — completion rates, avg XP per lesson

---

## 📐 SACRED DESIGN RULES (never break these)

```
✅ Dark-only — no light mode ever
✅ No raw hex — tokens only
✅ Gold = BROski$/XP/Hyper tier only
✅ Red = critical danger only (amber for warnings)
✅ Text minimum 16px — ADHD/Dyslexia non-negotiable
✅ Line-height 1.6 body, 1.8 long-form
✅ 44px min touch targets everywhere
✅ ARIA on every interactive element
✅ Always show next step — no dead-ends
✅ Always celebrate completions
✅ Max 3 lines before a visual break
✅ Max 2 glowing elements visible at once (except /pets)
✅ Glass blur ONLY for nav/modals/overlays — never cards
✅ Coin Drop animation on EVERY BROski$ award
✅ Cursor sparkle on /pets ONLY
✅ Holographic foil = Legendary tier ONLY
✅ Nudge errors only — never blame the user
✅ Neurodivergent-first. Always. 🧠
✅ Built in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁀
```

---

## 🎯 RECOMMENDED SESSION ORDER

```
1.  Phase 4A — Quick fixes (register bug, footer, privacy, terms, cookies)
2.  Phase 4B — BROski$ Shop + Stripe GBP
3.  Phase 4C — Accessibility boosters (font toggle, focus mode, dark+darker)
4.  Phase 5A — Quest System + streak counter
5.  Phase 5B — Leaderboard real data
6.  Phase 5C — Pets evolution + 3D tilt + coin drop
7.  Phase 5D — Dashboard sidebar
8.  Phase 6A — Spider AI mentor widget
9.  Phase 6B — NFT certificates
10. Phase 7  — Lesson player polish
11. Phase 8  — Full shop (Founder Badge first — limited 100!)
12. Phase 9  — Design system infrastructure + brand assets
13. Phase 10 — Community + Social
```

---

> 🐶 "Built for brains that build differently."
> 🏴󠁧󠁢󠁷󠁬󠁳󠁀 ENTER · THE · Z0NE
