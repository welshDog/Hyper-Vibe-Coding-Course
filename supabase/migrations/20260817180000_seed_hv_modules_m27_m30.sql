-- Batch 3 (final) of the M21-M30 expansion. Finishes Track B ("Token
-- Economies & On-Chain Craft") with M27-M29, then closes the whole
-- M21-M30 arc with M30, the capstone -- mirroring M11/M12's role for the
-- original 12 modules. Content and quizzes land in the two migrations
-- that follow this one in the same PR, applied in that order.
--
-- Same authoring approach as Batches 1-2: no source document for these
-- topics anywhere in the repo, content originated fresh, grounded in
-- real systems this ecosystem already runs (this repo's own dashboard
-- patterns, BROskiPets' real on-chain/off-chain split, the real
-- wagmi/rainbowkit /pets-only isolation rule). script_path reflects
-- that honestly rather than implying a source file that doesn't exist.
--
-- Reward numbers continue the curve confirmed in the M21-M30 plan:
-- Hyper-Pro tier 220->240 across M27-M29, then a bigger Elite-tier jump
-- to 280/160 for the M30 capstone (echoing M11's jump over M10).

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M27', 'Building a Living Dashboard',      '📊', 'Hyper-Pro', 220, 115, 'building-a-living-dashboard',      'authored-fresh-no-source-doc', 27),
  ('M28', 'On-Chain Basics for Builders',      '⛓️', 'Hyper-Pro', 230, 120, 'on-chain-basics-for-builders',      'authored-fresh-no-source-doc', 28),
  ('M29', 'Safe Web3 Integration Patterns',    '🔐', 'Hyper-Pro', 240, 125, 'safe-web3-integration-patterns',    'authored-fresh-no-source-doc', 29),
  ('M30', 'Launch Day: Ship Your Empire',      '🎓', 'Elite',     280, 160, 'launch-day-ship-your-empire',       'authored-fresh-no-source-doc', 30)
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
