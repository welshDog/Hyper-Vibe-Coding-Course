-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000014: BROski$ Shop — shop_items, shop_purchases, content_unlocks,
--                   user_loyalty_tier VIEW, purchase_shop_item() function
-- Idempotent — safe to re-run.
-- Requires: 000011 (token_transactions, award_tokens, spend_tokens)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. shop_items ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shop_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  description  text,
  price_tokens integer     NOT NULL CHECK (price_tokens >= 0),
  price_gbp    numeric(8,2),                   -- NULL = token-only item
  category     text        NOT NULL DEFAULT 'general',
  is_available boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Public: anyone can see available items (browse without logging in)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_items'
      AND policyname = 'shop_items_public_read'
  ) THEN
    CREATE POLICY shop_items_public_read ON public.shop_items
      FOR SELECT USING (is_available = true);
  END IF;
END $$;

-- service_role manages catalogue (INSERT/UPDATE/DELETE — no policy needed;
-- service_role bypasses RLS by default in Supabase)

-- ── 2. shop_purchases ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shop_purchases (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id       uuid        NOT NULL REFERENCES public.shop_items(id) ON DELETE RESTRICT,
  spent_tokens  integer     NOT NULL CHECK (spent_tokens >= 0),
  purchased_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)          -- one purchase per item per user
);

ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

-- Users read their own purchase history
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_purchases'
      AND policyname = 'shop_purchases_owner_read'
  ) THEN
    CREATE POLICY shop_purchases_owner_read ON public.shop_purchases
      FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ── 3. content_unlocks ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_unlocks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_ref  text        NOT NULL,  -- e.g. 'lesson:abc123' or 'module:2'
  unlocked_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_ref)
);

ALTER TABLE public.content_unlocks ENABLE ROW LEVEL SECURITY;

-- Users read their own unlocks (drives gated-content UI)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'content_unlocks'
      AND policyname = 'content_unlocks_owner_read'
  ) THEN
    CREATE POLICY content_unlocks_owner_read ON public.content_unlocks
      FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ── 4. user_loyalty_tier VIEW ─────────────────────────────────────────────────
-- Tier is computed from CUMULATIVE tokens ever earned (positive txns only),
-- not the current spendable balance — so spending doesn't demote you.

CREATE OR REPLACE VIEW public.user_loyalty_tier AS
SELECT
  u.id                             AS user_id,
  u.full_name,
  COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0)
                                   AS lifetime_earned,
  CASE
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 1500 THEN 'hyper'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 500  THEN 'gold'
    WHEN COALESCE(SUM(CASE WHEN tt.amount > 0 THEN tt.amount ELSE 0 END), 0) >= 100  THEN 'silver'
    ELSE 'bronze'
  END                              AS tier
FROM public.users u
LEFT JOIN public.token_transactions tt ON tt.user_id = u.id
GROUP BY u.id, u.full_name;

-- Anon/authenticated read own row only — enforce in app layer or wrap in RPC.
-- The VIEW itself carries no RLS; callers should filter by user_id = auth.uid().

-- ── 5. purchase_shop_item() ───────────────────────────────────────────────────
-- Atomic purchase: validate → spend tokens → record purchase → unlock content.
-- Runs as SECURITY DEFINER so it can write shop_purchases / content_unlocks
-- even though those tables have no INSERT policy for authenticated users.

CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      uuid := auth.uid();
  v_item         public.shop_items%ROWTYPE;
  v_spend_result jsonb;
  v_purchase_id  uuid;
  v_content_ref  text;
BEGIN
  -- ── Guard: must be authenticated ────────────────────────────────────────────
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- ── Fetch item ───────────────────────────────────────────────────────────────
  SELECT * INTO v_item FROM public.shop_items WHERE id = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_not_found');
  END IF;

  IF NOT v_item.is_available THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_unavailable');
  END IF;

  -- ── Guard: already purchased (UNIQUE enforced at DB level too) ───────────────
  IF EXISTS (
    SELECT 1 FROM public.shop_purchases
    WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_purchased');
  END IF;

  -- ── Spend tokens ─────────────────────────────────────────────────────────────
  v_spend_result := public.spend_tokens(
    v_user_id,
    v_item.price_tokens,
    'shop_purchase',
    p_item_id::text
  );

  IF NOT (v_spend_result->>'ok')::boolean THEN
    RETURN jsonb_build_object(
      'ok',    false,
      'error', COALESCE(v_spend_result->>'error', 'spend_failed')
    );
  END IF;

  -- ── Record purchase ──────────────────────────────────────────────────────────
  INSERT INTO public.shop_purchases (user_id, item_id, spent_tokens)
  VALUES (v_user_id, p_item_id, v_item.price_tokens)
  ON CONFLICT (user_id, item_id) DO NOTHING
  RETURNING id INTO v_purchase_id;

  -- ── Unlock content if applicable ─────────────────────────────────────────────
  IF v_item.category = 'bonus_content' THEN
    v_content_ref := 'shop_item:' || p_item_id::text;

    INSERT INTO public.content_unlocks (user_id, content_ref)
    VALUES (v_user_id, v_content_ref)
    ON CONFLICT (user_id, content_ref) DO NOTHING;
  END IF;

  -- ── Return success ───────────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',          true,
    'purchase_id', v_purchase_id,
    'item_id',     p_item_id,
    'spent',       v_item.price_tokens,
    'new_balance', (v_spend_result->>'new_balance')::integer
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ── Lock down purchase_shop_item() ────────────────────────────────────────────
-- Callable only from server-side (service_role / Edge Functions).
-- Prevents a browser from calling it directly via PostgREST.

REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.purchase_shop_item(uuid) TO service_role;

-- ── Verify (uncomment to test manually) ──────────────────────────────────────
-- SELECT * FROM public.shop_items;
-- SELECT * FROM public.user_loyalty_tier LIMIT 10;
-- SELECT has_function_privilege('authenticated', 'public.purchase_shop_item(uuid)', 'EXECUTE');
-- ^ should return f (false)

COMMIT;
