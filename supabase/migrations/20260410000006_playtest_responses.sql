create table if not exists public.playtest_responses (
  id               uuid primary key default gen_random_uuid(),
  tester_type      text not null,
  platform_description text,
  target_audience  text,
  would_pay        boolean,
  pay_reason       text,
  confusion        text,
  loved            text,
  overall_rating   integer check (overall_rating between 1 and 5),
  created_at       timestamptz not null default now()
);

alter table public.playtest_responses enable row level security;

create policy "anyone_can_submit_feedback"
  on public.playtest_responses
  for insert to public
  with check (true);

-- Admin read only via service role — no public SELECT policy
