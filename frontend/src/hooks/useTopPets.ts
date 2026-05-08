// useTopPets — public-readable squad row data from the `top_pets` view.
//
// The view is column-restricted (no wallet_address, no user_id, no tx hash)
// and granted SELECT to anon + authenticated, so this works for signed-out
// visitors too. Migration: 20260508120000_broskipets_persistence.

import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import type { PetStage } from '../lib/evolution'
import type { Rarity, SpeciesId } from '../lib/species'

export type TopPet = {
  pet_id:          string
  species_id:      SpeciesId
  pet_name:        string
  rarity:          Rarity
  stage:           PetStage
  evolution_count: number
  created_at:      string
}

type Result = {
  topPets: TopPet[]
  loading: boolean
  error:   Error | null
}

export function useTopPets(limit = 12): Result {
  const [topPets, setTopPets] = useState<TopPet[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error,   setError]   = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const { data, error: queryErr } = await supabase
          .from('top_pets')
          .select('*')
          .limit(limit)

        if (cancelled) return
        if (queryErr) throw queryErr
        setTopPets((data ?? []) as TopPet[])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error('Failed to load top pets'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [limit])

  return { topPets, loading, error }
}
