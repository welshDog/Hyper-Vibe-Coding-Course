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

/** Watchdog: `loading` must never stick `true` forever if a profile lookup
 *  wedges (auth-lock contention, dead network, RLS stall). The whole app is
 *  gated on store `loading` (App.tsx PrivateRoute), so a stuck flag = the
 *  May-19 P0 infinite-load. Snapshot 2026-05-19 explicitly: "add timeout
 *  fallback". */
const PROFILE_LOAD_TIMEOUT_MS = 8000
let loadingWatchdog: ReturnType<typeof setTimeout> | null = null

function clearLoadingWatchdog() {
  if (loadingWatchdog !== null) {
    clearTimeout(loadingWatchdog)
    loadingWatchdog = null
  }
}

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

  clearLoadingWatchdog()
  loadingWatchdog = setTimeout(() => {
    // Still the live request and still spinning → the profile lookup is
    // wedged. Release the UI and tell the truth rather than infinite-load
    // the whole app behind the store `loading` gate.
    if (requestId !== authRequestId) return
    if (!useAuthStore.getState().loading) return
    useAuthStore.setState({
      loading: false,
      authError: session?.user ? 'profile_load_timeout' : null,
    })
  }, PROFILE_LOAD_TIMEOUT_MS)

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
      clearLoadingWatchdog()
      set({ loading: false })
    }
  }
}

// Supabase v2 holds an internal auth lock for the lifetime of this callback.
// Awaiting a Supabase *data* query (loadUserProfile → from('users')) directly
// inside it deadlocks the lock → applySession's finally never runs → store
// `loading` sticks true → every store-loading-gated route (Dashboard,
// Courses, module pages) infinite-loads. Defer to a fresh macrotask so the
// auth lock is released before we touch the DB. Documented Supabase gotcha;
// P0 fix — snapshot 2026-05-19.
supabase.auth.onAuthStateChange((_, session) => {
  setTimeout(() => {
    void applySession(session)
  }, 0)
})

async function initializeAuth() {
  try {
    const { data } = await supabase.auth.getSession()
    await applySession(data.session)
  } catch {
    clearLoadingWatchdog()
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      authError: 'session_lookup_failed',
    })
  }
}

void initializeAuth()
