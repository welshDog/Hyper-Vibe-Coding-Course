// useCareInventory — the signed-in user's owned, unused Feed/Clean/Play items.
//
// Pulls shop_purchases (RLS: owner-read) with the joined shop_items row,
// filtered to used_at IS NULL (still-available inventory) and grouped by
// the item's metadata.effect_type ('feed' | 'care' | 'play' — set by
// migration 20260801120000). Items whose effect_type is something else
// (boost) are future-wave and intentionally excluded here.

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../context/auth'
import { supabase } from '../lib/supabase'

export type CareItem = {
  purchaseId:  string
  itemId:      string
  name:        string
  imageUrl:    string | null
  effectValue: number
}

type PurchaseRow = {
  id:      string
  item_id: string
  shop_items: {
    id:        string
    name:      string
    image_url: string | null
    metadata:  { effect_type?: string; effect_value?: number } | null
  } | null
}

type UseCareInventoryResult = {
  feedItems: CareItem[]
  careItems: CareItem[]
  playItems: CareItem[]
  loading:   boolean
  error:     Error | null
  refetch:   () => Promise<void>
}

function toCareItem(row: PurchaseRow): CareItem | null {
  const it = row.shop_items
  const effectValue = it?.metadata?.effect_value
  if (!it || typeof effectValue !== 'number') return null
  return { purchaseId: row.id, itemId: it.id, name: it.name, imageUrl: it.image_url, effectValue }
}

export function useCareInventory(): UseCareInventoryResult {
  const userId = useAuthStore((s) => s.user?.id)

  const [rows,    setRows]    = useState<PurchaseRow[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(userId))
  const [error,   setError]   = useState<Error | null>(null)

  const fetchInventory = useCallback(async () => {
    if (!userId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryErr } = await supabase
        .from('shop_purchases')
        .select('id, item_id, shop_items(id, name, image_url, metadata)')
        .eq('user_id', userId)
        .is('used_at', null)

      if (queryErr) throw queryErr
      setRows((data ?? []) as PurchaseRow[])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load care inventory'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const id = setTimeout(() => { void fetchInventory() }, 0)
    return () => clearTimeout(id)
  }, [fetchInventory])

  const feedItems = useMemo(
    () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'feed').map(toCareItem).filter((i): i is CareItem => i !== null),
    [rows],
  )
  const careItems = useMemo(
    () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'care').map(toCareItem).filter((i): i is CareItem => i !== null),
    [rows],
  )
  const playItems = useMemo(
    () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'play').map(toCareItem).filter((i): i is CareItem => i !== null),
    [rows],
  )

  return { feedItems, careItems, playItems, loading, error, refetch: fetchInventory }
}
