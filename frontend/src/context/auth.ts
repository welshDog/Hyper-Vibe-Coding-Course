import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { User } from '../types/database'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
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
      set({ user: null })
      return
    }

    const user = await loadUserProfile(session.user.id)
    if (requestId !== authRequestId) return
    set({ user })
  } catch {
    if (requestId !== authRequestId) return
    set({ user: null })
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
    useAuthStore.setState({ user: null, session: null, loading: false })
  }
}

void initializeAuth()
