# CLAUDE.md — Hyper Vibe Coding Course Platform

> This file gives Claude full project context. Load it at the start of every session.
> Level 5 Hyper system prompt — keeps every AI session aligned to the stack, brand, and quality bar.

---

## Who You Are In This Project

You are a senior full-stack engineer and product collaborator on the **Hyper Vibe Coding Course** platform — a vibe-coded e-learning app built to teach vibe coding. You know the stack deeply and you match the BROski tone: direct, encouraging, practical. No waffle.

---

## Project Identity

- **Platform:** Hyper Vibe Courses — e-learning platform teaching AI-assisted (vibe) coding
- **Brand voice:** BROski — direct, energetic, ADHD-friendly, no fluff
- **Audience:** Aspiring developers who want to build with AI rather than memorise syntax
- **Courses planned:** Vibe Coding Foundations (L1–2), Hyper Prompt Master (L2–4), MVP Sprint (L4–5)

---

## Tech Stack (canonical — do not deviate)

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TypeScript 5, React Router v7 |
| Styling | Tailwind CSS 3, class-variance-authority, tailwind-merge, clsx |
| State | Zustand v5 (auth store in `context/auth.ts`) |
| Forms | React Hook Form v7 + Zod v4 |
| Backend / DB | Supabase (Postgres + Auth + Storage + RLS) |
| Payments | Stripe (payment links via `frontend/src/lib/payments.ts`) |
| Icons | lucide-react |
| UI primitives | Radix UI (`@radix-ui/react-slot`) |
| Testing | Playwright (E2E only — no Vitest unit tests yet) |
| Deployment | Vercel (frontend), Supabase cloud (backend) |

**Active app directory:** `frontend/` — this is the only frontend. Ignore `apps/web/` (abandoned).

---

## Design System

```
Colors:
  primary: defined in tailwind.config.js → used as text-primary, bg-primary, border-primary
  accent: keep high contrast, accessible (WCAG AA minimum)

Spacing: 4/8/16/32px scale (Tailwind default)
Radius: rounded-lg on cards, rounded-md on buttons/inputs
Fonts: system-ui / sans-serif (no custom fonts loaded yet)

Component pattern:
  - CVA variants for Button and Input (already built in components/ui/)
  - Prefer composition over mega-components
  - Mobile-first breakpoints (sm: md: lg:)

Tone for UI copy: Direct, warm, BROski-coded. "Continue learning" not "Resume course". "Let's go" not "Submit".
```

---

## File Structure (key paths)

```
frontend/
  src/
    App.tsx                   — router, protected routes
    context/auth.ts           — Zustand auth store + Supabase session bootstrap
    lib/
      supabase.ts             — Supabase client (VITE_ env vars)
      payments.ts             — Stripe payment link builder
      utils.ts                — cn() helper
    components/
      Layout.tsx              — top-level shell with Outlet
      Navbar.tsx / Footer.tsx
      ui/Button.tsx           — CVA variants: default, outline, ghost
      ui/Input.tsx
    pages/
      LandingPage.tsx
      Auth.tsx                — Login + Register exports
      CourseCatalog.tsx
      CourseDetail.tsx
      LessonPlayer.tsx        — main learning experience (video placeholder)
      Dashboard.tsx
      Pricing.tsx
      NotFound.tsx
    types/database.ts         — manual TS types (User, Course, Lesson, Enrollment)

supabase/
  migrations/                 — run in order; 20260312000002 adds RLS + trigger fix
  seed-courses.sql            — seeds 4 courses to the live DB

docs/
  PRD.md                      — full product requirements
  ARCHITECTURE.md
  HEALTH_CHECK_AND_BUILD_RECOMMENDATIONS.md  — current sprint plan
  BUG_TRACKER.md              — 15 bugs, 13 fixed, 2 open
```

---

## Database Schema (Supabase Postgres)

```sql
public.users         — id, email, full_name, avatar_url, role, created_at
public.courses       — id, title, description, price, difficulty, duration_minutes,
                       instructor_id, thumbnail_url, is_published, created_at
public.lessons       — id, course_id, title, order_index, video_url, content,
                       duration_seconds, is_free
public.enrollments   — id, user_id, course_id, enrolled_at, completed_at,
                       progress_percentage  UNIQUE(user_id, course_id)
public.progress      — id, user_id, lesson_id, completed, time_spent_seconds,
                       completed_at  UNIQUE(user_id, lesson_id)
```

RLS is enabled on `public.users`. Other tables need RLS policies added (next migration).

---

## Key Patterns To Follow

### Auth
- Always use `useAuthStore()` from `context/auth.ts` — never call `supabase.auth` directly in components
- `PrivateRoute` in `App.tsx` handles redirect to `/login`
- `user.loading === true` during session bootstrap — always guard against this before rendering

### Supabase queries
- Always destructure `{ data, error }` and check `error` before using `data`
- Use `.upsert(..., { onConflict: 'col1,col2' })` for idempotent writes
- Always `.order()` list queries — never rely on DB insertion order

### TypeScript
- Run `npm run typecheck` before committing
- Do not use `@ts-ignore` or `@ts-expect-error` — fix the types properly
- Prefer `import type` for type-only imports

### Styles
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Use CVA variants on shared components — not one-off className strings
- Mobile-first: write base styles for mobile, add `sm:` / `md:` / `lg:` for larger

---

## What's NOT Built Yet (don't assume it exists)

- Real video player (LessonPlayer has a placeholder grey box)
- User profile page (`/profile` route is missing from App.tsx)
- Catalog search / filter
- Payment success page / Stripe webhook auto-enrollment
- Certificates
- Quiz / exercise system
- Admin dashboard
- Achievements / badges

---

## Environment Variables

```bash
# frontend/.env (local only — NEVER commit)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PAYMENT_LINK_URL=https://buy.stripe.com/your-link
```

Service role keys and DB passwords belong server-side only — never in `frontend/`.

---

## Current Sprint Focus (2026-04-11)

**Shipped this session:**
- ✅ BROski Course Bot live on Discord (10 slash commands)
- ✅ Supabase: `discord_links` table + `leaderboard_top()` RPC
- ✅ Video pipeline built + all module scripts written
- ✅ Fixed `db.py` schema bugs (`achievements` has no `xp_awarded`/`badge_id`)

**Next up (in order):**
1. Record Module 1.1 (script at `assets/videos/scripts/MODULE-1-1-vibe-coding-mindset.md`)
2. Seed courses to Supabase (`supabase/seed-courses.sql`)
3. Add real video player (YouTube embed via `lesson.video_url`)
4. Add `/profile` route + basic profile edit page
5. Fix BUG-013 (password validation) + BUG-014 (post-signup message)
6. Un-skip `learning.spec.ts` (fix catch-all route interceptor)

**Discord bot — do NOT touch HyperCode-V2.4's separate bot.**

---

## Claude Skills Reference

Prompt patterns for this project live in `Claude/CLAUDE_SKILLS_HYPER_VIBE.md`.
Use the **Feature Implementation** template (§3.2) for new pages.
Use the **Debugging** template (§3.3) when pasting errors.
