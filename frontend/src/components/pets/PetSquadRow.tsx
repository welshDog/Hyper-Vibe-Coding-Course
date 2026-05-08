// PetSquadRow — Section 5 social proof row.
//
// Reads from the public `top_pets` view (anon-readable, column-restricted).
// Renders a horizontally scrollable list of mini cards on mobile and a
// snapped grid on larger screens. Unknown species_ids are filtered out so a
// future species roll-out doesn't crash the row.

import { HVZCard, HVZTag, type TagColor } from '../ui/hvz'
import { useTopPets } from '../../hooks/useTopPets'
import {
  RARITY_LABELS,
  SPECIES,
  type Rarity,
} from '../../lib/species'
import { STAGE_BY_KEY } from '../../lib/evolution'

const RARITY_COLOR: Record<Rarity, TagColor> = {
  common:    'cyan',
  uncommon:  'mint',
  rare:      'violet',
  legendary: 'gold',
}

const KNOWN_SPECIES_IDS = new Set(SPECIES.map((s) => s.id))

export function PetSquadRow() {
  const { topPets, loading, error } = useTopPets(12)

  if (loading) {
    return (
      <HVZCard>
        <p className="text-sm text-hfz-text-secondary">Loading top evolvers…</p>
      </HVZCard>
    )
  }

  if (error || topPets.length === 0) {
    return (
      <HVZCard>
        <p className="text-sm text-hfz-text-secondary">
          No squad yet — be the first to evolve. 🚀
        </p>
      </HVZCard>
    )
  }

  const visible = topPets.filter((p) => KNOWN_SPECIES_IDS.has(p.species_id))

  return (
    <ul
      role="list"
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible"
    >
      {visible.map((p) => {
        const species = SPECIES.find((s) => s.id === p.species_id)!
        const stageInfo = STAGE_BY_KEY[p.stage]
        const isLegend = p.stage === 'legend'
        return (
          <li
            key={p.pet_id}
            className="snap-start shrink-0 w-[220px] lg:w-auto"
          >
            <HVZCard padding={16} glow={isLegend ? 'gold' : undefined}>
              <div className="flex items-center gap-3">
                <img
                  src={species.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 rounded-hfz-sm object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-hfz-text-primary truncate">
                    {p.pet_name}
                  </p>
                  <p className="text-[11px] text-hfz-text-secondary truncate">
                    <span className="font-mono">{p.pet_id}</span>
                    <span className="opacity-60"> · </span>
                    {species.displayName}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <HVZTag color={isLegend ? 'gold' : 'violet'}>
                  {stageInfo.emoji} {stageInfo.label}
                </HVZTag>
                <HVZTag color={RARITY_COLOR[p.rarity]}>
                  {RARITY_LABELS[p.rarity]}
                </HVZTag>
                {p.evolution_count > 0 && (
                  <span className="text-[10px] text-hfz-text-secondary font-mono">
                    {p.evolution_count}× evolved
                  </span>
                )}
              </div>
            </HVZCard>
          </li>
        )
      })}
    </ul>
  )
}
