-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000018: Fix user_loyalty_tier VIEW — rename column
--
-- Problem: CREATE OR REPLACE VIEW cannot rename a column in place.
-- Postgres raised: "cannot change name of view column "full_name" to
-- "display_name"".  Solution: DROP the view then CREATE it fresh.
--
-- Impact: no tables dropped, no data lost. The VIEW is purely derived.
-- Any queries that used the old column name "full_name" must be updated
-- in application code before applying this migration.
--
-- Frontend audit (2026-04-11): ShopPage.tsx, Profile.tsx, Navbar.tsx all
-- select only "tier" and/or "lifetime_earned" — none read the name column.
-- No frontend changes required.
--
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- DROP first — the only safe way to rename a VIEW column in Postgres
DROP VIEW IF EXISTS public.user_loyalty_tier;

-- Recreate with display_name instead of full_name
CREATE VIEW public.user_loyalty_tier AS
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

-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'user_loyalty_tier'
-- ORDER BY ordinal_position;
-- Expected: user_id | display_name | lifetime_earned | tier

COMMIT;
