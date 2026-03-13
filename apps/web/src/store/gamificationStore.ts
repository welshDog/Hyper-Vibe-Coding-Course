import { create } from 'zustand'

// TODO: Adjust XP thresholds to change how fast users level up
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000]

const LEVEL_NAMES = [
  'Vibe Newbie',
  'Prompt Padawan',
  'Code Curious',
  'Builder BRO',
  'Vibe Master',
  'Hyper Coder',
  'AI Whisperer',
  'Vibe Legend',
]

export function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level - 1] ?? 'Vibe Legend'
}

export function getXpToNextLevel(xp: number): { current: number; needed: number; pct: number } {
  const level = getLevelFromXp(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? 9999
  const current = xp - currentThreshold
  const needed = nextThreshold - currentThreshold
  return { current, needed, pct: Math.round((current / needed) * 100) }
}

interface GamificationStore {
  pendingXp: number
  showLevelUp: boolean
  addPendingXp: (amount: number) => void
  clearPendingXp: () => void
  triggerLevelUp: () => void
  dismissLevelUp: () => void
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  pendingXp: 0,
  showLevelUp: false,
  addPendingXp: (amount) => set((state) => ({ pendingXp: state.pendingXp + amount })),
  clearPendingXp: () => set({ pendingXp: 0 }),
  triggerLevelUp: () => set({ showLevelUp: true }),
  dismissLevelUp: () => set({ showLevelUp: false }),
}))
