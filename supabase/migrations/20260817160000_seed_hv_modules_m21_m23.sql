-- Batch 1 of the M21-M30 expansion ("Agent Ops & Guardrails" track opens).
-- Adds module rows for M21-M23 -- content and quizzes land in the two
-- migrations that follow this one in the same PR, applied in that order.
--
-- Unlike M13-M20 (adapted from PR #46's specs), M21-M30 have no existing
-- source document -- confirmed via repo-wide search before authoring
-- (nothing commits to M21+ topics anywhere: BUSINESS_PLAN.md, the stale
-- trackers, PR #46's own plan doc all stop at or before M20). Content is
-- originated fresh, grounded in real systems this ecosystem already runs
-- (multi-agent patterns, approval gates, Prometheus/Grafana observability)
-- rather than generic filler. script_path reflects that honestly rather
-- than implying a source file that doesn't exist -- the live pipeline
-- never reads script_path at runtime regardless (content lives in
-- hv_modules.content, not on disk).
--
-- Reward numbers continue the real M1-M20 curve (confirmed via SQL before
-- writing this migration): Hyper-Pro tier, climbing 160->200 across this
-- batch, matching M13-M20's own ~0.52-0.56 coin:XP ratio.

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M21', 'Multi-Agent Crews',              '🐝', 'Hyper-Pro', 160, 85, 'multi-agent-crews',              'authored-fresh-no-source-doc', 21),
  ('M22', 'Approval Gates & Guardrails',    '🚦', 'Hyper-Pro', 170, 90, 'approval-gates-guardrails',      'authored-fresh-no-source-doc', 22),
  ('M23', 'Watching Your Agents: Action Logs', '🔍', 'Hyper-Pro', 180, 95, 'watching-your-agents-action-logs', 'authored-fresh-no-source-doc', 23)
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
