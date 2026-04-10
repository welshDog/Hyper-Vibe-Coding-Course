# Hyper Vibe Platform — Health Check & Build Recommendations
> Audit date: 2026-04-10 | Audited against: `CLAUDE_SKILLS_HYPER_VIBE.md`, PRD, bug report, and current source code.

---

## 1. Current State Summary

**What exists and works:**
- `frontend/` — React 19 + Vite + TypeScript + Tailwind + Supabase + Stripe + Zustand + React Router v7
- Auth flow: login, register, session bootstrap, protected routes
- Course catalog + course detail pages
- Lesson player (UI complete, video is placeholder)
- Dashboard (enrolled courses + progress bar)
- Supabase schema: users, courses, lessons, enrollments, progress
- RLS + auth trigger fix (migration `20260312000002`)
- Vercel deployment configured
- Playwright E2E tests (auth, courses, landing — `learning.spec.ts` skipped)
- Pre-commit hooks (husky + lint-staged)

**Stack verdict:** Excellent modern choices. No need to change anything here.

---

## 2. CRITICAL Issues — Fix Before Any New Features

### 2.1 Secrets in `.env` on disk (SECURITY — immediate action)
`frontend/.env` contains **real Supabase service role key, database password, and anon key** in plain text with PowerShell variable syntax (not standard `.env` format). The file is not git-tracked, but it lives unencrypted on the machine and would expose full DB access if shared.

**Actions:**
1. Rotate the Supabase service role key and database password now at `supabase.com > Project Settings > API`.
2. Rename/delete `frontend/.env` — the app uses `VITE_` prefixed keys in standard format (see `.env.example`).
3. Add `.env` (without `.local` suffix) explicitly to `frontend/.gitignore`.
4. Never put service role keys in `frontend/` — they belong server-side only.

### 2.2 Dual frontend architecture — pick one, kill the other
There are two distinct frontend apps:
- `frontend/` — the real, deployed, feature-complete app
- `apps/web/` — a second monorepo attempt with different components, different auth store, different dark theme

`apps/web/` is half-built and diverging. Every hour spent there is wasted if `frontend/` is the canonical app.

**Decision needed:** Archive `apps/web/` (move to `_archive/` or delete) and commit to `frontend/` as the single source of truth. The `apps/api/` (Express + Prisma) also conflicts with the Supabase-direct approach in `frontend/`.

### 2.3 Hardcoded course data not seeded to database
`frontend/src/lib/course4-data.ts`, `course5-data.ts`, `course6-data.ts` define course objects in TypeScript — but the live app fetches courses from Supabase. These files are never imported by any page. The course catalog will show empty until courses are seeded.

**Fix:** Run a one-time seed using these objects against Supabase (use `apps/api/src/seed.ts` pattern or Supabase SQL editor) and delete the data files, or use them as the seed source explicitly.

---

## 3. HIGH Priority — Ship These Next

### 3.1 Real video player
`LessonPlayer.tsx` shows a grey box with "Video Player Placeholder" and prints the raw `video_url`. This is the core product — without it, enrolled students can't learn anything.

**Recommendation:** Integrate a hosted video provider:
- **MUX** — best for courses; analytics, adaptive streaming, thumbnail generation. Drop-in `@mux/mux-player-react`.
- **YouTube embed** — simplest if videos are already on YouTube (free, no bandwidth cost).
- **Vimeo** — good middle ground, clean embed API.

Minimum viable: add an `<iframe>` YouTube/Vimeo embed based on `lesson.video_url` pattern detection. Ship that first.

### 3.2 TypeScript type-check script missing
`package.json` has no `"typecheck": "tsc --noEmit"` script and no `tsc` in the build pipeline. TypeScript errors are only caught by the editor, not CI.

```json
// Add to package.json scripts:
"typecheck": "tsc --noEmit",
"build": "tsc --noEmit && vite build"
```

The `tsc-errors.txt` file (1 line, empty) suggests a previous type check was run but errors weren't captured.

### 3.3 Generate Supabase types instead of hand-writing them
`src/types/database.ts` is manually maintained. When schema changes (add a column, rename a field), types silently drift from reality.

```bash
# Add to package.json scripts:
"gen:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts"
```

Then import the generated `Database` type and derive `User`, `Course`, etc. from it. This eliminates the `// @ts-expect-error` in Dashboard and prevents data shape bugs.

### 3.4 Fix the skipped `learning.spec.ts` test (BUG-011)
The catch-all `page.route('**', ...)` interceptor blocks Supabase auth websocket calls, causing auth to never complete. The fix is scoped route mocking (see bug report). Un-skipping this test gives you full enroll→learn→complete coverage, which is the highest-risk user path.

### 3.5 Course catalog has no search or filter
The PRD specifies search/filter. The current catalog shows all published courses in a grid with no discovery tools. For 3–5 courses this is fine; for 10+ it becomes painful.

**Quick win:** Add client-side filter by `difficulty` (beginner/intermediate/advanced) as a button group. No backend changes needed — filter the already-fetched array.

---

## 4. MEDIUM Priority — Quality Bar Improvements

### 4.1 Replace "Loading..." text with skeletons
Every page shows plain "Loading..." text. Skeleton screens feel premium and reduce perceived wait time. Tailwind makes this easy with `animate-pulse` + grey blocks mirroring the real layout.

### 4.2 Add a React Error Boundary
No error boundary exists. An unhandled JS error in any component crashes the whole app to a white screen. Add one root-level boundary in `main.tsx` with a friendly "Something went wrong" fallback.

### 4.3 `via.placeholder.com` in Dashboard
`Dashboard.tsx` line 89 falls back to `https://via.placeholder.com/150` for missing thumbnails. This is an external service that can go down or be blocked. Replace with a local SVG placeholder or a Tailwind div showing the course initial.

### 4.4 Password validation on Register (BUG-013)
No minimum length check on the password field. Add `minLength: 8` to the zod schema (react-hook-form is already wired up) and show inline error before Supabase rejects the request.

### 4.5 Post-signup UX (BUG-014)
After registration the user is silently redirected to `/login` with no feedback. If email confirmation is required, they won't know. Show a success state: "Check your inbox to confirm your account before logging in."

### 4.6 `dist/` in `frontend/.gitignore` — verify it's excluded
The `.gitignore` has `dist` on a line by itself. Double-check with `git ls-files frontend/dist` — the built assets should not be committed (Vercel builds from source).

---

## 5. Roadmap — What to Build Next (Aligned to PRD)

These are not bugs — they are features the PRD defines but code doesn't implement yet. Ordered by user value:

| Priority | Feature | Effort | Notes |
|----------|---------|--------|-------|
| 1 | Real video player | Small | See §3.1 |
| 2 | User profile page | Small | Route `/profile` is missing from `App.tsx`; basic name/avatar edit |
| 3 | Course catalog search/filter | Small | Client-side filter on fetched data |
| 4 | Payment success page + Stripe webhook | Medium | Currently Stripe payment links redirect to nothing; users don't get enrolled automatically |
| 5 | Certificate generation | Medium | Generate PDF/image on 100% course completion; Supabase Edge Function + PDF lib |
| 6 | Achievements / badge system | Medium | PRD specifies badge system; gamification store exists in `apps/web/` — salvage the logic |
| 7 | Quiz / exercise system | Large | Needs new DB table (`quizzes`, `quiz_attempts`), question editor, grading |
| 8 | Admin dashboard | Large | Course CRUD, user list, revenue view; gate behind `role === 'admin'` |
| 9 | Instructor content flow | Large | Upload videos, manage curriculum, publish |

---

## 6. Alignment with CLAUDE_SKILLS_HYPER_VIBE.md

The skills guide defines 5 vibe coding levels. The current build demonstrates the **Level 4 (Shipper)** pattern — spec → implementation → tests → refactor is present. Here is how to reach Level 5:

| Level 5 Behaviour | Current Gap | Next Action |
|---|---|---|
| Reusable Claude flows + project templates | No `CLAUDE.md` in repo root | Add a `CLAUDE.md` that captures the stack, brand voice, and design system so every Claude session starts with context |
| Design system encoded in project instructions | Tailwind config has no custom `primary` colour variable defined; `text-primary` used everywhere but no token | Define `colors.primary` in `tailwind.config.js` and document it |
| Claude used for code + copy + UX as one system | Marketing copy (landing page, pricing, emails) is generic placeholder text | Write a Claude prompt template for "generate on-brand Hyper Vibe copy" and save it to `Claude/` |
| Given roadmap → scope MVP → implement critical path | PRD is written but no sprint scoping exists | Use the **§3.5 Learning Projects & Labs** prompt template to break the roadmap into 5-step sprints |

---

## 7. Quick Wins Checklist

These can each be done in under 30 minutes:

- [ ] Add `.env` to `frontend/.gitignore`
- [ ] Rotate the exposed Supabase service role key
- [ ] Add `"typecheck": "tsc --noEmit"` to `package.json`
- [ ] Replace `via.placeholder.com` with a local fallback in Dashboard
- [ ] Add `minLength: 8` to register password validation
- [ ] Add difficulty filter buttons to CourseCatalog
- [ ] Seed the 3 course data files to Supabase and delete the TS files
- [ ] Archive or delete `apps/web/` to remove the split-brain
- [ ] Add a root Error Boundary in `main.tsx`
- [ ] Add `CLAUDE.md` to project root with stack + design system context

---

## 8. Bug Report Reconciliation

The bug report table marks all 15 bugs as `❌ Open` but the header says many are fixed. Based on reading the current code, here is the actual status:

| Bug | Report Status | Actual Code Status |
|-----|-------------|-------------------|
| BUG-001 Auth race condition | Open | **Fixed** — `applySession()` with `requestId` pattern |
| BUG-002 No initial session check | Open | **Fixed** — `initializeAuth()` + `void` call |
| BUG-003 Dashboard `full_name` crash | Open | **Fixed** — `(user.full_name \|\| user.email \|\| 'there')` |
| BUG-004 LessonPlayer no error handling | Open | **Fixed** — `error` state + early returns |
| BUG-005 Progress scope / rollback | Open | **Fixed** — scoped to `lessonIds`, optimistic rollback in place |
| BUG-006 Duplicate enrollment | Open | **Fixed** — `upsert` with `onConflict` |
| BUG-007 `JSX.Element` deprecated | Open | **Fixed** — `React.ReactElement` |
| BUG-008 Session type | Open | **Fixed** — `Session \| null` imported |
| BUG-009 Progress % NaN | Open | **Fixed** — `Math.min(100, Math.round(...))` |
| BUG-010 No ordering on courses | Open | **Fixed** — `.order('created_at', { ascending: false })` |
| BUG-011 Skipped E2E test | Skipped | **Still skipped** — catch-all route interceptor not fixed |
| BUG-012 `@ts-expect-error` | Open | **Fixed** — not present in current `Dashboard.tsx` |
| BUG-013 No password validation | Open | **Still open** |
| BUG-014 Silent post-signup redirect | Open | **Still open** |
| BUG-015 RLS + trigger | Open | **Fixed** — migration `20260312000002` |

**Update the bug report table** — 13 of 15 bugs are resolved. Only BUG-011, BUG-013, BUG-014 remain.

---

*Generated by Claude Code health audit — `CLAUDE_SKILLS_HYPER_VIBE.md` Level 5 pattern applied.*
