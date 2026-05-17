import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Singleton — only ever one instance so session never drops on navigation
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,       // keep session in localStorage across page loads
        autoRefreshToken: true,     // auto-refresh JWT before it expires
        detectSessionInUrl: true,   // handle OAuth redirects
        storageKey: 'hyper-vibe-auth', // named key so nothing clashes
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
