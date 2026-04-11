-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 000021: Shop metadata + Agent Sandbox Access item
--
-- Changes:
--   1. shop_items.metadata JSONB — arbitrary per-item data (type, v24_tier, etc.)
--      Used by shop-purchase Edge Function to branch behaviour after purchase.
--      Default '{}' — existing items unaffected.
--
--   2. shop_purchases.fulfillment_metadata JSONB — stores the result of async
--      fulfillment (e.g. pending V2.4 provisioning state, access token delivery
--      timestamp). Nullable — only set when an item has post-purchase side-effects.
--
--   3. GIN index on shop_items.metadata — supports fast WHERE metadata @> '{"type":"agent_access"}'
--      queries. Used by admin tools and the graduate script.
--
--   4. Seed: "Agent Sandbox Access" shop item
--      category: agent_access, price: 300 tokens
--      metadata: { "type": "agent_access", "v24_tier": "sandbox" }
--      Purchasing this item triggers V2.4 provisioning (Phase 3 of integration plan).
--      For now, shop-purchase Edge Function sets fulfillment_metadata.status = 'pending_provisioning'
--      until V2.4 provision-access endpoint is live.
--
-- Idempotent — safe to re-run.
-- Requires: 000014 (shop_items, shop_purchases tables)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Add metadata column to shop_items ────────────────────────────────────

ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.shop_items.metadata IS
  'Arbitrary item-level data. Recognised keys:
   type (text): "agent_access" triggers V2.4 provisioning after purchase.
   v24_tier (text): access tier to provision in V2.4 ("sandbox" | "level4").
   content_url (text): direct download/access URL for content items.';

-- ── 2. Add fulfillment_metadata column to shop_purchases ────────────────────

ALTER TABLE public.shop_purchases
  ADD COLUMN IF NOT EXISTS fulfillment_metadata JSONB;

COMMENT ON COLUMN public.shop_purchases.fulfillment_metadata IS
  'Set by the shop-purchase Edge Function when a purchase has async side-effects.
   Example (agent_access pending provisioning):
     { "status": "pending_provisioning", "queued_at": "2026-04-11T..." }
   Example (provisioned):
     { "status": "provisioned", "provisioned_at": "2026-04-11T...", "v24_api_key_hint": "hvb_...xx" }';

-- ── 3. GIN index on shop_items.metadata ─────────────────────────────────────
-- Enables efficient WHERE metadata @> '{"type":"agent_access"}' queries.

CREATE INDEX IF NOT EXISTS idx_shop_items_metadata
  ON public.shop_items USING GIN (metadata jsonb_path_ops);

-- ── 4. Seed: Agent Sandbox Access ────────────────────────────────────────────
-- Stable UUID — idempotent via ON CONFLICT (id) DO UPDATE.
-- DO UPDATE (not DO NOTHING) so the description/price can be tuned in future
-- re-runs of this migration during dev without manual UPDATEs.

INSERT INTO public.shop_items
  (id, name, description, price_tokens, price_gbp, category, is_available, metadata)
VALUES (
  '22222222-0001-0000-0000-000000000001',
  'Agent Sandbox Access',
  'Unlock your personal HyperCode V2.4 sandbox. Deploy the agents you build in this course to a real AI dev stack. Comes with your own Mission Control dashboard and API key.',
  300,
  NULL,
  'agent_access',
  TRUE,
  '{"type":"agent_access","v24_tier":"sandbox"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  price_tokens = EXCLUDED.price_tokens,
  metadata     = EXCLUDED.metadata;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Confirm columns:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('shop_items', 'shop_purchases')
--   AND column_name IN ('metadata', 'fulfillment_metadata')
-- ORDER BY table_name, column_name;
--
-- Confirm agent_access item:
-- SELECT id, name, category, price_tokens, metadata
-- FROM public.shop_items
-- WHERE metadata @> '{"type":"agent_access"}';

COMMIT;
