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
  const thumbSrc = cosmetic.preview_image_url ?? cosmetic.image_url
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={cosmetic.name}
      aria-pressed={active}
      aria-label={`${active ? 'Equipped' : 'Equip'} ${cosmetic.name}`}
      className={`relative h-14 w-14 shrink-0 rounded-hfz-sm overflow-hidden border-2 transition-all duration-hfz-fast ease-hfz-smooth ${
        active
          ? 'border-pet-slime-dark ring-2 ring-pet-slime-dark/50'
          : 'border-pet-ink/30 hover:border-pet-slime-dark'
      } ${disabled ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:scale-[1.05]'}`}
      style={{ background: '#FFF8EC' }}
    >
      {thumbSrc ? (
        <img
          src={thumbSrc}
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
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pet-slime text-[10px] font-bold text-pet-ink"
        >
          ✓
        </span>
      )}
    </button>
  )
}

export function PetCosmeticsPanel({ pet, bySlot, busySlot, onEquip, onUnequip }: Props) {
  const equipped = pet.cosmetics ?? {}

  return (
    <HVZCard variant="chunky" padding={20}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
          🎨 Customise {pet.pet_name}
        </h3>
        <Link
          to="/shop"
          className="text-[11px] font-semibold text-pet-slime-dark hover:text-pet-wood-dark transition-colors"
        >
          Get more in the shop →
        </Link>
      </div>

      {/* All 4 slots always render — an empty slot shows a dashed placeholder
          tile (not just text) so the customise loop stays visible and
          game-like even before a single shop purchase. */}
      <div className="flex flex-col gap-5">
        {PET_SLOTS.map((slot) => {
          const options = bySlot[slot]
          const equippedId = equipped[slot]
          const meta = SLOT_META[slot]
          const rowBusy = busySlot === slot

          return (
            <div key={slot} className="flex flex-col gap-2">
              <HVZTag variant="chunky" color="violet">
                {meta.emoji} {meta.label}
              </HVZTag>

              {options.length === 0 ? (
                <Link
                  to="/shop"
                  className="flex h-14 w-fit min-w-[160px] items-center gap-2 rounded-hfz-sm border-2 border-dashed border-pet-ink/30 bg-pet-lilac/20 px-3 text-[11px] font-semibold text-pet-ink-soft hover:border-pet-slime-dark hover:text-pet-slime-dark transition-colors"
                >
                  <span className="text-lg opacity-50" aria-hidden>{meta.emoji}</span>
                  Empty — get one in the shop →
                </Link>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* None / unequip */}
                  <button
                    type="button"
                    onClick={() => onUnequip(pet.id, slot)}
                    disabled={rowBusy || !equippedId}
                    aria-pressed={!equippedId}
                    className={`h-14 w-14 shrink-0 rounded-hfz-sm border-2 text-[11px] font-semibold transition-all duration-hfz-fast ${
                      !equippedId
                        ? 'border-pet-slime-dark ring-2 ring-pet-slime-dark/50 text-pet-slime-dark'
                        : 'border-pet-ink/30 text-pet-ink-soft hover:border-pet-slime-dark'
                    } ${rowBusy ? 'opacity-50 cursor-wait' : !equippedId ? '' : 'cursor-pointer'}`}
                    style={{ background: '#FFF8EC' }}
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
    </HVZCard>
  )
}
