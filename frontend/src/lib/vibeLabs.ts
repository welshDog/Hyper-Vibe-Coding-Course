// =============================================================================
// Vibe Labs — level registry (display metadata, single source of truth)
//
// Rewards here are DISPLAY ONLY. The server (claim_level_reward RPC) is
// authoritative — the UI never trusts these numbers for anything but rendering.
// Keep XP/coins in sync with supabase/migrations/20260518000035_claim_level_reward.sql
// =============================================================================

export type VibeLevelId = 1 | 2 | 3 | 4 | 5

export interface VibeLevel {
  id: VibeLevelId
  slug: string
  path: string
  /** Short nav label */
  short: string
  /** Hero eyebrow, e.g. "Level 1 · The Reasoner" */
  eyebrow: string
  title: string
  tagline: string
  badge: string
  xp: number
  coins: number
  /** Tailwind gradient classes for the hero wash — master palette, no orange */
  heroGradient: string
  /** Accent token used for this level's focal moments */
  accent: 'violet' | 'cyan' | 'gold'
}

export const VIBE_LEVELS: VibeLevel[] = [
  {
    id: 1,
    slug: 'level-1',
    path: '/vibe-labs/level-1',
    short: 'Claude',
    eyebrow: 'Level 1 · The Reasoner',
    title: 'Claude Vibe Lab',
    tagline: 'Your first AI-powered build. You bring the idea — Claude is the crane.',
    badge: '🧠 Claude Lab Graduate',
    xp: 100,
    coins: 50,
    heroGradient: 'from-hfz-violet/55 via-hfz-deep-violet to-hfz-space-black',
    accent: 'violet',
  },
  {
    id: 2,
    slug: 'level-2',
    path: '/vibe-labs/level-2',
    short: 'AI Studio',
    eyebrow: 'Level 2 · Full-Stack Speed',
    title: 'Google AI Studio Lab',
    tagline: 'Same vibe loop, bigger build. Full stack in the browser, zero setup.',
    badge: '🚀 AI Studio Graduate',
    xp: 150,
    coins: 75,
    heroGradient: 'from-hfz-cyan/35 via-hfz-violet/40 to-hfz-space-black',
    accent: 'cyan',
  },
  {
    id: 3,
    slug: 'level-3',
    path: '/vibe-labs/level-3',
    short: 'Trae',
    eyebrow: 'Level 3 · The Autonomous Crew',
    title: 'Trae IDE + Agents Lab',
    tagline: 'You brief the crew. They plan, build, test, and ship it for you.',
    badge: '🤖 Trae Agent Master',
    xp: 200,
    coins: 100,
    heroGradient: 'from-hfz-violet-light/45 via-hfz-violet/40 to-hfz-space-black',
    accent: 'violet',
  },
  {
    id: 4,
    slug: 'level-4',
    path: '/vibe-labs/level-4',
    short: 'Compare',
    eyebrow: 'Level 4 · Pick Your Weapon',
    title: 'Big AI Comparisons',
    tagline: 'Every tool has a superpower. Learn which one to reach for, and when.',
    badge: '⚔️ Big AI Stack Master',
    xp: 250,
    coins: 125,
    heroGradient: 'from-hfz-midnight via-hfz-midnight-soft to-hfz-space-black',
    accent: 'cyan',
  },
  {
    id: 5,
    slug: 'level-5',
    path: '/vibe-labs/level-5',
    short: 'Full Stack',
    eyebrow: 'Level 5 · The Meta-Architect',
    title: 'Hyperfocus z0ne Full Stack',
    tagline: 'You planned it. You built it. You shipped it. Now combine all three.',
    badge: '🌟 Meta-Architect',
    xp: 500,
    coins: 250,
    heroGradient: 'from-hfz-gold/40 via-hfz-violet/45 to-hfz-space-black',
    accent: 'gold',
  },
]

export const getLevel = (id: number): VibeLevel | undefined =>
  VIBE_LEVELS.find((l) => l.id === id)

export const getLevelBySlug = (slug: string): VibeLevel | undefined =>
  VIBE_LEVELS.find((l) => l.slug === slug)

/** Level 1 is always open. Every other level needs the previous one claimed. */
export function isLevelUnlocked(level: number, completedLevels: number[]): boolean {
  if (level <= 1) return true
  return completedLevels.includes(level - 1)
}
