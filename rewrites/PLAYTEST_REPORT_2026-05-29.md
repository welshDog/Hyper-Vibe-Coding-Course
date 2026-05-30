# 🧪 PLAYTEST REPORT — Hyper Vibe Z0ne (Vercel)
> Date: 2026-05-29  
> Target: https://hyper-vibe-coding-course.vercel.app  
> Tester: automated walkthrough + spot checks

---

## ✅ Executive Summary

### What’s green
- Authenticated pages render and core loops work after hydration:
  - Dashboard loads and shows token balance + referral widget
  - Pets page loads and shows minted pets + evolution path
  - Shop page loads and shows items + purchase confirmation modal
- Pricing buttons successfully redirect to Stripe Payment Links (CTA → buy.stripe.com)

### What’s not green (highest impact)
- Multiple routes appear “empty” or partially rendered until hydration finishes; some look empty even after hydration:
  - `/quests` shows only the page title with no quest list surfaced
  - `/leaderboard` shows title/intro but no entries surfaced
- Course deep links don’t show unique course detail content:
  - `/courses/turn-on-your-ai-brain` still looks like the course list page (no dedicated module page content surfaced)

---

## 🌍 Environment & Session
- Browser: Chromium automation
- Session: logged in as an existing user (nav shows “Sign out” and user name on Dashboard)
- Notes: several pages initially appeared logged-out or “blank” then resolved after a short wait (client hydration/data fetch)

---

## 🧭 Navigation & Core Flows

### Home (`/`)
- Loads and renders landing content.
- Observed a brief “logged out header” state (shows “Sign in”) before auth appears in other routes.

### Pricing (`/pricing`)
- One-time tab:
  - “Get Starter 🌱” redirects to Stripe hosted checkout link (Payment Link).
- Monthly tab:
  - “Get Builder 🔥” redirects to Stripe hosted subscription checkout (“Pay and subscribe”).

### Courses (`/courses`)
- Course list headings render after hydration.
- “Start quest →” navigates to a course slug URL, but the destination page does not show distinct course detail content.

### Course detail (`/courses/turn-on-your-ai-brain`)
- URL changes correctly.
- Page content does not appear to change to a dedicated course detail view.

### Dashboard (`/dashboard`)
- Renders:
  - Welcome header with user name
  - Token balance card
  - Referral section
  - “My learning” section (currently prompts to pick a course)
- “Copy referral link” click throws a clipboard error in automation context (see console logs).

### Pets (`/pets`)
- Renders:
  - “Your pets (2)” list with minted pet cards
  - Evolution path with XP thresholds
  - Top evolvers panel
- Mint buttons present for multiple pet species.

### Shop (`/shop`)
- Renders a large catalog of items (some disabled, some enabled).
- Clicking “Buy Agent Sandbox Access” opens a confirmation modal:
  - “Cancel”
  - “Spend 🪙 270”
- Cancel closes the modal successfully.

### Quests (`/quests`)
- Only the “Quests” heading surfaced during the playtest.
- No quest list/cards surfaced in the accessible snapshot.

### Leaderboard (`/leaderboard`)
- Shows the “Leaderboard” heading and intro text.
- No ranking table/cards surfaced in the accessible snapshot.

---

## 🧨 Console & Network Findings (Actionable)

### Console messages (notable)
- Clipboard error on referral copy:
  - `NotAllowedError: Failed to execute 'writeText' on 'Clipboard': Document is not focused.`
- Referral fetch aborted:
  - `net::ERR_ABORTED .../rest/v1/referrals?...`
- Reown/Web3Modal config fetch warning (403):
  - `[Reown Config] Failed to fetch remote project configuration... HTTP status code: 403`
- Vercel Speed Insights vitals request aborted:
  - `net::ERR_ABORTED .../_vercel/speed-insights/vitals`

### Network requests (notable)
- `HEAD https://hyper-vibe-coding-course.vercel.app/pets` failed `net::ERR_ABORTED`
- `HEAD .../rest/v1/referrals?...` failed `net::ERR_ABORTED`

---

## 🔴 P0 Issues (Fix Next)
- Course deep-link pages don’t show unique module pages (slug routes appear to fall back to list view).
- Quests page doesn’t surface quest content.
- Leaderboard page doesn’t surface ranking content.

---

## 🟡 P1 Issues (Polish / Stability)
- Hydration “flip” (logged-out header flashes before auth state resolves) on some routes.
- Referral “Copy link” should fail gracefully (catch clipboard errors and show manual copy UI).
- Investigate aborted `/referrals` request (RLS policy, permissions, or client request method).
- Web3Modal/Reown 403 noise (if expected, suppress; if not expected, fix config).

---

## ✅ Recommendations (Next Actions)

### Immediate
- Confirm the production deploy is using the intended Stripe Payment Link URLs (TEST vs LIVE).
- Fix course slug routing so `/courses/:slug` renders a dedicated module page.
- Populate or restore quests + leaderboard data/components (or hide routes until ready).

### Nice-to-have
- Improve auth loading UX (skeleton header / “loading account…” state instead of flashing sign-in).
- Make referral copy robust across browsers (fallback to displaying the referral URL in a textbox with “select all”).

