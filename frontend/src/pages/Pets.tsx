// /pets — BROskiPet collection + minting page.
//
// Section 0 (top): your persistent pet collection — comes from public.pets
// via useMyPets, populated by mint-pet-auth Edge Fn after a successful relay
// mint. Reloads survive.
//
// Steps 1–3: the live mint flow (unchanged from May 7 ship).
//   1. Pick a species (SpeciesPicker)
//   2. Name your pet + choose rarity
//   3. Mint (MintPetButton — handles wallet connect, balance gate, on-chain tx)
//
// After a mint confirms we refetch useMyPets — Edge Fn INSERT may take a
// beat to land, so we retry once with a small delay.

import { useEffect, useState } from 'react'
import { HVZCard, HVZButton } from '../components/ui/hvz'
import { SpeciesPicker } from '../components/pets/SpeciesPicker'
import { MintPetButton } from '../components/pets/MintPetButton'
import { PetCard } from '../components/pets/PetCard'
import { useMyPets } from '../hooks/useMyPets'
import {
  RARITIES,
  RARITY_LABELS,
  SPECIES,
  getSpecies,
  type Rarity,
  type SpeciesId,
} from '../lib/species'

export default function Pets() {
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(null)
  const [petName,   setPetName]   = useState('')
  const [rarity,    setRarity]    = useState<Rarity>('common')
  const [justMintedTx, setJustMintedTx] = useState<`0x${string}` | null>(null)

  const { pets, loading: petsLoading, error: petsError, refetch } = useMyPets()
  const species = speciesId ? getSpecies(speciesId) : null

  const handleMinted = ({ txHash }: { txHash: `0x${string}`; petName: string; species: string }) => {
    setJustMintedTx(txHash)
    setPetName('')
    setSpeciesId(null)
    // Edge Fn INSERT may not have landed yet — refetch now and again shortly.
    void refetch()
  }

  // Belt-and-braces refetch in case the Edge Fn INSERT trails the on-chain
  // confirmation. The "syncing" UI below derives from the same predicate, so
  // we don't need to clear justMintedTx — it just stays at the most recent
  // tx and gets overwritten by the next mint.
  const awaitingSync = justMintedTx !== null && !pets.some((p) => p.mint_tx_hash === justMintedTx)
  useEffect(() => {
    if (!awaitingSync) return
    const timer = setTimeout(() => { void refetch() }, 1500)
    return () => clearTimeout(timer)
  }, [awaitingSync, refetch])

  return (
    <div className="mx-auto max-w-hfz-page px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-hfz-text-primary">
          🐾 BROski Pets
        </h1>
        <p className="mt-2 text-hfz-text-secondary">
          Mint your AI-evolving Pet on Base. Earn XP through quests, evolve through 6 stages, own it forever.
        </p>
      </header>

      {/* Section 0 — Your Pets (persistent collection) */}
      {(pets.length > 0 || petsLoading) && (
        <section aria-labelledby="my-pets" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="my-pets" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
              {petsLoading && pets.length === 0 ? 'Loading your pets…' : `Your pets (${pets.length})`}
            </h2>
            {awaitingSync && (
              <span className="text-[11px] text-hfz-text-secondary animate-pulse">
                Syncing fresh mint…
              </span>
            )}
          </div>
          {petsError ? (
            <HVZCard>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-red-300">Couldn’t load your pets: {petsError.message}</p>
                <HVZButton variant="ghost" size="sm" onClick={() => { void refetch() }}>
                  Retry
                </HVZButton>
              </div>
            </HVZCard>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {pets.map((p) => (
                <li key={p.id}>
                  <PetCard pet={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Step 1 — pick species */}
      <section aria-labelledby="step1" className="flex flex-col gap-3">
        <h2 id="step1" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
          {pets.length > 0 ? 'Mint another' : `Step 1 — Pick a species (${SPECIES.length} available)`}
        </h2>
        <HVZCard>
          <SpeciesPicker selected={speciesId} onSelect={setSpeciesId} />
        </HVZCard>
      </section>

      {/* Step 2 — name + rarity */}
      {species && (
        <section aria-labelledby="step2" className="flex flex-col gap-3">
          <h2 id="step2" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
            Step 2 — Name your {species.displayName}
          </h2>
          <HVZCard>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-hfz-text-secondary">
                  Pet name (1–32 chars)
                </span>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  maxLength={32}
                  placeholder={`e.g. Sparkle, Bytecrunch, ${species.emoji}-Master`}
                  className="rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black px-3 py-2 text-hfz-text-primary placeholder:text-hfz-text-secondary/50 focus:border-hfz-violet-light focus:outline-none focus:ring-2 focus:ring-hfz-violet-light/30"
                />
              </label>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-semibold uppercase tracking-wider text-hfz-text-secondary">
                  Rarity tier
                </legend>
                <div className="flex flex-wrap gap-2">
                  {RARITIES.map((r) => (
                    <HVZButton
                      key={r}
                      variant={rarity === r ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setRarity(r)}
                    >
                      {RARITY_LABELS[r]}
                    </HVZButton>
                  ))}
                </div>
                <p className="text-[11px] text-hfz-text-secondary mt-1">
                  All rarities cost the same to mint (100 BROski$). Rarity affects power-multiplier + visual flair.
                </p>
              </fieldset>
            </div>
          </HVZCard>
        </section>
      )}

      {/* Step 3 — mint */}
      {species && (
        <section aria-labelledby="step3" className="flex flex-col gap-3">
          <h2 id="step3" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
            Step 3 — Mint
          </h2>
          <HVZCard>
            <MintPetButton
              species={species}
              petName={petName}
              rarity={rarity}
              onMinted={handleMinted}
            />
          </HVZCard>
        </section>
      )}
    </div>
  )
}
