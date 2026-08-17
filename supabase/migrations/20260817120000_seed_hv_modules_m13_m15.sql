-- Batch 1 of the Builder OS expansion (M13-M20). Adds the module rows for
-- M13-M15 -- content and quizzes land in the two migrations that follow
-- this one in the same PR, applied in that order (content/quiz UPDATE and
-- INSERT statements key off `code`/`id`, so this must land first).
--
-- Source material: PR #46 (branch docs/builder-os-m13-m20, not merged --
-- its raw spec files aren't the hv_modules content format, see that PR's
-- description). Content adapted from the specs into this course's real
-- module template; see the content migration for the adapted lesson body.
--
-- Reward numbers: taken directly from each spec's own header line, which
-- form an internally consistent escalating curve above M11/M12's existing
-- Elite-tier ceiling (150/100, 100/50) -- confirmed no other Level headers
-- in M14-M20 conflict with an in-body schema default the way M13's did
-- (M13's spec header says +100 XP/+50 BROski$; its own micro_wins table
-- SQL example defaults to 10/5 -- that 10/5 describes the *feature being
-- taught*, not this module's own completion reward, so it's intentionally
-- not used here).
--
-- script_path intentionally points at the real PR #46 source file, not
-- scripts/M13-....md -- that path already exists in this repo pointing at
-- a completely unrelated, older M13 (a different numbering track, see
-- CLAUDE.md/WHATS_DONE history). The live pipeline never reads script_path
-- at runtime (content lives in the DB, not on disk), so this is purely
-- provenance metadata -- kept deliberately non-colliding.

insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M13', 'Micro-Wins Dev Flow',        '🏆', 'Advanced', 100, 50, 'micro-wins-dev-flow',        'rewrites/M13_MICRO_WINS_DEV_FLOW.md', 13),
  ('M14', 'HyperSplit Agent',           '🧩', 'Advanced', 120, 60, 'hypersplit-agent',            'rewrites/M14_HYPERSPLIT_AGENT.md',    14),
  ('M15', 'Session Snapshot & Morning Briefing', '📸', 'Advanced', 130, 70, 'session-snapshot-morning-briefing', 'rewrites/M15_SESSION_SNAPSHOT.md', 15)
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
