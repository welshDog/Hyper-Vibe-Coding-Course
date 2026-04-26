import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getRequiredEnv } from './env.js'

export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = getRequiredEnv('SUPABASE_URL')
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}
