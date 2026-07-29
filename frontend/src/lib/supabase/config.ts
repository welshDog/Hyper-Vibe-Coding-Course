type BrowserSupabaseEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

export function resolveBrowserSupabaseConfig(env: BrowserSupabaseEnv) {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const missing = [
    !url ? 'VITE_SUPABASE_URL' : null,
    !key ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`);
  }

  return { url, key };
}
