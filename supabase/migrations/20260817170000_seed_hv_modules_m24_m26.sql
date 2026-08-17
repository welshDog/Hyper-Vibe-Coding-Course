-- Batch 2 of the M21-M30 expansion. Closes Track A ("Agent Ops &
-- Guardrails") with M24-M25, opens Track B ("Token Economies & On-Chain
-- Craft") with M26. Content and quizzes land in the two migrations that
-- follow this one in the same PR, applied in that order.
--
-- Same authoring approach as Batch 1 (M21-M23): no source document for
-- these topics anywhere in the repo, content originated fresh, grounded
-- in real systems this ecosystem already runs (Prometheus/Grafana stack,
-- M17's Focus Panic Mode, award_tokens()'s real dedup rule). script_path
-- reflects that honestly rather than implying a source file that doesn't
-- exist.
--
-- Reward numbers continue the curve confirmed in the M21-M30 plan:
-- Hyper-Pro tier, climbing 190->210 across this batch.

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M24', 'Prometheus + Grafana for Vibe Coders', '📈', 'Hyper-Pro', 190, 100, 'prometheus-grafana-for-vibe-coders', 'authored-fresh-no-source-doc', 24),
  ('M25', 'Incident Response, ND Style',          '🧯', 'Hyper-Pro', 200, 105, 'incident-response-nd-style',        'authored-fresh-no-source-doc', 25),
  ('M26', 'Designing a Reward Economy',           '💰', 'Hyper-Pro', 210, 110, 'designing-a-reward-economy',        'authored-fresh-no-source-doc', 26)
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
