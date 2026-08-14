export type AuthenticatedUser = { id: string };

export type DiscordProfile = {
  id: string;
  username: string;
  globalName: string | null;
};

export type UpsertLinkResult = { ok: true } | { conflict: true } | { error: string };

export type DiscordLinkDeps = {
  env: {
    discordClientId: string;
    discordClientSecret: string;
  };
  allowedOrigins: Set<string>;
  getAuthenticatedUser: (authHeader: string) => Promise<AuthenticatedUser | null>;
  mintState: (userId: string) => Promise<string>;
  // Returns true only if `state` exists, belongs to `userId`, and is fresh —
  // and consumes (deletes) it as a single-use token in the same operation.
  consumeState: (state: string, userId: string) => Promise<boolean>;
  exchangeCode: (
    code: string,
    redirectUri: string,
  ) => Promise<{ accessToken: string } | { error: string }>;
  fetchDiscordProfile: (accessToken: string) => Promise<DiscordProfile | null>;
  upsertLink: (
    userId: string,
    discordId: string,
    displayName: string,
  ) => Promise<UpsertLinkResult>;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function authenticate(
  deps: DiscordLinkDeps,
  req: Request,
): Promise<{ ok: true; user: AuthenticatedUser } | { ok: false; response: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { ok: false, response: json({ error: "Unauthorized" }, 401) };

  let user: AuthenticatedUser | null;
  try {
    user = await deps.getAuthenticatedUser(authHeader);
  } catch (error) {
    console.error("discord-link: auth check failed:", error instanceof Error ? error.message : error);
    return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  }
  if (!user) return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  return { ok: true, user };
}

// GET: mint a fresh, single-use OAuth state bound to the caller — the
// frontend must fetch this before redirecting to Discord, instead of
// generating its own state client-side.
async function handleStart(deps: DiscordLinkDeps, req: Request): Promise<Response> {
  const auth = await authenticate(deps, req);
  if (!auth.ok) return auth.response;

  let state: string;
  try {
    state = await deps.mintState(auth.user.id);
  } catch (error) {
    console.error("discord-link: state mint failed:", error instanceof Error ? error.message : error);
    return json({ error: "Failed to start Discord link" }, 500);
  }
  return json({ state });
}

// POST: exchange a Discord authorisation code, but only if the caller
// presents a state this function itself minted for them.
async function handleExchange(deps: DiscordLinkDeps, req: Request): Promise<Response> {
  const auth = await authenticate(deps, req);
  if (!auth.ok) return auth.response;
  const user = auth.user;

  if (!deps.env.discordClientId || !deps.env.discordClientSecret) {
    return json({ error: "Discord not configured — contact support" }, 503);
  }

  let body: { code?: string; redirect_uri?: string; state?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const { code, redirect_uri, state } = body;
  if (!code || !redirect_uri || !state) {
    return json({ error: "Missing code, redirect_uri, or state" }, 400);
  }

  let parsedOrigin: string;
  try {
    parsedOrigin = new URL(redirect_uri).origin;
  } catch {
    return json({ error: "Invalid redirect_uri" }, 400);
  }
  if (!deps.allowedOrigins.has(parsedOrigin)) {
    return json({ error: "Redirect URI not allowed" }, 400);
  }

  // Server-side trust boundary: this state must have been minted by this
  // function for THIS authenticated user, and still be fresh. Consuming it
  // here (single-use) closes both replay and cross-user CSRF on the
  // callback itself, independent of the browser's own sessionStorage check.
  let stateValid: boolean;
  try {
    stateValid = await deps.consumeState(state, user.id);
  } catch (error) {
    console.error("discord-link: state consume failed:", error instanceof Error ? error.message : error);
    return json({ error: "Failed to verify Discord link request" }, 500);
  }
  if (!stateValid) {
    return json({ error: "Invalid or expired state — please try connecting again" }, 400);
  }

  const exchanged = await deps.exchangeCode(code, redirect_uri);
  if ("error" in exchanged) {
    console.error("discord-link: Discord token exchange failed:", exchanged.error);
    return json({ error: "Discord auth failed — the link may have expired, please try again" }, 400);
  }

  const profile = await deps.fetchDiscordProfile(exchanged.accessToken);
  if (!profile) return json({ error: "Failed to fetch Discord profile" }, 502);

  const displayName = profile.globalName ?? profile.username;
  const result = await deps.upsertLink(user.id, profile.id, displayName);

  if ("conflict" in result) {
    return json({ error: "That Discord account is already linked to another user" }, 409);
  }
  if ("error" in result) {
    console.error("discord-link: DB upsert error:", result.error);
    return json({ error: "Failed to save Discord link" }, 500);
  }

  return json({ discord_id: profile.id, discord_username: displayName });
}

export function createDiscordLinkHandler(deps: DiscordLinkDeps) {
  return async function handleDiscordLink(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method === "GET") return handleStart(deps, req);
    if (req.method === "POST") return handleExchange(deps, req);
    return json({ error: "Method not allowed" }, 405);
  };
}
