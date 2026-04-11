-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000022: Health report fixes — definitive view + index guard
--
-- Background:
--   The Supabase AI health check flagged ALTER VIEW errors in logs and a
--   missing payments.user_id index. The AI's suggested fix used a DIFFERENT
--   view definition (wrong column names, wrong tier values, wrong logic).
--   DO NOT apply the AI's suggestion — it breaks the frontend.
--
-- What actually needs fixing:
--   1. The ALTER VIEW errors are log noise from earlier migration attempts
--      (000018 → 000020). The live view is correct, but we re-drop + recreate
--      here as the single authoritative definition to silence future reports.
--   2. idx_payments_user already exists (added in migration 000020).
--      idx_payments_user_id was dropped in 000019 as a confirmed duplicate.
--      We add ONLY a CREATE INDEX IF NOT EXISTS guard for idx_payments_user —
--      no new index name, no duplicates.
--
-- Column contract (must match frontend queries in ShopPage, Profile, Navbar):
--   user_id        uuid    — filter: .eq('user_id', user.id)
--   display_name   text    — u.full_name aliased
--   lifetime_earned bigint — cumulative positive token_transactions (never shrinks on spend)
--   tier           text    — 'bronze' | 'silver' | 'gold' | 'hyper'
--                            LoyaltyTierBadge expects exactly these 4 values.
--
-- Tier thresholds (lifetime earned, NOT current balance):
--   hyper  ≥ 1500
--   gold   ≥ 500
--   silver ≥ 100
--   bronze < 100
--
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Definitive user_loyalty_tier view ──────────────────────────────────────
-- DROP + CREATE because Postgres cannot rename view columns in place.
-- security_invoker = true — RLS on users + token_transactions enforced.
-- Without this, any authenticated user can read ALL users' tier data.

DROP VIEW IF EXISTS public.user_loyalty_tier;

CREATE VIEW public.user_loyalty_tier
  WITH (security_invoker = true)
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

-- ── 2. Payments FK index guard ────────────────────────────────────────────────
-- idx_payments_user was created in 000020. This is a safety re-assertion only.
-- idx_payments_user_id (dropped in 000019 as a duplicate) is NOT re-created.

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments (user_id);

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Confirm view columns + security_invoker:
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'user_loyalty_tier'
-- ORDER BY ordinal_position;
-- Expected: user_id | display_name | lifetime_earned | tier
--
-- Confirm only ONE payments user_id index exists:
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'payments'
-- ORDER BY indexname;
-- Expected: idx_payments_user (not idx_payments_user_id)
--
-- Confirm security_invoker is set:
-- SELECT viewname, definition FROM pg_views
-- WHERE schemaname = 'public' AND viewname = 'user_loyalty_tier';
-- (look for security_invoker=true in the definition)

COMMIT;
