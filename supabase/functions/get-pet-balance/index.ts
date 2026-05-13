// supabase/functions/get-pet-balance/index.ts
//
// Returns the calling user's BROski$ balance and whether they can afford to
// mint a BROskiPet. Used by <MintPetButton /> for the live balance indicator.
//
// JWT-verified — RLS on users table prevents cross-account reads.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };

  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401, corsHeaders);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return json({ error: "Unauthorized" }, 401, corsHeaders);

  const { data, error: dbErr } = await supabase
    .from("users")
    .select("broski_tokens")
    .eq("id", user.id)
    .single();

  if (dbErr) return json({ error: "Could not fetch balance" }, 500, corsHeaders);

  const balance = data?.broski_tokens ?? 0;
  return json({
    broski_tokens: balance,
    mint_cost:     100,
    can_mint:      balance >= 100,
  }, 200, corsHeaders);
});

function json(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(body === null ? "" : JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type":                 "application/json",
    },
  });
}
