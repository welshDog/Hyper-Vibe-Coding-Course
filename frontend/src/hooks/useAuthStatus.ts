import { useAuthStore } from '../context/auth'

export type AuthStatus = 'signed-in' | 'signed-out' | 'refreshing' | 'auth-error'

export interface AuthStatusView {
  status: AuthStatus
  /** Short pill text — no explanatory copy (spec) */
  label: string
  /** Drives the badge colour */
  tone: 'green' | 'gray' | 'amber' | 'red'
}

/**
 * The single source of truth for "is the user really signed in?" — derived
 * from the Supabase-backed auth store. AUTH ONLY: deliberately reads no wallet
 * state, so it's safe on every page (incl. the funnel) without pulling the
 * lazy web3 chunk. Wallet truth is surfaced separately, on /pets only.
 *
 * Order matters: a real error must win over "looks signed out", and an
 * in-flight check must not flash "Signed out".
 */
export function useAuthStatus(): AuthStatusView {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const authError = useAuthStore((s) => s.authError)

  if (authError) {
    return { status: 'auth-error', label: 'Auth error', tone: 'red' }
  }
  if (loading) {
    return { status: 'refreshing', label: 'Session refreshing…', tone: 'amber' }
  }
  if (user) {
    return { status: 'signed-in', label: 'Signed in', tone: 'green' }
  }
  return { status: 'signed-out', label: 'Signed out', tone: 'gray' }
}
