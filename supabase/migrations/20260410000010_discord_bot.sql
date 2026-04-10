-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Discord bot support
-- Date: 2026-04-10
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 1. discord_links — maps Discord user IDs to platform user UUIDs
-- 2. leaderboard_top() — RPC for bot /leaderboard command
-- ═══════════════════════════════════════════════════════════════════════════

-- ── discord_links ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.discord_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT NOT NULL UNIQUE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  linked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.discord_links ENABLE ROW LEVEL SECURITY;

-- Users can see their own link; service role (bot) can read/write all
CREATE POLICY "Users can read their own discord link"
  ON public.discord_links FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_discord_links_discord_id ON public.discord_links(discord_id);
CREATE INDEX IF NOT EXISTS idx_discord_links_user_id    ON public.discord_links(user_id);

-- ── leaderboard_top RPC ───────────────────────────────────────────────────────
-- Called by the Discord bot with service role key (bypasses RLS).
-- Returns top N users by total XP, joining to public.users for display name.
CREATE OR REPLACE FUNCTION public.leaderboard_top(row_limit integer DEFAULT 10)
RETURNS TABLE (
  user_id    UUID,
  full_name  TEXT,
  email      TEXT,
  total_xp   BIGINT,
  badge_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    u.id            AS user_id,
    u.full_name,
    u.email,
    COALESCE(SUM(a.xp_awarded), 0)::BIGINT AS total_xp,
    COUNT(a.id)::BIGINT                     AS badge_count
  FROM public.users u
  LEFT JOIN public.achievements a ON a.user_id = u.id
  GROUP BY u.id, u.full_name, u.email
  ORDER BY total_xp DESC
  LIMIT row_limit;
$$;
