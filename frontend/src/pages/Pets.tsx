// /pets — BROskiPet minting page.
//
// Three-step flow:
//   1. Pick a species (SpeciesPicker)
//   2. Name your pet + choose rarity
//   3. Mint (MintPetButton — handles wallet connect, balance gate, on-chain tx)
//
// `mintedPets` keeps a session-local list of just-minted pets. A future
// version should hydrate this from on-chain `PetMinted` events keyed by
// the connected wallet so the user sees their full collection.

import { useState } from 'react'
import { HVZCard, HVZTag, HVZButton } from '../components/ui/hvz'
import { SpeciesPicker } from '../components/pets/SpeciesPicker'
import { MintPetButton } from '../components/pets/MintPetButton'
import {
  RARITIES,
  RARITY_LABELS,
  SPECIES,
  getSpecies,
  type Rarity,
  type SpeciesId,
} from '../lib/species'

type MintedPet = {
  txHash:    `0x${string}`
  petName:   string
  speciesId: SpeciesId
  rarity:    Rarity
  mintedAt:  number
}

export default function Pets() {
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(null)
  const [petName,   setPetName]   = useState('')
  const [rarity,    setRarity]    = useState<Rarity>('common')
  const [minted,    setMinted]    = useState<MintedPet[]>([])

  const species = speciesId ? getSpecies(speciesId) : null

  const handleMinted = ({ txHash, petName, species: id }: { txHash: `0x${string}`; petName: string; species: string }) => {
    setMinted((prev) => [
      { txHash, petName, speciesId: id as SpeciesId, rarity, mintedAt: Date.now() },
      ...prev,
    ])
    setPetName('')
    setSpeciesId(null)
  }

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

      {/* Step 1 — pick species */}
      <section aria-labelledby="step1" className="flex flex-col gap-3">
        <h2 id="step1" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
          Step 1 — Pick a species ({SPECIES.length} available)
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

      {/* Just-minted collection */}
      {minted.length > 0 && (
        <section aria-labelledby="minted" className="flex flex-col gap-3">
          <h2 id="minted" className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
            Your fresh mints this session
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {minted.map((m) => {
              const sp = getSpecies(m.speciesId)
              return (
                <HVZCard key={m.txHash} as="li">
                  <div className="flex items-center gap-3">
                    <img src={sp.imageUrl} alt="" className="h-14 w-14 rounded-hfz-sm object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-hfz-text-primary truncate">{m.petName}</p>
                      <p className="text-xs text-hfz-text-secondary">{sp.displayName}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <HVZTag color="violet">{m.rarity}</HVZTag>
                        <HVZTag color="cyan">Baby</HVZTag>
                      </div>
                    </div>
                  </div>
                </HVZCard>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
