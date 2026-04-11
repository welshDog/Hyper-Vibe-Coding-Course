-- seed-shop-items.sql
-- Idempotent seed for shop_items.
-- Uses explicit UUIDs so ON CONFLICT (id) DO NOTHING is safe on re-runs.
--
-- Run against your Supabase DB:
--   supabase db reset                                          (dev)
--   psql $DATABASE_URL -f supabase/seed-shop-items.sql        (targeted)
--
-- To update a description or price after initial seed, use UPDATE manually —
-- re-seeding a row with the same id is a no-op by design.

INSERT INTO public.shop_items (id, name, description, price_tokens, price_gbp, category, is_available)
VALUES
  (
    '11111111-0001-0000-0000-000000000001',
    'Hyper Prompt Pack Vol.1',
    '25 battle-tested prompts for shipping faster with AI. Copy, paste, ship.',
    50,
    NULL,
    'prompt_pack',
    TRUE
  ),
  (
    '11111111-0002-0000-0000-000000000002',
    'Module 2 Deep Dive',
    'Extended walkthrough: build a full SaaS in 2 hours. 90 minutes of bonus footage.',
    200,
    NULL,
    'bonus_content',
    TRUE
  ),
  (
    '11111111-0003-0000-0000-000000000003',
    'Project Review Slot',
    '30-min 1-on-1 review of your capstone project. Real feedback, no fluff.',
    500,
    NULL,
    'coaching',
    TRUE
  ),
  (
    '11111111-0004-0000-0000-000000000004',
    'Gold Profile Frame',
    'Show off your Hyper status with a gold profile border. Flex responsibly.',
    100,
    NULL,
    'cosmetic',
    TRUE
  ),
  (
    '11111111-0005-0000-0000-000000000005',
    'AI Tools Cheat Sheet',
    'The 10 AI tools every vibe coder needs in 2026. Bookmarkable PDF included.',
    30,
    NULL,
    'prompt_pack',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
