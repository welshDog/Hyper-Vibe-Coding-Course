-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Lessons for Vibe Coding Foundations
-- ═══════════════════════════════════════════════════════════════════════════
-- Requires: migration 000013 (lessons table) + seed-courses.sql to have run.
-- Idempotent — ON CONFLICT (course_id, order_index) DO NOTHING.
-- Course ID is resolved by title subquery — works with any ID type.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Week 1: What Is Vibe Coding? ─────────────────────────────────────────────

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'The Vibe Coding Mindset', 1, NULL,
  'Shift from "learning syntax" to "directing AI with taste". Code is the implementation detail — taste is the superpower. You will build your first real webpage today with zero prior knowledge.',
  480, true
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Your First Prompt', 2, NULL,
  'Hands-on lab: write a prompt, paste AI code into Replit, deploy a live URL in under 20 minutes. Deliverable: share your live URL in #projects.',
  1200, true
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Anatomy of a Good Prompt', 3, NULL,
  'The 3-ingredient prompt formula: Role + Context + Taste. Learn the red flags that kill your results and the patterns that make every prompt land.',
  360, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Project: Personal Landing Page', 4, NULL,
  'Build and deploy a personal landing page. Must be publicly deployed with a real URL by end of week. No template clones — this has to be yours.',
  5400, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

-- ── Week 2: Build Your First Data App ────────────────────────────────────────

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'What Is State? (The Vibe Version)', 5, NULL,
  '"State" = your app''s memory. A mood tracker needs to remember moods. Data without state is just a pretty picture. No theory — just what it is and why it matters.',
  420, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Local Storage Without the Pain', 6, NULL,
  'localStorage lets data survive a page refresh — no backend required. Prompt AI to wire it up. You do not need to understand the code, just what it does.',
  480, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Project: Mood Tracker', 7, NULL,
  'Build an interactive mood tracker with local storage. Log daily moods, see a simple visualisation. Data persists across page refreshes. Deliverable: live URL in #projects.',
  5400, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

-- ── Week 3: Aesthetic & Personality ──────────────────────────────────────────

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Design Systems in 10 Minutes', 8, NULL,
  'Colour palettes, font pairings, spacing rhythm. Three decisions: primary colour, font personality, whitespace. Make anything look intentional without a design degree.',
  360, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Project: Custom Timer', 9, NULL,
  'Build a timer app with YOUR aesthetic. Not another grey Pomodoro clone. Deliverable: deployed timer with a distinctive visual personality that is unmistakably yours.',
  7200, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

-- ── Week 4: Ship Your Capstone ────────────────────────────────────────────────

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Scoping Like a Pro', 10, NULL,
  'The #1 project killer is scope creep. Pick ONE core feature. Ship THAT. Add extras after. Every shipped thing beats every perfect draft.',
  300, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
SELECT id, 'Capstone Project', 11, NULL,
  'Build any simple tool you want. Must be deployed. Must solve a real problem for a real person. This is your graduation project — earns the Shipper badge and 150 BROski$.',
  10800, false
FROM public.courses WHERE title = 'Vibe Coding Foundations'
ON CONFLICT (course_id, order_index) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT l.order_index, l.title, l.duration_seconds, l.is_free
-- FROM public.lessons l
-- JOIN public.courses c ON c.id = l.course_id
-- WHERE c.title = 'Vibe Coding Foundations'
-- ORDER BY l.order_index;

COMMIT;
