import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { User } from '../types/database'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  /** Non-null when a session/profile lookup actually failed — distinct from
   *  "signed out". Lets the UI tell the truth instead of showing logged-out. */
  authError: string | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  /** Re-fetches the user profile from DB — call after token balance changes */
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  authError: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, authError: null })
  },
  refreshUser: async () => {
    const { session } = get()
    if (!session?.user) return
    try {
      const user = await loadUserProfile(session.user.id)
      set({ user })
    } catch {
      // silently ignore — stale data is better than a crash
    }
  },
}))

let authRequestId = 0

async function loadUserProfile(userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return userProfile as User
}

async function applySession(session: Session | null) {
  const requestId = ++authRequestId
  const set = useAuthStore.setState

  set({ session, loading: true })

  try {
    if (!session?.user) {
      set({ user: null, authError: null })
      return
    }

    const user = await loadUserProfile(session.user.id)
    if (requestId !== authRequestId) return
    set({ user, authError: null })
  } catch {
    if (requestId !== authRequestId) return
    // Session exists but the profile lookup failed — this is an ERROR, not
    // a sign-out. Surface it so the badge doesn't lie.
    set({ user: null, authError: 'profile_load_failed' })
  } finally {
    if (requestId === authRequestId) {
      set({ loading: false })
    }
  }
}

supabase.auth.onAuthStateChange(async (_, session) => {
  await applySession(session)
})

async function initializeAuth() {
  try {
    const { data } = await supabase.auth.getSession()
    await applySession(data.session)
  } catch {
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      authError: 'session_lookup_failed',
    })
  }
}

void initializeAuth()
