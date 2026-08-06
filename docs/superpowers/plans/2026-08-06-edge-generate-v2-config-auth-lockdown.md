# Edge Generate V2 Config Auth Lockdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `generate-v2-config` from a browser-shaped JWT endpoint into a strict service-only Edge Function that requires `X-Sync-Secret`, rejects browser CORS/JWT traffic, preserves server-authoritative entitlement checks, and keeps idempotent provisioning intact.

**Architecture:** Extract the request contract and decision logic into a small testable handler module with injected dependencies. Keep `index.ts` as a thin Deno bootstrap that wires the real Supabase lookups and downstream V2.4 fetch call, then deploy the function with `verify_jwt` off so the shared-secret contract is the actual gateway.

**Tech Stack:** Supabase Edge Functions (Deno + TypeScript), Supabase JS, Deno test, shared secret auth via `X-Sync-Secret`, scoped admin keys via `resolveSupabaseAdminKey`.

---

## Global Constraints

- Live target remains `tlavrxiaegbtyfmjfdcz`.
- `generate-v2-config` must become `POST`-only, `X-Sync-Secret`-only, and browser-CORS-free.
- Inbound auth is `V24_SYNC_SECRET`; outbound provisioning auth stays `SHOP_SYNC_SECRET`.
- `user_id` is service-claimed identity only; server-side Discord link and entitlement checks stay authoritative.
- `discord_id` mismatch against `discord_links` must hard fail with `409`.
- Qualifying entitlement means newest `agent_access` purchase that is not already marked `fulfillment_metadata.provision_status = 'failed'`.
- Because browser JWT auth is being removed, deployment must switch the function to `verify_jwt = false` with `supabase functions deploy ... --no-verify-jwt`.
- Do not add any frontend caller in this fix pack.

## File Map

**Create**
- `supabase/functions/generate-v2-config/handler.ts`
  - Pure request-contract handler with injected dependencies.
- `supabase/functions/generate-v2-config/handler_test.ts`
  - Deno contract tests for method/auth/schema/conflict/entitlement/downstream behavior.

**Modify**
- `supabase/functions/generate-v2-config/index.ts`
  - Thin bootstrap: env, Supabase client wiring, downstream fetch wiring, Deno serve.
- `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`
  - Flip `generate-v2-config` from `fail` to `pass` with the exact new trust contract.
- `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`
  - Record the fix completion and note the new proof.

---

### Task 1: Establish handler tests for method, secret auth, and schema validation

**Files:**
- Create: `supabase/functions/generate-v2-config/handler.ts`
- Create: `supabase/functions/generate-v2-config/handler_test.ts`

- [ ] **Step 1: Write the failing contract tests**

Create `supabase/functions/generate-v2-config/handler_test.ts` with this exact starting content:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts"
```

Expected: FAIL because `./handler.ts` does not exist yet.

- [ ] **Step 3: Write the minimal handler for method/auth/schema gates**

Create `supabase/functions/generate-v2-config/handler.ts` with this exact starting content:

```ts
type GenerateRequest = {
  user_id: string;
  discord_id?: string;
  display_name?: string;
  agent_names?: string[];
};

type PurchaseRow = {
  id: string;
  purchased_at?: string;
  fulfillment_metadata?: Record<string, unknown> | null;
  shop_items?: {
    metadata?: {
      type?: string;
      v24_tier?: string;
    } | null;
  } | null;
};

type ProvisionPayload = {
  purchase_id: string;
  user_id: string;
  discord_id: string | null;
  item_type: "agent_access";
  v24_tier: string;
  idempotency_key: string;
};

export type GenerateV2ConfigDeps = {
  env: {
    supabaseUrl: string;
    v24SyncSecret: string;
    shopSyncSecret: string;
    v24ApiUrl: string;
    coreUrl: string;
    missionControlFallbackUrl: string;
  };
  resolveAdminKey: () => string;
  resolveDiscordLink: (userId: string) => Promise<string | null>;
  listPurchases: (userId: string) => Promise<PurchaseRow[]>;
  provisionAccess: (
    payload: ProvisionPayload,
    shopSyncSecret: string,
  ) => Promise<Response>;
};

const JSON_HEADERS = { "Content-Type": "application/json" };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function parseRequestBody(input: unknown): GenerateRequest | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  if (typeof body.user_id !== "string" || !UUID_RE.test(body.user_id.trim())) {
    return null;
  }
  if (body.discord_id !== undefined && (typeof body.discord_id !== "string" || !body.discord_id.trim())) {
    return null;
  }
  if (body.display_name !== undefined && typeof body.display_name !== "string") {
    return null;
  }
  if (
    body.agent_names !== undefined &&
    (!Array.isArray(body.agent_names) || body.agent_names.some((value) => typeof value !== "string" || !value.trim()))
  ) {
    return null;
  }

  return {
    user_id: body.user_id.trim(),
    discord_id: typeof body.discord_id === "string" ? body.discord_id.trim() : undefined,
    display_name: typeof body.display_name === "string" ? body.display_name.trim() : undefined,
    agent_names: Array.isArray(body.agent_names) ? body.agent_names.map((value) => value.trim()) : undefined,
  };
}

export function createGenerateV2ConfigHandler(deps: GenerateV2ConfigDeps) {
  return async function handleGenerateV2Config(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return json(405, { success: false, error: "Method not allowed" });
    }

    if (!deps.env.v24SyncSecret) {
      return json(503, { success: false, error: "Service misconfigured" });
    }

    const providedSecret = req.headers.get("X-Sync-Secret");
    if (!providedSecret || providedSecret !== deps.env.v24SyncSecret) {
      return json(401, { success: false, error: "Unauthorized" });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return json(400, { success: false, error: "Invalid JSON body" });
    }

    const body = parseRequestBody(rawBody);
    if (!body) {
      return json(400, { success: false, error: "Invalid request body" });
    }

    return json(501, { success: false, error: "Not implemented yet", user_id: body.user_id });
  };
}
```

- [ ] **Step 4: Run the tests and confirm the gates pass**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts"
```

Expected: PASS for the four gate tests above.

- [ ] **Step 5: Commit the scaffolded handler**

```bash
git add supabase/functions/generate-v2-config/handler.ts supabase/functions/generate-v2-config/handler_test.ts
git commit -m "test(edge): scaffold generate-v2-config service handler"
```

---

### Task 2: Add server-authoritative Discord and qualifying purchase rules

**Files:**
- Modify: `supabase/functions/generate-v2-config/handler.ts`
- Modify: `supabase/functions/generate-v2-config/handler_test.ts`

- [ ] **Step 1: Add failing tests for Discord conflict and qualifying purchase lookup**

Append these tests to `supabase/functions/generate-v2-config/handler_test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts" --filter "discord_id conflicts|skips failed"
```

Expected: FAIL because the handler still returns `501` instead of enforcing these rules.

- [ ] **Step 3: Implement Discord conflict handling and qualifying purchase selection**

Update `supabase/functions/generate-v2-config/handler.ts` so it contains these helper functions and uses them inside `createGenerateV2ConfigHandler(...)`:

```ts
function getProvisionStatus(row: PurchaseRow): string | null {
  const value = row.fulfillment_metadata?.provision_status;
  return typeof value === "string" ? value : null;
}

function selectQualifyingPurchase(rows: PurchaseRow[]): { purchaseId: string; v24Tier: string } | null {
  for (const row of rows) {
    const itemType = row.shop_items?.metadata?.type ?? null;
    const provisionStatus = getProvisionStatus(row);
    if (itemType !== "agent_access") continue;
    if (provisionStatus === "failed") continue;
    return {
      purchaseId: row.id,
      v24Tier: row.shop_items?.metadata?.v24_tier ?? "sandbox",
    };
  }
  return null;
}

async function resolveEffectiveDiscordId(
  deps: GenerateV2ConfigDeps,
  userId: string,
  providedDiscordId?: string,
): Promise<{ ok: true; discordId: string | null } | { ok: false; response: Response }> {
  const linkedDiscordId = await deps.resolveDiscordLink(userId);

  if (providedDiscordId && linkedDiscordId && providedDiscordId !== linkedDiscordId) {
    return {
      ok: false,
      response: json(409, { success: false, error: "Discord ID conflict with linked account" }),
    };
  }

  return { ok: true, discordId: providedDiscordId ?? linkedDiscordId ?? null };
}
```

Then replace the `501` branch in `createGenerateV2ConfigHandler(...)` with:

```ts
    const discord = await resolveEffectiveDiscordId(deps, body.user_id, body.discord_id);
    if (!discord.ok) {
      return discord.response;
    }

    if (!discord.discordId) {
      return json(200, {
        success: false,
        error: "No discord_id linked to this Course account yet. Link Discord first.",
      });
    }

    const purchase = selectQualifyingPurchase(await deps.listPurchases(body.user_id));
    if (!purchase) {
      return json(200, {
        success: false,
        error: "No 'agent_access' purchase found for this user.",
      });
    }
```

- [ ] **Step 4: Run the tests and confirm the server-authoritative rules pass**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts"
```

Expected: PASS for the original gate tests plus the two new tests.

- [ ] **Step 5: Commit the authoritative-check changes**

```bash
git add supabase/functions/generate-v2-config/handler.ts supabase/functions/generate-v2-config/handler_test.ts
git commit -m "fix(edge): enforce generate-v2-config authority checks"
```

---

### Task 3: Preserve downstream provisioning and idempotent success behavior

**Files:**
- Modify: `supabase/functions/generate-v2-config/handler.ts`
- Modify: `supabase/functions/generate-v2-config/handler_test.ts`

- [ ] **Step 1: Add failing tests for downstream success, 409 idempotency, and no-CORS responses**

Append these tests to `supabase/functions/generate-v2-config/handler_test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts" --filter "calls downstream|already_provisioned"
```

Expected: FAIL because the handler does not yet call `provisionAccess(...)` or shape success bodies.

- [ ] **Step 3: Implement downstream success and idempotent 409 handling**

Update `supabase/functions/generate-v2-config/handler.ts` with these helpers:

```ts
function buildEnvTemplate(apiKey: string, discordId: string, coreUrl: string): string {
  return [
    `API_KEY=${apiKey}`,
    `CORE_URL=${coreUrl}`,
    `DISCORD_ID=${discordId}`,
    "DISCORD_TOKEN=",
  ].join("\n") + "\n";
}

function buildReadme(displayName: string | undefined, agentNames: string[] | undefined, missionControlUrl: string): string {
  const safeName = displayName?.trim() ? displayName.trim() : "BROski";
  const agentsLine = agentNames?.length ? agentNames.join(", ") : "(none)";
  return [
    `# HyperCode V2.4 — ${safeName}`,
    "",
    `Agents: ${agentsLine}`,
    "",
    "## Run",
    "",
    "```bash",
    "docker compose -f docker-compose.nano.yml up --build",
    "```",
    "",
    "## Mission Control",
    "",
    missionControlUrl,
    "",
  ].join("\n");
}
```

Then finish the happy-path branch in `createGenerateV2ConfigHandler(...)` with:

```ts
    const provisionPayload: ProvisionPayload = {
      purchase_id: purchase.purchaseId,
      user_id: body.user_id,
      discord_id: discord.discordId,
      item_type: "agent_access",
      v24_tier: purchase.v24Tier,
      idempotency_key: `shop_purchase:${purchase.purchaseId}`,
    };

    const provisionRes = await deps.provisionAccess(provisionPayload, deps.env.shopSyncSecret);

    if (provisionRes.status === 409) {
      return json(200, {
        success: true,
        api_key: "",
        env_template: buildEnvTemplate("", discord.discordId, deps.env.coreUrl),
        readme_md: buildReadme(body.display_name, body.agent_names, deps.env.missionControlFallbackUrl),
        provision_status: "already_provisioned",
      });
    }

    if (provisionRes.status === 404) {
      return json(404, {
        success: false,
        error: "Your V2.4 account is not linked to this discord_id yet. Run /link-discord in HyperCode first.",
      });
    }

    if (!provisionRes.ok) {
      return json(200, {
        success: false,
        error: `V2.4 provision failed (status ${provisionRes.status}).`,
      });
    }

    const provisionBody = await provisionRes.json() as Record<string, unknown>;
    const missionControlUrl =
      typeof provisionBody.mission_control_url === "string"
        ? provisionBody.mission_control_url
        : deps.env.missionControlFallbackUrl;
    const apiKey = typeof provisionBody.api_key === "string" ? provisionBody.api_key : "";

    return json(200, {
      success: true,
      api_key: apiKey,
      env_template: buildEnvTemplate(apiKey, discord.discordId, deps.env.coreUrl),
      readme_md: buildReadme(body.display_name, body.agent_names, missionControlUrl),
      mission_control_url: provisionBody.mission_control_url ?? null,
      provision_event_id: provisionBody.provision_event_id ?? null,
      expires_at: provisionBody.expires_at ?? null,
    });
```

- [ ] **Step 4: Run the full test file**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts"
```

Expected: PASS for all contract tests.

- [ ] **Step 5: Commit the downstream behavior**

```bash
git add supabase/functions/generate-v2-config/handler.ts supabase/functions/generate-v2-config/handler_test.ts
git commit -m "fix(edge): preserve generate-v2-config provisioning contract"
```

---

### Task 4: Wire the real Deno entrypoint and update truth docs

**Files:**
- Modify: `supabase/functions/generate-v2-config/index.ts`
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md`
- Modify: `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`

- [ ] **Step 1: Replace the browser-shaped entrypoint with a thin bootstrap**

Update `supabase/functions/generate-v2-config/index.ts` so its top-level shape becomes:

```ts
// @ts-ignore -- CDN import for Deno; no local types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
// @ts-ignore -- relative Deno import; no local types
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
```

Implementation notes:
- do not keep `CORS_HEADERS`
- do not keep `OPTIONS` handling
- do not keep bearer-token parsing or `auth.getUser(...)`
- keep the scoped admin key path through `resolveSupabaseAdminKey(...)`

- [ ] **Step 2: Run tests after the entrypoint refactor**

Run:

```bash
deno test "supabase/functions/generate-v2-config/handler_test.ts"
```

Expected: PASS.

- [ ] **Step 3: Update the Wave 1 truth docs**

Change the `generate-v2-config` row in `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md` to:

```md
| `generate-v2-config` | service / integration | no active browser caller found in `frontend/src` or `api` | explicit service auth | scoped admin key only on server | no browser CORS contract | method, caller secret, inputs | `pass` | `POST`-only service contract now enforced: browser CORS removed, bearer-JWT path removed, inbound `X-Sync-Secret` required, and server-authoritative Discord + qualifying `agent_access` checks preserved before the outbound V2.4 bridge call. |
```

Update `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` with a short fix note under the Edge Function section:

```md
- `generate-v2-config` has now been locked to the intended service-only trust model: no browser CORS, no bearer-JWT path, explicit `X-Sync-Secret` auth, `409` on Discord-link conflicts, and qualifying `agent_access` purchase selection before outbound provisioning.
```

- [ ] **Step 4: Commit the wired function and doc sync**

```bash
git add supabase/functions/generate-v2-config/index.ts supabase/functions/generate-v2-config/handler.ts supabase/functions/generate-v2-config/handler_test.ts docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md
git commit -m "fix(edge): lock down generate-v2-config service auth"
```

---

### Task 5: Deploy with `verify_jwt` off and prove the live contract

**Files:** none

- [ ] **Step 1: Deploy the function with the correct gateway mode**

Run:

```bash
supabase functions deploy generate-v2-config --project-ref tlavrxiaegbtyfmjfdcz --no-verify-jwt
```

Expected: deploy succeeds and the function is reachable without Supabase JWT gatekeeping.

- [ ] **Step 2: Fetch one live qualifying user for proof**

Run this exact SQL against `tlavrxiaegbtyfmjfdcz` via Supabase SQL editor or MCP `execute_sql`:

```sql
select
  sp.user_id,
  dl.discord_id,
  sp.id as purchase_id
from public.shop_purchases sp
join public.shop_items si on si.id = sp.item_id
left join public.discord_links dl on dl.user_id = sp.user_id
where coalesce(si.metadata->>'type', '') = 'agent_access'
  and coalesce(sp.fulfillment_metadata->>'provision_status', '') <> 'failed'
  and dl.discord_id is not null
order by sp.purchased_at desc
limit 1;
```

Expected: one row with `user_id`, `discord_id`, and `purchase_id`.

- [ ] **Step 3: Prove browser-style bearer request now fails**

In PowerShell, set the user from Step 2:

```powershell
$body = @{ user_id = "<user_id-from-step-2>" } | ConvertTo-Json -Compress
curl.exe -i "https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/generate-v2-config" `
  -X POST `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $env:COURSE_TEST_JWT" `
  --data $body
```

Expected:
- HTTP `401`
- response body contains `Unauthorized`
- no `Access-Control-Allow-Origin` header

- [ ] **Step 4: Prove service-auth request succeeds**

Run:

```powershell
$body = @{ user_id = "<user_id-from-step-2>" } | ConvertTo-Json -Compress
curl.exe -i "https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/generate-v2-config" `
  -X POST `
  -H "Content-Type: application/json" `
  -H "X-Sync-Secret: $env:V24_SYNC_SECRET" `
  --data $body
```

Expected:
- HTTP `200`
- JSON body contains either `success: true` with generated config fields or `provision_status: "already_provisioned"`
- no `Access-Control-Allow-Origin` header

- [ ] **Step 5: Capture completion**

Run:

```bash
git status --short
```

Expected: clean working tree.

Then push:

```bash
git push -u origin <your-branch-name>
```

In the PR update or handover, record this exact proof line:

```md
`generate-v2-config` now rejects browser-style bearer requests with `401`, succeeds with `X-Sync-Secret`, and no longer emits browser CORS headers.
```
