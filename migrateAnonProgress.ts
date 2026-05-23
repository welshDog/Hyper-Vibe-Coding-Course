/**
 * migrateAnonProgress
 * ───────────────────
 * Lifts anonymous Vibe Labs progress (localStorage `completedLevels`)
 * into the authenticated `user_level_progress` table on signup/login.
 *
 * Sacred rules:
 *   - Idempotent: safe to call on every SIGNED_IN event (onConflict do nothing)
 *   - localStorage cleared ONLY after successful write
 *   - Never throws — returns { error } instead, so the auth flow never breaks
 *
 * ⚠️ SCHEMA ASSUMPTION (verify against your real table — flagged in PR):
 *   user_level_progress (
 *     user_id      uuid          → references auth.users(id)
 *     level        int           → 1..5 (VibeLabs)
 *     completed_at timestamptz   → default now()
 *     source       text          → 'anon_migration' for these rows
 *     UNIQUE (user_id, level)
 *   )
 *
 * If your column is named `level_id` or `level_number` instead of `level`,
 * change LEVEL_COLUMN below.  If `source` doesn't exist, drop it from the row.
 *
 * Wire-up (App.tsx or your auth-listener provider):
 *   supabase.auth.onAuthStateChange(async (event, session) => {
 *     if (event === 'SIGNED_IN' && session?.user) {
 *       const result = await migrateAnonProgress(supabase, session.user.id)
 *       if (result.migrated > 0) {
 *         // toast: `Claimed ${result.migrated} levels`
 *         // award BROski$ via your existing award_tokens() RPC
 *       }
 *     }
 *   })
 */
import type { SupabaseClient } from '@supabase/supabase-js'

const STORAGE_KEY = 'completedLevels'
const TABLE = 'user_level_progress'
const LEVEL_COLUMN = 'level' // ← edit if your column is `level_id` / `level_number`
const SOURCE_TAG = 'anon_migration'

export interface MigrateResult {
  /** Number of rows the migration attempted to upsert. */
  attempted: number
  /** Levels successfully written (or already present — onConflict do nothing). */
  levels: number[]
  /** Set if the read or write failed. Migration is best-effort; auth never breaks. */
  error: Error | null
  /** True when localStorage was cleared after a successful write. */
  cleared: boolean
}

function readCompletedLevels(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return Array.from(
      new Set(
        parsed.filter(
          (n): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0,
        ),
      ),
    ).sort((a, b) => a - b)
  } catch {
    return []
  }
}

function clearStorage(): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export async function migrateAnonProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<MigrateResult> {
  const result: MigrateResult = {
    attempted: 0,
    levels: [],
    error: null,
    cleared: false,
  }

  if (!userId) {
    result.error = new Error('migrateAnonProgress: userId is required')
    return result
  }

  const levels = readCompletedLevels()
  if (levels.length === 0) return result

  result.attempted = levels.length

  const rows = levels.map((level) => ({
    user_id: userId,
    [LEVEL_COLUMN]: level,
    completed_at: new Date().toISOString(),
    source: SOURCE_TAG,
  }))

  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, {
      onConflict: `user_id,${LEVEL_COLUMN}`,
      ignoreDuplicates: true,
    })

  if (error) {
    result.error = error as unknown as Error
    return result
  }

  result.levels = levels
  result.cleared = clearStorage()
  return result
}
