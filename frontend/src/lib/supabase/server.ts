// Server-side Supabase client (for SSR/middleware use)
// If using Vite SPA only, use client.ts instead
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { resolveBrowserSupabaseConfig } from './config'

export function createServerClient() {
  const { url, key } = resolveBrowserSupabaseConfig({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  })

  return createSupabaseClient(
    url,
    key
  )
}
