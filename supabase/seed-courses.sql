-- seed-courses.sql
-- Seeds the 4 Hyper Vibe courses into public.courses
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING on title
-- Run via: Supabase SQL Editor → paste → Run
--       or: supabase db reset (will include via supabase/seed.sql if referenced)

-- NOTE: instructor_id is left NULL — update with your real user UUID after first login.
-- To find your user UUID: SELECT id FROM public.users WHERE email = 'your@email.com';

BEGIN;

INSERT INTO public.courses (
  title,
  description,
  price,
  difficulty,
  duration_minutes,
  thumbnail_url,
  is_published
)
VALUES
  (
    'Vibe Coding Foundations',
    'Build 3 real apps with zero prior coding knowledge. Learn to vibe code with AI: prompt → build → ship. 4 weeks, 5–7 hrs/week. Perfect for complete beginners.',
    0.00,
    'beginner',
    120,
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    true
  ),
  (
    'Hyper Prompt Master',
    'Level up from copy-paste prompts to real engineering flows. Debug with AI, refactor existing code, and build features end-to-end. For Builders who want to ship faster.',
    29.00,
    'intermediate',
    300,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    true
  ),
  (
    'MVP Sprint',
    'Go from idea to deployed product in one sprint. Spec → implement → test → ship. Covers system prompts, product thinking, and building full-stack apps with taste.',
    49.00,
    'advanced',
    480,
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    true
  ),
  (
    'Hyperfocus HTML & CSS Quick Wins',
    'Short, spicy builds for brains that bounce. Ship 3 real pages in 3 focused sessions. Perfect for ADHD coders who hate 40-hour tutorial marathons.',
    19.99,
    'beginner',
    360,
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80',
    true
  ),
  (
    'Component Chaos Lab',
    'Build 8–10 reusable React + TypeScript components you will actually use again. Wire shared state with Zustand. Document with Storybook. Ship once, reuse forever.',
    39.99,
    'intermediate',
    600,
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
    true
  ),
  (
    'Ship Your First Full Stack Thing',
    'React 19 + Supabase + Stripe + Vercel. One brain, one weekend, one deployable app. Build a real brag-worthy full stack project without the 60-hour bootcamp waffle.',
    49.99,
    'intermediate',
    840,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    true
  )
ON CONFLICT (title) DO NOTHING;

-- Verify seed worked:
-- SELECT id, title, price, difficulty, is_published FROM public.courses ORDER BY created_at;

COMMIT;
