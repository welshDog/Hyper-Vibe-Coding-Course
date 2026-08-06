import { assertEquals } from "jsr:@std/assert";
import {
  createGenerateV2ConfigHandler,
  type GenerateV2ConfigDeps,
} from "./handler.ts";

function makeDeps(): GenerateV2ConfigDeps {
  return {
    env: {
      supabaseUrl: "https://example.supabase.co",
      v24SyncSecret: "sync-secret",
      shopSyncSecret: "shop-secret",
      v24ApiUrl: "https://v24.example.com",
      coreUrl: "http://localhost:8000",
      missionControlFallbackUrl: "http://localhost:8088",
    },
    resolveAdminKey: () => "sb_secret_example",
    resolveDiscordLink: async () => null,
    listPurchases: async () => [],
    provisionAccess: async () =>
      new Response(JSON.stringify({ status: "provisioned" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  };
}

Deno.test("generate-v2-config rejects non-POST requests", async () => {
  const handler = createGenerateV2ConfigHandler(makeDeps());
  const response = await handler(new Request("http://local.test", { method: "GET" }));
  assertEquals(response.status, 405);
});

Deno.test("generate-v2-config rejects missing X-Sync-Secret", async () => {
  const handler = createGenerateV2ConfigHandler(makeDeps());
  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "11111111-1111-4111-8111-111111111111" }),
    }),
  );
  assertEquals(response.status, 401);
});

Deno.test("generate-v2-config rejects bearer-auth-only browser calls", async () => {
  const handler = createGenerateV2ConfigHandler(makeDeps());
  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer browser-user-jwt",
      },
      body: JSON.stringify({ user_id: "11111111-1111-4111-8111-111111111111" }),
    }),
  );
  assertEquals(response.status, 401);
});

Deno.test("generate-v2-config rejects invalid user_id schema", async () => {
  const handler = createGenerateV2ConfigHandler(makeDeps());
  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": "sync-secret",
      },
      body: JSON.stringify({ user_id: "not-a-uuid" }),
    }),
  );
  assertEquals(response.status, 400);
});

Deno.test("generate-v2-config rejects discord_id conflicts with linked account", async () => {
  const handler = createGenerateV2ConfigHandler({
    ...makeDeps(),
    resolveDiscordLink: async () => "db-discord-123",
    listPurchases: async () => [
      {
        id: "purchase-ok",
        shop_items: { metadata: { type: "agent_access", v24_tier: "sandbox" } },
      },
    ],
  });

  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": "sync-secret",
      },
      body: JSON.stringify({
        user_id: "11111111-1111-4111-8111-111111111111",
        discord_id: "caller-discord-999",
      }),
    }),
  );

  assertEquals(response.status, 409);
});

Deno.test("generate-v2-config skips failed agent_access rows and selects the newest qualifying purchase", async () => {
  let capturedPayload: unknown = null;
  const handler = createGenerateV2ConfigHandler({
    ...makeDeps(),
    resolveDiscordLink: async () => "db-discord-123",
    listPurchases: async () => [
      {
        id: "purchase-failed",
        purchased_at: "2026-08-06T12:00:00Z",
        fulfillment_metadata: { provision_status: "failed" },
        shop_items: { metadata: { type: "agent_access", v24_tier: "sandbox" } },
      },
      {
        id: "purchase-good",
        purchased_at: "2026-08-05T12:00:00Z",
        fulfillment_metadata: { provision_status: "pending" },
        shop_items: { metadata: { type: "agent_access", v24_tier: "sandbox" } },
      },
    ],
    provisionAccess: async (payload) => {
      capturedPayload = payload;
      return new Response(JSON.stringify({ status: "provisioned", api_key: "api-key-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": "sync-secret",
      },
      body: JSON.stringify({ user_id: "11111111-1111-4111-8111-111111111111" }),
    }),
  );

  assertEquals(response.status, 200);
  assertEquals((capturedPayload as { purchase_id: string }).purchase_id, "purchase-good");
});

Deno.test("generate-v2-config calls downstream with SHOP_SYNC_SECRET and service-claimed user_id", async () => {
  let capturedSecret = "";
  let capturedPayload: unknown = null;

  const handler = createGenerateV2ConfigHandler({
    ...makeDeps(),
    resolveDiscordLink: async () => "db-discord-123",
    listPurchases: async () => [
      {
        id: "purchase-good",
        shop_items: { metadata: { type: "agent_access", v24_tier: "sandbox" } },
      },
    ],
    provisionAccess: async (payload, shopSyncSecret) => {
      capturedPayload = payload;
      capturedSecret = shopSyncSecret;
      return new Response(JSON.stringify({
        status: "provisioned",
        api_key: "live-api-key",
        mission_control_url: "https://mission.example.com",
        provision_event_id: "evt_123",
        expires_at: "2026-12-31T00:00:00Z",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": "sync-secret",
      },
      body: JSON.stringify({
        user_id: "11111111-1111-4111-8111-111111111111",
        display_name: "Lyndz",
        agent_names: ["Scout", "Builder"],
      }),
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(capturedSecret, "shop-secret");
  assertEquals((capturedPayload as { user_id: string }).user_id, "11111111-1111-4111-8111-111111111111");
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("generate-v2-config returns already_provisioned on downstream 409", async () => {
  const handler = createGenerateV2ConfigHandler({
    ...makeDeps(),
    resolveDiscordLink: async () => "db-discord-123",
    listPurchases: async () => [
      {
        id: "purchase-good",
        shop_items: { metadata: { type: "agent_access", v24_tier: "sandbox" } },
      },
    ],
    provisionAccess: async () =>
      new Response("already provisioned", { status: 409 }),
  });

  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": "sync-secret",
      },
      body: JSON.stringify({ user_id: "11111111-1111-4111-8111-111111111111" }),
    }),
  );

  const jsonBody = await response.json();
  assertEquals(response.status, 200);
  assertEquals(jsonBody.provision_status, "already_provisioned");
});
