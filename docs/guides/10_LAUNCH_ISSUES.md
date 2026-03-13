# 🚀 Launch Roadmap: Option A (Static + External)

This file defines the GitHub Issues required to execute the launch plan.
Copy and paste these blocks into new GitHub Issues.

---

## Issue 1: [Milestone A] Checkout + Delivery E2E
**Labels**: `launch`, `marketing`, `p0`
**Assignee**: @me
**Due**: 2026-03-15

### Description
Configure Gumroad (or equivalent) for "Course 1" and ensure the purchase flow works perfectly from landing page to content delivery.

### Tasks
- [ ] Create "Course 1" product in Gumroad (Price: Free/Low)
- [ ] Create "Thank You" page content linking to `docs/guides/START_HERE.md`
- [ ] Configure automated email receipt with:
  - [ ] Link to Course Index
  - [ ] Link to Discord Invite
  - [ ] Support contact info
- [ ] Perform test purchase (use 100% discount code)
- [ ] Verify email arrives within 5 mins

### Acceptance Criteria
- [ ] I can buy the course, get the email, click the link, and land on the Start Guide.
- [ ] Discord invite link is valid.

---

## Issue 2: [Milestone B] Landing Page Conversion-Ready
**Labels**: `marketing`, `frontend`, `p0`
**Assignee**: @me
**Due**: 2026-03-14

### Description
Polish the `frontend/public/index.html` to be ready for real traffic.

### Tasks
- [ ] Replace all `#` placeholder links with real URLs:
  - [ ] "Start Course 1" -> Gumroad Checkout URL
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
- [ ] Add tracking script to `frontend/public/index.html` `<head>`
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
- [ ] Check `docs/ARCHITECTURE.md` reflects Option A

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
