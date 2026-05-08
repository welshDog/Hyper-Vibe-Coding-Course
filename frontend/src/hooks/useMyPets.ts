// useMyPets — fetches the signed-in user's BROskiPet collection.
//
// RLS handles the user filter (policy: "users read own pets"). The .eq()
// is belt-and-braces so the query plan still uses idx_pets_user_id.
//
// The pets table is populated by the mint-pet-auth Edge Function in relay
// mode. After a successful mint, callers should call refetch() — the row
// may take a beat to land, so we expose a refetch rather than auto-polling.

import { useCallback, useEffect, useState } from 'react'

import { useAuthStore } from '../context/auth'
import { supabase } from '../lib/supabase'
import type { Pet } from '../components/pets/PetCard'

type UseMyPetsResult = {
  pets:    Pet[]
  loading: boolean
  error:   Error | null
  refetch: () => Promise<void>
}

export function useMyPets(): UseMyPetsResult {
  const userId = useAuthStore((s) => s.user?.id)

  const [pets,    setPets]    = useState<Pet[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(userId))
  const [error,   setError]   = useState<Error | null>(null)

  const fetchPets = useCallback(async () => {
    if (!userId) {
      setPets([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryErr } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (queryErr) throw queryErr
      setPets((data ?? []) as Pet[])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load pets'))
      setPets([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Defer to a 0-tick timeout so the setState calls inside fetchPets don't
  // fire synchronously within the effect — same pattern as HUDContext.
  useEffect(() => {
    const id = setTimeout(() => { void fetchPets() }, 0)
    return () => clearTimeout(id)
  }, [fetchPets])

  return { pets, loading, error, refetch: fetchPets }
}
