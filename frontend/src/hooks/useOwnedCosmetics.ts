// useOwnedCosmetics — the signed-in user's owned BROskiPet cosmetics.
//
// Pulls shop_purchases (RLS: owner-read) with the joined shop_items row,
// then keeps only items the catalogue tagged as a pet cosmetic
// (shop_items.metadata.pet_slot ∈ aura|frame|badge|background — set by
// migration 000031). These are the only items equip_pet_cosmetic() accepts.
//
// Exposes the flat list plus a bySlot grouping (for the equip panel) and a
// byId lookup (to resolve what a pet has equipped → its art).

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../context/auth'
import { supabase } from '../lib/supabase'

export const PET_SLOTS = ['aura', 'frame', 'badge', 'background'] as const
export type PetSlot = (typeof PET_SLOTS)[number]

export type OwnedCosmetic = {
  id:        string
  name:      string
  image_url: string | null
  slot:      PetSlot
}

type PurchaseRow = {
  item_id: string
  shop_items: {
    id:        string
    name:      string
    image_url: string | null
    metadata:  { pet_slot?: string } | null
  } | null
}

type UseOwnedCosmeticsResult = {
  cosmetics: OwnedCosmetic[]
  bySlot:    Record<PetSlot, OwnedCosmetic[]>
  byId:      Record<string, OwnedCosmetic>
  loading:   boolean
  error:     Error | null
  refetch:   () => Promise<void>
}

function emptyBySlot(): Record<PetSlot, OwnedCosmetic[]> {
  return { aura: [], frame: [], badge: [], background: [] }
}

export function useOwnedCosmetics(): UseOwnedCosmeticsResult {
  const userId = useAuthStore((s) => s.user?.id)

  const [cosmetics, setCosmetics] = useState<OwnedCosmetic[]>([])
  const [loading,   setLoading]   = useState<boolean>(Boolean(userId))
  const [error,     setError]     = useState<Error | null>(null)

  const fetchCosmetics = useCallback(async () => {
    if (!userId) {
      setCosmetics([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryErr } = await supabase
        .from('shop_purchases')
        .select('item_id, shop_items(id, name, image_url, metadata)')
        .eq('user_id', userId)

      if (queryErr) throw queryErr

      const owned: OwnedCosmetic[] = ((data ?? []) as PurchaseRow[])
        .map((row) => {
          const it = row.shop_items
          const slot = it?.metadata?.pet_slot
          if (!it || !slot || !PET_SLOTS.includes(slot as PetSlot)) return null
          return {
            id:        it.id,
            name:      it.name,
            image_url: it.image_url,
            slot:      slot as PetSlot,
          }
        })
        .filter((c): c is OwnedCosmetic => c !== null)

      setCosmetics(owned)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load cosmetics'))
      setCosmetics([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // 0-tick defer — same pattern as useMyPets, keeps setState out of the
  // synchronous effect body.
  useEffect(() => {
    const id = setTimeout(() => { void fetchCosmetics() }, 0)
    return () => clearTimeout(id)
  }, [fetchCosmetics])

  const bySlot = useMemo(() => {
    const grouped = emptyBySlot()
    for (const c of cosmetics) grouped[c.slot].push(c)
    return grouped
  }, [cosmetics])

  const byId = useMemo(() => {
    const m: Record<string, OwnedCosmetic> = {}
    for (const c of cosmetics) m[c.id] = c
    return m
  }, [cosmetics])

  return { cosmetics, bySlot, byId, loading, error, refetch: fetchCosmetics }
}
