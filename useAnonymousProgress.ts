/**
 * useAnonymousProgress
 * ────────────────────
 * Tracks Vibe Labs level completions BEFORE signup, via localStorage.
 * On signup, `migrateAnonProgress` lifts these into `user_level_progress`.
 *
 * Sacred rules:
 *   - localStorage key is `completedLevels` (do NOT rename without a migration)
 *   - Defensive parse — corrupted JSON => empty array, never throw
 *   - Cross-tab sync via `storage` event
 *   - SSR-safe (Vite SPA, but guarded anyway)
 *
 * Usage in a Level page:
 *   const { markComplete, isComplete } = useAnonymousProgress()
 *   // when the user finishes the level:
 *   markComplete(1)
 */
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'completedLevels'

function readFromStorage(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Only keep positive integers, dedupe, sort
    const cleaned = Array.from(
      new Set(
        parsed.filter(
          (n): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0,
        ),
      ),
    ).sort((a, b) => a - b)
    return cleaned
  } catch {
    return []
  }
}

function writeToStorage(levels: number[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
  } catch {
    // quota exceeded / storage disabled — fail silently
    // migration will simply find nothing on signup; no data loss beyond session
  }
}

export interface UseAnonymousProgressReturn {
  completedLevels: number[]
  markComplete: (level: number) => void
  isComplete: (level: number) => boolean
  clear: () => void
  hasAnyProgress: boolean
}

export function useAnonymousProgress(): UseAnonymousProgressReturn {
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => readFromStorage())

  // Cross-tab sync: if another tab updates progress, mirror it here
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCompletedLevels(readFromStorage())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const markComplete = useCallback((level: number) => {
    if (!Number.isInteger(level) || level <= 0) return
    setCompletedLevels((prev) => {
      if (prev.includes(level)) return prev
      const next = [...prev, level].sort((a, b) => a - b)
      writeToStorage(next)
      return next
    })
  }, [])

  const isComplete = useCallback(
    (level: number) => completedLevels.includes(level),
    [completedLevels],
  )

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* noop */
      }
    }
    setCompletedLevels([])
  }, [])

  return {
    completedLevels,
    markComplete,
    isComplete,
    clear,
    hasAnyProgress: completedLevels.length > 0,
  }
}
