/**
 * supabase.ts — Supabase service_role client
 * Used by agent ONLY. Never expose service_role key to frontend.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n' +
      'Add them to agents/course-content-agent/.env'
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}
