-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000020: Fix user_loyalty_tier security model
--
-- Problem (SECURITY advisory from Supabase linter):
--   The view was created by the postgres role (superuser) without
--   WITH (security_invoker = true). Postgres views run with the OWNER's
--   privileges by default — effectively SECURITY DEFINER. Because postgres
--   is a superuser, all RLS policies on the underlying tables (users,
--   token_transactions) were bypassed when the view was queried.
--
--   Consequence: any authenticated user could call
--     GET /rest/v1/user_loyalty_tier
--   without a filter and receive ALL users' tier data.
--
-- Fix: WITH (security_invoker = true) — available from Postgres 15 (which
--   Supabase runs). The view now executes with the QUERYING USER's rights.
--   RLS on users (own-row only) and token_transactions (own-rows only) is
--   enforced, so each caller can only ever aggregate their own data.
--
-- Also guards: payments.user_id FK index (in case linter advisory is current).
--
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Recreate view with security_invoker = true ─────────────────────────────

DROP VIEW IF EXISTS public.user_loyalty_tier;

CREATE VIEW public.user_loyalty_tier
  WITH (security_invoker = true)   -- RLS on users + token_transactions is enforced
AS
SELECT
  u.id                                                                   AS user_id,
  u.full_name                                                            AS display_name,
  COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0)  AS lifetime_earned,
  CASE
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 1500 THEN 'hyper'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 500  THEN 'gold'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 100  THEN 'silver'
    ELSE 'bronze'
  END                                                                    AS tier
FROM public.users u
LEFT JOIN public.token_transactions tt ON tt.user_id = u.id
GROUP BY u.id, u.full_name;

-- ── 2. Guard: payments.user_id FK index ───────────────────────────────────────
-- Migration 000019 dropped idx_payments_user_id (the 000008 duplicate) and
-- relied on idx_payments_user (000000) to cover the FK. If the linter advisory
-- is still current this IF NOT EXISTS is a safe no-op; if the index was somehow
-- also absent, this re-creates it cleanly.

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments (user_id);

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Confirm security_invoker is active:
-- SELECT viewname, definition
-- FROM pg_views
-- WHERE schemaname = 'public' AND viewname = 'user_loyalty_tier';
-- (look for "security_invoker=true" in the definition)
--
-- Confirm columns:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'user_loyalty_tier'
-- ORDER BY ordinal_position;
-- Expected: user_id | display_name | lifetime_earned | tier
--
-- Confirm payments index:
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'payments';

COMMIT;
