-- ═══════════════════════════════════════════════════════════════════════════
-- 20260606231810: harden_early_access_signups_rls
--
-- Applied to prod via Supabase MCP apply_migration (yhtmuibgdnxhbgboajhc).
-- This file mirrors the remote migration for parallel git tracking — DO NOT
-- run `supabase db push` (local migration filenames are desynced from remote
-- schema_migrations history).
--
-- Why:
--   Supabase advisor lint 0024 (rls_policy_always_true) flagged the original
--   `anon insert early_access` policy: WITH CHECK (true) lets any anon insert
--   any payload with no guardrail. General hardening pass, no live incident.
--
-- Design:
--   Aligns with Option A in rewrites/SUPABASE_ADVISOR_FIX_PLAN_2026-05-27.md.
--   Keeps anon + authenticated INSERT (the founding-member page is anonymous
--   by design) but tightens the WITH CHECK to require:
--     - email not null, 6..320 chars, contains '@'
--     - name not null, trimmed length 1..100
--   `source` is intentionally NOT whitelisted — per the original
--   20260520000000_early_access_signups.sql design note, new entry points
--   (Discord drops, IG bio, etc.) should not require a schema change.
--
-- Spam guardrail:
--   The existing unique index `early_access_signups_email_key` on
--   `lower(email)` continues to dedupe resubmits — frontend
--   (frontend/src/lib/earlyAccess.ts) folds 23505 into a friendly success.
--
-- Verified post-deploy via anon-role smoke (all in BEGIN/ROLLBACK):
--   - happy path inserts (200 OK)
--   - email without '@' → blocked (42501)
--   - email shorter than 6 chars → blocked (42501)
--   - blank name → blocked (42501)
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "anon insert early_access" on public.early_access_signups;

create policy "anon insert early_access"
  on public.early_access_signups
  for insert
  to anon, authenticated
  with check (
    email is not null
    and char_length(email) between 6 and 320
    and email like '%@%'
    and name is not null
    and char_length(btrim(name)) between 1 and 100
  );

comment on policy "anon insert early_access" on public.early_access_signups is
  'Minimal-validation INSERT for the founding-member waitlist. Replaces WITH CHECK (true). Unique index on lower(email) remains the dedup/spam guardrail; source stays open by design.';
