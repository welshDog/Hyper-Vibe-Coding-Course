// PetCosmeticsPanel — equip / unequip the cosmetics a user bought from the
// shop onto one BROskiPet. One row per slot (aura / frame / badge /
// background). Equipped state lives in pets.cosmetics; writes go through the
// equip_pet_cosmetic / unequip_pet_cosmetic RPCs (migration 000032).

import { Link } from 'react-router-dom'
import { HVZCard, HVZTag } from '../ui/hvz'
import type { Pet } from './PetCard'
import {
  PET_SLOTS,
  type OwnedCosmetic,
  type PetSlot,
} from '../../hooks/useOwnedCosmetics'

const SLOT_META: Record<PetSlot, { label: string; emoji: string }> = {
  aura:       { label: 'Aura',       emoji: '🌀' },
  frame:      { label: 'Frame',      emoji: '🖼️' },
  badge:      { label: 'Badge',      emoji: '🎖️' },
  background: { label: 'Background', emoji: '🌌' },
}

type Props = {
  pet:        Pet
  bySlot:     Record<PetSlot, OwnedCosmetic[]>
  /** Slot currently mutating (disables that row's buttons). */
  busySlot:   PetSlot | null
  onEquip:    (petId: string, itemId: string) => void
  onUnequip:  (petId: string, slot: PetSlot) => void
}

function Thumb({
  cosmetic,
  active,
  disabled,
  onClick,
}: {
  cosmetic: OwnedCosmetic
  active:   boolean
  disabled: boolean
  onClick:  () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={cosmetic.name}
      aria-pressed={active}
      aria-label={`${active ? 'Equipped' : 'Equip'} ${cosmetic.name}`}
      className={`relative h-14 w-14 shrink-0 rounded-hfz-sm overflow-hidden border transition-all duration-hfz-fast ease-hfz-smooth ${
        active
          ? 'border-hfz-mint ring-2 ring-hfz-mint/50'
          : 'border-hfz-border-violet hover:border-hfz-violet-light'
      } ${disabled ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:scale-[1.05]'}`}
      style={{ background: 'rgba(15,27,53,0.6)' }}
    >
      {cosmetic.image_url ? (
        <img
          src={cosmetic.image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-lg" aria-hidden>
          ✨
        </span>
      )}
      {active && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-hfz-mint text-[10px] font-bold text-hfz-space-black"
        >
          ✓
        </span>
      )}
    </button>
  )
}

export function PetCosmeticsPanel({ pet, bySlot, busySlot, onEquip, onUnequip }: Props) {
  const equipped = pet.cosmetics ?? {}
  const ownsAny = PET_SLOTS.some((s) => bySlot[s].length > 0)

  return (
    <HVZCard padding={20}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
          🎨 Customise {pet.pet_name}
        </h3>
        <Link
          to="/shop"
          className="text-[11px] font-semibold text-hfz-cyan hover:text-hfz-violet-light transition-colors"
        >
          Get more in the shop →
        </Link>
      </div>

      {!ownsAny ? (
        <div className="flex items-center gap-4 rounded-hfz-sm border border-hfz-border-violet bg-hfz-space-black/40 px-4 py-3">
          <span className="text-2xl shrink-0" aria-hidden>🛍️</span>
          <p className="text-xs text-hfz-text-secondary leading-relaxed">
            No cosmetics yet. Grab auras, frames, badges and backgrounds from the{' '}
            <Link to="/shop" className="font-semibold text-hfz-cyan hover:underline">
              BROski$ shop
            </Link>{' '}
            to deck out {pet.pet_name}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {PET_SLOTS.map((slot) => {
            const options = bySlot[slot]
            const equippedId = equipped[slot]
            const meta = SLOT_META[slot]
            const rowBusy = busySlot === slot

            return (
              <div key={slot} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <HVZTag color="violet">
                    {meta.emoji} {meta.label}
                  </HVZTag>
                  {options.length === 0 && (
                    <span className="text-[11px] text-hfz-text-secondary">
                      none owned —{' '}
                      <Link to="/shop" className="text-hfz-cyan hover:underline">
                        shop
                      </Link>
                    </span>
                  )}
                </div>

                {options.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* None / unequip */}
                    <button
                      type="button"
                      onClick={() => onUnequip(pet.id, slot)}
                      disabled={rowBusy || !equippedId}
                      aria-pressed={!equippedId}
                      className={`h-14 w-14 shrink-0 rounded-hfz-sm border text-[11px] font-semibold transition-all duration-hfz-fast ${
                        !equippedId
                          ? 'border-hfz-mint ring-2 ring-hfz-mint/50 text-hfz-mint'
                          : 'border-hfz-border-violet text-hfz-text-secondary hover:border-hfz-violet-light'
                      } ${rowBusy ? 'opacity-50 cursor-wait' : !equippedId ? '' : 'cursor-pointer'}`}
                      style={{ background: 'rgba(15,27,53,0.6)' }}
                      title="No cosmetic in this slot"
                    >
                      None
                    </button>

                    {options.map((c) => (
                      <Thumb
                        key={c.id}
                        cosmetic={c}
                        active={equippedId === c.id}
                        disabled={rowBusy}
                        onClick={() =>
                          equippedId === c.id
                            ? onUnequip(pet.id, slot)
                            : onEquip(pet.id, c.id)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </HVZCard>
  )
}
