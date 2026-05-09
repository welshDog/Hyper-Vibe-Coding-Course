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
import { PetCardSkeleton } from './PetCardSkeleton'

const RARITY_COLOR: Record<Rarity, TagColor> = {
  common:    'cyan',
  uncommon:  'mint',
  rare:      'violet',
  legendary: 'gold',
}

const KNOWN_SPECIES_IDS = new Set(SPECIES.map((s) => s.id))

export function PetSquadRow() {
  // 11 = 1 hero (col-span-2 on lg) + 2 minis on row 1 (the "podium") + 2 clean
  // rows of 4 below. Fits a 4-col grid as 3 perfectly balanced rows.
  const { topPets, loading, error } = useTopPets(11)

  if (loading) {
    return (
      <ul
        role="list"
        aria-label="Loading top evolvers"
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className={`shrink-0 w-[220px] lg:w-auto motion-safe:animate-fade-in-up ${
              i === 0 ? 'lg:col-span-2' : ''
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <PetCardSkeleton size="mini" />
          </li>
        ))}
      </ul>
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
      {visible.map((p, i) => {
        const species = SPECIES.find((s) => s.id === p.species_id)!
        const stageInfo = STAGE_BY_KEY[p.stage]
        const isLegend = p.stage === 'legend'
        const isHero = i === 0
        return (
          <li
            key={p.pet_id}
            className={`snap-start shrink-0 w-[260px] lg:w-auto ${isHero ? 'lg:col-span-2' : ''}`}
          >
            <HVZCard padding={isHero ? 20 : 16} glow={isLegend ? 'gold' : isHero ? 'violet' : undefined}>
              {isHero ? (
                // Hero variant — bigger image, top-evolver tag, breathing room.
                <div className="flex items-start gap-4">
                  <img
                    src={species.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-20 w-20 rounded-hfz-md object-cover shrink-0 ring-2 ring-hfz-gold/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-base text-hfz-text-primary truncate">
                          {p.pet_name}
                        </p>
                        <p className="text-[11px] text-hfz-text-secondary truncate">
                          <span className="font-mono">{p.pet_id}</span>
                          <span className="opacity-60"> · </span>
                          {species.displayName}
                        </p>
                      </div>
                      <HVZTag color="gold">🥇 Top evolver</HVZTag>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <HVZTag color={isLegend ? 'gold' : 'violet'}>
                        {stageInfo.emoji} {stageInfo.label}
                      </HVZTag>
                      <HVZTag color={RARITY_COLOR[p.rarity]}>
                        {RARITY_LABELS[p.rarity]}
                      </HVZTag>
                      {p.evolution_count > 0 && (
                        <span className="text-[11px] text-hfz-gold-light font-mono font-bold">
                          {p.evolution_count}× evolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Mini variant — unchanged behaviour.
                <>
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
                </>
              )}
            </HVZCard>
          </li>
        )
      })}
    </ul>
  )
}
