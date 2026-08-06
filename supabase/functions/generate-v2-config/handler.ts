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
  if (
    body.discord_id !== undefined &&
    (typeof body.discord_id !== "string" || !body.discord_id.trim())
  ) {
    return null;
  }
  if (body.display_name !== undefined && typeof body.display_name !== "string") {
    return null;
  }
  if (
    body.agent_names !== undefined &&
    (!Array.isArray(body.agent_names) ||
      body.agent_names.some((value) =>
        typeof value !== "string" || !value.trim()
      ))
  ) {
    return null;
  }

  return {
    user_id: body.user_id.trim(),
    discord_id: typeof body.discord_id === "string"
      ? body.discord_id.trim()
      : undefined,
    display_name: typeof body.display_name === "string"
      ? body.display_name.trim()
      : undefined,
    agent_names: Array.isArray(body.agent_names)
      ? body.agent_names.map((value) => value.trim())
      : undefined,
  };
}

function buildEnvTemplate(apiKey: string, discordId: string, coreUrl: string): string {
  return [
    `API_KEY=${apiKey}`,
    `CORE_URL=${coreUrl}`,
    `DISCORD_ID=${discordId}`,
    "DISCORD_TOKEN=",
  ].join("\n") + "\n";
}

function buildReadme(
  displayName: string | undefined,
  agentNames: string[] | undefined,
  missionControlUrl: string,
): string {
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
  let linkedDiscordId: string | null;
  try {
    linkedDiscordId = await deps.resolveDiscordLink(userId);
  } catch (error) {
    console.error(
      "generate-v2-config: discord link lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      response: json(502, { success: false, error: "Discord link lookup failed" }),
    };
  }

  if (providedDiscordId && linkedDiscordId && providedDiscordId !== linkedDiscordId) {
    return {
      ok: false,
      response: json(409, { success: false, error: "Discord ID conflict with linked account" }),
    };
  }

  return { ok: true, discordId: providedDiscordId ?? linkedDiscordId ?? null };
}

function isServiceMisconfigured(deps: GenerateV2ConfigDeps): boolean {
  if (!deps.env.v24SyncSecret || !deps.env.shopSyncSecret || !deps.env.v24ApiUrl) {
    return true;
  }
  try {
    const adminKey = deps.resolveAdminKey();
    if (!adminKey || !adminKey.trim()) {
      return true;
    }
  } catch (error) {
    console.error(
      "generate-v2-config: admin key configuration check failed:",
      error instanceof Error ? error.message : error,
    );
    return true;
  }
  return false;
}

// Compares secrets via fixed-size digests + an accumulator so neither the
// length nor position of a mismatch is observable from response timing.
async function timingSafeSecretsMatch(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [providedDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const providedBytes = new Uint8Array(providedDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let diff = 0;
  for (let i = 0; i < providedBytes.length; i++) {
    diff |= providedBytes[i] ^ expectedBytes[i];
  }
  return diff === 0;
}

export function createGenerateV2ConfigHandler(deps: GenerateV2ConfigDeps) {
  return async function handleGenerateV2Config(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return json(405, { success: false, error: "Method not allowed" });
    }

    if (isServiceMisconfigured(deps)) {
      return json(503, { success: false, error: "Service misconfigured" });
    }

    const providedSecret = req.headers.get("X-Sync-Secret");
    if (!providedSecret || !(await timingSafeSecretsMatch(providedSecret, deps.env.v24SyncSecret))) {
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

    let purchaseRows: PurchaseRow[];
    try {
      purchaseRows = await deps.listPurchases(body.user_id);
    } catch (error) {
      console.error(
        "generate-v2-config: purchase lookup failed:",
        error instanceof Error ? error.message : error,
      );
      return json(502, { success: false, error: "Purchase lookup failed" });
    }

    const purchase = selectQualifyingPurchase(purchaseRows);
    if (!purchase) {
      return json(200, {
        success: false,
        error: "No 'agent_access' purchase found for this user.",
      });
    }

    const provisionPayload: ProvisionPayload = {
      purchase_id: purchase.purchaseId,
      user_id: body.user_id,
      discord_id: discord.discordId,
      item_type: "agent_access",
      v24_tier: purchase.v24Tier,
      idempotency_key: `shop_purchase:${purchase.purchaseId}`,
    };

    let provisionRes: Response;
    try {
      provisionRes = await deps.provisionAccess(provisionPayload, deps.env.shopSyncSecret);
    } catch (error) {
      console.error(
        "generate-v2-config: downstream provisioning request failed:",
        error instanceof Error ? error.message : error,
      );
      return json(502, { success: false, error: "V2.4 provisioning request failed" });
    }

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

    let provisionBody: Record<string, unknown>;
    try {
      provisionBody = await provisionRes.json() as Record<string, unknown>;
    } catch (error) {
      console.error(
        "generate-v2-config: downstream response parse failed:",
        error instanceof Error ? error.message : error,
      );
      return json(502, { success: false, error: "V2.4 provisioning response was invalid" });
    }

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
  };
}
