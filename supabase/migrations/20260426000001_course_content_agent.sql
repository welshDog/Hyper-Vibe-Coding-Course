-- ============================================================
-- 🤖 Course Content Agent — DB Migration
-- Hyper-Vibe Coding Course | welshDog | April 2026
-- ============================================================

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'hv_asset_status') then
    create type hv_asset_status as enum ('draft', 'ready', 'recorded', 'edited', 'published');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'hv_quiz_type') then
    create type hv_quiz_type as enum ('multiple_choice', 'true_false', 'practical');
  end if;
end $$;

-- ============================================================
-- TABLE: hv_modules
-- One row per course module (M1–M12)
-- ============================================================
create table if not exists public.hv_modules (
  id             uuid        primary key default gen_random_uuid(),
  code           text        not null unique,              -- 'M1', 'M2' … 'M12'
  title          text        not null,                    -- '🌱 Your First Vibe'
  emoji          text        not null default '📦',       -- module icon
  level          text        not null,                    -- 'Beginner' | 'Intermediate' | 'Hyper-Pro' | 'Elite'
  xp_reward      integer     not null default 0,
  coin_reward    integer     not null default 0,          -- BROski$ coins
  slug           text        not null unique,             -- 'your-first-vibe'
  summary        text,                                   -- first "what you'll learn" block
  script_path    text        not null,                   -- 'scripts/M2-your-first-vibe.md'
  sort_order     integer     not null default 0,          -- 1, 2, 3 … for ordering

  status_script  hv_asset_status not null default 'draft',
  status_video   hv_asset_status not null default 'draft',
  status_podcast hv_asset_status not null default 'draft',

  content_hash   text,                                   -- sha256 of script file — agent uses this to detect changes

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists hv_modules_code_idx       on public.hv_modules (code);
create index if not exists hv_modules_slug_idx       on public.hv_modules (slug);
create index if not exists hv_modules_sort_order_idx on public.hv_modules (sort_order);
create index if not exists hv_modules_updated_at_idx on public.hv_modules (updated_at desc);

-- Auto-update updated_at on any row change
create or replace function public.hv_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hv_modules_updated_at on public.hv_modules;
create trigger hv_modules_updated_at
  before update on public.hv_modules
  for each row execute procedure public.hv_set_updated_at();

-- ============================================================
-- TABLE: hv_quizzes
-- Quiz payload per module — matches the Hyper-Vibe Quiz Pack format
-- (multiple_choice, true_false, practical)
-- ============================================================
create table if not exists public.hv_quizzes (
  id          uuid    primary key default gen_random_uuid(),
  module_id   uuid    not null references public.hv_modules(id) on delete cascade,
  source      text    not null default 'claude-auto',  -- 'manual' | 'claude-auto'
  version     integer not null default 1,
  payload     jsonb   not null,                        -- see payload shape below
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (module_id, version)
);

-- payload shape matches the Quiz Pack structure:
-- {
--   "module_code": "M2",
--   "title": "Quiz: 🌱 Your First Vibe",
--   "questions": [
--     {
--       "id": "q1",
--       "type": "multiple_choice",
--       "prompt": "What is the engine that holds your entire empire in a box?",
--       "choices": ["Chrome", "Docker Desktop", "Windows Media Player"],
--       "answer_index": 1,
--       "explanation": "Docker Desktop is the engine. It must be running (whale icon) before anything starts."
--     },
--     {
--       "id": "q5",
--       "type": "practical",
--       "prompt": "Run docker compose up -d and verify Mission Control loads at http://localhost:8088",
--       "answer_index": null,
--       "explanation": null
--     }
--   ]
-- }

create index if not exists hv_quizzes_module_id_idx  on public.hv_quizzes (module_id);
create index if not exists hv_quizzes_updated_at_idx on public.hv_quizzes (updated_at desc);

drop trigger if exists hv_quizzes_updated_at on public.hv_quizzes;
create trigger hv_quizzes_updated_at
  before update on public.hv_quizzes
  for each row execute procedure public.hv_set_updated_at();

-- ============================================================
-- TABLE: hv_agent_runs
-- Audit trail — every time the Course Content Agent runs
-- ============================================================
create table if not exists public.hv_agent_runs (
  id           uuid  primary key default gen_random_uuid(),
  trigger      text  not null,             -- 'cron' | 'manual' | 'webhook'
  modules_scanned  integer not null default 0,
  modules_changed  integer not null default 0,
  quizzes_written  integer not null default 0,
  errors       jsonb,                      -- any errors caught
  duration_ms  integer,
  run_at       timestamptz not null default now()
);

create index if not exists hv_agent_runs_run_at_idx on public.hv_agent_runs (run_at desc);

-- ============================================================
-- RLS — read = safe public/auth. write = service_role only.
-- ============================================================
alter table public.hv_modules    enable row level security;
alter table public.hv_quizzes    enable row level security;
alter table public.hv_agent_runs enable row level security;

-- Modules: anyone can read
drop policy if exists hv_modules_read on public.hv_modules;
create policy hv_modules_read
  on public.hv_modules for select
  to anon, authenticated
  using (true);

-- Quizzes: authenticated students only
drop policy if exists hv_quizzes_read on public.hv_quizzes;
create policy hv_quizzes_read
  on public.hv_quizzes for select
  to authenticated
  using (true);

-- Agent runs: authenticated only (admin panel)
drop policy if exists hv_agent_runs_read on public.hv_agent_runs;
create policy hv_agent_runs_read
  on public.hv_agent_runs for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policies on any table.
-- Backend agent uses service_role key (bypasses RLS) to write.

-- ============================================================
-- SEED: hv_modules — all 12 modules from the Quiz Pack
-- ============================================================
insert into public.hv_modules
  (code, title, emoji, level, xp_reward, coin_reward, slug, script_path, sort_order)
values
  ('M1',  'Designing Your Focus Zone',     '🧘', 'Beginner',     30,  10, 'designing-your-focus-zone',     'scripts/M1-designing-your-focus-zone.md',     1),
  ('M2',  'Your First Vibe',               '🌱', 'Beginner',     50,  20, 'your-first-vibe',               'scripts/M2-your-first-vibe.md',               2),
  ('M3',  'Prompt Like a Pro',             '🎤', 'Beginner',     30,  10, 'prompt-like-a-pro',             'scripts/M3-prompt-like-a-pro.md',             3),
  ('M4',  'Build Your First App',          '🏗',  'Beginner',     40,  15, 'build-your-first-app',          'scripts/M4-build-your-first-app.md',          4),
  ('M5',  'Full Stack Vibe',               '🧠', 'Intermediate', 50,  20, 'full-stack-vibe',               'scripts/M5-full-stack-vibe.md',               5),
  ('M6',  'HyperCode The Hyper Way',       '🔥', 'Advanced',     75,  30, 'hypercode-the-hyper-way',       'scripts/M6-hypercode-the-hyper-way.md',       6),
  ('M7',  'Agent Architecture & Manifests','🛠',  'Advanced',     70,  25, 'agent-architecture-manifests',  'scripts/M7-agent-architecture-manifests.md',  7),
  ('M8',  'Soulful Entities & AI Pets',    '🐕', 'Advanced',     70,  25, 'soulful-entities-ai-pets',      'scripts/M8-soulful-entities-ai-pets.md',      8),
  ('M9',  'Web3 Integration & On-Chain',   '🔗', 'Hyper-Pro',    80,  35, 'web3-integration-on-chain',     'scripts/M9-web3-integration-on-chain.md',     9),
  ('M10', 'Security & SRE Observability',  '🛡',  'Hyper-Pro',    80,  35, 'security-sre-observability',    'scripts/M10-security-sre-observability.md',   10),
  ('M11', 'Ship, Scale & Graduate',        '🚀', 'Elite',        150, 100,'ship-scale-graduate',           'scripts/M11-ship-scale-graduate.md',          11),
  ('M12', 'The Ride or Die Contribution',  '🤝', 'Elite',        100, 50, 'ride-or-die-contribution',      'scripts/M12-ride-or-die-contribution.md',     12)
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
