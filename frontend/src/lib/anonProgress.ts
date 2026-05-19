// =============================================================================
// Anon (logged-out) Vibe Labs progress — persisted to localStorage so a
// visitor can EARN levels before signing up (dopamine before the ask).
//
// 🔒 NOT a source of truth for rewards. The server `claim_level_reward` RPC
// stays authoritative — idempotent + level-locked. Reconciliation (on login)
// replays these server-side IN ORDER, so a hand-edited store can never bank
// unearned BROski$: the server rejects any level whose predecessor isn't
// genuinely complete. This file is best-effort UX state only — it never throws
// (private mode / quota / SSR all degrade to "no progress").
// =============================================================================

const KEY = 'vibe-labs:anon-progress'
const VALID_IDS = new Set([1, 2, 3, 4, 5])

interface AnonProgressShape {
  v: 1
  completedLevels: number[]
}

function sanitise(list: unknown): number[] {
  if (!Array.isArray(list)) return []
  return [...new Set(list)]
    .filter((n): n is number => typeof n === 'number' && VALID_IDS.has(n))
    .sort((a, b) => a - b)
}

/** Completed-level ids the anon visitor has earned (unbanked), ascending. */
export function readAnonProgress(): number[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return []
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<AnonProgressShape>
    return sanitise(parsed?.completedLevels)
  } catch {
    return []
  }
}

/** Record a locally-earned level. Returns the new sanitised list. */
export function addAnonLevel(level: number): number[] {
  const next = sanitise([...readAnonProgress(), level])
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const payload: AnonProgressShape = { v: 1, completedLevels: next }
      window.localStorage.setItem(KEY, JSON.stringify(payload))
    }
  } catch {
    /* best-effort — never block the UI on storage */
  }
  return next
}

/** Wipe anon progress (called after a successful login-time reconcile). */
export function clearAnonProgress(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(KEY)
    }
  } catch {
    /* ignore */
  }
}
