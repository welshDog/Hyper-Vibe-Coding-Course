// @ts-ignore -- CDN import for Deno; no local types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
// @ts-ignore -- relative Deno import; no local types
import { resolveSupabaseAdminKey } from "../_shared/supabaseAdminKey.mjs";

const SUPABASE_URL = (globalThis as any).Deno?.env?.get('SUPABASE_URL') ?? '';
const V24_API_URL = (globalThis as any).Deno?.env?.get('V24_API_URL') ?? '';
const SHOP_SYNC_SECRET = (globalThis as any).Deno?.env?.get('SHOP_SYNC_SECRET') ?? '';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: CORS_HEADERS });
}

function jsonHttpError(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: CORS_HEADERS,
  });
}

function jsonAppError(message: string): Response {
  return jsonOk({ success: false, error: message });
}

type GenerateRequest = {
  discord_id?: string;
  display_name?: string;
  agent_names?: string[];
};

type ShopItemMetadata = {
  type?: string;
  v24_tier?: string;
};

type PurchaseRow = {
  id: string;
  created_at?: string;
  item_id?: string;
  fulfillment_metadata?: Record<string, unknown> | null;
  shop_items?: {
    metadata?: ShopItemMetadata | null;
  } | null;
};

type ProvisionRequest = {
  purchase_id: string;
  user_id: string;
  discord_id: string | null;
  item_type: 'agent_access';
  v24_tier: string;
  idempotency_key: string;
};

type ProvisionResponse = {
  status: 'provisioned' | 'failed';
  api_key?: string;
  mission_control_url?: string;
  expires_at?: string | null;
  provision_event_id?: string;
};

async function resolveDiscordId(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  providedDiscordId?: string,
): Promise<string | null> {
  if (providedDiscordId && typeof providedDiscordId === 'string' && providedDiscordId.trim()) {
    return providedDiscordId.trim();
  }

  const { data } = await supabaseAdmin
    .from('discord_links')
    .select('discord_id')
    .eq('user_id', userId)
    .maybeSingle();

  return (data as { discord_id?: string } | null)?.discord_id ?? null;
}

async function findLatestAgentAccessPurchase(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ purchaseId: string; v24Tier: string } | null> {
  const { data, error } = await supabaseAdmin
    .from('shop_purchases')
    .select('id, created_at, item_id, fulfillment_metadata, shop_items ( metadata )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('generate-v2-config: shop_purchases lookup failed:', error.message);
    return null;
  }

  const rows = (data ?? []) as PurchaseRow[];
  for (const row of rows) {
    const itemType = row.shop_items?.metadata?.type ?? null;
    if (itemType === 'agent_access') {
      const v24Tier = row.shop_items?.metadata?.v24_tier ?? 'sandbox';
      return { purchaseId: row.id, v24Tier };
    }
  }

  return null;
}

function buildEnvTemplate(apiKey: string, discordId: string, coreUrl: string): string {
  const lines = [
    `API_KEY=${apiKey}`,
    `CORE_URL=${coreUrl}`,
    `DISCORD_ID=${discordId}`,
    'DISCORD_TOKEN=',
  ];
  return `${lines.join('\n')}\n`;
}

function buildDockerComposeYaml(): string {
  return [
    'services:',
    '  redis:',
    '    image: redis:7-alpine',
    '    container_name: redis',
    '    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --save 60 1000 --protected-mode no',
    '    networks:',
    '      - hyper-net',
    '',
    '  postgres:',
    '    image: postgres:15-alpine',
    '    container_name: postgres',
    '    env_file:',
    '      - .env',
    '    environment:',
    '      POSTGRES_USER: ${POSTGRES_USER:-postgres}',
    '      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hypercode}',
    '      POSTGRES_DB: ${POSTGRES_DB:-hypercode}',
    '    networks:',
    '      - hyper-net',
    '',
    '  hypercode-core:',
    '    build:',
    '      context: ./backend',
    '      dockerfile: Dockerfile',
    '    image: ${HYPERCODE_CORE_IMAGE:-hypercode-core:latest}',
    '    container_name: hypercode-core',
    '    env_file:',
    '      - .env',
    '    environment:',
    '      - API_KEY=${API_KEY}',
    '      - HYPERCODE_REDIS_URL=${HYPERCODE_REDIS_URL:-redis://redis:6379}',
    '      - HYPERCODE_DB_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-hypercode}@postgres:5432/${POSTGRES_DB:-hypercode}',
    '    depends_on:',
    '      - redis',
    '      - postgres',
    '    ports:',
    '      - "127.0.0.1:8000:8000"',
    '    networks:',
    '      - hyper-net',
    '',
    '  dashboard:',
    '    build:',
    '      context: ./agents/dashboard',
    '      dockerfile: Dockerfile',
    '    container_name: hypercode-dashboard',
    '    environment:',
    '      - NEXT_PUBLIC_CORE_URL=http://hypercode-core:8000',
    '      - HYPERCODE_CORE_URL=http://hypercode-core:8000',
    '      - NODE_ENV=production',
    '      - HOSTNAME=0.0.0.0',
    '      - PORT=3000',
    '    depends_on:',
    '      - hypercode-core',
    '    ports:',
    '      - "127.0.0.1:8088:3000"',
    '    networks:',
    '      - hyper-net',
    '',
    'networks:',
    '  hyper-net:',
    '    driver: bridge',
    '',
  ].join('\n');
}

function buildReadme(displayName: string, agentNames: string[], missionControlUrl: string): string {
  const safeName = displayName.trim() ? displayName.trim() : 'BROski';
  const agentsLine = agentNames.length ? agentNames.join(', ') : '(none)';
  return [
    `# HyperCode V2.4 — ${safeName}`,
    '',
    `Agents: ${agentsLine}`,
    '',
    '## Run',
    '',
    '```bash',
    'docker compose -f docker-compose.nano.yml up --build',
    '```',
    '',
    '## Mission Control',
    '',
    missionControlUrl,
    '',
  ].join('\n');
}

(globalThis as any).Deno?.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonHttpError('Method not allowed', 405);
  }

  if (!SUPABASE_URL) {
    return jsonAppError('Supabase admin env not configured (SUPABASE_URL).');
  }

  let supabaseAdminKey: string;
  try {
    supabaseAdminKey = resolveSupabaseAdminKey(
      {
        SUPABASE_SECRET_KEYS: (globalThis as any).Deno?.env?.get('SUPABASE_SECRET_KEYS') ?? '',
        SUPABASE_SECRET_KEY: (globalThis as any).Deno?.env?.get('SUPABASE_SECRET_KEY') ?? '',
      },
      'generate_v2_config',
    );
  } catch (err) {
    console.error('generate-v2-config: admin key resolution failed:', err instanceof Error ? err.message : err);
    return jsonAppError('Server misconfigured — contact support.');
  }
  const supabaseAdmin = createClient(SUPABASE_URL, supabaseAdminKey);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonHttpError('Missing or malformed Authorization header', 401);
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return jsonHttpError('Invalid or expired session — please sign in again.', 401);
  }

  let body: GenerateRequest;
  try {
    body = await req.json() as GenerateRequest;
  } catch {
    return jsonHttpError('Invalid JSON body', 400);
  }

  const agentNames = Array.isArray(body.agent_names)
    ? body.agent_names.filter((n) => typeof n === 'string' && n.trim()).map((n) => n.trim())
    : [];

  const discordId = await resolveDiscordId(supabaseAdmin, user.id, body.discord_id);
  if (!discordId) {
    return jsonAppError('No discord_id linked to your Course account yet. Link Discord first.');
  }

  if (!V24_API_URL || !SHOP_SYNC_SECRET) {
    return jsonAppError('V2.4 bridge not configured (V24_API_URL / SHOP_SYNC_SECRET).');
  }

  const purchase = await findLatestAgentAccessPurchase(supabaseAdmin, user.id);
  if (!purchase) {
    return jsonAppError("No 'agent_access' purchase found for this user.");
  }

  const endpoint = `${V24_API_URL.replace(/\/$/, '')}/api/v1/access/provision`;
  const idempotencyKey = `shop_purchase:${purchase.purchaseId}`;

  const provisionPayload: ProvisionRequest = {
    purchase_id: purchase.purchaseId,
    user_id: user.id,
    discord_id: discordId,
    item_type: 'agent_access',
    v24_tier: purchase.v24Tier,
    idempotency_key: idempotencyKey,
  };

  let provisionRes: Response | null = null;
  try {
    provisionRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Secret': SHOP_SYNC_SECRET,
      },
      body: JSON.stringify(provisionPayload),
    });
  } catch (err) {
    console.error('generate-v2-config: V2.4 provision network error:', err);
    return jsonAppError('Could not reach V2.4 provisioning endpoint.');
  }

  if (provisionRes.ok) {
    const provisionBody = await provisionRes.json().catch(() => ({})) as ProvisionResponse;

    const apiKey = provisionBody.api_key ?? '';
    const missionControlUrl = provisionBody.mission_control_url ?? 'http://localhost:8088';
    const coreUrl = 'http://localhost:8000';

    return jsonOk({
      success: true,
      api_key: apiKey,
      docker_compose_yaml: buildDockerComposeYaml(),
      env_template: buildEnvTemplate(apiKey, discordId, coreUrl),
      readme_md: buildReadme(body.display_name ?? '', agentNames, missionControlUrl),
      provision_event_id: provisionBody.provision_event_id ?? null,
      expires_at: provisionBody.expires_at ?? null,
      mission_control_url: provisionBody.mission_control_url ?? null,
    });
  }

  if (provisionRes.status === 409) {
    const missionControlUrl = 'http://localhost:8088';
    const coreUrl = 'http://localhost:8000';
    return jsonOk({
      success: true,
      api_key: '',
      docker_compose_yaml: buildDockerComposeYaml(),
      env_template: buildEnvTemplate('', discordId, coreUrl),
      readme_md: buildReadme(body.display_name ?? '', agentNames, missionControlUrl),
      provision_status: 'already_provisioned',
    });
  }

  if (provisionRes.status === 404) {
    return jsonAppError('Your V2.4 account is not linked to this discord_id yet. Run /link-discord in HyperCode first.');
  }

  const errText = await provisionRes.text().catch(() => '');
  console.error(`generate-v2-config: V2.4 returned ${provisionRes.status}: ${errText}`);
  return jsonAppError(`V2.4 provision failed (status ${provisionRes.status}).`);
});

