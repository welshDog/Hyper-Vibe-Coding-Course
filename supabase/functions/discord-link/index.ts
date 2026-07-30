import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveSupabaseAdminKey } from '../_shared/supabaseAdminKey.mjs';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Validate redirect_uri to prevent misuse of the Discord code exchange
const ALLOWED_ORIGINS = new Set([
    'http://localhost:5173',
    'http://localhost:4173',
    'https://hyper-vibe-coding-course.vercel.app',
]);

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    // Resolved before the Discord round-trip below so a misconfigured key
    // fails fast instead of burning a one-time-use Discord auth code.
    let supabaseAdminKey: string;
    try {
        supabaseAdminKey = resolveSupabaseAdminKey(
            {
                SUPABASE_SECRET_KEYS: Deno.env.get('SUPABASE_SECRET_KEYS') ?? '',
                SUPABASE_SECRET_KEY: Deno.env.get('SUPABASE_SECRET_KEY') ?? '',
            },
            'discord_link',
        );
    } catch (err) {
        console.error('Admin key resolution failed:', err instanceof Error ? err.message : err);
        return json({ error: 'Server misconfigured — contact support' }, 500);
    }

    let body: { code: string; redirect_uri: string };
    try {
        body = await req.json();
    } catch {
        return json({ error: 'Invalid request body' }, 400);
    }

    const { code, redirect_uri } = body;
    if (!code || !redirect_uri) return json({ error: 'Missing code or redirect_uri' }, 400);

    let parsedOrigin: string;
    try {
        parsedOrigin = new URL(redirect_uri).origin;
    } catch {
        return json({ error: 'Invalid redirect_uri' }, 400);
    }
    if (!ALLOWED_ORIGINS.has(parsedOrigin)) {
        return json({ error: 'Redirect URI not allowed' }, 400);
    }

    const clientId = Deno.env.get('DISCORD_CLIENT_ID');
    const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
        return json({ error: 'Discord not configured — contact support' }, 503);
    }

    // Exchange Discord authorisation code for an access token
    const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri,
        }),
    });

    if (!tokenResp.ok) {
        const err = await tokenResp.text();
        console.error('Discord token exchange failed:', tokenResp.status, err);
        return json({ error: 'Discord auth failed — the link may have expired, please try again' }, 400);
    }

    const { access_token } = await tokenResp.json() as { access_token: string };

    const discordResp = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!discordResp.ok) return json({ error: 'Failed to fetch Discord profile' }, 502);

    const discordUser = await discordResp.json() as {
        id: string;
        username: string;
        global_name?: string | null;
    };

    const displayName = discordUser.global_name ?? discordUser.username;

    const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        supabaseAdminKey,
    );

    const { error: upsertError } = await admin.from('discord_links').upsert(
        {
            user_id: user.id,
            discord_id: discordUser.id,
            discord_username: displayName,
            linked_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
    );

    if (upsertError) {
        if (upsertError.code === '23505') {
            return json({ error: 'That Discord account is already linked to another user' }, 409);
        }
        console.error('DB upsert error:', upsertError);
        return json({ error: 'Failed to save Discord link' }, 500);
    }

    return json({ discord_id: discordUser.id, discord_username: displayName });
});
