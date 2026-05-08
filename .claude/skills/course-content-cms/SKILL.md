---
name: course-content-cms
description: Hyper-Vibe-Coding-Course content schema — courses, modules, lessons (video_url), quiz_questions/quiz_attempts, certificates, referrals, BROski$ token economy, RLS patterns. Use when the user says "add a lesson", "quiz schema", "video URL", "certificate", "referral codes", "course tracker", or extends the content/learning data model.
---

# course-content-cms

The content + learning data model lives in Supabase Postgres. RLS-protected, frontend-readable via `supabase-js`.

## Core Tables

| Table | Purpose |
|---|---|
| `users` | Profile data, BROski$ balance, level, XP, discord_id |
| `courses` | Course metadata (title, slug, level, description) |
| `modules` | Modules within a course (ordered) |
| `lessons` | Lessons within a module (video_url, content, ordered) |
| `enrollments` | User ↔ course (status, progress, started_at, completed_at) |
| `lesson_progress` | Per-user, per-lesson (completed_at, time_spent) |
| `quiz_questions` | Question pool per lesson |
| `quiz_attempts` | User attempts (score, passed, attempted_at) |
| `certificates` | Issued on course completion (course_id, user_id, issued_at, certificate_url) |
| `referral_codes` | Per-user unique code |
| `referrals` | Referrer → referee mapping |
| `token_transactions` | BROski$ ledger (idempotency-protected) |
| `shop_items` | Digital items + prompt packs + bonus lessons |
| `shop_purchases` | Purchase records (item_slug, JSONB metadata) |

## Adding a Lesson (workflow)

```sql
-- 1. Create the module if it doesn't exist
INSERT INTO modules (course_id, title, slug, position)
VALUES ('<course-uuid>', 'Module 1: Vibe Foundations', 'vibe-foundations', 1)
RETURNING id;

-- 2. Insert the lesson
INSERT INTO lessons (module_id, title, slug, position, video_url, content, duration_seconds)
VALUES (
  '<module-uuid>',
  'Lesson 1.1: Why Vibe Coding',
  'why-vibe-coding',
  1,
  'https://www.youtube.com/embed/<video-id>',     -- set when recorded; LessonPlayer shows placeholder until set
  'Markdown content here...',
  600
);

-- 3. Add quiz questions (optional)
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation)
VALUES (
  '<lesson-uuid>',
  'What is vibe coding?',
  '["Random typing", "Flow-state programming", "Coding without tests", "AI-assisted dev"]'::jsonb,
  1,
  'Vibe coding is the flow-state, intuition-led approach.'
);
```

The frontend reads via Supabase RPCs / direct queries. RLS allows authenticated users to read course content but only their own progress.

## video_url — The Recording Backlog

Many lessons have `video_url IS NULL` until recorded. The `LessonPlayer` component shows a placeholder when null:

```tsx
{lesson.video_url
  ? <iframe src={lesson.video_url} ... />
  : <PlaceholderCard message="Recording coming soon" />
}
```

Bro records → uploads to YouTube → updates the row:

```sql
UPDATE lessons SET video_url = 'https://www.youtube.com/embed/<id>' WHERE slug = '<lesson-slug>';
```

## Quiz System

```
quiz_questions (per lesson, multi-choice with options JSONB)
  ↓
QuizWidget (in LessonPlayer)
  ↓
On submit → INSERT INTO quiz_attempts
  ↓
If passed → award BROski$ via token_transactions
```

Pass threshold typically 80% (configurable per quiz). On pass, `lesson_progress.completed_at` is set automatically (DB trigger).

## Certificates

Issued when ALL lessons in a course are complete:

```sql
-- DB trigger or Edge Function on lesson_progress completion
INSERT INTO certificates (user_id, course_id, certificate_url)
VALUES ('<user>', '<course>', '<url to PDF or page>')
ON CONFLICT (user_id, course_id) DO NOTHING;
```

Frontend route: `/certificate/:courseId` — renders the certificate page (PDF download, social share buttons).

## Referrals

`handle_new_user` trigger generates a unique referral code per user. When a new user signs up via `?ref=<code>`, the frontend:

1. Captures the ref code from URL on landing
2. Stores in `localStorage`
3. After signup, calls a Supabase RPC to record the referral:
   ```ts
   await supabase.rpc('record_referral', { ref_code: storedCode })
   ```
4. RPC inserts into `referrals` + awards BROski$ to both parties

## BROski$ Token Economy (DB side)

| Field | Where |
|---|---|
| `users.broski_tokens` | Current balance |
| `token_transactions` | Append-only ledger, every change recorded |
| `award_tokens(user_id, amount, reason)` | RPC, SECURITY DEFINER |
| `spend_tokens(user_id, amount, reason)` | RPC, SECURITY DEFINER |
| `shop_purchases.item_slug` | Filter by `'agent-sandbox-access'` etc. |
| `shop_purchases.metadata` | JSONB — flexible per-item data |

**Always go through the RPCs** — direct UPDATE on `users.broski_tokens` would bypass the ledger.

## RLS Patterns

```sql
-- Users can read own data
CREATE POLICY "users_self_read" ON users FOR SELECT
USING (auth.uid() = id);

-- Users can read their own enrollments
CREATE POLICY "enrollments_self" ON enrollments FOR SELECT
USING (auth.uid() = user_id);

-- All authenticated users can read course content
CREATE POLICY "courses_authenticated" ON courses FOR SELECT
TO authenticated USING (true);

-- Public courses readable by anon (for landing page preview)
CREATE POLICY "courses_public" ON courses FOR SELECT
TO anon USING (is_public = true);
```

## Migrations

```powershell
cd "H:\Hyper-Vibe-Coding-Course"

# Apply pending migrations to linked Supabase project
supabase db push

# Generate a new migration from local changes
supabase db diff --use-migra -f <name>

# Reset local DB (DESTRUCTIVE)
supabase db reset
```

22 migrations applied as of May 3, 2026 — all green.

## Adding New Content (full checklist)

1. Plan: course → modules → lessons → quizzes
2. Migration: add columns/tables if new fields needed (`supabase db diff`)
3. RLS: add policies for new tables (default: deny all)
4. Seed: SQL or Edge Function to insert content
5. Frontend: types regenerated (`supabase gen types typescript --linked > frontend/src/types/database.ts`)
6. UI: render in `CourseDetail`, `LessonPlayer`, `QuizWidget`, etc.
7. Test: enroll a test user, walk the flow

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| Lesson shows but video doesn't play | `video_url` is NULL | UPDATE `lessons` with the YouTube embed URL |
| Quiz submit returns 403 | RLS policy missing on `quiz_attempts` | Add INSERT policy: `auth.uid() = user_id` |
| Certificate not issued after all lessons done | Completion trigger missing or errored | Check Supabase logs; manually run completion check |
| Referral code shows in URL but not recorded | RPC `record_referral` not called or errored | Check frontend console + Supabase logs |
| `broski_tokens` doesn't match `token_transactions` sum | Direct UPDATE bypassed the ledger | Use `award_tokens`/`spend_tokens` RPCs only |
| Course content visible to anon when shouldn't be | Wrong RLS policy on `courses` table | Tighten policy to authenticated-only |

## Companion Skills

- `supabase-edge-functions` — server-side hooks (handle-new-user, access-provision)
- `frontend-auth-debug` — auth must work for any user-scoped reads
- `stripe-checkout-frontend` — paid course access flow

## Hard Rules

- **NEVER UPDATE `users.broski_tokens` directly** — always via `award_tokens`/`spend_tokens` RPCs
- **Always add RLS policies** to new tables — Supabase defaults are wide open without them
- **`video_url` can be NULL** — UI must handle it (placeholder)
- **Migrations are forward-only** — never edit applied migrations; create a new one to fix
- **`supabase gen types`** after every schema change — keeps frontend types in sync
