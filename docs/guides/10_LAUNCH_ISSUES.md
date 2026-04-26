# 🚀 Launch Roadmap (Current)

This file defines the GitHub Issues required to execute the launch plan.
Copy and paste these blocks into new GitHub Issues.

---

## Issue 1: [Milestone A] Stripe Checkout + Webhook Fulfillment (E2E)
**Labels**: `launch`, `marketing`, `p0`
**Assignee**: @me
**Due**: 2026-03-15

### Description
Ensure the Stripe purchase flow works end-to-end: user starts checkout → Stripe payment succeeds → webhook is processed → Supabase grants entitlements (enrollment/tokens).

### Tasks
- [ ] Confirm checkout creation endpoint is reachable from the frontend (`VITE_HYPERCODE_API_URL`)
- [ ] Confirm Stripe webhook is configured to call Supabase Edge Function (`supabase/functions/stripe-webhook/`)
- [ ] Perform a test purchase in Stripe (test mode)
- [ ] Verify webhook processing creates the expected DB records (enrollment/tokens)
- [ ] Verify the buyer can access the purchased course immediately after redirect

### Acceptance Criteria
- [ ] A test user can complete checkout and is granted the correct entitlements in Supabase.
- [ ] The purchase flow is idempotent (replayed webhook events do not double-grant).

---

## Issue 2: [Milestone B] Landing Page Conversion-Ready
**Labels**: `marketing`, `frontend`, `p0`
**Assignee**: @me
**Due**: 2026-03-14

### Description
Polish the landing page in `frontend/src/pages/LandingPage.tsx` to be ready for real traffic.

### Tasks
- [ ] Replace all `#` placeholder links with real URLs:
  - [ ] "Start Course 1" -> pricing / checkout entry
  - [ ] "Join Discord" -> Discord Invite URL
- [ ] Add "Trust" section (money back guarantee / outcome promise)
- [ ] Verify mobile responsiveness (check on phone)
- [ ] Fix any broken images or layout shifts

### Acceptance Criteria
- [ ] Every button leads to a real destination.
- [ ] No dead links.
- [ ] Looks good on mobile.

---

## Issue 3: [Milestone C] Instrumentation & Analytics
**Labels**: `infra`, `marketing`, `p1`
**Assignee**: @me
**Due**: 2026-03-15

### Description
Add privacy-friendly analytics to track conversion funnel.

### Tasks
- [ ] Sign up for Plausible (or similar)
- [ ] Add tracking script to the frontend app shell (Vite/React)
- [ ] Add custom event tracking to buttons:
  - [ ] `class="btn-primary"` -> `data-event="checkout_click"`
  - [ ] `class="btn-secondary"` -> `data-event="discord_click"`
- [ ] Verify events appear in dashboard

### Acceptance Criteria
- [ ] I can see "Realtime Visitors" in the dashboard.
- [ ] Clicking "Buy" registers a custom event.

---

## Issue 4: [Milestone D] Docs + Showcase Pack
**Labels**: `docs`, `p1`
**Assignee**: @me
**Due**: 2026-03-15

### Description
Ensure documentation is self-serve for new students.

### Tasks
- [ ] Create `docs/guides/START_HERE.md` (The "Day 1" guide)
- [ ] Update `docs/guides/INDEX.md` to point to Start Here
- [ ] Verify `SHOWCASE.md` is accurate
- [ ] Check `docs/ARCHITECTURE.md` reflects the current platform architecture

### Acceptance Criteria
- [ ] A stranger can read `START_HERE.md` and know exactly what to do next.

---

## Issue 5: [Phase 1] Soft Launch (Beta)
**Labels**: `launch`, `marketing`, `p1`
**Assignee**: @me
**Due**: 2026-03-22

### Description
Execute soft launch to small group to validate flows.

### Tasks
- [ ] Recruit 10-25 Beta testers (Friends/Discord)
- [ ] Send personal invites
- [ ] Hold "Office Hours" / Onboarding call
- [ ] Collect feedback via Typeform/Google Form

### Acceptance Criteria
- [ ] >50% of beta users start Week 1 content.
- [ ] Zero critical bugs reported.

---

## Issue 6: [Phase 2] Public Launch
**Labels**: `launch`, `marketing`, `p0`
**Assignee**: @me
**Due**: 2026-03-29

### Description
Go live to the world.

### Tasks
- [ ] **Launch Day Runbook**:
  - [ ] Check CI is Green
  - [ ] Check Checkout works
  - [ ] Post to Socials (X, LinkedIn, Reddit)
  - [ ] Email List blast
- [ ] Monitor Analytics for 24h
- [ ] Triage support emails

### Acceptance Criteria
- [ ] Public traffic hitting site.
- [ ] First public sale/signup recorded.

---

## Issue 7: [Phase 3] Iteration & Community
**Labels**: `community`, `growth`
**Assignee**: @me
**Due**: 2026-04-12

### Description
Stabilize and grow after launch.

### Tasks
- [ ] Weekly metric review (Monday)
- [ ] Ship 1 conversion improvement
- [ ] Ship 1 onboarding improvement
- [ ] Establish weekly community ritual (e.g., "Win Wednesday")

### Acceptance Criteria
- [ ] Conversion rate improves week-over-week.
- [ ] Active community engagement in Discord.
