// PetCareSection — Section between the hero row and EvolutionTimeline.
//
// Two buttons (Feed, Clean) each show a live drifted Hunger/Cleanliness
// bar and, on click, expand a grid of owned unused compatible items
// (useCareInventory). Selecting one calls use_care_item(), then refetches
// both the pet and the inventory. No optimistic UI — same await-then-
// refetch convention as Pets.tsx's handleEquip/handleUnequip.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HVZCard, HVZButton, HVZProgress } from '../ui/hvz'
import { supabase } from '../../lib/supabase'
import { driftedStat } from '../../lib/evolution'
import { useCareInventory, type CareItem } from '../../hooks/useCareInventory'
import type { Pet } from './PetCard'

type Action = 'feed' | 'care'

const ACTION_LABEL: Record<Action, string> = { feed: 'Feed', care: 'Clean' }
const ACTION_EMOJI: Record<Action, string> = { feed: '🍔', care: '🧼' }

type Toast = { text: string; bonus?: string }

type CareRpcResult = {
  ok?:          boolean
  target_stat?: string
  new_value?:   number
  xp_awarded?:  number
  duo_bonus?:   boolean
  error?:       string
}

const DUO_BONUS_XP = 5

function prettyCareError(raw: string | undefined): string {
  switch (raw) {
    case 'not_your_pet':      return "That's not your pet."
    case 'not_owned':         return "You don't own that item."
    case 'already_used':      return "That item's already been used."
    case 'wrong_effect_type': return "That item doesn't work for this action."
    case 'invalid_action':    return "That action isn't available."
    case 'unsupported_stat':  return "Couldn't complete that — give it another go."
    case 'not_authenticated': return 'Please sign in again.'
    default:                  return raw || "Couldn't complete that — give it another go."
  }
}

type Props = {
  pet: Pet
  onActionComplete: () => void
}

export function PetCareSection({ pet, onActionComplete }: Props) {
  const { feedItems, careItems, loading, refetch } = useCareInventory()
  const [openAction, setOpenAction] = useState<Action | null>(null)
  const [busy,        setBusy]      = useState(false)
  const [errorMsg,    setErrorMsg]  = useState<string | null>(null)
  const [toast,       setToast]     = useState<Toast | null>(null)

  const items: Record<Action, CareItem[]> = { feed: feedItems, care: careItems }
  const statValue: Record<Action, number> = {
    feed: driftedStat(pet.hunger, pet.hunger_updated_at),
    care: driftedStat(pet.cleanliness, pet.cleanliness_updated_at),
  }
  const statLabel: Record<Action, string> = { feed: 'Hunger', care: 'Cleanliness' }

  const handleUse = async (action: Action, item: CareItem) => {
    setBusy(true)
    setErrorMsg(null)
    const beforeValue = statValue[action]
    const { data, error } = await supabase.rpc('use_care_item', {
      p_purchase_id: item.purchaseId,
      p_pet_id:      pet.id,
      p_action:      action,
    })
    const result = data as CareRpcResult | null
    if (error || !result?.ok) {
      setErrorMsg(prettyCareError(result?.error ?? error?.message))
    } else {
      // Derive the toast from what the RPC actually did, not what the item's
      // face value claims — near the 0-100 cap a clamp can shrink the real
      // delta below the item's nominal effectValue.
      const delta = typeof result.new_value === 'number' ? result.new_value - beforeValue : item.effectValue
      const totalXp = result.xp_awarded ?? 0
      const baseXp = result.duo_bonus ? totalXp - DUO_BONUS_XP : totalXp
      setToast({
        text: `${pet.pet_name} loved that ${action === 'feed' ? 'snack' : 'clean-up'}! +${delta} ${statLabel[action]} · +${baseXp} XP`,
        bonus: result.duo_bonus ? `Daily care complete! +${DUO_BONUS_XP} bonus XP 🎉` : undefined,
      })
      await refetch()
      onActionComplete()
      setOpenAction(null)
    }
    setBusy(false)
  }

  return (
    <div data-testid="pet-care-section">
      <HVZCard variant="chunky">
        <header className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Pet Care
          </h2>
        </header>

        {errorMsg && (
          <p role="status" className="mb-3 rounded-hfz-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-700">
            ⚠️ {errorMsg}
          </p>
        )}
        {toast && (
          <div role="status" className="mb-3 flex flex-col gap-1 rounded-hfz-sm border-2 border-pet-slime-dark/50 bg-pet-slime/10 px-3 py-2">
            <p className="text-xs font-semibold text-pet-ink">{toast.text}</p>
            {toast.bonus && <p className="text-xs font-bold text-pet-gold-dark">{toast.bonus}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['feed', 'care'] as const).map((action) => (
            <div key={action} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <HVZButton
                  variant="primary"
                  chunky
                  onClick={() => setOpenAction(openAction === action ? null : action)}
                  disabled={busy}
                >
                  <span aria-hidden>{ACTION_EMOJI[action]}</span> {ACTION_LABEL[action]}
                </HVZButton>
                <span className="text-[11px] text-pet-ink-soft">{statLabel[action]}</span>
              </div>
              <HVZProgress
                value={statValue[action]}
                max={100}
                gradient="xp"
                ariaLabel={statLabel[action]}
                trackStyle={{ border: '2px solid #241C3D', background: '#FFF8EC' }}
              />

              {openAction === action && (
                <div className="mt-2 rounded-hfz-md border-2 border-pet-ink/15 bg-pet-lilac/10 p-3">
                  {loading ? (
                    <p className="text-xs text-pet-ink-soft">Loading…</p>
                  ) : items[action].length === 0 ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-pet-ink-soft">
                        You don't have any {action === 'feed' ? 'snacks' : 'cleaning supplies'} yet — grab some in the shop 🛍️
                      </p>
                      <Link to="/shop" className="text-xs font-semibold text-pet-slime-dark hover:text-pet-wood-dark">
                        Go to shop →
                      </Link>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {items[action].map((item) => (
                        <li key={item.purchaseId}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => { void handleUse(action, item) }}
                            className="w-full text-left text-xs font-medium text-pet-ink hover:text-pet-wood-dark disabled:opacity-50"
                          >
                            {item.name} <span className="text-pet-ink-soft">(+{item.effectValue})</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </HVZCard>
    </div>
  )
}