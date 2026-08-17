// PetPortrait — the one place a BROskiPet's species art + equipped cosmetics
// are layered. Used by PetCard (full + mini) and PetSquadRow (hero + mini),
// so equip styling stays identical everywhere.
//
// Two groups, not one flat stack — this is what keeps it reading as one
// card instead of stacked images:
//   - Card content (clipped to the card's own bounds + rounded corners via
//     overflow-hidden): background, species, legendary shimmer, frame.
//     A frame is a border — it must belong to the card, not float past it.
//   - Ambient overlays (deliberately unclipped, positioned against the
//     outer wrapper): aura (a glow meant to surround the pet past the card
//     edge) and badge (a corner pin meant to overhang the corner).
//
// Stack, back → front, within the clipped card:
//   background  fills the box behind the pet — prefers overlay_image_url
//               (full-bleed scene art), falls back to the catalogue
//               image_url (may have a baked vignette) for items without one
//   species     the pet itself (object-contain when a background shows)
//   frame       decorative border on top (never intercepts clicks) — only
//               overlay_image_url (transparent art) is safe to composite
//               here; catalogue image_url is opaque shop-preview art and
//               is a same-known-bug fallback until an item gets one
// Ambient, outside the clip: aura (soft glow behind the pet, scaled past
// the box) then badge (corner chip — falls back to `cornerFallback`, e.g.
// legend ✨).
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

      {/* Aura — an ambient glow, not a card layer. It's deliberately scaled
          past the card (surrounds the pet like a halo) and blend-mode
          softened, so it sits outside the clipped card box below rather
          than being cropped by it. Positioned against this outer div, which
          shrink-wraps to the exact size of that sized box either way. */}
      {aura && (
        <img
          src={aura}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-aura' : undefined}
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.5] blur-[1px] ${
            auraOverlay
              // Overlay path (real transparent art) — already alpha-clean,
              // so it doesn't need the screen-blend transparency trick.
              // Applying it anyway washes out the glow, the same problem
              // documented on the frame layer below. Lower opacity keeps
              // it reading as a soft ambient glow rather than a fog.
              ? 'opacity-30'
              // Fallback path only (#51 items not yet cropped to
              // transparent overlay art) — catalogue-card aura art has a
              // dark/near-black background; mix-blend-screen makes those
              // near-black pixels transparent, same trick the frame
              // layer's fallback path uses.
              : 'opacity-80 mix-blend-screen'
          }`}
        />
      )}

      {/* Card content — background/species/frame must all read as one card,
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
          className={`absolute inset-0 h-full w-full object-cover ${s.rounded}`}
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
          data-testid={isHero ? 'pet-portrait-frame' : undefined}
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
            frameOverlay
              ? 'scale-[1.4]'
              // Fallback path only (#51 items not yet cropped to transparent
              // overlay art) — catalogue-card frames like this are opaque
              // with a dark/near-black background that otherwise fully
              // hides the pet. mix-blend-screen makes near-black pixels
              // transparent, same trick the aura layer already relies on.
              // Verified empirically this doesn't touch already-migrated
              // overlay frames (this branch never runs for them) and
              // visibly washes out their glow if applied there too — so
              // it's deliberately scoped to only the fallback path.
              : 'scale-[1.12] mix-blend-screen'
          }`}
        />
      )}
      </div>

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
