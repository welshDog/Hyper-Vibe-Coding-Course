import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../context/auth'
import { getLevel, isLevelUnlocked } from '../lib/vibeLabs'
import { addAnonLevel, clearAnonProgress, readAnonProgress } from '../lib/anonProgress'

export interface VibeProgress {
  xp: number
  badges: string[]
  completedLevels: number[]
}

const EMPTY: VibeProgress = { xp: 0, badges: [], completedLevels: [] }

/** Summary of an anon→login reconcile, for the "banked!" celebration. */
export interface Reconciliation {
  banked: number
  xp: number
  coins: number
}

export type ClaimOutcome =
  | { ok: true; level: number; xp: number; coins: number; badge: string }
  | { ok: false; reason: 'unauthorized' | 'invalid_level' | 'already_claimed' | 'locked' | 'error' }

type RpcSuccess = { success: true; level: number; xp: number; coins: number; badge: string }
type RpcError = { error: string }

function parseRpc(data: unknown): RpcSuccess | RpcError | null {
  if (!data || typeof data !== 'object') return null
  if ('success' in data && (data as RpcSuccess).success === true) return data as RpcSuccess
  if ('error' in data) return data as RpcError
  return null
}

/** Display XP for a set of levels (anon, unbanked — never trusted server-side). */
function displayXp(levels: number[]): number {
  return levels.reduce((sum, id) => sum + (getLevel(id)?.xp ?? 0), 0)
}

/**
 * Vibe Labs progress + reward claiming.
 *
 * Logged-in: reads `user_level_progress` (RLS owner-read) and claims via the
 * atomic `claim_level_reward` RPC (server-authoritative, idempotent,
 * level-locked); a successful claim resyncs the auth store so the global
 * BROski$ balance stays in sync.
 *
 * Logged-out: progress lives in localStorage (`completeLevelLocally`) so a
 * visitor can EARN levels before signing up. On the first authenticated render
 * after that, `reconcile` replays the earned levels through the server RPC in
 * ascending order — the server is still the only authority, so a tampered
 * store cannot bank unearned rewards.
 */
export function useProgress() {
  const { user, refreshUser } = useAuthStore()
  const [progress, setProgress] = useState<VibeProgress>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<number | null>(null)
  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null)
  // Guards the reconcile to once per authenticated user id (per mount).
  const reconciledFor = useRef<string | null>(null)

  useEffect(() => {
    const userId = user?.id

    // ---- Anon: progress is local + unbanked (display only) ----
    if (!userId) {
      queueMicrotask(() => {
        const levels = readAnonProgress()
        setProgress({ xp: displayXp(levels), badges: [], completedLevels: levels })
        setLoading(false)
      })
      return
    }

    let cancelled = false
    queueMicrotask(() => setLoading(true))

    const run = async () => {
      // ---- Reconcile: bank anon-earned levels on first auth for this id ----
      const anonLevels = readAnonProgress()
      if (anonLevels.length > 0 && reconciledFor.current !== userId) {
        reconciledFor.current = userId
        let banked = 0
        let xp = 0
        let coins = 0
        // Ascending: the server enforces the level-lock + idempotency, so an
        // out-of-order or tampered store simply yields no/partial banking.
        for (const lvl of anonLevels) {
          const { data, error } = await supabase.rpc('claim_level_reward', { p_level: lvl })
          if (error) continue
          const parsed = parseRpc(data)
          if (parsed && 'success' in parsed && parsed.success) {
            banked += 1
            xp += parsed.xp
            coins += parsed.coins
          }
          // already_claimed / locked → skip; server is the gate.
        }
        clearAnonProgress()
        if (!cancelled && banked > 0) {
          setReconciliation({ banked, xp, coins })
          await refreshUser()
        }
      }

      // ---- Load server progress (source of truth) ----
      const { data, error } = await supabase
        .from('user_level_progress')
        .select('xp, badges, completed_levels')
        .eq('user_id', userId)
        .maybeSingle()

      if (cancelled) return
      if (error || !data) {
        setProgress(EMPTY)
      } else {
        setProgress({
          xp: typeof data.xp === 'number' ? data.xp : 0,
          badges: Array.isArray(data.badges) ? data.badges : [],
          completedLevels: Array.isArray(data.completed_levels) ? data.completed_levels : [],
        })
      }
      setLoading(false)
    }

    run().catch(() => {
      if (cancelled) return
      setProgress(EMPTY)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user?.id, refreshUser])

  const claimReward = useCallback(
    async (level: number): Promise<ClaimOutcome> => {
      if (!user?.id) return { ok: false, reason: 'unauthorized' }

      setClaiming(level)
      try {
        const { data, error } = await supabase.rpc('claim_level_reward', {
          p_level: level,
        })

        if (error) return { ok: false, reason: 'error' }

        const parsed = parseRpc(data)
        if (!parsed) return { ok: false, reason: 'error' }

        if ('error' in parsed) {
          const r = parsed.error
          return {
            ok: false,
            reason:
              r === 'unauthorized' ||
              r === 'invalid_level' ||
              r === 'already_claimed' ||
              r === 'locked'
                ? r
                : 'error',
          }
        }

        // Success — fold the reward into local state, then resync the
        // global user (BROski$ balance moved server-side).
        setProgress((prev) => ({
          xp: prev.xp + parsed.xp,
          badges: prev.badges.includes(parsed.badge)
            ? prev.badges
            : [...prev.badges, parsed.badge],
          completedLevels: prev.completedLevels.includes(parsed.level)
            ? prev.completedLevels
            : [...prev.completedLevels, parsed.level],
        }))
        await refreshUser()

        return {
          ok: true,
          level: parsed.level,
          xp: parsed.xp,
          coins: parsed.coins,
          badge: parsed.badge,
        }
      } finally {
        setClaiming(null)
      }
    },
    [user?.id, refreshUser],
  )

  /**
   * Anon-only: mark a level earned locally (the "I built it ✓" action).
   * Logged-in users complete via the server claim instead. Called from a
   * click handler, so the setState here is not an effect-body write.
   */
  const completeLevelLocally = useCallback(
    (level: number) => {
      if (user?.id) return
      const levels = addAnonLevel(level)
      setProgress({ xp: displayXp(levels), badges: [], completedLevels: levels })
    },
    [user?.id],
  )

  const levelUnlocked = useCallback(
    (level: number) => isLevelUnlocked(level, progress.completedLevels),
    [progress.completedLevels],
  )

  const isLevelComplete = useCallback(
    (level: number) => progress.completedLevels.includes(level),
    [progress.completedLevels],
  )

  return {
    progress,
    loading,
    claiming,
    reconciliation,
    claimReward,
    completeLevelLocally,
    levelUnlocked,
    isLevelComplete,
    isLoggedIn: Boolean(user?.id),
  }
}
