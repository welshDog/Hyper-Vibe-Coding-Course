-- Batch 2 of the Builder OS expansion (M13-M20). Adds module rows for
-- M16-M18 -- content and quizzes land in the two migrations that follow
-- this one in the same PR, applied in that order.
--
-- Source: PR #46 (branch docs/builder-os-m13-m20, not merged) specs,
-- adapted into this course's real module template -- see
-- 20260817120000_seed_hv_modules_m13_m15.sql for the full rationale
-- (source, reward-number policy, script_path collision note) shared by
-- every batch in this expansion.
--
-- Reward numbers taken directly from each spec's own header line; no
-- internal header-vs-schema conflict found in M16-M18 (checked, same as
-- confirmed for M14-M20 as a group in Batch 1).

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M16', 'Energy-Aware Build Mode', '🔋', 'Advanced', 140, 75, 'energy-aware-build-mode', 'rewrites/M16_ENERGY_AWARE_BUILD_MODE.md', 16),
  ('M17', 'Focus Panic Mode',        '🪂', 'Advanced', 150, 80, 'focus-panic-mode',        'rewrites/M17_FOCUS_PANIC_MODE.md',        17),
  ('M18', 'Personal Dev Dashboard',  '🎛️', 'Advanced', 160, 90, 'personal-dev-dashboard',  'rewrites/M18_PERSONAL_DEV_DASHBOARD.md',  18)
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
