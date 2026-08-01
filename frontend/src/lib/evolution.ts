// Evolution stages — shared between PetCard, XPBar, and the future
// EvolutionTimeline (Phase 2B). Server-side stage CHECK constraint in
// migration 20260508120000_broskipets_persistence.sql must stay in lockstep
// with the keys here.

export type PetStage =
  | 'baby'
  | 'learner'
  | 'builder'
  | 'shipper'
  | 'hyperfocus_god'
  | 'legend'

export type PetMood = 'idle' | 'learning' | 'hyperfocus' | 'evolving'

export type EvolutionStage = {
  key:   PetStage
  label: string
  emoji: string
  minXp: number
}

export const EVOLUTION_STAGES: readonly EvolutionStage[] = [
  { key: 'baby',           label: 'Baby',           emoji: '🐣', minXp: 0     },
  { key: 'learner',        label: 'Learner',        emoji: '📚', minXp: 500   },
  { key: 'builder',        label: 'Builder',        emoji: '🛠️', minXp: 1500  },
  { key: 'shipper',        label: 'Shipper',        emoji: '🚀', minXp: 3000  },
  { key: 'hyperfocus_god', label: 'HyperFocus God', emoji: '⚡', minXp: 5000  },
  { key: 'legend',         label: 'Legend',         emoji: '👑', minXp: 10000 },
] as const

export const STAGE_BY_KEY: Record<PetStage, EvolutionStage> = Object.fromEntries(
  EVOLUTION_STAGES.map((s) => [s.key, s]),
) as Record<PetStage, EvolutionStage>

/** Returns the highest stage whose minXp threshold the pet has met. */
export function stageForXp(xp: number): PetStage {
  let current: PetStage = 'baby'
  for (const stage of EVOLUTION_STAGES) {
    if (xp >= stage.minXp) current = stage.key
  }
  return current
}

/**
 * Progress within the current stage.
 * - `current` — XP earned beyond the current stage's threshold
 * - `next` — XP gap between current stage and next stage (Infinity at legend)
 * - `percent` — 0–100 (always 100 once at the final stage)
 */
export function progressInStage(xp: number): {
  stage:   PetStage
  current: number
  next:    number
  percent: number
} {
  const stageKey = stageForXp(xp)
  const idx = EVOLUTION_STAGES.findIndex((s) => s.key === stageKey)
  const stage = EVOLUTION_STAGES[idx]
  const nextStage = EVOLUTION_STAGES[idx + 1]

  if (!nextStage) {
    return { stage: stageKey, current: xp - stage.minXp, next: 0, percent: 100 }
  }

  const span = nextStage.minXp - stage.minXp
  const into = xp - stage.minXp
  return {
    stage:   stageKey,
    current: into,
    next:    span,
    percent: Math.min(100, Math.max(0, (into / span) * 100)),
  }
}

/** BaseScan tx URL for either Base mainnet (8453) or Base Sepolia (84532). */
export function baseScanTxUrl(hash: string, chainId: number): string {
  const subdomain = chainId === 8453 ? '' : 'sepolia.'
  return `https://${subdomain}basescan.org/tx/${hash}`
}

export const MOOD_LABEL: Record<PetMood, string> = {
  idle:       'Idle',
  learning:   'Learning',
  hyperfocus: 'Hyperfocus',
  evolving:   'Evolving',
}

export const MOOD_EMOJI: Record<PetMood, string> = {
  idle:       '💤',
  learning:   '📖',
  hyperfocus: '⚡',
  evolving:   '✨',
}

/**
 * TS mirror of the SQL `drifted_stat()` function — for live display of
 * Hunger/Cleanliness between actions ONLY. The database is the source of
 * truth; `use_care_item()` computes this same formula server-side before
 * applying an action's boost, so this never needs to be a write source.
 */
export function driftedStat(raw: number, updatedAt: string, now: Date = new Date()): number {
  const updated = new Date(updatedAt)
  const daysSince = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
  const fraction = Math.min(1, Math.max(0, daysSince / 5))
  const effective = raw + (50 - raw) * fraction
  return Math.min(100, Math.max(0, Math.round(effective)))
}
