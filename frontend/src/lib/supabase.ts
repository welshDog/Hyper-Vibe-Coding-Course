import { createClient } from '@supabase/supabase-js'
import { resolveBrowserSupabaseConfig } from './supabase/config'

const { url, key } = resolveBrowserSupabaseConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
})

export const supabase = createClient(url, key)
