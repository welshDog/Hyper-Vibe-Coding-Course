-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: security + perf fixes
-- Date: 2026-04-26
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1) Fix avatar_url references by restoring the column (backward-compatible).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) Recreate leaderboard view with invoker security (no definer/bypass behavior).
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = true) AS
SELECT
  COALESCE(NULLIF(u.full_name, ''), 'Anonymous BROski') AS display_name,
  u.avatar_url,
  ux.total_xp,
  ux.level,
  ux.streak_days,
  COALESCE(u.broski_tokens, 0) AS tokens,
  ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) AS rank
FROM public.user_xp ux
JOIN public.users u ON u.id = ux.user_id
ORDER BY ux.total_xp DESC
LIMIT 50;

ALTER VIEW public.leaderboard OWNER TO postgres;
GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- 3) pending_enrollments: authenticated users can read rows for their own email.
ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pending_enrollments_own_read" ON public.pending_enrollments;
CREATE POLICY "pending_enrollments_own_read"
  ON public.pending_enrollments
  FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- 4) RLS perf: wrap auth.uid() calls.
DROP POLICY IF EXISTS "admin_write_rifts" ON public.rifts;
CREATE POLICY "admin_write_rifts"
  ON public.rifts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid()) AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "user_quests_own_read" ON public.user_quests;
CREATE POLICY "user_quests_own_read"
  ON public.user_quests
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_quests_own_insert" ON public.user_quests;
CREATE POLICY "user_quests_own_insert"
  ON public.user_quests
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 5) Pin search_path for SECURITY DEFINER / trigger helpers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_referral_code  TEXT;
  v_referrer_id    UUID;
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Apply any courses paid for before account creation
  PERFORM public.apply_pending_enrollments(NEW.email, NEW.id);

  -- Process referral code if provided at signup
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    SELECT user_id INTO v_referrer_id
      FROM public.referral_codes
     WHERE code = v_referral_code;

    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
      -- Record the referral
      INSERT INTO public.referrals
        (referrer_user_id, referred_user_id, referred_email, tokens_awarded, rewarded_at)
      VALUES
        (v_referrer_id, NEW.id, NEW.email, 100, NOW())
      ON CONFLICT (referrer_user_id, referred_email) DO NOTHING;

      -- Award 100 BROski$ to the referrer (idempotent via source_id dedup)
      PERFORM public.award_tokens(
        p_user_id   := v_referrer_id,
        p_amount    := 100,
        p_reason    := 'referral',
        p_source_id := NEW.id::TEXT
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hv_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

COMMIT;

