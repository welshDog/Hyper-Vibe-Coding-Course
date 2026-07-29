const CONFIG_ERROR =
  'Missing Supabase admin key configuration: expected SUPABASE_SECRET_KEYS["stripe_webhook"] or local SUPABASE_SECRET_KEY.';

export function resolveSupabaseAdminKey(env) {
  const namedSecretKeys = env.SUPABASE_SECRET_KEYS?.trim();
  if (namedSecretKeys) {
    try {
      const parsed = JSON.parse(namedSecretKeys);
      const webhookKey = parsed?.stripe_webhook;

      if (typeof webhookKey === 'string' && webhookKey.trim()) {
        return webhookKey.trim();
      }
    } catch (_error) {
      // Fall through to the shared configuration error below.
    }

    throw new Error(CONFIG_ERROR);
  }

  const localSecretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (localSecretKey) {
    return localSecretKey;
  }

  throw new Error(CONFIG_ERROR);
}
