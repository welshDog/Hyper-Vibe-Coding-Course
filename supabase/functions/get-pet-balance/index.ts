// supabase/functions/get-pet-balance/index.ts
//
// Returns the calling user's BROski$ balance and whether they can afford to
// mint a BROskiPet. Used by <MintPetButton /> for the live balance indicator.
//
// JWT-verified — RLS on users table prevents cross-account reads.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return json(null, 204);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return json({ error: "Unauthorized" }, 401);

  const { data, error: dbErr } = await supabase
    .from("users")
    .select("broski_tokens")
    .eq("id", user.id)
    .single();

  if (dbErr) return json({ error: "Could not fetch balance" }, 500);

  const balance = data?.broski_tokens ?? 0;
  return json({
    broski_tokens: balance,
    mint_cost:     100,
    can_mint:      balance >= 100,
  }, 200);
});

function json(body: unknown, status: number): Response {
  return new Response(body === null ? "" : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type":                 "application/json",
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}
