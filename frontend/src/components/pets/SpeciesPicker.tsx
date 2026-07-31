// SpeciesPicker — 10-card grid for choosing a BROskiPet species.
//
// Click toggles selection. The selected card gets the HVZ violet ring + glow.
// Locked species (unlockXp > user's current XP) render as a dark silhouette
// with a violet ? — same image, brightness crushed to ~15%, question mark
// overlaid in violet. Tooltip shows the exact XP needed.
// Image fallbacks to a big emoji if the PNG fails.

import { useState } from 'react'
import { SPECIES, type SpeciesId, type SpeciesConfig } from '../../lib/species'
import { useHUD } from '../../hooks/useHUD'

type Props = {
  selected:    SpeciesId | null
  onSelect:    (id: SpeciesId) => void
  disabled?:   boolean
}

export function SpeciesPicker({ selected, onSelect, disabled = false }: Props) {
  const { xp: userXp } = useHUD()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {SPECIES.map((s) => {
        const locked = !!s.unlockXp && userXp < s.unlockXp
        return (
          <SpeciesCard
            key={s.id}
            species={s}
            isSelected={!locked && selected === s.id}
            onClick={() => !disabled && !locked && onSelect(s.id)}
            disabled={disabled || locked}
            locked={locked}
          />
        )
      })}
    </div>
  )
}

function SpeciesCard({
  species,
  isSelected,
  onClick,
  disabled,
  locked,
}: {
  species:    SpeciesConfig
  isSelected: boolean
  onClick:    () => void
  disabled:   boolean
  locked:     boolean
}) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={
        locked
          ? `${species.displayName} — unlocks at ${species.unlockXp?.toLocaleString()} XP`
          : `Choose ${species.displayName}`
      }
      className={`
        group relative flex flex-col items-center gap-2 p-3 rounded-pet-chunky
        border-4 motion-safe:transition-all motion-safe:duration-hfz-fast text-left
        ${locked
          ? 'border-pet-ink/30 bg-pet-lilac/30 cursor-not-allowed'
          : isSelected
          ? 'border-pet-ink bg-pet-slime/20 ring-2 ring-pet-slime-dark shadow-pet-pop-sm'
          : 'border-pet-ink bg-pet-cream hover:bg-pet-lilac/40'}
        ${disabled && !locked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Image / silhouette box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-hfz-sm bg-pet-lilac/40 flex items-center justify-center">
        {imgFailed ? (
          <span
            className={`text-6xl ${locked ? 'opacity-20' : ''}`}
            aria-hidden
          >
            {species.emoji}
          </span>
        ) : (
          <img
            src={species.imageUrl}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`h-full w-full object-cover ${
              locked
                ? ''
                : 'motion-safe:transition-transform motion-safe:duration-hfz-base motion-safe:group-hover:scale-105'
            }`}
            style={locked ? { filter: 'brightness(0.15) saturate(0)' } : undefined}
          />
        )}

        {/* Violet ? overlay — locked only */}
        {locked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="text-3xl font-black text-pet-ink-soft"
              style={{ filter: 'drop-shadow(0 0 8px rgba(36,28,61,0.6))' }}
              aria-hidden
            >
              ?
            </span>
          </div>
        )}
      </div>

      {/* Name row */}
      <div className="flex items-center gap-1.5 w-full">
        <span aria-hidden className="text-base">{species.emoji}</span>
        <span
          className={`text-sm font-semibold truncate ${
            locked ? 'text-pet-ink-soft' : 'text-pet-ink'
          }`}
        >
          {species.displayName}
        </span>
      </div>

      {/* Unlock label / selected badge */}
      {locked ? (
        <p className="w-full text-[10px] font-semibold text-pet-wood-dark">
          Unlocks at {species.unlockXp?.toLocaleString()} XP
        </p>
      ) : isSelected ? (
        <span className="absolute top-2 right-2 rounded-hfz-full border-2 border-pet-ink bg-pet-slime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pet-ink">
          ✓ Picked
        </span>
      ) : null}
    </button>
  )
}
