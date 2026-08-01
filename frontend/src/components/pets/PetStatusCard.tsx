// PetStatusCard — compact "status at a glance" panel for the hero spotlight
// sidebar. Sits under PetCosmeticsPanel so the right column has as much
// visual weight/height as the hero card instead of trailing off short — a
// layout gap otherwise opens up between the hero, evolution, and customise
// areas that reads as three disconnected cards rather than one pet-control
// zone. Mood/next-target/equipped-count are all values already computed
// elsewhere on the page (useHUD, lib/evolution, resolveEquipped) — this is a
// re-presentation, not new data.

import { Link } from 'react-router-dom'
import { HVZCard } from '../ui/hvz'
import { MoodBadge } from './MoodBadge'
import { EVOLUTION_STAGES, progressInStage, type PetMood } from '../../lib/evolution'
import { PET_SLOTS } from '../../hooks/useOwnedCosmetics'

type Props = {
  petName:        string
  mood:           PetMood
  /** Total XP — same source PetCard/XPBar use (the pet's own xp column). */
  xp:             number
  /** How many of the 4 cosmetic slots currently have something equipped. */
  equippedCount:  number
}

export function PetStatusCard({ petName, mood, xp, equippedCount }: Props) {
  const { stage } = progressInStage(xp)
  const stageIdx = EVOLUTION_STAGES.findIndex((s) => s.key === stage)
  const nextStage = EVOLUTION_STAGES[stageIdx + 1]

  return (
    <HVZCard variant="chunky" padding={16}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-pet-wood-dark">
            {petName}'s status
          </span>
          <MoodBadge mood={mood} variant="pets-reskin" />
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-pet-ink-soft">
          <p>
            🎯 Next target:{' '}
            <span className="font-semibold text-pet-ink">
              {nextStage ? `${nextStage.label} ${nextStage.emoji}` : 'Fully evolved 👑'}
            </span>
          </p>
          <p>
            🎨 Equipped:{' '}
            <span className="font-semibold text-pet-ink">
              {equippedCount} / {PET_SLOTS.length} slots
            </span>
          </p>
        </div>

        <Link
          to="/shop"
          className="text-[11px] font-semibold text-pet-slime-dark hover:text-pet-wood-dark transition-colors"
        >
          🛍️ Boost {petName} in the shop →
        </Link>
      </div>
    </HVZCard>
  )
}
