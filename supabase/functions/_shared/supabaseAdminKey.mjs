// Shared admin-key resolver for Supabase Edge Functions.
// Prefer the hosted named secret key SUPABASE_SECRET_KEYS[keyName]; fall back
// to a local SUPABASE_SECRET_KEY for `supabase functions serve`; never touch
// SUPABASE_SERVICE_ROLE_KEY.
export function resolveSupabaseAdminKey(env, keyName) {
  const configError =
    `Missing Supabase admin key configuration: expected SUPABASE_SECRET_KEYS["${keyName}"] or local SUPABASE_SECRET_KEY.`;

  const namedSecretKeys = env.SUPABASE_SECRET_KEYS?.trim();
  if (namedSecretKeys) {
    try {
      const parsed = JSON.parse(namedSecretKeys);
      const namedKey = parsed?.[keyName];

      if (typeof namedKey === 'string' && namedKey.trim()) {
        return namedKey.trim();
      }
    } catch (_error) {
      // Fall through to the shared configuration error below.
    }

    throw new Error(configError);
  }

  const localSecretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (localSecretKey) {
    return localSecretKey;
  }

  throw new Error(configError);
}
