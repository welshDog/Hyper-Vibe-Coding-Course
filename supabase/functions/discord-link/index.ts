import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveSupabaseAdminKey } from "../_shared/supabaseAdminKey.mjs";
import { createDiscordLinkHandler } from "./handler.ts";

const SUPABASE_URL = (globalThis as any).Deno?.env?.get("SUPABASE_URL") ?? "";
const DISCORD_CLIENT_ID = (globalThis as any).Deno?.env?.get("DISCORD_CLIENT_ID") ?? "";
const DISCORD_CLIENT_SECRET = (globalThis as any).Deno?.env?.get("DISCORD_CLIENT_SECRET") ?? "";

// State freshness window for the mint-then-consume OAuth state check.
const STATE_FRESHNESS_MINUTES = 10;

// Validate redirect_uri to prevent misuse of the Discord code exchange.
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:4173",
  "https://hyper-vibe-coding-course.vercel.app",
  "https://hypervibe.online",
]);

function resolveAdminKey(): string {
  return resolveSupabaseAdminKey(
    {
      SUPABASE_SECRET_KEYS: (globalThis as any).Deno?.env?.get("SUPABASE_SECRET_KEYS") ?? "",
      SUPABASE_SECRET_KEY: (globalThis as any).Deno?.env?.get("SUPABASE_SECRET_KEY") ?? "",
    },
    "discord_link",
  );
}

function createSupabaseAdmin() {
  return createClient(SUPABASE_URL, resolveAdminKey());
}

const handler = createDiscordLinkHandler({
  env: {
    discordClientId: DISCORD_CLIENT_ID,
    discordClientSecret: DISCORD_CLIENT_SECRET,
  },
  allowedOrigins: ALLOWED_ORIGINS,

  getAuthenticatedUser: async (authHeader) => {
    const userClient = createClient(
      SUPABASE_URL,
      (globalThis as any).Deno?.env?.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return null;
    return { id: user.id };
  },

  mintState: async (userId) => {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from("discord_oauth_states")
      .insert({ user_id: userId })
      .select("state")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "state insert returned no row");
    }
    return (data as { state: string }).state;
  },

  consumeState: async (state, userId) => {
    const admin = createSupabaseAdmin();
    const cutoff = new Date(Date.now() - STATE_FRESHNESS_MINUTES * 60_000).toISOString();
    const { data, error } = await admin
      .from("discord_oauth_states")
      .delete()
      .eq("state", state)
      .eq("user_id", userId)
      .gt("created_at", cutoff)
      .select("state");
    if (error) {
      throw new Error(error.message);
    }
    return Array.isArray(data) && data.length === 1;
  },

  exchangeCode: async (code, redirectUri) => {
    const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      return { error: `${tokenResp.status} ${errText}` };
    }
    const { access_token } = await tokenResp.json() as { access_token: string };
    return { accessToken: access_token };
  },

  fetchDiscordProfile: async (accessToken) => {
    const resp = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) return null;
    const user = await resp.json() as { id: string; username: string; global_name?: string | null };
    return { id: user.id, username: user.username, globalName: user.global_name ?? null };
  },

  upsertLink: async (userId, discordId, displayName) => {
    const admin = createSupabaseAdmin();
    const { error } = await admin.from("discord_links").upsert(
      {
        user_id: userId,
        discord_id: discordId,
        discord_username: displayName,
        linked_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) {
      if (error.code === "23505") return { conflict: true };
      return { error: error.message };
    }
    return { ok: true };
  },
});

(globalThis as any).Deno?.serve(handler);
