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
import {
  PetPortrait,
  type PetCosmeticSlot,
  type EquippedCosmetics,
} from './PetPortrait'
import { EvolveButton } from './EvolveButton'

// Re-exported for back-compat — these types now live in PetPortrait.
export type { PetCosmeticSlot, EquippedCosmetics }

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

type Props = {
  pet:         Pet
  /** Override the XP value (otherwise read from useHUD). */
  xpOverride?: number
  /** 'hero' = large spotlight card on /pets (Moy reskin), size="hero" portrait. */
  size?:       'full' | 'mini' | 'hero'
  onClick?:    () => void
  /** Mini picker strip: highlight this card as the currently-spotlighted pet. */
  selected?:   boolean
  /** Pet was minted this session — play the gold shimmer sweep once. */
  freshMint?:  boolean
  /** Resolved cosmetic art for this pet's equipped slots. */
  equipped?:   EquippedCosmetics
  /** Called after a successful evolve_pet RPC so the parent can refetch. */
  onEvolved?:  () => void
  /** Showcase render for logged-out visitors — swaps the BaseScan tx link for
   *  a "Preview" marker (the pet isn't real on-chain). Everything else, incl.
   *  the holo tilt + rarity ring, stays identical so it feels desirable. */
  demo?:       boolean
}

const RARITY_COLOR: Record<Rarity, TagColor> = {
  common:    'cyan',
  uncommon:  'mint',
  rare:      'violet',
  legendary: 'gold',
}

export function PetCard({ pet, xpOverride, size = 'full', onClick, selected = false, freshMint = false, equipped, onEvolved, demo = false }: Props) {
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
        variant="chunky"
        selected={selected}
        onClick={onClick}
        padding={16}
        style={{ minWidth: 200 }}
      >
        <div className="flex items-center gap-3">
          <PetPortrait
            imageUrl={species.imageUrl}
            alt={species.displayName}
            size="sm"
            rarity={pet.rarity}
            equipped={equipped}
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-pet-ink truncate">{pet.pet_name}</p>
            <p className="text-[11px] text-pet-ink-soft truncate">{species.displayName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <HVZTag variant="chunky" color={isLegend ? 'gold' : 'violet'}>
                {stageInfo.emoji} {stageInfo.label}
              </HVZTag>
            </div>
          </div>
        </div>
      </HVZCard>
    )
  }

  // 'full' (collection grid, legacy) and 'hero' (spotlight, Moy reskin) share
  // this render path — only the portrait size, heading scale, and layout
  // direction (row vs centered stack) differ.
  const isHero = size === 'hero'
  const portraitSize = isHero ? 'hero' : 'lg'
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
      variant="chunky"
      onClick={onClick}
      glow={isLegend ? 'gold' : undefined}
      padding={isHero ? 36 : undefined}
      className={isHero ? 'h-full' : undefined}
      style={
        isHero
          ? { boxShadow: '8px 8px 0 #241C3D', background: '#FFF8EC' }
          : undefined
      }
    >
      <div
        className={`relative flex gap-4 ${isHero ? 'h-full flex-col items-center justify-center text-center gap-6' : 'flex-col sm:flex-row'}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={tiltStyle}
      >
        {/* Holographic sheen — radial gradient follows the cursor, fades on leave. */}
        {!reduceMotion && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-pet-chunky mix-blend-overlay transition-opacity duration-300"
            style={{
              opacity: tilt.active ? 0.35 : 0,
              background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.6) 0%, rgba(168,85,247,0.15) 30%, transparent 60%)`,
            }}
          />
        )}

        {freshMint && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-pet-chunky"
          >
            <div className="absolute inset-y-0 -left-1/3 w-1/3 motion-safe:animate-gold-sweep bg-gradient-to-r from-transparent via-pet-gold/40 to-transparent" />
          </div>
        )}

        <PetPortrait
          imageUrl={species.imageUrl}
          alt={species.displayName}
          size={portraitSize}
          rarity={pet.rarity}
          equipped={equipped}
          className={isEvolving ? 'motion-safe:animate-border-pulse' : undefined}
          cornerFallback={
            isLegend ? (
              <span
                aria-hidden
                className="absolute -bottom-1 -right-1 text-lg drop-shadow"
                title="Fully evolved"
              >
                ✨
              </span>
            ) : null
          }
        />

        <div className={`flex-1 min-w-0 ${isHero ? 'w-full' : ''}`}>
          <header className={`flex items-start gap-3 ${isHero ? 'flex-col items-center' : 'justify-between'}`}>
            <div className="min-w-0">
              <h3 className={`font-bold tracking-tight text-pet-ink truncate ${isHero ? 'text-2xl' : 'text-lg'}`}>{pet.pet_name}</h3>
              <p className="text-xs text-pet-ink-soft">
                <span className="font-mono">{pet.pet_id}</span>
                <span className="opacity-60"> · </span>
                {species.displayName}
              </p>
            </div>
            <HVZTag variant="chunky" color={RARITY_COLOR[pet.rarity]}>{RARITY_LABELS[pet.rarity]}</HVZTag>
          </header>

          <div className={isHero ? 'max-w-sm mx-auto mt-5' : 'mt-3'}>
            <p className={`uppercase tracking-wider text-pet-wood-dark ${isHero ? 'text-xs mb-1.5' : 'text-[11px] mb-1'}`}>
              Stage: {stageInfo.label} {stageInfo.emoji}
              {pet.evolution_count > 0 && (
                <span className="ml-2 opacity-70">· {pet.evolution_count}× evolved</span>
              )}
            </p>
            <XPBar xp={xp} isEvolving={isEvolving} />
          </div>

          <footer className={`flex flex-wrap items-center gap-2 ${isHero ? 'justify-center mt-5' : 'mt-3'}`}>
            <MoodBadge mood={pet.mood} />
            {demo ? (
              <span className="text-xs text-pet-ink-soft/70 select-none">
                ✨ Preview pet
              </span>
            ) : (
              <a
                href={baseScanTxUrl(pet.mint_tx_hash, pet.chain_id)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-pet-wood-dark hover:underline"
              >
                ↗ BaseScan
              </a>
            )}
          </footer>

          {onEvolved && !demo && (
            <EvolveButton pet={pet} onEvolved={onEvolved} />
          )}
        </div>
      </div>
    </HVZCard>
  )
}
