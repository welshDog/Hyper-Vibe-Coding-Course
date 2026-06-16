// EvolveButton — rendered inside PetCard when the user's XP has unlocked
// a stage the pet hasn't reached yet. Returns null when the pet is current.
//
// Calls the evolve_pet RPC (SECURITY DEFINER, authenticated-only).
// On success, calls onEvolved() so the parent can refetch the pet list.

import { useState } from 'react'
import { HVZButton } from '../ui/hvz'
import { supabase } from '../../lib/supabase'
import { EVOLUTION_STAGES, STAGE_BY_KEY, stageForXp } from '../../lib/evolution'
import { useHUD } from '../../hooks/useHUD'
import type { Pet } from './PetCard'

type Props = {
  pet:       Pet
  onEvolved: () => void
}

export function EvolveButton({ pet, onEvolved }: Props) {
  const hud = useHUD()
  const userXp = hud?.xp ?? 0

  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  const earnedStage = stageForXp(userXp)
  const earnedIdx   = EVOLUTION_STAGES.findIndex((s) => s.key === earnedStage)
  const currentIdx  = EVOLUTION_STAGES.findIndex((s) => s.key === pet.stage)

  if (earnedIdx <= currentIdx) return null

  const targetInfo = STAGE_BY_KEY[earnedStage]

  const handleEvolve = async () => {
    setBusy(true)
    setError(null)
    const { data, error: rpcErr } = await supabase.rpc('evolve_pet', { p_pet_id: pet.id })
    const result = data as { ok?: boolean; error?: string } | null
    if (rpcErr || !result?.ok) {
      setError(result?.error ?? rpcErr?.message ?? 'Evolution failed — try again')
      setBusy(false)
      return
    }
    onEvolved()
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {error && (
        <p role="status" className="text-[11px] text-red-400">
          ⚠️ {error}
        </p>
      )}
      <HVZButton
        variant="primary"
        size="sm"
        disabled={busy}
        fullWidth
        onClick={handleEvolve}
      >
        {busy
          ? '✨ Evolving…'
          : `✨ Evolve to ${targetInfo.label} ${targetInfo.emoji}`}
      </HVZButton>
    </div>
  )
}
