// usePetCosmeticArt — resolve shop_item UUIDs → their cosmetic art.
//
// Public/anon-safe: reads shop_items directly (shop_items_public_read grants
// SELECT where is_available = true — every catalogue cosmetic qualifies). No
// shop_purchases, no auth — so the squad row works for signed-out visitors.
//
// Pass the equipped UUIDs harvested off a set of pets; get back a byId map
// the caller turns into per-pet EquippedCosmetics. Re-fetches only when the
// distinct id set actually changes (stable key, not array identity).

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase'
import type { PetSlot } from './useOwnedCosmetics'

export type CosmeticArt = {
  id:        string
  name:      string
  image_url: string | null
  slot:      PetSlot
}

const PET_SLOTS_SET = new Set<PetSlot>(['aura', 'frame', 'badge', 'background'])
const EMPTY: Record<string, CosmeticArt> = {}

type ItemRow = {
  id:        string
  name:      string
  image_url: string | null
  metadata:  { pet_slot?: string } | null
}

export function usePetCosmeticArt(ids: string[]): Record<string, CosmeticArt> {
  // Stable, order-independent key — re-fetch only on a real set change.
  const key = useMemo(() => {
    return Array.from(new Set(ids.filter(Boolean))).sort().join(',')
  }, [ids])

  const [byId, setById] = useState<Record<string, CosmeticArt>>(EMPTY)

  useEffect(() => {
    if (!key) return        // nothing to resolve — hook returns EMPTY below
    let cancelled = false
    const wanted = key.split(',')

    const run = async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('id, name, image_url, metadata')
        .in('id', wanted)

      if (cancelled || error || !data) return

      const next: Record<string, CosmeticArt> = {}
      for (const it of data as ItemRow[]) {
        const slot = it.metadata?.pet_slot
        if (slot && PET_SLOTS_SET.has(slot as PetSlot)) {
          next[it.id] = {
            id:        it.id,
            name:      it.name,
            image_url: it.image_url,
            slot:      slot as PetSlot,
          }
        }
      }
      setById(next)
    }

    void run()
    return () => { cancelled = true }
  }, [key])

  // No ids → EMPTY (stable identity, avoids spurious consumer re-renders).
  return key ? byId : EMPTY
}
