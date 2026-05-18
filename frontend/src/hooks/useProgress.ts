import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../context/auth'
import { isLevelUnlocked } from '../lib/vibeLabs'

export interface VibeProgress {
  xp: number
  badges: string[]
  completedLevels: number[]
}

const EMPTY: VibeProgress = { xp: 0, badges: [], completedLevels: [] }

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

/**
 * Vibe Labs progress + reward claiming.
 *
 * Reads `user_level_progress` (RLS: owner-read) and claims via the atomic
 * `claim_level_reward` RPC (server-authoritative, idempotent, level-locked).
 * On a successful claim it refreshes the auth store so the BROski$ balance
 * the rest of the app shows stays in sync.
 */
export function useProgress() {
  const { user, refreshUser } = useAuthStore()
  const [progress, setProgress] = useState<VibeProgress>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<number | null>(null)

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      queueMicrotask(() => {
        setProgress(EMPTY)
        setLoading(false)
      })
      return
    }

    let cancelled = false
    queueMicrotask(() => setLoading(true))

    supabase
      .from('user_level_progress')
      .select('xp, badges, completed_levels')
      .eq('user_id', userId)
      .maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled) return
          if (error || !data) {
            setProgress(EMPTY)
          } else {
            setProgress({
              xp: typeof data.xp === 'number' ? data.xp : 0,
              badges: Array.isArray(data.badges) ? data.badges : [],
              completedLevels: Array.isArray(data.completed_levels)
                ? data.completed_levels
                : [],
            })
          }
          setLoading(false)
        },
        () => {
          if (cancelled) return
          setProgress(EMPTY)
          setLoading(false)
        },
      )

    return () => {
      cancelled = true
    }
  }, [user?.id])

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
    claimReward,
    levelUnlocked,
    isLevelComplete,
    isLoggedIn: Boolean(user?.id),
  }
}
