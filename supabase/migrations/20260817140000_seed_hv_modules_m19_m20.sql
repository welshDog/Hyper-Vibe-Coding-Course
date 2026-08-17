-- Batch 3 (final) of the Builder OS expansion (M13-M20). Adds module rows
-- for M19-M20 -- content and quizzes land in the two migrations that
-- follow this one in the same PR, applied in that order.
--
-- These two use PR #46's "Vibe Coding Craft" track label rather than
-- "Neurodivergent Builder OS" (M13-M18) -- a natural sub-track shift in
-- the source specs, kept as-authored rather than forced to match M13-M18.
--
-- Source, reward-number policy, script_path collision note: see
-- 20260817120000_seed_hv_modules_m13_m15.sql (Batch 1), shared by every
-- batch in this expansion. No internal header-vs-schema conflict found in
-- M19-M20 (confirmed as part of the full M14-M20 check during Batch 1).

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M19', 'The Vibe Loop',        '🔁', 'Advanced', 150, 80, 'the-vibe-loop',        'rewrites/M19_THE_VIBE_LOOP.md',        19),
  ('M20', 'Context Is Currency',  '🗂️', 'Advanced', 150, 80, 'context-is-currency',  'rewrites/M20_CONTEXT_IS_CURRENCY.md',  20)
on conflict (code) do update set
  title        = excluded.title,
  emoji        = excluded.emoji,
  level        = excluded.level,
  xp_reward    = excluded.xp_reward,
  coin_reward  = excluded.coin_reward,
  slug         = excluded.slug,
  script_path  = excluded.script_path,
  sort_order   = excluded.sort_order,
  updated_at   = now();
