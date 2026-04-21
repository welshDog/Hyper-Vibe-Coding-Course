-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000015: Add full_name + avatar_url to users,
--                   fix user_loyalty_tier VIEW (graceful display_name fallback)
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Add missing columns ────────────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name  text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- ── 2. Replace user_loyalty_tier VIEW ────────────────────────────────────────
-- Uses COALESCE(full_name, email) so the view works even before
-- a user has set their display name.

DROP VIEW IF EXISTS public.user_loyalty_tier;

CREATE OR REPLACE VIEW public.user_loyalty_tier AS
SELECT
  u.id                                                           AS user_id,
  COALESCE(u.full_name, u.email)                                 AS display_name,
  COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0)
                                                                 AS lifetime_earned,
  CASE
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 1500 THEN 'hyper'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 500  THEN 'gold'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 100  THEN 'silver'
    ELSE 'bronze'
  END                                                            AS tier
FROM public.users u
LEFT JOIN public.token_transactions tt ON tt.user_id = u.id
GROUP BY u.id, u.full_name, u.email;

-- ── Verify (uncomment to test manually) ──────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'users'
-- ORDER BY ordinal_position;
--
-- SELECT * FROM public.user_loyalty_tier LIMIT 5;

COMMIT;
