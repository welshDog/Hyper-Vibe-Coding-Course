// PetPortrait — the one place a BROskiPet's species art + equipped cosmetics
// are layered. Used by PetCard (full + mini) and PetSquadRow (hero + mini),
// so equip styling stays identical everywhere.
//
// Stack, back → front:
//   background  fills the box behind the pet
//   aura        soft glow ring just behind the pet (scaled past the box)
//   species     the pet itself (object-contain when a background shows)
//   frame       decorative border on top (never intercepts clicks) — only
//               overlay_image_url (transparent art) is safe to composite
//               here; catalogue image_url is opaque shop-preview art and
//               is a same-known-bug fallback until an item gets one
//   badge       corner chip — falls back to `cornerFallback` (e.g. legend ✨)
//
// Cosmetic layers are size-agnostic via `scale-*` (no per-size calc math).

import type { ReactNode, CSSProperties } from 'react'
import type { Rarity } from '../../lib/species'

export type PetCosmeticSlot = 'aura' | 'frame' | 'badge' | 'background'

/** A resolved cosmetic per slot (its art), supplied by the page/row. */
export type EquippedCosmetics = Partial<
  Record<
    PetCosmeticSlot,
    {
      image_url: string | null
      /** Transparent compositable art; when present, used instead of image_url here. */
      overlay_image_url?: string | null
      name: string
    }
  >
>

const RARITY_RING: Record<Rarity, CSSProperties> = {
  common:    { boxShadow: '0 0 0 2px #60A5FA, 0 0 8px #3B82F6' },
  uncommon:  { boxShadow: '0 0 0 2px #10F5A0, 0 0 8px rgba(16, 245, 160, 0.5)' },
  rare:      { boxShadow: '0 0 0 2px #A855F7, 0 0 12px #7B2FBE' },
  legendary: {}, // handled by animate-legendary-ring CSS animation
}

const SIZE = {
  hero: {
    box:     'h-64 w-64 sm:h-72 sm:w-72',
    rounded: 'rounded-pet-chunky',
    badge:   'h-10 w-10 -bottom-3 -right-3',
  },
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
  rarity?:  Rarity
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
  rarity,
  equipped,
  cornerFallback,
  className = '',
}: Props) {
  const s = SIZE[size]
  const isHero = size === 'hero'
  const bg    = equipped?.background?.image_url
  const aura  = equipped?.aura?.image_url
  // Frame catalogue art is an opaque shop-preview card, not compositable —
  // only overlay_image_url (transparent border/glow art) is safe to lay
  // directly over the pet. Falls back to the old opaque art (same
  // known "covers the pet" look) for frames that don't have one yet.
  const frameOverlay = equipped?.frame?.overlay_image_url
  const frame = frameOverlay ?? equipped?.frame?.image_url
  const badge = equipped?.badge
  const ringStyle   = rarity ? RARITY_RING[rarity] : {}
  const legendaryRingClass = rarity === 'legendary' ? 'motion-safe:animate-legendary-ring' : ''

  return (
    <div className={`relative shrink-0 ${isHero ? 'pb-4' : ''}`}>
      {/* Wood-floor grounding — hero spotlight only, gives the pet somewhere
          to "stand" per the Moy reference instead of floating on the card. */}
      {isHero && (
        <div
          aria-hidden
          className="absolute inset-x-2 bottom-0 h-6 rounded-[50%] bg-pet-wood opacity-70 blur-[2px]"
        />
      )}
      <div
        className={`relative shrink-0 ${s.box} ${s.rounded} ${legendaryRingClass} ${className}`}
        style={ringStyle}
      >
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
        loading={isHero ? 'eager' : 'lazy'}
        {...(isHero ? { width: 288, height: 288 } : {})}
        className={`relative h-full w-full ${s.rounded} motion-safe:animate-idle-breath ${
          bg ? 'object-contain p-1' : 'object-cover'
        }`}
      />

      {rarity === 'legendary' && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${s.rounded} bg-hfz-holographic motion-safe:animate-holographic opacity-[0.07] mix-blend-overlay`}
          style={{ backgroundSize: '200% 200%' }}
        />
      )}

      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          loading="lazy"
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
            frameOverlay ? 'scale-[1.4]' : 'scale-[1.12]'
          }`}
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
    </div>
  )
}
