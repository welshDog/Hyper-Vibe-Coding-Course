-- Seed the REAL Hyper Vibe course catalog into public.courses + public.lessons.
--
-- Replaces the retired generic demo (20260723000000_retire_demo_lms.sql). This is
-- the git-tracked, rebuild-safe version of the standalone supabase/seed-courses.sql +
-- seed-lessons.sql, corrected for the live tlav schema:
--   * courses.id / lessons.course_id are UUID (not text) -> use gen_random_uuid()
--     directly (the standalone seed's ::text cast would fail on a uuid column).
--   * The lesson seed's ON CONFLICT (course_id, order_index) needs a UNIQUE index;
--     the tlav rebuild created idx_lessons_order as NON-unique, so add the intended
--     unique constraint first (safe — table is empty). This restores the invariant
--     "one lesson per (course, order)".
--
-- Dated AFTER the retire migration so a fresh rebuild: seeds demo -> retire clears ->
-- this seeds the real catalog. Fully idempotent (constraint guard + WHERE NOT EXISTS
-- on title + ON CONFLICT DO NOTHING). Verified 2026-07-23: no NOT-NULL-without-default
-- columns outside the insert lists.

-- 1) Restore the intended unique invariant the lesson upsert relies on.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_course_order_key'
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_course_order_key UNIQUE (course_id, order_index);
  END IF;
END $$;

-- 2) Courses (6). Idempotent via WHERE NOT EXISTS on title.
INSERT INTO public.courses (id, title, slug, description, price_pence, currency, is_active)
SELECT v.id, v.title, v.slug, v.description, v.price_pence, v.currency, v.is_active
FROM (VALUES
  (gen_random_uuid(), 'Vibe Coding Foundations',          'vibe-coding-foundations',  'Build 3 real apps with zero prior coding knowledge. Learn to vibe code with AI: prompt to build to ship. 4 weeks, 5-7 hrs/week. Perfect for complete beginners.',                                          0,    'gbp', true),
  (gen_random_uuid(), 'Hyper Prompt Master',              'hyper-prompt-master',       'Level up from copy-paste prompts to real engineering flows. Debug with AI, refactor existing code, and build features end-to-end. For Builders who want to ship faster.',                                 2900, 'gbp', true),
  (gen_random_uuid(), 'MVP Sprint',                       'mvp-sprint',                'Go from idea to deployed product in one sprint. Spec to implement to test to ship. Covers system prompts, product thinking, and building full-stack apps with taste.',                                   4900, 'gbp', true),
  (gen_random_uuid(), 'Hyperfocus HTML & CSS Quick Wins', 'hyperfocus-html-css',       'Short, spicy builds for brains that bounce. Ship 3 real pages in 3 focused sessions. Perfect for ADHD coders who hate 40-hour tutorial marathons.',                                                   1999, 'gbp', true),
  (gen_random_uuid(), 'Component Chaos Lab',              'component-chaos-lab',       'Build 8-10 reusable React + TypeScript components you will actually use again. Wire shared state with Zustand. Document with Storybook. Ship once, reuse forever.',                                      3999, 'gbp', true),
  (gen_random_uuid(), 'Ship Your First Full Stack Thing', 'ship-full-stack',           'React 19 + Supabase + Stripe + Vercel. One brain, one weekend, one deployable app. Build a real brag-worthy full stack project without the 60-hour bootcamp waffle.',                                 4999, 'gbp', true)
) AS v(id, title, slug, description, price_pence, currency, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.title = v.title);

-- 3) Lessons for "Vibe Coding Foundations" (11). course_id resolved by title subquery.
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
