-- Part of edge-discord-link-callback-hardening (Wave 1 P1).
--
-- discord-link's OAuth `state` was only ever generated and checked
-- client-side (sessionStorage) -- the edge function itself never saw or
-- verified it, so the callback trust boundary wasn't enforced server-side.
-- This table backs a real mint-then-consume state check: the function
-- mints a row for the authenticated user before redirecting to Discord,
-- and consumes (deletes) it on callback only if the state matches AND
-- belongs to the same authenticated user AND is fresh. A forged, replayed,
-- or cross-user state is rejected server-side, not just by the browser.
--
-- No RLS policies: only the discord-link edge function (service-role admin
-- key) ever reads or writes this table. RLS is enabled anyway per this
-- project's convention of enabling it on every public table (default-deny
-- for anon/authenticated; the admin key bypasses RLS regardless).
create table if not exists public.discord_oauth_states (
  state      uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.discord_oauth_states enable row level security;

comment on table public.discord_oauth_states is
  'Single-use OAuth state nonces for the discord-link callback. Minted and consumed only by the discord-link edge function (admin key). Rows are deleted on successful consume; a 10-minute freshness check on consume makes any stale row harmless even without a cleanup job.';
