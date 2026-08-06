import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveSupabaseAdminKey } from "../_shared/supabaseAdminKey.mjs";
import { createGenerateV2ConfigHandler } from "./handler.ts";

const SUPABASE_URL = (globalThis as any).Deno?.env?.get("SUPABASE_URL") ?? "";
const V24_API_URL = (globalThis as any).Deno?.env?.get("V24_API_URL") ?? "";
const SHOP_SYNC_SECRET = (globalThis as any).Deno?.env?.get("SHOP_SYNC_SECRET") ?? "";
const V24_SYNC_SECRET = (globalThis as any).Deno?.env?.get("V24_SYNC_SECRET") ?? "";

function createSupabaseAdmin() {
  const supabaseAdminKey = resolveSupabaseAdminKey(
    {
      SUPABASE_SECRET_KEYS: (globalThis as any).Deno?.env?.get("SUPABASE_SECRET_KEYS") ?? "",
      SUPABASE_SECRET_KEY: (globalThis as any).Deno?.env?.get("SUPABASE_SECRET_KEY") ?? "",
    },
    "generate_v2_config",
  );
  return createClient(SUPABASE_URL, supabaseAdminKey);
}

const handler = createGenerateV2ConfigHandler({
  env: {
    supabaseUrl: SUPABASE_URL,
    v24ApiUrl: V24_API_URL,
    shopSyncSecret: SHOP_SYNC_SECRET,
    v24SyncSecret: V24_SYNC_SECRET,
    coreUrl: "http://localhost:8000",
    missionControlFallbackUrl: "http://localhost:8088",
  },
  resolveAdminKey: () => "wired-via-resolveSupabaseAdminKey",
  resolveDiscordLink: async (userId) => {
    const supabaseAdmin = createSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from("discord_links")
      .select("discord_id")
      .eq("user_id", userId)
      .maybeSingle();
    return (data as { discord_id?: string } | null)?.discord_id ?? null;
  },
  listPurchases: async (userId) => {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("shop_purchases")
      .select("id, purchased_at, fulfillment_metadata, shop_items ( metadata )")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("generate-v2-config: shop_purchases lookup failed:", error.message);
      return [];
    }

    return (data ?? []) as Array<Record<string, unknown>>;
  },
  provisionAccess: async (payload, shopSyncSecret) => {
    const endpoint = `${V24_API_URL.replace(/\/$/, "")}/api/v1/access/provision`;
    return await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": shopSyncSecret,
      },
      body: JSON.stringify(payload),
    });
  },
});

(globalThis as any).Deno?.serve(handler);
