// PetCareSection — Section between the hero row and EvolutionTimeline.
//
// Three buttons (Feed, Clean, Play) each show a live drifted Hunger/
// Cleanliness/Happiness bar and, on click, expand a grid of owned unused
// compatible items (useCareInventory). Selecting one calls use_care_item(),
// then refetches both the pet and the inventory. No optimistic UI — same
// await-then-refetch convention as Pets.tsx's handleEquip/handleUnequip.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HVZCard, HVZButton, HVZProgress, HVZTag, type TagColor } from '../ui/hvz'
import { supabase } from '../../lib/supabase'
import { driftedStat, deriveCareMood, type CareMood } from '../../lib/evolution'
import { useCareInventory, type CareItem } from '../../hooks/useCareInventory'
import type { Pet } from './PetCard'

type Action = 'feed' | 'care' | 'play'

const ACTION_LABEL: Record<Action, string> = { feed: 'Feed', care: 'Clean', play: 'Play' }
const ACTION_EMOJI: Record<Action, string> = { feed: '🍔', care: '🧼', play: '🎮' }
const ACTION_NOUN: Record<Action, string> = { feed: 'snack', care: 'clean-up', play: 'toy' }
const EMPTY_NOUN: Record<Action, string> = { feed: 'snacks', care: 'cleaning supplies', play: 'play items' }
const GRADIENT: Record<Action, 'xp' | 'gold' | 'mint'> = { feed: 'gold', care: 'mint', play: 'xp' }

const MOOD_EMOJI: Record<CareMood, string> = {
  sleepy: '😴', grubby: '🧼', zen: '😌', hype: '🎉', playful: '🙂', content: '😐',
}
const MOOD_LABEL: Record<CareMood, string> = {
  sleepy: 'Sleepy', grubby: 'Grubby', zen: 'Zen', hype: 'Hype', playful: 'Playful', content: 'Content',
}
const MOOD_COLOR: Record<CareMood, TagColor> = {
  sleepy: 'cyan', grubby: 'amber', content: 'violet', zen: 'mint', hype: 'gold', playful: 'pink',
}

type Toast = { text: string; bonus?: string }

type CareRpcResult = {
  ok?:          boolean
  target_stat?: string
  new_value?:   number
  xp_awarded?:  number
  care_bonus?:  boolean
  error?:       string
}

const CARE_BONUS_XP = 10

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
  const { feedItems, careItems, playItems, loading, refetch } = useCareInventory()
  const [openAction, setOpenAction] = useState<Action | null>(null)
  const [busy,        setBusy]      = useState(false)
  const [errorMsg,    setErrorMsg]  = useState<string | null>(null)
  const [toast,       setToast]     = useState<Toast | null>(null)

  const items: Record<Action, CareItem[]> = { feed: feedItems, care: careItems, play: playItems }
  const statValue: Record<Action, number> = {
    feed: driftedStat(pet.hunger, pet.hunger_updated_at),
    care: driftedStat(pet.cleanliness, pet.cleanliness_updated_at),
    play: driftedStat(pet.happiness, pet.happiness_updated_at),
  }
  const statLabel: Record<Action, string> = { feed: 'Hunger', care: 'Cleanliness', play: 'Happiness' }
  const mood = deriveCareMood(statValue.feed, statValue.care, statValue.play, pet.last_play_at)

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
      const baseXp = result.care_bonus ? totalXp - CARE_BONUS_XP : totalXp
      setToast({
        text: `${pet.pet_name} loved that ${ACTION_NOUN[action]}! +${delta} ${statLabel[action]} · +${baseXp} XP`,
        bonus: result.care_bonus ? `Daily care complete! +${CARE_BONUS_XP} bonus XP 🎉` : undefined,
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
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Pet Care
          </h2>
          <HVZTag variant="chunky" color={MOOD_COLOR[mood]}>
            <span aria-hidden>{MOOD_EMOJI[mood]}</span> {MOOD_LABEL[mood]}
          </HVZTag>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['feed', 'care', 'play'] as const).map((action) => (
            <HVZCard key={action} variant="chunky" padding={16}>
              <div className="flex flex-col gap-2">
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
                  gradient={GRADIENT[action]}
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
                          You don't have any {EMPTY_NOUN[action]} yet — grab some in the shop 🛍️
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
                              className="flex w-full items-start gap-2 rounded-hfz-sm border-2 border-pet-ink/15 bg-pet-lilac/10 px-2 py-1.5 text-left text-xs font-medium text-pet-ink transition-transform duration-150 hover:-translate-y-0.5 hover:border-pet-ink/25 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-hfz-sm object-cover" />
                              ) : (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-hfz-sm bg-pet-lilac/30 text-sm" aria-hidden>
                                  {ACTION_EMOJI[action]}
                                </span>
                              )}
                              <span className="flex-1">{item.name}</span>
                              <span className="shrink-0 text-pet-ink-soft">+{item.effectValue}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </HVZCard>
          ))}
        </div>
      </HVZCard>
    </div>
  )
}
