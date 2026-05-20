-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 20260520000000: early_access_signups (founding-member waitlist)
--
-- Why:
--   The /early-access landing page captures name + email for the Founding
--   Member launch (max 20% off, time-limited — see marketing.md rules). It
--   ships as a pure marketing surface — no auth gate, anon visitors must be
--   able to sign themselves up.
--
-- Schema:
--   id          uuid pk
--   name        text not null
--   email       text not null  — kept in user's original casing for display
--   source      text not null default 'early-access-page'  — analytics tag,
--                 lets us add more entry points later (Discord drop, IG bio
--                 link, etc.) without a schema change
--   created_at  timestamptz
--
--   Case-insensitive unique on lower(email) — re-submits from the same email
--   are caught at the DB layer, so the form can show "you're already in"
--   instead of a duplicate row. Storing original casing means we never lose
--   the display form a user typed.
--
-- RLS:
--   - INSERT allowed for anon + authenticated (anyone can sign themselves up)
--   - NO SELECT policy → anon cannot harvest the list. Reads only via the
--     service_role key (admin tooling) or the dashboard.
--   - NO UPDATE / DELETE → row is append-only from the public surface.
--
-- Idempotent — IF NOT EXISTS / DROP POLICY IF EXISTS / CREATE OR REPLACE.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Table ───────────────────────────────────────────────────────────────
create table if not exists public.early_access_signups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  source      text not null default 'early-access-page',
  created_at  timestamptz not null default now()
);

-- Case-insensitive unique on email. Storing as text (not citext) so we don't
-- depend on the citext extension; the unique index on lower(email) gives us
-- the same dedup guarantee, and the trim happens client-side before insert.
create unique index if not exists early_access_signups_email_key
  on public.early_access_signups (lower(email));

create index if not exists early_access_signups_created_at_idx
  on public.early_access_signups (created_at desc);

-- ── 2. RLS ─────────────────────────────────────────────────────────────────
alter table public.early_access_signups enable row level security;

-- Anyone (anon or signed-in) can add themselves. The unique index on
-- lower(email) prevents duplicate rows at the DB layer; the page treats the
-- 23505 (unique_violation) as "you're already in", not an error.
drop policy if exists "anon insert early_access" on public.early_access_signups;
create policy "anon insert early_access"
  on public.early_access_signups
  for insert
  to anon, authenticated
  with check (true);

-- Deliberately no SELECT / UPDATE / DELETE policy — RLS denies by default,
-- which means anon cannot read the list (no email harvesting) and admin
-- access goes through the service_role key only.

-- ── 3. Grants ──────────────────────────────────────────────────────────────
grant insert on public.early_access_signups to anon, authenticated;
