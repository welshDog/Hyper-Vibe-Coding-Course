-- seed-courses.sql
-- Seeds the 6 Hyper Vibe courses into public.courses
-- Safe to run multiple times — uses WHERE NOT EXISTS guard
-- Run via: Supabase SQL Editor → paste → Run

-- Actual schema: id (text), title, slug, description, price_pence (int), currency (text), is_active (bool)
-- NOTE: price_pence is in pence (GBP). e.g. £29 = 2900

INSERT INTO public.courses (id, title, slug, description, price_pence, currency, is_active)
SELECT v.id, v.title, v.slug, v.description, v.price_pence, v.currency, v.is_active
FROM (VALUES
  (gen_random_uuid()::text, 'Vibe Coding Foundations',         'vibe-coding-foundations',  'Build 3 real apps with zero prior coding knowledge. Learn to vibe code with AI: prompt to build to ship. 4 weeks, 5-7 hrs/week. Perfect for complete beginners.',                                          0,    'gbp', true),
  (gen_random_uuid()::text, 'Hyper Prompt Master',             'hyper-prompt-master',       'Level up from copy-paste prompts to real engineering flows. Debug with AI, refactor existing code, and build features end-to-end. For Builders who want to ship faster.',                                 2900, 'gbp', true),
  (gen_random_uuid()::text, 'MVP Sprint',                      'mvp-sprint',                'Go from idea to deployed product in one sprint. Spec to implement to test to ship. Covers system prompts, product thinking, and building full-stack apps with taste.',                                   4900, 'gbp', true),
  (gen_random_uuid()::text, 'Hyperfocus HTML & CSS Quick Wins','hyperfocus-html-css',        'Short, spicy builds for brains that bounce. Ship 3 real pages in 3 focused sessions. Perfect for ADHD coders who hate 40-hour tutorial marathons.',                                                   1999, 'gbp', true),
  (gen_random_uuid()::text, 'Component Chaos Lab',             'component-chaos-lab',       'Build 8-10 reusable React + TypeScript components you will actually use again. Wire shared state with Zustand. Document with Storybook. Ship once, reuse forever.',                                      3999, 'gbp', true),
  (gen_random_uuid()::text, 'Ship Your First Full Stack Thing','ship-full-stack',            'React 19 + Supabase + Stripe + Vercel. One brain, one weekend, one deployable app. Build a real brag-worthy full stack project without the 60-hour bootcamp waffle.',                                 4999, 'gbp', true)
) AS v(id, title, slug, description, price_pence, currency, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.title = v.title);

-- Verify seed worked:
-- SELECT id, title, slug, price_pence, is_active FROM public.courses ORDER BY created_at;
