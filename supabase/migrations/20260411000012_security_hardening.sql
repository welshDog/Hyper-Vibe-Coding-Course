-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Security hardening — achievements policy + function permissions
-- Date: 2026-04-11
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Changes:
--   1. Lock public.achievements inserts to service-role only (no INSERT policy)
--   2. Revoke award_tokens() + spend_tokens() from PUBLIC / anon / authenticated
--   3. Confirm SECURITY DEFINER + RLS interaction is safe (see comment block)
--
-- All statements are idempotent (DROP IF EXISTS, CREATE OR REPLACE, etc.)
-- Safe to re-run without side effects.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. public.achievements — INSERT policy ────────────────────────────────────
--
-- DECISION: service-role only. No INSERT policy for authenticated users.
--
-- Achievements are connected to the BROski$ token economy and milestone
-- banners. If a student could insert their own achievement row, they could
-- potentially trigger token awards or milestone thresholds client-side.
--
-- Postgres RLS behaviour: when NO INSERT policy exists on a table with RLS
-- enabled, all inserts from non-superuser roles are blocked by default.
-- Service role bypasses RLS entirely — so the Edge Functions and webhook
-- can still award badges freely.
--
-- All badge awards must go through server-side Edge Functions with the
-- service_role key. Never expose an insert path to the browser.

-- Drop any INSERT policies that may have been created under any name.
-- Leaves only the existing SELECT policy ("Users can read their own achievements")
-- intact — users can see their badges, never write them.
DROP POLICY IF EXISTS "Service role can insert achievements"    ON public.achievements;
DROP POLICY IF EXISTS "Service role inserts achievements"       ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;

-- No CREATE POLICY here — intentional. Zero INSERT access for anon/authenticated.
-- SELECT policy unchanged from migration 20260410000003:
--   "Users can read their own achievements"  USING (user_id = auth.uid())


-- ── 2. Harden award_tokens() and spend_tokens() ───────────────────────────────
--
-- By default Postgres grants EXECUTE on new functions to PUBLIC, meaning any
-- authenticated (or anonymous) user can call them via supabase.rpc().
--
-- These functions are SECURITY DEFINER — they run with elevated privileges
-- and modify broski_tokens on public.users. They must only be callable:
--   a. By the Postgres trigger on_lesson_completed() (SECURITY DEFINER, runs
--      as the function owner — a superuser — so unaffected by this REVOKE).
--   b. By the stripe-webhook Edge Function via the service_role key.
--
-- After this migration:
--   anon        → permission denied ✓
--   authenticated (browser/frontend) → permission denied ✓
--   service_role (Edge Function)     → allowed ✓
--   postgres / superuser (triggers)  → always allowed, unaffected by REVOKE ✓

-- award_tokens(p_user_id, p_amount, p_reason, p_stripe_payment_intent_id, p_source_id)
REVOKE EXECUTE
  ON FUNCTION public.award_tokens(uuid, integer, text, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
  ON FUNCTION public.award_tokens(uuid, integer, text, text, text)
  TO service_role;

-- spend_tokens(p_user_id, p_amount, p_reason, p_source_id)
REVOKE EXECUTE
  ON FUNCTION public.spend_tokens(uuid, integer, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
  ON FUNCTION public.spend_tokens(uuid, integer, text, text)
  TO service_role;


-- ── 3. SECURITY DEFINER + public.users RLS — safety confirmation ──────────────
--
-- public.users has RLS enabled (since migration 20260312000002).
-- award_tokens() and spend_tokens() both UPDATE public.users directly.
--
-- WHY THIS IS SAFE:
--   Both functions are declared SECURITY DEFINER with SET search_path = public.
--   In Supabase, functions created via migrations are owned by the `postgres`
--   role, which is a superuser. PostgreSQL superusers bypass RLS entirely —
--   RLS is only evaluated for non-superuser roles.
--
--   Therefore: when award_tokens() / spend_tokens() run, they execute as
--   `postgres` and the UPDATE on public.users succeeds regardless of the
--   authenticated user's RLS policies. The functions themselves are the
--   security boundary — they validate user_id via their own logic, not RLS.
--
--   SET search_path = public prevents search path injection attacks where a
--   malicious schema could shadow public.users with a fake table.
--
-- CALL CHAIN (verified safe):
--
--   [Browser] progress upsert (authenticated role)
--       → Postgres trigger fires on_lesson_completed()
--       → SECURITY DEFINER, runs as postgres (superuser)
--       → calls award_tokens()
--       → SECURITY DEFINER, runs as postgres (superuser)
--       → UPDATE public.users bypasses RLS ✓
--
--   [Stripe webhook Edge Function] supabaseAdmin.rpc('award_tokens', ...)
--       → connects as service_role
--       → service_role has EXECUTE (granted above)
--       → SECURITY DEFINER, runs as postgres (superuser)
--       → UPDATE public.users bypasses RLS ✓
--
--   [Browser] supabase.rpc('award_tokens', ...)  ← BLOCKED
--       → authenticated role has no EXECUTE (revoked above)
--       → permission denied before function body runs ✓

-- No SQL needed — this block is documentation only.
-- The safety guarantee comes from SECURITY DEFINER + superuser ownership,
-- established in migration 20260411000011.
