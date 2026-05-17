// PetPortrait — the one place a BROskiPet's species art + equipped cosmetics
// are layered. Used by PetCard (full + mini) and PetSquadRow (hero + mini),
// so equip styling stays identical everywhere.
//
// Stack, back → front:
//   background  fills the box behind the pet
//   aura        soft glow ring just behind the pet (scaled past the box)
//   species     the pet itself (object-contain when a background shows)
//   frame       decorative border on top (never intercepts clicks)
//   badge       corner chip — falls back to `cornerFallback` (e.g. legend ✨)
//
// Cosmetic layers are size-agnostic via `scale-*` (no per-size calc math).

import type { ReactNode } from 'react'

export type PetCosmeticSlot = 'aura' | 'frame' | 'badge' | 'background'

/** A resolved cosmetic per slot (its art), supplied by the page/row. */
export type EquippedCosmetics = Partial<
  Record<PetCosmeticSlot, { image_url: string | null; name: string }>
>

const SIZE = {
  lg: {
    box:     'h-20 w-20',
    rounded: 'rounded-hfz-md',
    badge:   'h-7 w-7 -bottom-2 -right-2',
  },
  sm: {
    box:     'h-12 w-12',
    rounded: 'rounded-hfz-sm',
    badge:   'h-5 w-5 -bottom-1.5 -right-1.5',
  },
} as const

type Props = {
  imageUrl: string
  alt:      string
  size:     keyof typeof SIZE
  equipped?: EquippedCosmetics
  /** Bottom-right node shown only when no badge cosmetic is equipped. */
  cornerFallback?: ReactNode
  /** Extra classes on the outer box (e.g. ring on the squad hero). */
  className?: string
}

export function PetPortrait({
  imageUrl,
  alt,
  size,
  equipped,
  cornerFallback,
  className = '',
}: Props) {
  const s = SIZE[size]
  const bg    = equipped?.background?.image_url
  const aura  = equipped?.aura?.image_url
  const frame = equipped?.frame?.image_url
  const badge = equipped?.badge

  return (
    <div className={`relative shrink-0 ${s.box} ${s.rounded} ${className}`}>
      {bg && (
        <img
          src={bg}
          alt=""
          aria-hidden
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover ${s.rounded}`}
        />
      )}

      {aura && (
        <img
          src={aura}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.25] blur-[1px] opacity-80 mix-blend-screen"
        />
      )}

      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        className={`relative h-full w-full ${s.rounded} ${
          bg ? 'object-contain p-1' : 'object-cover'
        }`}
      />

      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.12]"
        />
      )}

      {badge?.image_url ? (
        <img
          src={badge.image_url}
          alt={badge.name}
          title={badge.name}
          loading="lazy"
          className={`absolute ${s.badge} object-contain drop-shadow`}
        />
      ) : (
        cornerFallback
      )}
    </div>
  )
}
