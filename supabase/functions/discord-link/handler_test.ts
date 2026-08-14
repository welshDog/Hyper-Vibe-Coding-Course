import { assertEquals } from "jsr:@std/assert";
import { createDiscordLinkHandler, type DiscordLinkDeps } from "./handler.ts";

const USER = { id: "11111111-1111-4111-8111-111111111111" };
const OTHER_USER = { id: "22222222-2222-4222-8222-222222222222" };
const ALLOWED_ORIGIN = "https://hypervibe.online";
const REDIRECT_URI = `${ALLOWED_ORIGIN}/auth/discord/callback`;

function makeDeps(overrides: Partial<DiscordLinkDeps> = {}): DiscordLinkDeps {
  return {
    env: { discordClientId: "client-id", discordClientSecret: "client-secret" },
    allowedOrigins: new Set([ALLOWED_ORIGIN]),
    getAuthenticatedUser: async () => USER,
    mintState: async () => "state-123",
    consumeState: async (state, userId) => state === "state-123" && userId === USER.id,
    exchangeCode: async () => ({ accessToken: "discord-access-token" }),
    fetchDiscordProfile: async () => ({ id: "discord-1", username: "welshdog", globalName: "WelshDog" }),
    upsertLink: async () => ({ ok: true }),
    ...overrides,
  };
}

function authedRequest(method: string, body?: unknown): Request {
  return new Request("http://local.test/discord-link", {
    method,
    headers: {
      Authorization: "Bearer valid-jwt",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

Deno.test("discord-link rejects unsupported methods", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(new Request("http://local.test", { method: "DELETE" }));
  assertEquals(response.status, 405);
});

Deno.test("discord-link handles OPTIONS preflight without auth", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(new Request("http://local.test", { method: "OPTIONS" }));
  assertEquals(response.status, 200);
});

Deno.test("GET (start) rejects requests with no Authorization header", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(new Request("http://local.test", { method: "GET" }));
  assertEquals(response.status, 401);
});

Deno.test("GET (start) mints and returns a state for the authenticated user", async () => {
  let mintedFor = "";
  const handler = createDiscordLinkHandler(
    makeDeps({
      mintState: async (userId) => {
        mintedFor = userId;
        return "fresh-state";
      },
    }),
  );
  const response = await handler(authedRequest("GET"));
  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.state, "fresh-state");
  assertEquals(mintedFor, USER.id);
});

Deno.test("POST (exchange) rejects requests with no Authorization header", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(
    new Request("http://local.test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
    }),
  );
  assertEquals(response.status, 401);
});

Deno.test("POST (exchange) rejects a missing state", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI }));
  assertEquals(response.status, 400);
});

Deno.test("POST (exchange) rejects a redirect_uri whose origin isn't allowlisted", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(
    authedRequest("POST", {
      code: "abc",
      redirect_uri: "https://evil.example.com/auth/discord/callback",
      state: "state-123",
    }),
  );
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Redirect URI not allowed");
});

Deno.test("POST (exchange) rejects a state that was never minted (forged)", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "forged-state" }),
  );
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Invalid or expired state — please try connecting again");
});

Deno.test("POST (exchange) rejects a state minted for a different user (cross-user CSRF)", async () => {
  const handler = createDiscordLinkHandler(
    makeDeps({
      // consumeState is only ever asked to check against the CALLER's id
      // (the authenticated user), so simulate the state having actually
      // been minted for someone else by having the check fail.
      consumeState: async (state, userId) => state === "state-123" && userId === OTHER_USER.id,
    }),
  );
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(response.status, 400);
});

Deno.test("POST (exchange) rejects a replayed (already-consumed) state", async () => {
  let calls = 0;
  const handler = createDiscordLinkHandler(
    makeDeps({
      consumeState: async () => {
        calls++;
        return calls === 1; // valid the first time, gone the second
      },
    }),
  );
  const first = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(first.status, 200);
  const second = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(second.status, 400);
});

Deno.test("POST (exchange) succeeds with a valid state and allowlisted origin", async () => {
  const handler = createDiscordLinkHandler(makeDeps());
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.discord_id, "discord-1");
  assertEquals(body.discord_username, "WelshDog");
});

Deno.test("POST (exchange) returns 503 when Discord isn't configured", async () => {
  const handler = createDiscordLinkHandler(
    makeDeps({ env: { discordClientId: "", discordClientSecret: "" } }),
  );
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(response.status, 503);
});

Deno.test("POST (exchange) returns 409 on a duplicate Discord account link", async () => {
  const handler = createDiscordLinkHandler(
    makeDeps({ upsertLink: async () => ({ conflict: true }) }),
  );
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(response.status, 409);
});

Deno.test("POST (exchange) returns 400 when the Discord code exchange fails", async () => {
  const handler = createDiscordLinkHandler(
    makeDeps({ exchangeCode: async () => ({ error: "invalid_grant" }) }),
  );
  const response = await handler(
    authedRequest("POST", { code: "abc", redirect_uri: REDIRECT_URI, state: "state-123" }),
  );
  assertEquals(response.status, 400);
});
