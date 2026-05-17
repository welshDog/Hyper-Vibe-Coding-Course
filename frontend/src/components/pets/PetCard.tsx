// PetCard — primary view of an owned BROskiPet.
//
// Two sizes:
//   - 'full' (default): hero card on the Pets page
//   - 'mini': horizontal-scroll squad row (Phase 2C)
//
// XP source is overridable. Default behaviour mirrors the user's total_xp
// from the HUD — see Phase 2A spec, "Option A". Per-pet XP becomes possible
// when the pets table grows an `xp` column in a future migration.

import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { HVZCard, HVZTag, type TagColor } from '../ui/hvz'
import { useHUD } from '../../hooks/useHUD'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { getSpecies, RARITY_LABELS, type Rarity, type SpeciesId } from '../../lib/species'
import {
  baseScanTxUrl,
  STAGE_BY_KEY,
  type PetMood,
  type PetStage,
} from '../../lib/evolution'
import { MoodBadge } from './MoodBadge'
import { XPBar } from './XPBar'

// Pointer-tracked tilt — Pokémon-card holo feel without the gaudy.
// Capped at ~6° so it stays elegant; perspective 1000px keeps the depth shallow.
const MAX_TILT_DEG = 6

export type Pet = {
  id:              string
  pet_id:          string
  species_id:      SpeciesId
  pet_name:        string
  rarity:          Rarity
  stage:           PetStage
  mood:            PetMood
  evolution_count: number
  last_evolved_at: string | null
  mint_tx_hash:    `0x${string}`
  ipfs_cid:        string
  chain_id:        number
  created_at:      string
  /** Equipped cosmetics by slot → shop_item uuid. Written via the equip RPC. */
  cosmetics?:      Partial<Record<PetCosmeticSlot, string>>
}

export type PetCosmeticSlot = 'aura' | 'frame' | 'badge' | 'background'

/** A resolved cosmetic (slot id → its art), passed in by the Pets page. */
export type EquippedCosmetics = Partial<
  Record<PetCosmeticSlot, { image_url: string | null; name: string }>
>

type Props = {
  pet:         Pet
  /** Override the XP value (otherwise read from useHUD). */
  xpOverride?: number
  size?:       'full' | 'mini'
  onClick?:    () => void
  /** Pet was minted this session — play the gold shimmer sweep once. */
  freshMint?:  boolean
  /** Resolved cosmetic art for this pet's equipped slots (full size only). */
  equipped?:   EquippedCosmetics
}

const RARITY_COLOR: Record<Rarity, TagColor> = {
  common:    'cyan',
  uncommon:  'mint',
  rare:      'violet',
  legendary: 'gold',
}

export function PetCard({ pet, xpOverride, size = 'full', onClick, freshMint = false, equipped }: Props) {
  // ⚠️  All hooks declared up top — Rules of Hooks. Even though `tilt` only
  // matters for the full variant, useState/usePrefersReducedMotion must be
  // called on every render regardless of `size`.
  const species = getSpecies(pet.species_id)
  const hud = useHUD()
  const reduceMotion = usePrefersReducedMotion()
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false })
  const xp = xpOverride ?? hud?.xp ?? 0
  const stageInfo = STAGE_BY_KEY[pet.stage]
  const isLegend = pet.stage === 'legend'
  const isEvolving = pet.mood === 'evolving'

  if (size === 'mini') {
    return (
      <HVZCard
        onClick={onClick}
        padding={16}
        style={{ minWidth: 220 }}
      >
        <div className="flex items-center gap-3">
          <img
            src={species.imageUrl}
            alt=""
            className="h-12 w-12 rounded-hfz-sm object-cover"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-hfz-text-primary truncate">{pet.pet_name}</p>
            <p className="text-[11px] text-hfz-text-secondary truncate">{species.displayName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <HVZTag color={isLegend ? 'gold' : 'violet'}>
                {stageInfo.emoji} {stageInfo.label}
              </HVZTag>
            </div>
          </div>
        </div>
      </HVZCard>
    )
  }

  // Full size — hero card on the Pets page.
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width   // 0..1
    const y = (e.clientY - r.top) / r.height   // 0..1
    setTilt({
      rx: (0.5 - y) * MAX_TILT_DEG,            // tilt forward when cursor low
      ry: (x - 0.5) * MAX_TILT_DEG,            // tilt right when cursor right
      mx: x * 100,
      my: y * 100,
      active: true,
    })
  }
  const handlePointerLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false })

  const tiltStyle = reduceMotion
    ? undefined
    : {
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: 'preserve-3d' as const,
        transition: tilt.active
          ? 'transform 80ms linear'                                  // tracks cursor tightly
          : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',         // springy reset
      }

  return (
    <HVZCard
      onClick={onClick}
      glow={isLegend ? 'gold' : undefined}
    >
      <div
        className="relative flex flex-col sm:flex-row gap-4"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={tiltStyle}
      >
        {/* Holographic sheen — radial gradient follows the cursor, fades on leave. */}
        {!reduceMotion && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-hfz-md mix-blend-overlay transition-opacity duration-300"
            style={{
              opacity: tilt.active ? 0.35 : 0,
              background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.6) 0%, rgba(168,85,247,0.15) 30%, transparent 60%)`,
            }}
          />
        )}

        {freshMint && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-hfz-md"
          >
            <div className="absolute inset-y-0 -left-1/3 w-1/3 motion-safe:animate-gold-sweep bg-gradient-to-r from-transparent via-hfz-gold/30 to-transparent" />
          </div>
        )}

        <div
          className={`relative shrink-0 h-20 w-20 rounded-hfz-md ${isEvolving ? 'motion-safe:animate-border-pulse' : ''}`}
        >
          {/* Background — fills the portrait box behind everything */}
          {equipped?.background?.image_url && (
            <img
              src={equipped.background.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full rounded-hfz-md object-cover"
            />
          )}

          {/* Aura — soft glow ring just behind the pet */}
          {equipped?.aura?.image_url && (
            <img
              src={equipped.aura.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] object-contain blur-[1px] opacity-80 mix-blend-screen"
            />
          )}

          {/* The pet itself — object-contain (with a touch of padding) when a
              background is equipped so the scene shows behind it */}
          <img
            src={species.imageUrl}
            alt={species.displayName}
            loading="lazy"
            className={`relative h-20 w-20 rounded-hfz-md ${
              equipped?.background?.image_url ? 'object-contain p-1' : 'object-cover'
            }`}
          />

          {/* Frame — decorative border on top, never intercepts clicks */}
          {equipped?.frame?.image_url && (
            <img
              src={equipped.frame.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none absolute -inset-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] object-contain"
            />
          )}

          {/* Badge — corner chip; falls back to the legend sparkle */}
          {equipped?.badge?.image_url ? (
            <img
              src={equipped.badge.image_url}
              alt={equipped.badge.name}
              title={equipped.badge.name}
              loading="lazy"
              className="absolute -bottom-2 -right-2 h-7 w-7 object-contain drop-shadow"
            />
          ) : (
            isLegend && (
              <span
                aria-hidden
                className="absolute -bottom-1 -right-1 text-lg drop-shadow"
                title="Fully evolved"
              >
                ✨
              </span>
            )
          )}
        </div>

        <div className="flex-1 min-w-0">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight text-hfz-text-primary truncate">{pet.pet_name}</h3>
              <p className="text-xs text-hfz-text-secondary">
                <span className="font-mono">{pet.pet_id}</span>
                <span className="opacity-60"> · </span>
                {species.displayName}
              </p>
            </div>
            <HVZTag color={RARITY_COLOR[pet.rarity]}>{RARITY_LABELS[pet.rarity]}</HVZTag>
          </header>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-hfz-violet-light mb-1">
              Stage: {stageInfo.label} {stageInfo.emoji}
              {pet.evolution_count > 0 && (
                <span className="ml-2 opacity-70">· {pet.evolution_count}× evolved</span>
              )}
            </p>
            <XPBar xp={xp} isEvolving={isEvolving} />
          </div>

          <footer className="mt-3 flex flex-wrap items-center gap-2">
            <MoodBadge mood={pet.mood} />
            <a
              href={baseScanTxUrl(pet.mint_tx_hash, pet.chain_id)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-hfz-violet-light hover:underline"
            >
              ↗ BaseScan
            </a>
          </footer>
        </div>
      </div>
    </HVZCard>
  )
}
