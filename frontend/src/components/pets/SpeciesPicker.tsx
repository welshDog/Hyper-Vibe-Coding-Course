// SpeciesPicker — 10-card grid for choosing a BROskiPet species.
//
// Click toggles selection. The selected card gets the HVZ violet ring + glow.
// Image fallbacks to a big emoji if the PNG fails (useful before pinata upload).

import { useState } from 'react'
import { SPECIES, type SpeciesId, type SpeciesConfig } from '../../lib/species'

type Props = {
  selected:    SpeciesId | null
  onSelect:    (id: SpeciesId) => void
  disabled?:   boolean
}

export function SpeciesPicker({ selected, onSelect, disabled = false }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {SPECIES.map((s) => (
        <SpeciesCard
          key={s.id}
          species={s}
          isSelected={selected === s.id}
          onClick={() => !disabled && onSelect(s.id)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

function SpeciesCard({
  species,
  isSelected,
  onClick,
  disabled,
}: {
  species:    SpeciesConfig
  isSelected: boolean
  onClick:    () => void
  disabled:   boolean
}) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`Choose ${species.displayName}`}
      className={`
        group relative flex flex-col items-center gap-2 p-3 rounded-hfz-md
        border transition-all duration-hfz-fast text-left
        ${isSelected
          ? 'border-hfz-violet-light bg-hfz-violet/15 ring-2 ring-hfz-violet-light shadow-[0_0_24px_rgba(167,139,250,0.4)]'
          : 'border-hfz-border-violet bg-hfz-space-black/60 hover:border-hfz-violet-light hover:bg-hfz-violet/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="aspect-square w-full overflow-hidden rounded-hfz-sm bg-hfz-space-black flex items-center justify-center">
        {imgFailed ? (
          <span className="text-6xl" aria-hidden>{species.emoji}</span>
        ) : (
          <img
            src={species.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-hfz-base group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex items-center gap-1.5 w-full">
        <span aria-hidden className="text-base">{species.emoji}</span>
        <span className="text-sm font-semibold text-hfz-text-primary truncate">
          {species.displayName}
        </span>
      </div>
      {isSelected && (
        <span className="absolute top-2 right-2 rounded-hfz-full bg-hfz-violet-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-hfz-space-black">
          ✓ Picked
        </span>
      )}
    </button>
  )
}
