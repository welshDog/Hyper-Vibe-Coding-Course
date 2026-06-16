-- Migration: pets_by_discord RPC
--
-- Called by the Discord bot (anon key) to fetch a user's Supabase-persisted
-- pets without needing the service_role key. SECURITY DEFINER lets it join
-- discord_links → pets despite the caller having no direct table access.
-- Returns empty set when the Discord ID isn't linked or has no pets.

CREATE OR REPLACE FUNCTION pets_by_discord(p_discord_id text)
RETURNS TABLE (
  id              uuid,
  pet_id          text,
  species_id      text,
  pet_name        text,
  rarity          text,
  stage           text,
  mood            text,
  evolution_count integer,
  last_evolved_at timestamptz,
  mint_tx_hash    text,
  chain_id        integer,
  created_at      timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.pet_id,
    p.species_id,
    p.pet_name,
    p.rarity,
    p.stage,
    p.mood,
    p.evolution_count,
    p.last_evolved_at,
    p.mint_tx_hash,
    p.chain_id,
    p.created_at
  FROM pets p
  JOIN discord_links dl ON dl.user_id = p.user_id
  WHERE dl.discord_id = p_discord_id
  ORDER BY p.created_at DESC;
$$;

-- Intentionally grant to anon so the bot's anon key can call it.
-- The function only returns data the Discord user owns (via discord_links join).
GRANT EXECUTE ON FUNCTION pets_by_discord(text) TO anon, authenticated;
