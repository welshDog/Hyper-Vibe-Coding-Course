// PetPortrait — the one place a BROskiPet's species art + equipped cosmetics
// are layered. Used by PetCard (full + mini) and PetSquadRow (hero + mini),
// so equip styling stays identical everywhere.
//
// Reads as a collectible card stack, back to front:
//   background  the scene plate — inset on the hero size so it tucks
//               behind the frame instead of filling the box edge-to-edge
//               like a poster. Prefers overlay_image_url (full-bleed scene
//               art), falls back to the catalogue image_url (may have a
//               baked vignette) for items without one.
//   frame       the collectible boundary, sitting behind the pet's own
//               square so the pet reads as the hero framed inside it,
//               not something laid on top of the pet. Only
//               overlay_image_url (transparent border art) is safe here;
//               catalogue image_url is opaque shop-preview art and is a
//               same-known-bug fallback until an item gets one. Species
//               art is itself an opaque square (no alpha) — the pet gets
//               extra inward padding whenever a frame is equipped so its
//               square doesn't fully cover the frame's ring.
//   species     the pet itself, always the dominant element.
//   aura        energy around/over the pet, not muddying the backdrop —
//               deliberately unclipped and painted *after* the card so it
//               reads as a glow in front of the pet's edge, not a smear
//               hidden under the opaque background/species layers below
//               it. Source art (both overlay and fallback) is opaque with
//               a near-black backing, not real alpha, so it always needs
//               mix-blend-screen regardless of path.
//   badge       a corner pin, always topmost so it reads clean — falls
//               back to `cornerFallback` (e.g. legend ✨) when unequipped.
//
// Two DOM groups, not one flat stack — this is what keeps it reading as
// one card instead of stacked images:
//   - Card content (clipped to the card's own bounds + rounded corners via
//     overflow-hidden): background, frame, species, legendary shimmer.
//   - Ambient overlays (deliberately unclipped, positioned against the
//     outer wrapper, painted AFTER the card so they sit in front of it):
//     aura, then badge.
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
    badge:   'h-16 w-16 -bottom-3 -right-3',
  },
  lg: {
    box:     'h-20 w-20',
    rounded: 'rounded-hfz-md',
    badge:   'h-10 w-10 -bottom-2 -right-2',
  },
  sm: {
    box:     'h-12 w-12',
    rounded: 'rounded-hfz-sm',
    badge:   'h-7 w-7 -bottom-1.5 -right-1.5',
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
  // Background catalogue art may have a baked vignette border (a "scene
  // inside a card"), same class of problem frame's promo-card art had —
  // only overlay_image_url (full-bleed scene art) is safe to render
  // edge-to-edge here. Blank/whitespace-only values count as absent.
  const rawBgOverlay = equipped?.background?.overlay_image_url?.trim()
  const bgOverlay = rawBgOverlay ? rawBgOverlay : undefined
  const bg = bgOverlay ?? equipped?.background?.image_url
  // Aura catalogue art may have a lot of dead starfield margin around the
  // actual ring — only overlay_image_url (tightly cropped) is meant to be
  // rendered at the larger portrait scale. Blank/whitespace-only values
  // count as absent, same as null.
  const rawAuraOverlay = equipped?.aura?.overlay_image_url?.trim()
  const auraOverlay = rawAuraOverlay ? rawAuraOverlay : undefined
  const aura = auraOverlay ?? equipped?.aura?.image_url
  // Frame catalogue art is an opaque shop-preview card, not compositable —
  // only overlay_image_url (transparent border/glow art) is safe to lay
  // directly over the pet. Falls back to the old opaque art (same
  // known "covers the pet" look) for frames that don't have one yet.
  // Blank/whitespace-only values count as absent, same as null.
  const rawFrameOverlay = equipped?.frame?.overlay_image_url?.trim()
  const frameOverlay = rawFrameOverlay ? rawFrameOverlay : undefined
  const frame = frameOverlay ?? equipped?.frame?.image_url
  const badge = equipped?.badge
  // Badge catalogue art may have dead starfield margin like aura — only
  // overlay_image_url (tightly cropped to the medallion) is meant to be
  // rendered at the larger badge size. Blank/whitespace-only values count
  // as absent, same as null.
  const rawBadgeOverlay = badge?.overlay_image_url?.trim()
  const badgeOverlay = rawBadgeOverlay ? rawBadgeOverlay : undefined
  const badgeSrc = badgeOverlay ?? badge?.image_url
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

      {/* Card content — background/frame/species must all read as one card,
          so they share this box's exact bounds and rounded corners via
          overflow-hidden. Without this, an oversized frame (any frame not
          yet cropped to overlay art — see #51) renders as an unclipped
          square floating past the card's rounded edge instead of a border
          that belongs to it. */}
      <div
        className={`relative shrink-0 overflow-hidden ${s.box} ${s.rounded} ${legendaryRingClass} ${className}`}
        style={ringStyle}
      >
      {bg && (
        <img
          src={bg}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-background' : undefined}
          className={`absolute object-cover ${s.rounded} ${
            // Shrunk on the hero size only — this is the "scene plate
            // tucked behind the frame" read. At lg/sm the box is already
            // tiny (48-80px); an inset there reads as a mushy floating
            // square instead of a card, so those keep the full-bleed fill.
            isHero ? 'inset-[6%]' : 'inset-0 h-full w-full'
          }`}
        />
      )}

      {/* Frame — behind the pet, not on top of it. Species art has no
          alpha (it's an opaque square, confirmed by direct pixel check),
          so the pet's own inward padding below is what reveals this
          layer's ring rather than the frame being drawn over the pet. */}
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-frame' : undefined}
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
            frameOverlay
              ? 'scale-100'
              // Fallback path only (#51 items not yet cropped to transparent
              // overlay art) — catalogue-card frames like this are opaque
              // with a dark/near-black background that would otherwise fully
              // hide the pet. mix-blend-screen makes near-black pixels
              // transparent, same trick the aura layer relies on below.
              : 'scale-100 mix-blend-screen'
          }`}
        />
      )}

      <img
        src={imageUrl}
        alt={alt}
        loading={isHero ? 'eager' : 'lazy'}
        {...(isHero ? { width: 288, height: 288 } : {})}
        className={`relative h-full w-full ${s.rounded} motion-safe:animate-idle-breath ${
          (bg || frame)
            // Hero only: real inward padding so a behind-pet frame's ring
            // (and an inset background) actually show in the gap. At
            // lg/sm (48-80px icons) that padding would shrink the pet to
            // an ~32px core — not worth it where this layering nuance
            // barely reads; keep the old razor-thin margin there instead.
            ? (isHero ? 'object-contain p-[16%]' : 'object-contain p-1')
            : 'object-cover'
        }`}
      />

      {rarity === 'legendary' && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${s.rounded} bg-hfz-holographic motion-safe:animate-holographic opacity-[0.07] mix-blend-overlay`}
          style={{ backgroundSize: '200% 200%' }}
        />
      )}
      </div>

      {/* Aura — painted *after* the clipped card (not before it) so it's
          actually visible in front of the pet instead of hidden behind the
          opaque background/species layers underneath (both are positioned
          siblings with z-index:auto; DOM order after the card wins paint
          order). Deliberately unclipped + scaled past the box so it still
          reads as energy bleeding past the pet's edge, not a flat card
          layer. Source art is opaque with a near-black backing on both the
          overlay and fallback path (checked directly — neither has real
          alpha), so mix-blend-screen is unconditional here: black
          contributes nothing under screen blend regardless of opacity, so
          it never fogs the pet, and only the glow content adds light. */}
      {aura && (
        <img
          src={aura}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-aura' : undefined}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.5] blur-[1px] opacity-70 mix-blend-screen"
        />
      )}

      {/* Badge — a corner pin, not a card layer. It's deliberately anchored
          past the card's own corner (a "medal pinned on" look), so it sits
          outside the clipped card box above rather than being cropped by
          it. Positioned against this outer div, same reasoning as aura. */}
      {badge && badgeSrc ? (
        <img
          src={badgeSrc}
          alt={badge.name}
          title={badge.name}
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-badge' : undefined}
          className={`absolute ${s.badge} object-contain drop-shadow`}
        />
      ) : (
        cornerFallback
      )}
    </div>
  )
}
