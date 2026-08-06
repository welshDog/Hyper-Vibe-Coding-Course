-- Wave 1 learner-flow RLS audit
-- Covers the current frontend-facing tables/views from auth, courses,
-- pets, tokens, shop, referrals, Discord, and legacy lesson flows.

with target_relations as (
  select *
  from (
    values
      ('public', 'users'),
      ('public', 'user_xp'),
      ('public', 'xp_events'),
      ('public', 'module_completions'),
      ('public', 'hv_modules'),
      ('public', 'hv_quizzes'),
      ('public', 'pets'),
      ('public', 'shop_items'),
      ('public', 'shop_purchases'),
      ('public', 'token_transactions'),
      ('public', 'referrals'),
      ('public', 'discord_links'),
      ('public', 'quests'),
      ('public', 'user_quests'),
      ('public', 'achievements'),
      ('public', 'enrollments'),
      ('public', 'courses'),
      ('public', 'lessons'),
      ('public', 'progress'),
      ('public', 'payments'),
      ('public', 'playtest_responses'),
      ('public', 'certificates'),
      ('public', 'quiz_attempts'),
      ('public', 'quiz_questions'),
      ('public', 'user_level_progress'),
      ('public', 'waitlist'),
      ('public', 'early_access_signups'),
      ('public', 'rifts'),
      ('public', 'top_pets'),
      ('public', 'leaderboard'),
      ('public', 'user_loyalty_tier')
  ) as v(schema_name, relation_name)
)
select
  t.schema_name,
  t.relation_name,
  c.relkind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  coalesce(
    string_agg(distinct p.polname || ':' || p.cmd, ', ' order by p.polname || ':' || p.cmd),
    '(none)'
  ) as policies
from target_relations t
left join pg_class c
  on c.oid = to_regclass(format('%I.%I', t.schema_name, t.relation_name))
left join (
  select schemaname, tablename, policyname as polname, cmd
  from pg_policies
) p
  on p.schemaname = t.schema_name
 and p.tablename = t.relation_name
group by
  t.schema_name,
  t.relation_name,
  c.relkind,
  c.relrowsecurity,
  c.relforcerowsecurity
order by t.relation_name;
