# Hyper Vibe Coding Course — Comprehensive Project Report
> **Compiled:** 2026-04-10 | **Version:** 1.0 | **Status:** Platform Active, Phase 1 Operational

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Assets Inventory](#2-current-assets-inventory)
3. [Technical Stack Assessment](#3-technical-stack-assessment)
4. [Content Library Status](#4-content-library-status)
5. [User Base & Metrics](#5-user-base--metrics)
6. [Infrastructure Overview](#6-infrastructure-overview)
7. [Gap Analysis](#7-gap-analysis)
8. [Technical Architecture Requirements](#8-technical-architecture-requirements)
9. [LMS Specifications](#9-lms-specifications)
10. [Video Hosting Strategy](#10-video-hosting-strategy)
11. [Interactive Features Roadmap](#11-interactive-features-roadmap)
12. [Mobile Responsiveness](#12-mobile-responsiveness)
13. [Payment Gateway Integration](#13-payment-gateway-integration)
14. [Analytics Dashboard Requirements](#14-analytics-dashboard-requirements)
15. [Scalability Plan](#15-scalability-plan)
16. [Success Criteria & KPIs](#16-success-criteria--kpis)
17. [Implementation Phases](#17-implementation-phases)
18. [Team Roles & Budget](#18-team-roles--budget)
19. [Testing Protocols](#19-testing-protocols)
20. [Deployment Strategy](#20-deployment-strategy)
21. [Post-Launch Maintenance](#21-post-launch-maintenance)
22. [Risk Register](#22-risk-register)

---

## 1. Executive Summary

**Project:** Hyper Vibe Coding Course — a taste-driven e-learning platform teaching AI-assisted (vibe) coding to aspiring developers.

**Mission:** Eliminate the syntax barrier to coding. Teach students to build real apps with AI through short, high-intensity learning experiences aligned to ADHD-friendly, hyperfocus-optimised design.

**Current Maturity:** The platform has completed its Phase 0 (docs + planning) and is mid-Phase 1 (functional MVP with auth, course catalog, lesson player shell, and Supabase backend). Core infrastructure is stable. Critical features — video delivery, payments-to-enrollment pipeline, quiz system, and admin tooling — remain unbuilt.

**Immediate Priority:** Ship a working end-to-end student journey (register → enroll → watch → complete → certificate) before scaling marketing spend.

**Revenue Trajectory:**

| Milestone | Timeline | MRR Target |
|-----------|----------|-----------|
| Platform soft launch (Course 1 free) | Week 4 | $0 / list building |
| First paid cohort (Course 2) | Week 8 | $1,500 |
| Three paid courses live | Month 4 | $5,000 |
| Phase 2 upgrade trigger | Month 6–9 | $10,000 |
| Mature platform | Year 2 | $25,000+ |

---

## 2. Current Assets Inventory

### 2.1 Codebase Assets

| Asset | Location | Status | Quality |
|-------|----------|--------|---------|
| React frontend application | `frontend/` | Live on Vercel | Solid — production ready |
| Supabase schema (migrations) | `supabase/migrations/` | Applied | 3 migrations, RLS enabled |
| Playwright E2E test suite | `frontend/tests/` | Partial | 3 of 4 suites passing |
| API scaffolding (Express) | `apps/api/` | Abandoned/unused | Delete or archive |
| Second frontend (monorepo attempt) | `apps/web/` | Abandoned | Archive — do not develop |
| Seed SQL for 6 courses | `supabase/seed-courses.sql` | Ready to run | New — not yet applied |
| Pre-commit hooks (husky + lint-staged) | `frontend/.husky/` | Active | Working |
| Vercel deployment config | `frontend/.vercel/` | Configured | Deployed |
| Docker Compose | `docker-compose.yml` | Exists | Not tested against active stack |

### 2.2 Documentation Assets

| Document | Location | Completeness |
|----------|----------|-------------|
| Product Requirements Document | `docs/PRD.md` | 95% complete |
| Technical Architecture | `docs/TECHNICAL-ARCHITECTURE.md` | 60% (pre-rebuild draft) |
| Architecture (lean launch) | `docs/ARCHITECTURE.md` | Superseded — reflects old static site |
| CLAUDE.md (AI context) | `CLAUDE.md` (root) | New — complete |
| Claude Skills Guide | `Claude/CLAUDE_SKILLS_HYPER_VIBE.md` | Complete |
| Health Check + Sprint Plan | `docs/HEALTH_CHECK_AND_BUILD_RECOMMENDATIONS.md` | Current |
| Bug Tracker | `docs/BUG_TRACKER.md` | 13/15 bugs resolved |
| Gamification System | `docs/guides/GAMIFICATION.md` | Designed, not implemented |
| Marketing Assets | `docs/guides/MARKETING.md` | Ready — copy + post templates |
| Launch Plan | `docs/guides/LAUNCH_PLAN.md` | Complete |
| Email Sequences | `docs/guides/EMAIL_SEQUENCES.md` | Written, not integrated |
| Full Curriculum | `docs/course/CURRICULUM.md` | Complete (Course 1) |
| Week-by-Week Sprint | `docs/guides/07_WEEK_BY_WEEK_SPRINT.md` | Complete |
| Deployment Runbook | `docs/DEPLOYMENT-RUNBOOK.md` | Stub |
| Dev Log | `docs/DEVLOG.md` | Current |

### 2.3 Content Assets

| Content | Status | Location |
|---------|--------|----------|
| Course 1 curriculum (4 weeks, full scripts) | Written | `docs/course/CURRICULUM.md` |
| Course 4 data (Hyperfocus HTML & CSS) | TS file, not in DB | `frontend/src/lib/course4-data.ts` |
| Course 5 data (Component Chaos Lab) | TS file, not in DB | `frontend/src/lib/course5-data.ts` |
| Course 6 data (Full Stack Thing) | TS file, not in DB | `frontend/src/lib/course6-data.ts` |
| Video lessons | Not recorded | — |
| Course thumbnails | Unsplash URLs (placeholder) | `supabase/seed-courses.sql` |
| Marketing copy (Reddit, Twitter, email) | Written | `docs/guides/MARKETING.md` |
| Email sequences (10 emails) | Written | `docs/guides/EMAIL_SEQUENCES.md` |
| Badge graphics | Not created | — |

---

## 3. Technical Stack Assessment

### 3.1 Current Stack (Canonical)

```
Frontend:       React 19, Vite 8, TypeScript 5, React Router v7
Styling:        Tailwind CSS 3, CVA, tailwind-merge, clsx
State:          Zustand v5
Forms:          React Hook Form v7 + Zod v4
Backend:        Supabase (Postgres + Auth + RLS + Storage)
Payments:       Stripe (payment links — no webhook yet)
Icons:          lucide-react
UI Primitives:  Radix UI
Testing:        Playwright (E2E only)
Deployment:     Vercel (frontend), Supabase Cloud (backend)
CI/CD:          GitHub Actions (Playwright workflow)
Code Quality:   ESLint 9, Prettier, husky, lint-staged
```

### 3.2 Stack Verdict

| Layer | Assessment | Action |
|-------|-----------|--------|
| Frontend framework | Excellent — React 19 is future-proof | Keep |
| Build tool | Vite 8 is cutting-edge, fast | Keep |
| TypeScript | Strong typing in place | Add `typecheck` to build |
| Styling | Tailwind is right for this audience | Define `primary` colour token |
| State management | Zustand is appropriate scale | Keep |
| Auth | Supabase Auth — robust, handles OAuth | Keep |
| Database | Supabase Postgres + RLS — solid | Add RLS to all tables |
| Payments | Stripe payment links — MVP only | Upgrade to Stripe webhooks (Phase 2) |
| Testing | Playwright E2E — good coverage pattern | Add Vitest unit tests |
| Deployment | Vercel — correct choice | Keep |

### 3.3 Missing Stack Components

| Need | Recommended Solution | Priority |
|------|---------------------|----------|
| Video player | YouTube embed → MUX (Phase 2) | CRITICAL |
| Email delivery | Resend or ConvertKit integration | HIGH |
| Analytics | PostHog (self-serve) or Plausible | HIGH |
| Error monitoring | Sentry (free tier) | HIGH |
| Unit testing | Vitest + Testing Library | MEDIUM |
| Type generation | `supabase gen types typescript` | MEDIUM |
| Certificate PDF | Supabase Edge Function + `@react-pdf/renderer` | MEDIUM |
| Code editor (exercises) | Monaco Editor or CodeMirror | LOW/Phase 2 |

---

## 4. Content Library Status

### 4.1 Planned Course Catalogue

| # | Course Title | Level | Price | Duration | Status |
|---|-------------|-------|-------|----------|--------|
| 1 | Vibe Coding Foundations | Beginner | Free | 4 weeks / ~20h | Curriculum written, no video |
| 2 | Hyper Prompt Master | Intermediate | $29 | ~5h video | Outline only |
| 3 | MVP Sprint | Advanced | $49 | ~8h video | Outline only |
| 4 | Hyperfocus HTML & CSS Quick Wins | Beginner | $19.99 | 6h / 3 sessions | Brief written, no video |
| 5 | Component Chaos Lab | Intermediate | $39.99 | 10h / 5 sessions | Brief written, no video |
| 6 | Ship Your First Full Stack Thing | Intermediate | $49.99 | 14h / 7 sessions | Brief written, no video |

### 4.2 Course 1 — Detailed Curriculum Status

| Week | Module | Objectives | Script | Video | Quiz |
|------|--------|-----------|--------|-------|------|
| 1 | What Is Vibe Coding? | Written | Written | Not recorded | Not built |
| 1 | Your First Prompt | Written | Written | Not recorded | Not built |
| 1 | Prompt Anatomy | Written | Written | Not recorded | Not built |
| 2 | Interactive Apps | Written | Partial | Not recorded | Not built |
| 2 | Mood Tracker Build | Written | Partial | Not recorded | Not built |
| 3 | Design Systems | Written | Draft | Not recorded | Not built |
| 3 | Custom Timer Build | Written | Draft | Not recorded | Not built |
| 4 | Capstone Project | Written | Draft | Not recorded | Not built |

**Conclusion:** Course 1 has complete curriculum design but zero recorded content. Recording is the single biggest unblocked task right now.

### 4.3 Content Production Requirements

To launch Course 1:
- **8–12 video lessons** at 5–20 min each (total ~90 min of recorded content)
- **4 project briefs** (written — mostly done)
- **4 quizzes** (quiz engine must be built first)
- **1 welcome email sequence** (written — integration needed)
- **4 badge graphics** (not created)

Recommended tools: Loom (screen + face), DaVinci Resolve (free editing), Canva (badges + thumbnails).

---

## 5. User Base & Metrics

### 5.1 Current State

The platform is pre-launch. No user data exists.

| Metric | Current | Phase 1 Target (Month 1) | Phase 2 Target (Month 6) |
|--------|---------|--------------------------|--------------------------|
| Registered users | 0 | 100–200 | 2,000+ |
| Free enrollments | 0 | 50–100 | 500+ |
| Paid customers | 0 | 10–20 | 200+ |
| Email list | 0 | 200–500 | 5,000+ |
| Discord members | 0 | 30–50 | 500+ |
| Social followers | 0 | 100–300 | 5,000+ |
| MRR | $0 | $500–$1,500 | $10,000+ |

### 5.2 Target Audience Profiles

**Primary — The Stuck Beginner (60% of audience)**
- Has tried tutorials, got bored/confused, quit
- ADHD or ADHD-adjacent learning style
- Wants to build real things, not study theory
- Price sensitivity: $0–$50 per course

**Secondary — The Career Switcher (25%)**
- Working professional, limited time
- Wants portfolio projects fast
- Values AI-efficiency angle
- Price sensitivity: $50–$200 per course

**Tertiary — The Curious Pro (15%)**
- Already codes, wants to speed up with AI
- Interested in vibe/taste-driven workflow
- Price sensitivity: $50–$150 per course

### 5.3 Acquisition Channels (Planned)

| Channel | Cost | Quality | Priority |
|---------|------|---------|----------|
| Reddit (r/learnprogramming, r/webdev, r/nocode) | Free | High intent | Week 1 |
| Twitter/X organic | Free | Medium | Week 1 |
| ProductHunt launch | Free | High volume, low retention | Week 3 |
| Email list (7-day free mini-course) | Free | Highest | Week 1 |
| Discord community | Free | Highest retention | Week 1 |
| YouTube SEO | Free / time | Compounding | Month 2+ |
| Paid social ads | $500/mo | Scalable | After $5k MRR |

---

## 6. Infrastructure Overview

### 6.1 Current Production Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│                  VERCEL (CDN + Edge)                     │
│    frontend/  →  React 19 SPA (static build)            │
│    URL: [project].vercel.app                            │
└──────────────────────────┬──────────────────────────────┘
                           │ Supabase JS SDK
┌──────────────────────────▼──────────────────────────────┐
│               SUPABASE CLOUD                            │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Auth    │  │  PostgreSQL  │  │    Storage      │  │
│  │ (JWT/RLS) │  │  (5 tables)  │  │  (future: imgs) │  │
│  └───────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ Redirect
┌──────────────────────────▼──────────────────────────────┐
│               STRIPE PAYMENT LINKS                       │
│    (manual payment → no automatic enrollment)           │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Database Schema (Current)

```sql
public.users         id, email, full_name, avatar_url, role, created_at
                     RLS: users can read/update own row only

public.courses       id, title, description, price, difficulty, duration_minutes,
                     instructor_id, thumbnail_url, is_published, created_at

public.lessons       id, course_id, title, order_index, video_url, content,
                     duration_seconds, is_free

public.enrollments   id, user_id, course_id, enrolled_at, completed_at,
                     progress_percentage
                     UNIQUE(user_id, course_id)

public.progress      id, user_id, lesson_id, completed, time_spent_seconds,
                     completed_at
                     UNIQUE(user_id, lesson_id)
```

### 6.3 Missing Infrastructure Components

| Component | Purpose | Priority |
|-----------|---------|----------|
| Stripe webhooks endpoint | Auto-enroll after payment | CRITICAL |
| Supabase Edge Functions | Serverless logic (certs, webhooks) | HIGH |
| Email service (Resend/ConvertKit) | Transactional + marketing emails | HIGH |
| Error monitoring (Sentry) | Production error tracking | HIGH |
| Analytics (PostHog/Plausible) | User behaviour data | HIGH |
| RLS policies for all tables | Security hardening | HIGH |
| `supabase/seed-courses.sql` applied | Courses visible in catalog | CRITICAL — run now |

---

## 7. Gap Analysis

### 7.1 Feature Gaps

| Feature | PRD Required | Built | Gap |
|---------|-------------|-------|-----|
| Real video player | YES | NO — placeholder box | Build YouTube embed → MUX |
| Course catalog search/filter | YES | NO — shows all courses | Add difficulty filter + search |
| User profile page (`/profile`) | YES | NO — route missing | Create page + route |
| Achievements / badge system | YES | NO — designed only | Build after core flow |
| Quiz / exercise system | YES | NO | Requires new DB tables + UI |
| Certificate generation | YES | NO | Supabase Edge Function + PDF |
| Admin dashboard | YES | NO | Gate by role, full CRUD |
| Instructor content upload | YES | NO | Phase 2 |
| Stripe webhook → auto-enroll | YES | NO — manual only | CRITICAL for revenue |
| Payment success page | YES | NO — redirects to nothing | Create `/payment-success` |
| Offline downloads (premium) | YES | NO | Phase 3 |
| Note-taking in lessons | YES | NO | Phase 2 |
| Learning streaks | YES | NO | Phase 2 |
| Community (Discord integration) | Implied | External only | Phase 2 |
| Social proof / testimonials | YES | NO | Manual → Phase 1 content |
| Post-signup email confirmation msg | MINOR | NO (BUG-014) | Fix this sprint |
| Password strength validation | MINOR | NO (BUG-013) | Fix this sprint |

### 7.2 Technology Gaps

| Gap | Impact | Solution | Effort |
|-----|--------|----------|--------|
| No video hosting | Lesson player is a grey box — no learning possible | YouTube embed (quick) → MUX (Phase 2) | S |
| No Stripe webhooks | Users pay but don't get enrolled automatically | Supabase Edge Function + Stripe webhook | M |
| No email delivery | No welcome emails, no receipt, no engagement sequences | Resend (transactional) + ConvertKit (marketing) | M |
| No error monitoring | Production bugs are invisible | Sentry (5 min setup, free tier) | XS |
| No analytics | Can't measure engagement, funnel, or churn | PostHog or Plausible (1 hr setup) | XS |
| No generated DB types | Schema drift causes silent runtime bugs | `supabase gen types typescript` in CI | S |
| No unit tests | Logic bugs caught only by E2E or users | Vitest + React Testing Library | M |
| `learning.spec.ts` skipped | No E2E coverage of core learning path | Fix catch-all route interceptor | S |

### 7.3 Content Gaps

| Gap | Courses Affected | Action |
|-----|-----------------|--------|
| Zero recorded video lessons | All 6 courses | Record Course 1 (8–12 videos) first |
| No quiz content | All courses | Build quiz engine, then author questions |
| No project starter files | Courses 1–3 | Create Replit templates for each project |
| No course thumbnails (real) | All 6 | Design in Canva / hire designer |
| No instructor bio + photo | All courses | Write bio, add to course detail page |
| No testimonials | Platform-wide | Collect from beta cohort |
| No certificate templates | All courses | Design in Canva, generate via Edge Function |

### 7.4 Team Gaps

| Role | Current State | Gap |
|------|---------------|-----|
| Engineering | 1 person (solo, vibe-coded) | Need part-time QA for Phase 2 |
| Content / Curriculum | 1 person | Need video editor once content scales |
| Marketing | 1 person | Need community manager at 500+ students |
| Design | Ad-hoc with Canva/AI | Need consistent design system applied |
| Customer Support | 0 dedicated | Discord + email handled by founder now |

---

## 8. Technical Architecture Requirements

### 8.1 Phase 1 Architecture (Current + Immediate Fixes)

The lean, Supabase-direct architecture is correct for Phase 1. No changes to the core pattern — extend, don't rebuild.

```
Phase 1 Target Architecture:

Browser → Vercel (React SPA)
             ↓
         Supabase SDK
             ↓
    ┌────────────────────────────────┐
    │         SUPABASE               │
    │  Auth + Postgres + Storage     │
    │  + Edge Functions (new)        │
    └────────────────────────────────┘
             ↓                   ↓
    Stripe Webhooks          Resend Email
    (Edge Function)         (Transactional)
```

### 8.2 Phase 2 Architecture ($10k MRR trigger)

At scale, add a thin API layer for server-side logic that shouldn't run in the browser:

```
Phase 2 Architecture:

Browser → Vercel (Next.js SSR/SSG — migrate from Vite SPA)
             ↓
    ┌────────────────────────────────────────────┐
    │            SUPABASE BACKEND                 │
    │  Auth + Postgres + Storage + Realtime       │
    │  Edge Functions (payments, certs, AI)       │
    └────────────────────────────────────────────┘
             ↓               ↓              ↓
         Stripe           Resend        MUX Video
       (full API)     (email platform)  (streaming)
             ↓
        PostHog / Plausible
        (analytics + funnels)
```

### 8.3 Database Extensions Required

```sql
-- Phase 1 additions needed:
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- New tables for Phase 1:
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,  -- [{text, is_correct}]
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  selected_option INTEGER,
  is_correct BOOLEAN,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Phase 2 additions:
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  course_id UUID REFERENCES public.courses(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_code VARCHAR(20) UNIQUE NOT NULL,
  pdf_url TEXT
);
```

---

## 9. LMS Specifications

### 9.1 Core LMS Features Required

**Student-Facing:**

| Feature | Spec | Priority |
|---------|------|----------|
| Video lessons | Embed from YouTube/Vimeo/MUX, resume position | P1 |
| Progress tracking | Per-lesson completion, course % bar | Built |
| Quiz system | Multiple choice, instant feedback, explanation | P1 |
| Notes | Per-lesson text notes, exportable | P2 |
| Bookmarks | Mark lessons for return | P2 |
| Lesson search | Search within course content | P3 |
| Certificates | PDF download on 100% completion | P1 |
| Learning streaks | Daily activity tracking | P2 |
| Achievements / badges | Gamification (605 points system designed) | P1 |
| Mobile learning | Full functionality on phone | P1 |
| Offline downloads | Premium tier only | P3 |

**Instructor-Facing (Admin):**

| Feature | Spec | Priority |
|---------|------|----------|
| Course CRUD | Create/edit/delete courses and lessons | P1 |
| Video upload | Link videos from YouTube/Vimeo or upload to MUX | P1 |
| Quiz builder | Add questions + answers with explanations | P1 |
| Student analytics | Completion rates, drop-off points, time spent | P2 |
| Revenue reporting | Sales by course, subscription vs one-time | P2 |
| Bulk enrollments | Enroll users manually or by coupon | P2 |
| Content scheduling | Drip content by days-since-enrollment | P3 |

### 9.2 Gamification System Specification

Based on `docs/guides/GAMIFICATION.md` — the 605-point system is fully designed:

```
Course 1 Points Allocation:
  Week 1 (100 pts):  Quiz (15) + First Prompt Lab (25) + Landing Page (50) + Bonus (10)
  Week 2 (150 pts):  Prompt worksheet (15) + Guided project (25) + Custom app (100) + Bonus (10)
  Week 3 (155 pts):  Design worksheet (20) + Timer project (125) + Bonus (10)
  Week 4 (200 pts):  Capstone planning (25) + App build (125) + Demo (25) + Portfolio (25)
  TOTAL POSSIBLE: 605 points

Badge System:
  "First Vibe"       — Complete Week 1
  "Prompt Master"    — Score 80%+ on all quizzes
  "Shipper"          — Deploy all 3 projects
  "Hyper"            — Complete full course
  "Helper"           — Help 3 other students (Discord)
  "Streak King"      — 7-day learning streak
```

**Implementation:** Store badge awards in `public.achievements`. Display on Dashboard + shareable profile URL.

### 9.3 LMS Access Control Model

```
Free User:
  - Browse all course listings
  - Preview first lesson of any course (is_free = true)
  - Register account
  - View pricing

Enrolled Student:
  - All lessons in enrolled courses
  - Progress tracking
  - Quiz access
  - Certificate on completion
  - Discord access

Instructor (role = 'instructor'):
  - All student access
  - Course creation / editing for own courses
  - Student analytics for own courses

Admin (role = 'admin'):
  - Full platform access
  - All instructor capabilities
  - User management
  - Revenue reports
  - Content moderation
```

---

## 10. Video Hosting Strategy

### 10.1 Phase 1 — YouTube Embed (Implement Now)

Fastest path to a working lesson player. Zero cost. Works for early cohorts.

```tsx
// Implementation: replace placeholder in LessonPlayer.tsx

function VideoEmbed({ videoUrl }: { videoUrl: string }) {
  const youtubeId = extractYouTubeId(videoUrl)  // parse ?v= or youtu.be/
  const vimeoId = extractVimeoId(videoUrl)

  if (youtubeId) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }
  // Fallback for Vimeo, direct MP4, etc.
}
```

**Setup:** Upload to YouTube as unlisted. Paste URL into Supabase `lessons.video_url`. Done.

### 10.2 Phase 2 — MUX ($10k MRR trigger)

MUX provides professional-grade streaming: adaptive bitrate, analytics per-video, thumbnail generation, captions.

| Feature | YouTube (Phase 1) | MUX (Phase 2) |
|---------|-------------------|---------------|
| Cost | Free | ~$0.015/min stored + $0.003/min streamed |
| Analytics | Basic | Deep (watch time, drop-off, re-watches) |
| Branding | YouTube branding visible | Fully branded |
| Access control | By URL only | Token-protected, no downloads |
| Captions | Manual upload | Auto-generated |
| Adaptive bitrate | Yes | Yes |
| Thumbnails | YouTube auto | Automatic from timestamp |

**MUX integration:** `@mux/mux-player-react` is a drop-in replacement for the embed. Takes 2 hours to switch over.

### 10.3 Video Requirements per Course

| Course | Video Count | Approx. Total Minutes |
|--------|------------|----------------------|
| Vibe Coding Foundations | 8–12 | 90–120 min |
| Hyper Prompt Master | 15–20 | 150–200 min |
| MVP Sprint | 20–25 | 200–300 min |
| HTML & CSS Quick Wins | 10–12 | 80–100 min |
| Component Chaos Lab | 15–18 | 120–180 min |
| Full Stack Thing | 20–25 | 200–280 min |

**Production spec:** Screen recording + webcam overlay. Tools: Loom (recording) → DaVinci Resolve (free, light editing) → YouTube unlisted upload.

---

## 11. Interactive Features Roadmap

### 11.1 Phase 1 Interactive Features

| Feature | Description | Complexity | Timeline |
|---------|-------------|-----------|----------|
| Quiz system | Multiple choice per lesson, instant feedback | M | Sprint 2 |
| Progress bar (lessons) | Already built | — | Done |
| Mark complete button | Already built | — | Done |
| Achievement unlock | Badge awarded on milestone, toast notification | S | Sprint 2 |
| Course difficulty filter | Client-side filter on catalog | XS | Sprint 1 |
| Lesson bookmarks | Star a lesson, show starred list | S | Sprint 3 |

### 11.2 Phase 2 Interactive Features

| Feature | Description | Complexity |
|---------|-------------|-----------|
| Code exercises | Embedded Monaco editor with test runner | L |
| Note-taking | Per-lesson rich text notes, exportable | M |
| Live coding challenges | Timed prompts, AI-graded output | XL |
| Discussion threads | Per-lesson comments | M |
| Peer project reviews | Submit + request feedback | L |
| Learning streak tracker | Daily visit tracking, streak UI | S |
| AI coding coach | Claude API integration for in-lesson help | M |

### 11.3 AI Coding Coach Feature (Level 5 Differentiator)

This is the platform's killer feature — an embedded Claude-powered coaching assistant that helps students debug their vibe coding sessions in real time.

```
Implementation plan:
1. Supabase Edge Function: POST /functions/v1/coach
   - Accepts: student code snippet + error message + lesson context
   - Calls: Claude claude-sonnet-4-6 API with lesson system prompt
   - Returns: explanation + fix suggestion

2. LessonPlayer sidebar: "Ask the Coach" panel
   - Text input for question or paste error
   - Streaming response display
   - "Try this fix" button copies suggestion to clipboard

3. Usage metering:
   - Free tier: 5 coach interactions/week
   - Paid tier: unlimited

Cost estimate: ~$0.002 per interaction → negligible at early scale
```

---

## 12. Mobile Responsiveness

### 12.1 Current State

The app is built mobile-first with Tailwind breakpoints. Landing page and catalog are responsive. LessonPlayer's sidebar layout collapses acceptably on medium screens but is untested on mobile (<640px).

### 12.2 Mobile Requirements

| Screen | Requirement | Current | Gap |
|--------|-------------|---------|-----|
| 375px (iPhone SE) | All core flows usable | Untested | Test + fix |
| 390px (iPhone 15) | Lesson player sidebar collapses to top nav | Partial | Fix sidebar |
| 768px (iPad) | Full sidebar visible | Good | Minor tweaks |
| 1024px+ (desktop) | Full layout, sidebar + main content | Good | — |

### 12.3 Lesson Player Mobile Fix Required

The two-column layout (`flex h-screen`) must collapse on mobile:

```tsx
// LessonPlayer.tsx — mobile fix needed:
<div className="flex flex-col lg:flex-row h-screen bg-gray-100">
  {/* Sidebar: full width on mobile, fixed width on desktop */}
  <div className="lg:w-80 w-full bg-white border-b lg:border-b-0 lg:border-r ...">
    {/* On mobile: show as collapsible accordion, not always-open sidebar */}
  </div>
  {/* Main content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    ...
  </div>
</div>
```

### 12.4 PWA Considerations (Phase 2)

Adding a Service Worker manifest enables "Add to Home Screen" on mobile — increases retention by ~20% for mobile-first learners.

---

## 13. Payment Gateway Integration

### 13.1 Current State

Stripe payment links via `frontend/src/lib/payments.ts`. User clicks "Enroll", redirects to `buy.stripe.com/...`, pays, and lands on... nothing. No webhook triggers enrollment. Student must be manually enrolled.

**This is broken for any paid course.** It must be fixed before paid launch.

### 13.2 Phase 1 Fix — Stripe Webhook

```
Flow after fix:
  User → Course Detail → "Enroll" → Stripe Payment Link
  Stripe → payment.success event → Supabase Edge Function webhook
  Edge Function → INSERT into public.enrollments
  Edge Function → Send welcome email via Resend
  User → Redirected to /dashboard (new enrollment visible)
```

**Implementation steps:**

1. Create `supabase/functions/stripe-webhook/index.ts`
   - Verify Stripe webhook signature
   - On `checkout.session.completed`: insert enrollment row
   - Pass `metadata.userId` and `metadata.courseId` in Stripe link

2. Set `success_url` in Stripe Payment Link to `/payment-success?course={courseId}`

3. Create `/payment-success` page in React
   - Shows "You're enrolled!" + link to dashboard

4. Add `STRIPE_WEBHOOK_SECRET` to Supabase function secrets

### 13.3 Pricing Strategy

| Product | Price | Type | Target Conversion |
|---------|-------|------|-------------------|
| Vibe Coding Foundations | Free | Lead magnet | 100% — get on email list |
| Hyper Prompt Master | $29 | One-time | 10–15% of free users |
| MVP Sprint | $49 | One-time | 20% of Course 2 completers |
| Full Stack Bundle (courses 1–3) | $89 | Bundle | 30% vs. individual |
| HTML & CSS Quick Wins | $19.99 | One-time | Impulse buy |
| Component Chaos Lab | $39.99 | One-time | Intermediate upsell |

### 13.4 Phase 2 — Subscription Model

At $5k+ MRR, consider a subscription tier:

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 | Course 1 + lesson previews |
| Hyper | $19/mo | All current courses |
| Hyper Annual | $149/yr | All current + future courses |

Use Stripe Subscriptions + Supabase to manage `subscription_status` on user record.

---

## 14. Analytics Dashboard Requirements

### 14.1 External Analytics (Phase 1)

Minimum viable analytics stack — 2 tools, ~2 hours setup:

| Tool | Purpose | Cost | Setup |
|------|---------|------|-------|
| **Plausible** | Page views, traffic sources, conversions | $9/mo (or self-host free) | Add `<script>` tag |
| **PostHog** | Product analytics (funnels, retention, heatmaps) | Free up to 1M events/mo | Add `posthog-js` |

Key events to track with PostHog:

```js
posthog.capture('course_viewed', { course_id, course_title })
posthog.capture('enrollment_started', { course_id })
posthog.capture('payment_clicked', { course_id, price })
posthog.capture('lesson_completed', { course_id, lesson_id, lesson_index })
posthog.capture('quiz_attempted', { quiz_id, is_correct })
posthog.capture('certificate_earned', { course_id })
```

### 14.2 Internal Admin Analytics Dashboard (Phase 2)

Built-in analytics page at `/admin` using Supabase queries:

| Metric | Query | Visualisation |
|--------|-------|--------------|
| Daily new users | `users` grouped by `created_at::date` | Line chart |
| Enrollments by course | `enrollments` grouped by `course_id` | Bar chart |
| Course completion rates | `enrollments` where `progress_percentage = 100` | Funnel |
| Lesson drop-off | `progress` completed vs total per lesson | Drop-off chart |
| Revenue (Stripe) | Stripe API `/charges` grouped by date | Revenue chart |
| Quiz pass rates | `quiz_attempts` where `is_correct` | Bar chart |

### 14.3 Student-Facing Progress Analytics

On `/dashboard`:

| Metric | Implementation |
|--------|--------------|
| Total courses enrolled | COUNT enrollments |
| Total lessons completed | COUNT progress where completed = true |
| Learning streak (days) | Custom streak logic in Edge Function |
| Points earned | SUM points from achievements + completions |
| Badges earned | COUNT achievements |
| Time spent learning | SUM progress.time_spent_seconds (needs tracking) |

---

## 15. Scalability Plan

### 15.1 Supabase Tier Progression

| Stage | Users | Supabase Plan | Monthly Cost |
|-------|-------|--------------|-------------|
| Pre-launch | 0–100 | Free | $0 |
| Early growth | 100–500 | Pro | $25/mo |
| Growth | 500–5,000 | Pro | $25/mo |
| Scale | 5,000–50,000 | Pro + Compute add-on | $100–300/mo |
| Enterprise | 50,000+ | Enterprise | Custom |

### 15.2 Vercel Tier Progression

| Stage | Deployments | Vercel Plan | Cost |
|-------|-------------|-------------|------|
| Phase 1 | Low volume | Hobby (free) | $0 |
| Phase 2 | Production | Pro | $20/mo |

### 15.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|------------|
| Page load (LCP) | < 2.5s | Core Web Vitals |
| Time to interactive | < 3.5s | Lighthouse |
| API response time | < 200ms P95 | Supabase dashboard |
| Video start time | < 1s | YouTube/MUX metrics |
| Uptime | 99.9% | Vercel + Supabase SLAs |

### 15.4 Architecture Migration Triggers

| Trigger | Migration |
|---------|-----------|
| $10k MRR | Migrate from Vite SPA to Next.js (SEO + SSR) |
| 5,000+ users | Add Redis/Upstash for session caching |
| 10,000+ videos served/day | Migrate video to MUX from YouTube |
| Custom domain needed | Point `hypervibecourses.com` to Vercel |
| Admin team > 1 person | Add role-based admin access controls |

---

## 16. Success Criteria & KPIs

### 16.1 Technical Quality Benchmarks

| Benchmark | Target | How to Measure |
|-----------|--------|---------------|
| TypeScript errors | 0 | `npm run typecheck` in CI |
| E2E test pass rate | 100% (all 4 suites) | Playwright CI |
| Lighthouse Performance | > 90 | CI Lighthouse audit |
| Lighthouse Accessibility | > 95 | CI audit |
| Bundle size (JS) | < 500kb gzipped | Vite build output |
| Auth flow reliability | 100% (no stuck loading) | E2E auth suite |
| Payment → enrollment success | 99%+ | Stripe + Supabase logs |

### 16.2 Content Quality Benchmarks

| Benchmark | Target |
|-----------|--------|
| Video production quality | Screen share + webcam, clear audio (no background noise) |
| Lesson length | 5–20 min per video (max 20) |
| Quiz quality | Each lesson has 1–3 questions, with explanation |
| Course completion time | Matches stated duration ± 20% |
| Student rating | 4.5/5.0 average after first 20 completions |

### 16.3 User Engagement Targets

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Course 1 Week 1 completion | 60%+ | 70%+ | 80%+ |
| Course 1 full completion | 20%+ | 35%+ | 45%+ |
| Student satisfaction (NPS) | > 40 | > 50 | > 60 |
| Daily active learners | 10+ | 50+ | 200+ |
| Email open rate | 40%+ | 45%+ | 50%+ |
| Discord weekly active | 20+ | 100+ | 300+ |
| Session duration | > 15 min | > 20 min | > 25 min |

### 16.4 Revenue Projections

**Conservative scenario (solo creator, organic only):**

| Month | Users | Paying | Avg. Price | MRR |
|-------|-------|--------|-----------|-----|
| 1 | 150 | 15 | $29 | $435 |
| 2 | 300 | 40 | $32 | $1,280 |
| 3 | 500 | 80 | $35 | $2,800 |
| 6 | 1,200 | 220 | $39 | $8,580 |
| 9 | 2,500 | 500 | $42 | $21,000 |
| 12 | 4,000 | 850 | $45 | $38,250 |

**Optimistic scenario (ProductHunt launch + content marketing):**

| Month | Users | Paying | Avg. Price | MRR |
|-------|-------|--------|-----------|-----|
| 1 | 500 | 60 | $30 | $1,800 |
| 3 | 1,500 | 250 | $35 | $8,750 |
| 6 | 4,000 | 800 | $40 | $32,000 |
| 12 | 10,000 | 2,500 | $45 | $112,500 |

---

## 17. Implementation Phases

### Phase 0 — Foundation (COMPLETE)
Planning, documentation, repo structure, CI/CD, basic frontend scaffold.

---

### Phase 1 — MVP Launch (Current — Target: 4 weeks)

**Goal:** End-to-end student journey works. Course 1 is live and completable.

#### Sprint 1 (Week 1) — Unblock the Core Journey

| Task | Owner | Effort | Acceptance Criteria |
|------|-------|--------|-------------------|
| Seed 6 courses to Supabase | Dev | XS | Catalog shows 6 courses |
| Build YouTube video embed | Dev | S | Lessons play real video |
| Fix BUG-013 (password validation) | Dev | XS | Register shows inline error for < 8 chars |
| Fix BUG-014 (signup success msg) | Dev | XS | Success toast shown after register |
| Add difficulty filter to catalog | Dev | S | Filter buttons narrow course list |
| Sentry error monitoring | Dev | XS | Errors appear in Sentry dashboard |
| Apply Plausible analytics | Dev | XS | Page views tracked |

**Deliverable:** A student can register, browse 6 real courses, and watch a real video lesson.

#### Sprint 2 (Week 2) — Payments + Enrollment

| Task | Owner | Effort | Acceptance Criteria |
|------|-------|--------|-------------------|
| Stripe webhook Edge Function | Dev | M | Payment triggers enrollment in DB |
| `/payment-success` page | Dev | S | Clear confirmation after payment |
| User profile page + route | Dev | S | `/profile` edits name/avatar |
| Add RLS policies to all tables | Dev | M | No cross-user data leaks |
| Fix `learning.spec.ts` (BUG-011) | Dev | S | All 4 E2E suites pass |
| Add `typecheck` to CI | Dev | XS | Build fails on TS errors |

**Deliverable:** User can pay for a course and be automatically enrolled.

#### Sprint 3 (Week 3) — Gamification + Content

| Task | Owner | Effort | Acceptance Criteria |
|------|-------|--------|-------------------|
| Quiz engine (DB schema + UI) | Dev | M | 3-question quiz appears after lesson, shows result |
| Achievement / badge unlock | Dev | M | Badge appears in Dashboard on milestone |
| Record Course 1 Week 1 videos | Content | L | 4 videos uploaded as YouTube unlisted |
| Upload lessons to Supabase | Content | S | Week 1 lessons visible in lesson player |
| Certificate generation (MVP) | Dev | M | Downloadable PDF on 100% completion |
| Mobile lesson player fix | Dev | S | Lesson player usable on 375px screen |

**Deliverable:** Course 1 is completable end-to-end on desktop and mobile.

#### Sprint 4 (Week 4) — Launch Prep

| Task | Owner | Effort | Acceptance Criteria |
|------|-------|--------|-------------------|
| Record Course 1 Week 2–4 videos | Content | L | All lessons have video |
| Admin dashboard (basic) | Dev | M | Admin can publish/unpublish courses |
| Transactional emails via Resend | Dev | M | Welcome email sent on enrollment |
| Email marketing integration (ConvertKit) | Dev/Marketing | M | New users added to list |
| Landing page testimonials section | Dev/Content | S | 3 beta testimonials displayed |
| Performance audit (Lighthouse) | Dev | XS | Score > 90 |
| Full regression test | QA/Dev | M | All flows tested manually |
| Launch runbook executed | Dev | S | GitHub release created, monitoring live |

**Deliverable:** Platform is public. First cohort can fully complete Course 1.

---

### Phase 2 — Growth ($10k MRR trigger)

| Feature | Description |
|---------|-------------|
| Next.js migration | SSR for SEO, faster initial load |
| MUX video hosting | Professional video platform |
| AI coding coach | Claude API embedded in lesson player |
| Code exercise system | Monaco editor + test runner |
| Subscription billing | Stripe subscriptions, Hyper tier |
| Advanced admin analytics | Revenue, retention, drop-off charts |
| Affiliate programme | Referral tracking + payouts |
| Mobile app (PWA) | Install to home screen |
| Community platform | Discord bridge or in-platform threads |

---

### Phase 3 — Platform ($25k MRR trigger)

| Feature | Description |
|---------|-------------|
| Instructor marketplace | Third-party instructors create courses |
| Live cohort sessions | Scheduled group video calls |
| Certification partnerships | Employer-recognised credentials |
| Enterprise / team plans | B2B sales, team dashboards |
| Multilingual support | Spanish, Portuguese, French |

---

## 18. Team Roles & Budget

### 18.1 Current Team

| Role | FTE | Responsibilities |
|------|-----|-----------------|
| Founder / Solo Dev | 1.0 | Engineering, content, marketing, support |

### 18.2 Phase 1 Budget (Monthly)

| Item | Cost/mo | Notes |
|------|---------|-------|
| Vercel Hobby | $0 | Free tier, sufficient for Phase 1 |
| Supabase Free | $0 | Up to 500MB DB, 50,000 MAU |
| Stripe | $0 + 2.9%+30¢ | No monthly fee |
| ConvertKit Free | $0 | Up to 1,000 subscribers |
| Plausible | $9 | Analytics |
| Sentry Free | $0 | Error monitoring |
| Loom Pro | $12 | Video recording |
| Canva Pro | $13 | Design assets |
| Domain (amortised) | $1 | `hypervibecourses.com` ~$12/yr |
| **TOTAL** | **$35/mo** | Lean launch mode |

### 18.3 Phase 2 Budget (Monthly, at $10k MRR)

| Item | Cost/mo | Notes |
|------|---------|-------|
| Vercel Pro | $20 | Production SLA |
| Supabase Pro | $25 | Production DB |
| MUX Video | ~$100–300 | Based on watch hours |
| ConvertKit Creator | $29 | Up to 1,000 subscribers |
| PostHog Cloud | $0–50 | Based on events |
| Sentry Team | $26 | Full error tracking |
| Resend | $20 | Transactional email |
| Part-time video editor | $500–1,000 | 10hrs/mo |
| Paid social ads | $500–1,000 | Testing channels |
| **TOTAL** | **~$1,200–2,400/mo** | ~15–25% of MRR |

### 18.4 Phase 1 Hiring Priorities (If Revenue Allows)

| Priority | Role | When to Hire | Cost |
|----------|------|-------------|------|
| 1 | Part-time video editor | After 50 paid students | $300–600/mo |
| 2 | Community manager | After 200 Discord members | $500/mo |
| 3 | Part-time QA engineer | Phase 2 launch | $1,000/mo |
| 4 | Content writer | After 3 courses live | $500/mo |

---

## 19. Testing Protocols

### 19.1 Current Test Coverage

| Suite | File | Coverage | Status |
|-------|------|----------|--------|
| Landing page | `tests/landing.spec.ts` | Page renders, CTAs work | Passing |
| Auth flows | `tests/auth.spec.ts` | Login, register, protected routes | Passing |
| Course catalog | `tests/courses.spec.ts` | Catalog displays, navigation | Passing |
| Learning flow | `tests/learning.spec.ts` | Enroll → learn → complete | SKIPPED (BUG-011) |

### 19.2 Required Test Additions

**E2E Tests (Playwright):**

| Test | Priority | Covers |
|------|----------|--------|
| Payment flow | CRITICAL | Stripe → enrollment → dashboard |
| Video lesson plays | HIGH | Embed renders, mark complete works |
| Quiz attempt + result | HIGH | Submit answer, see result |
| Certificate generation | HIGH | 100% completion → download PDF |
| Admin: create course | MEDIUM | Course visible in catalog |
| Mobile: full lesson flow | HIGH | 375px viewport |

**Unit Tests (Vitest — add this sprint):**

| Test | Priority | Covers |
|------|----------|--------|
| `auth.ts` — `applySession` race condition | HIGH | Auth store logic |
| `payments.ts` — `buildStripePaymentLinkUrl` | MEDIUM | URL construction |
| `LessonPlayer` — progress calculation | HIGH | Math.min, NaN guard |
| Quiz grading logic | HIGH | Correct/incorrect determination |
| Certificate verification code generation | MEDIUM | Unique code uniqueness |

### 19.3 Manual QA Checklist (Pre-Launch)

```
CORE FLOWS:
[ ] Register with email → receive confirmation email
[ ] Login → land on dashboard
[ ] Browse catalog → 6 courses visible, difficulty filter works
[ ] Free enroll → lesson player opens, video plays
[ ] Mark lesson complete → progress bar updates
[ ] Complete course → certificate available for download
[ ] Pay for course → receive email → enrolled → lesson player opens
[ ] Profile page → update name/avatar → changes persist

EDGE CASES:
[ ] Login with wrong password → friendly error
[ ] Register duplicate email → friendly error
[ ] Navigate to /dashboard without login → redirect to /login
[ ] Direct URL to /learn/:id without enrollment → redirect to course detail
[ ] Video with no URL → graceful placeholder
[ ] No lessons in course → graceful empty state
[ ] Progress bar: 0 complete → 0%, all complete → 100%

MOBILE:
[ ] Landing page: iPhone 15 (390px)
[ ] Course catalog: iPhone 15
[ ] Lesson player: iPhone 15 — sidebar collapses
[ ] Mark complete button: tappable on mobile

SECURITY:
[ ] User A cannot view User B's profile via direct API call
[ ] Unenrolled user cannot access lesson content
[ ] Admin routes inaccessible to student role
```

---

## 20. Deployment Strategy

### 20.1 Environments

| Environment | URL | Trigger | Purpose |
|-------------|-----|---------|---------|
| Development | `localhost:5173` | Local | Daily development |
| Preview | `[branch].vercel.app` | Push to any branch | PR review |
| Production | `[project].vercel.app` | Push to `main` | Live platform |

### 20.2 Git Workflow

```
main          — production, always deployable, protected
develop       — integration branch, PRs merge here
feature/xxx   — individual feature branches

Release flow:
  feature/xxx → PR → develop → PR review → merge
  develop → PR to main → smoke test → merge → auto-deploys to Vercel
```

### 20.3 Pre-Deploy Checklist (CI/CD)

```yaml
# .github/workflows/ci.yml additions needed:
- npm run typecheck        # TypeScript — zero errors
- npm run lint             # ESLint — zero errors
- npm run test:e2e         # Playwright — all 4 suites pass
- lighthouse ci            # Performance > 90, Accessibility > 95
```

### 20.4 Database Migration Protocol

```
1. Write migration SQL in supabase/migrations/[timestamp]_[name].sql
2. Test against local Supabase: supabase db reset
3. Review in PR — migrations are permanent, review carefully
4. After merge to main: supabase db push (manual step)
5. Verify in Supabase dashboard → Table Editor
```

### 20.5 Launch Day Runbook

```
T-24h:
  [ ] All E2E tests passing on develop
  [ ] Stripe payment link tested with test card
  [ ] Seed SQL applied to production Supabase
  [ ] Sentry + Plausible verified sending data
  [ ] Email welcome sequence tested (send to yourself)
  [ ] Discord server open + welcome message pinned

T-0h:
  [ ] Create GitHub release: v1.0.0
  [ ] Merge develop → main (triggers Vercel deploy)
  [ ] Verify Vercel deploy: green
  [ ] Manual smoke test: register → enroll Course 1 → play video
  [ ] Send launch announcement to email list
  [ ] Post on Reddit (r/learnprogramming, r/webdev, r/nocode)
  [ ] Post on Twitter/X

T+1h to T+24h:
  [ ] Monitor Sentry error feed
  [ ] Monitor Discord for user questions
  [ ] Reply to all comments + messages
  [ ] Track Plausible for traffic + conversion
```

---

## 21. Post-Launch Maintenance

### 21.1 Weekly Maintenance (2 hours/week)

```
Engineering:
  [ ] Review Sentry error feed — fix any new critical errors
  [ ] Check Vercel deployment logs — no failed builds
  [ ] Review Supabase metrics — query performance, storage
  [ ] Deploy any open PRs that are merge-ready

Content:
  [ ] Upload next week's course video(s)
  [ ] Review Discord student questions — update FAQ if recurring
  [ ] Collect + publish 1 student win/testimonial

Marketing:
  [ ] Post 3x social (Twitter/Reddit)
  [ ] Send weekly email digest to list
  [ ] Award Discord points/badges for active students
```

### 21.2 Monthly Maintenance (4 hours/month)

```
Product:
  [ ] Review PostHog funnel — identify biggest drop-off point
  [ ] Review quiz pass rates — flag poorly written questions
  [ ] NPS survey to active students (Typeform, 1 question)
  [ ] Review Stripe revenue — reconcile with enrollment count

Engineering:
  [ ] Dependency updates: npm audit fix + test
  [ ] Lighthouse CI audit — flag any score drops
  [ ] Database query performance review (Supabase Dashboard)
  [ ] Supabase backup verification

Content:
  [ ] Compile student FAQ into updated FAQ doc
  [ ] Plan next month's content calendar
  [ ] Review course ratings — flag below 4.0 for content refresh
```

### 21.3 Incident Response Protocol

| Severity | Example | Response Time | Action |
|----------|---------|---------------|--------|
| P0 — Site down | Vercel deploy failed, 502s | 30 min | Rollback deploy, post status |
| P1 — Auth broken | Users can't log in | 1 hour | Hotfix to main, notify users |
| P2 — Payment broken | Stripe webhook failing | 2 hours | Disable paid courses, fix, re-enable |
| P3 — Feature broken | Video won't play | 24 hours | Fix in next deploy |
| P4 — Minor bug | Wrong styling on mobile | 72 hours | Add to backlog, next sprint |

---

## 22. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Supabase service role key exposed | Medium — was in `.env` | CRITICAL | Rotated + `.gitignore` hardened |
| Low course completion rate | High (industry average is 5–15%) | High | Short lessons, gamification, community |
| Video content not recorded | High — no videos exist yet | CRITICAL | Block sprint 3 on recording sprint |
| Payment webhook fails silently | Medium | High | Stripe retry logic + Sentry alert |
| Supabase free tier limit hit | Low pre-launch | Medium | Upgrade to Pro ($25/mo) |
| Competitor launches similar course | Medium | Medium | Speed to market + community moat |
| Dual frontend architecture confusion | Was a risk | Resolved | `apps/web/` archived |
| Single developer dependency | High | High | Document everything, no bus factor secrets |
| YouTube removes unlisted videos | Low | High | Migration to MUX planned for Phase 2 |
| Course content goes stale (AI tools change fast) | High | High | Modular lesson structure, easy to update |

---

## Appendix A — File Inventory

```
Repository: Hyper-Vibe-Coding-Course/
├── CLAUDE.md                         ← AI context file (Level 5)
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SHOWCASE.md
├── docker-compose.yml
├── package.json                      ← Monorepo root
│
├── frontend/                         ← THE active frontend
│   ├── src/
│   │   ├── App.tsx                   ← Router
│   │   ├── context/auth.ts           ← Auth store
│   │   ├── lib/{supabase,payments,utils}.ts
│   │   ├── pages/{Landing,Auth,Catalog,Detail,Player,Dashboard,Pricing,NotFound}.tsx
│   │   ├── components/ui/{Button,Input}.tsx
│   │   └── types/database.ts
│   ├── tests/                        ← Playwright suites
│   └── package.json
│
├── supabase/
│   ├── migrations/                   ← 3 applied migrations
│   └── seed-courses.sql              ← Run this now
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL-ARCHITECTURE.md
│   ├── DEPLOYMENT-RUNBOOK.md
│   ├── DEVLOG.md
│   ├── BUG_TRACKER.md                ← 13/15 resolved
│   ├── HEALTH_CHECK_AND_BUILD_RECOMMENDATIONS.md
│   ├── PROJECT_REPORT_COMPREHENSIVE.md  ← This file
│   ├── course/CURRICULUM.md
│   └── guides/{LAUNCH_PLAN,GAMIFICATION,MARKETING,EMAIL_SEQUENCES,...}.md
│
├── Claude/
│   └── CLAUDE_SKILLS_HYPER_VIBE.md  ← Prompt patterns L1-L5
│
└── apps/                             ← ARCHIVE — do not develop
    ├── web/                          ← Abandoned second frontend
    └── api/                          ← Abandoned Express API
```

---

## Appendix B — Quick Reference Metrics

```
PLATFORM HEALTH (2026-04-10):
  Codebase:     Production ready (Phase 1)
  Bugs open:    2 (BUG-013, BUG-014) — both LOW severity
  E2E coverage: 75% (3/4 suites passing)
  Tech debt:    Low — stack is clean and modern

CONTENT:
  Courses planned:    6
  Courses in DB:      0 (seed SQL ready to run)
  Lessons recorded:   0
  Curriculum written: Course 1 (100%), Others (10–30%)

REVENUE:
  MRR:      $0 (pre-launch)
  Phase 2 trigger: $10,000 MRR

INFRASTRUCTURE COST:
  Current: $35/mo
  Phase 1 target: $35/mo
  Phase 2 (at $10k MRR): ~$1,200–2,400/mo
```

---

*Report compiled by Claude Code health audit on 2026-04-10.*
*Next review date: 2026-05-10 or at Phase 1 launch, whichever comes first.*
