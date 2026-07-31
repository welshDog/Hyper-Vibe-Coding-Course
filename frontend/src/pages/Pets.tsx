// @ts-nocheck
// /pets — BROskiPet collection + minting page.
//
// Section 0 (top): your persistent pet collection — comes from public.pets
// via useMyPets, populated by mint-pet-auth Edge Fn after a successful relay
// mint. Reloads survive.
//
// Steps 1–3: the live mint flow (login-gated).
//   1. Pick a species (SpeciesPicker)
//   2. Name your pet (rarity is rolled server-side on mint — anti-exploit)
//   3. Mint (MintPetButton — handles wallet connect, balance gate, on-chain tx)
//
// After a mint confirms we refetch useMyPets — Edge Fn INSERT may take a
// beat to land, so we retry once with a small delay.

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HVZCard, HVZButton, HVZTag } from '../components/ui/hvz'
import { SpeciesPicker } from '../components/pets/SpeciesPicker'
import { MintPetButton } from '../components/pets/MintPetButton'
import { WalletStatusBadge } from '../components/WalletStatusBadge'
import { PetCard, type Pet } from '../components/pets/PetCard'
import { PetCardSkeleton } from '../components/pets/PetCardSkeleton'
import { XpFeed } from '../components/pets/XpFeed'
import { EvolutionTimeline } from '../components/pets/EvolutionTimeline'
import { PetSquadRow } from '../components/pets/PetSquadRow'
import { PetCosmeticsPanel } from '../components/pets/PetCosmeticsPanel'
import { PetStatusCard } from '../components/pets/PetStatusCard'
import { useMyPets } from '../hooks/useMyPets'
import { useOwnedCosmetics, PET_SLOTS } from '../hooks/useOwnedCosmetics'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../context/auth'
import { useHUD } from '../hooks/useHUD'
import {
  SPECIES,
  RARITY_LABELS,
  getSpecies,
  type SpeciesId,
} from '../lib/species'
import { EVOLUTION_STAGES } from '../lib/evolution'

// Gacha-style rarity odds row for the mint flow (Step 2) — same color
// language as the rarity tag everywhere else on the page (PetCard/PetSquadRow).
const MINT_RARITY_ROW: { key: 'common' | 'uncommon' | 'rare' | 'legendary'; color: 'cyan' | 'mint' | 'violet' | 'gold' }[] = [
  { key: 'common',    color: 'cyan' },
  { key: 'uncommon',  color: 'mint' },
  { key: 'rare',      color: 'violet' },
  { key: 'legendary', color: 'gold' },
]

import { usePetNotifications } from '../hooks/usePetNotifications'

// Showcase pet for logged-out visitors. Not a real on-chain pet — PetCard's
// `demo` flag swaps the BaseScan link for a "Preview" marker. Rarity stays
// honest (rare, not a fabricated "Epic" tier) and the gold/Legend treatment is
// reserved for real pets. xpOverride sits mid-Learner so the bar reads ~60%.
const DEMO_PET: Pet = {
  id:              'demo',
  pet_id:          'broski_demo',
  species_id:      'power_pup',
  pet_name:        'Nimble Wolf',
  rarity:          'rare',
  stage:           'learner',
  mood:            'hyperfocus',
  evolution_count: 1,
  last_evolved_at: null,
  mint_tx_hash:    '0x0000000000000000000000000000000000000000000000000000000000000000',
  ipfs_cid:        '',
  chain_id:        84532,
  created_at:      new Date().toISOString(),
}
const DEMO_PET_XP = 1100

export default function Pets() {
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(null)
  const [petName,   setPetName]   = useState('')
  const [justMintedTx, setJustMintedTx] = useState<`0x${string}` | null>(null)
  // Which pet is spotlighted in the hero card. null = "auto" (fresh mint, else
  // highest-stage pet) — set explicitly when the user clicks the picker strip.
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  const { tokens, streak, xp } = useHUD()

  const { pets, loading: petsLoading, error: petsError, refetch } = useMyPets()
  const { bySlot, byId, refetch: refetchCosmetics } = useOwnedCosmetics()
  const [busy, setBusy] = useState(null)          // { petId, slot } | null
  const [equipError, setEquipError] = useState(null)
  const userId = useAuthStore((s) => s.user?.id)

  const prettyEquipError = (raw) => {
    switch (raw) {
      case 'not_your_pet':       return "That's not your pet."
      case 'not_owned':          return "You don't own that cosmetic yet — grab it in the shop."
      case 'not_a_pet_cosmetic': return "That item can't be equipped on a pet."
      case 'not_authenticated':  return 'Please sign in again.'
      default:                   return raw || "Couldn't update — give it another go."
    }
  }

  // Resolve a pet's equipped slot → cosmetic art (only what the user owns).
  const resolveEquipped = (pet) => {
    const c = pet.cosmetics ?? {}
    const out = {}
    for (const slot of PET_SLOTS) {
      const id = c[slot]
      const owned = id ? byId[id] : undefined
      if (owned) out[slot] = { image_url: owned.image_url, name: owned.name }
    }
    return out
  }

  const handleEquip = async (petId, itemId) => {
    const cos = byId[itemId]
    if (!cos) return
    setBusy({ petId, slot: cos.slot })
    setEquipError(null)
    const { data, error } = await supabase.rpc('equip_pet_cosmetic', {
      p_pet_id: petId,
      p_item_id: itemId,
    })
    if (error || !data?.ok) {
      setEquipError(prettyEquipError(data?.error ?? error?.message))
    } else {
      await refetch()
    }
    setBusy(null)
  }

  const handleUnequip = async (petId, slot) => {
    setBusy({ petId, slot })
    setEquipError(null)
    const { data, error } = await supabase.rpc('unequip_pet_cosmetic', {
      p_pet_id: petId,
      p_slot: slot,
    })
    if (error || !data?.ok) {
      setEquipError(prettyEquipError(data?.error ?? error?.message))
    } else {
      await refetch()
    }
    setBusy(null)
  }

  // Keep the owned-cosmetics list fresh when a shop purchase happens elsewhere.
  void refetchCosmetics
  const species = speciesId ? getSpecies(speciesId) : null
  const showEmptyState = !!userId && !petsLoading && !petsError && pets.length === 0
  const { notifyLevelUp } = usePetNotifications()

  // Track previous pets via a ref (not state) to detect level-ups without a
  // setState-in-effect / render loop. Behaviour identical to before.
  const prevPetsRef = useRef<typeof pets>([])
  useEffect(() => {
    const prevPets = prevPetsRef.current
    pets.forEach(pet => {
      const oldPet = prevPets.find(p => p.id === pet.id)
      if (oldPet && oldPet.stage !== pet.stage) {
        const addr = (pet as any).wallet_address || window.ethereum?.selectedAddress || '0x'
        if (addr && addr !== '0x') {
          notifyLevelUp({
            walletAddress: addr,
            petName: pet.pet_name,
            detail: `Stage: ${pet.stage}`
          }).catch(console.error)
        }
      }
    })
    prevPetsRef.current = pets
  }, [pets, notifyLevelUp])

  const handleMinted = ({ txHash }: { txHash: `0x${string}`; petName: string; species: string }) => {
    setJustMintedTx(txHash)
    setSelectedPetId(null) // back to "auto" so the fresh mint gets spotlighted
    setPetName('')
    setSpeciesId(null)
    void refetch()
  }

  // Hero-pet selection: manual pick wins; else the just-minted pet once it's
  // synced; else highest evolution stage (tie-broken by most-recently-evolved,
  // then newest). Pure render-time derivation — no effect/setState needed.
  const stageIndex = (p) => EVOLUTION_STAGES.findIndex((s) => s.key === p.stage)
  const heroPet =
    (selectedPetId && pets.find((p) => p.id === selectedPetId)) ||
    (justMintedTx && pets.find((p) => p.mint_tx_hash === justMintedTx)) ||
    [...pets].sort((a, b) => {
      const byStage = stageIndex(b) - stageIndex(a)
      if (byStage !== 0) return byStage
      const byEvolved = (b.last_evolved_at ?? '').localeCompare(a.last_evolved_at ?? '')
      if (byEvolved !== 0) return byEvolved
      return b.created_at.localeCompare(a.created_at)
    })[0] ||
    null

  const awaitingSync = justMintedTx !== null && !pets.some((p) => p.mint_tx_hash === justMintedTx)
  useEffect(() => {
    if (!awaitingSync) return
    const timer = setTimeout(() => { void refetch() }, 1500)
    return () => clearTimeout(timer)
  }, [awaitingSync, refetch])

  return (
    <div className="pet-theme-scope bg-pet-diamond -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-hfz-page flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-pet-ink">
            🐾 BROski Pets
          </h1>
          <p className="mt-2 text-pet-ink-soft">
            Mint your AI-evolving Pet on Base. Earn XP through quests, evolve through 6 stages, own it forever.
          </p>
        </div>
        {/* Page-local resource strip — same useHUD() data as the global HUD,
            re-presented in the chunky/pastel style so the dark->light seam
            reads as an intentional "pet food bowl" readout, not a reload of
            the same bar. */}
        <div className="flex items-center gap-3 rounded-pet-chunky border-4 border-pet-ink bg-pet-cream px-4 py-2 shadow-pet-pop-sm shrink-0">
          <span className="flex items-center gap-1.5 text-sm font-bold text-pet-gold-dark">
            🪙 {tokens.toLocaleString()}
          </span>
          <span className="h-4 w-px bg-pet-ink/20" aria-hidden />
          <span className="flex items-center gap-1.5 text-sm font-bold text-pet-wood-dark">
            🔥 {streak > 0 ? `${streak}-day streak` : 'Start your streak today'}
          </span>
        </div>
      </header>

      {/* Section 0 — Your Pets (persistent collection) */}
      {(pets.length > 0 || petsLoading || showEmptyState) && (
        <section aria-labelledby="my-pets" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="my-pets" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
              {petsLoading && pets.length === 0
                ? 'Loading your pets…'
                : pets.length === 0
                ? 'Your pets'
                : `Your pets (${pets.length})`}
            </h2>
            {awaitingSync && (
              <span className="text-[11px] text-pet-ink-soft motion-safe:animate-pulse">
                Syncing fresh mint…
              </span>
            )}
          </div>
          {equipError && (
            <p
              role="status"
              className="rounded-hfz-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-700"
            >
              ⚠️ {equipError}
            </p>
          )}
          {petsError ? (
            <HVZCard>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-red-300">Couldn't load your pets: {petsError.message}</p>
                <HVZButton variant="ghost" size="sm" onClick={() => { void refetch() }}>
                  Retry
                </HVZButton>
              </div>
            </HVZCard>
          ) : petsLoading && pets.length === 0 ? (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3" aria-label="Loading your pets">
              {Array.from({ length: 2 }).map((_, i) => (
                <li
                  key={i}
                  className="motion-safe:animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <PetCardSkeleton />
                </li>
              ))}
            </ul>
          ) : pets.length === 0 ? (
            <HVZCard>
              <div className="flex items-center gap-4">
                <span className="text-3xl shrink-0" aria-hidden>🐣</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-pet-ink">
                    No pets yet — your first companion lands here.
                  </p>
                  <p className="text-xs text-pet-ink-soft mt-1">
                    Pick a species below, name it, and mint. Your collection persists across reloads.
                  </p>
                </div>
              </div>
            </HVZCard>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Hero spotlight + sidebar (customise + status for the
                  spotlighted pet), then evolution full-width below both. This
                  used to have EvolutionTimeline squeezed into the narrow
                  sidebar column (its 6-stage horizontal layout had no room to
                  breathe there) with the sidebar trailing off shorter than
                  the hero, opening a "dead zone" gap. Full-width now, and the
                  new PetStatusCard fills the sidebar out to closer to the
                  hero's height instead of leaving it short. */}
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-start">
                <div
                  className="relative rounded-pet-chunky"
                  style={{
                    background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.9) 0%, rgba(191,232,255,0) 70%)',
                  }}
                >
                  <PetCard
                    pet={heroPet}
                    size="hero"
                    freshMint={heroPet.mint_tx_hash === justMintedTx}
                    equipped={resolveEquipped(heroPet)}
                    onEvolved={() => { void refetch() }}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <PetCosmeticsPanel
                    pet={heroPet}
                    bySlot={bySlot}
                    busySlot={busy?.petId === heroPet.id ? busy.slot : null}
                    onEquip={handleEquip}
                    onUnequip={handleUnequip}
                  />
                  <PetStatusCard
                    petName={heroPet.pet_name}
                    mood={heroPet.mood}
                    xp={xp}
                    equippedCount={Object.keys(resolveEquipped(heroPet)).length}
                  />
                </div>
              </div>

              <EvolutionTimeline />

              {/* Collection picker strip — full collection stays reachable
                  (demoted from the old equal-sized grid, not deleted).
                  Click a card to re-spotlight it above. */}
              {pets.length > 1 && (
                <ul
                  className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
                  aria-label={`Your full pet collection (${pets.length})`}
                >
                  {pets.map((p, i) => (
                    <li
                      key={p.id}
                      className="shrink-0 motion-safe:animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
                    >
                      <PetCard
                        pet={p}
                        size="mini"
                        selected={p.id === heroPet.id}
                        onClick={() => setSelectedPetId(p.id)}
                        equipped={resolveEquipped(p)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {/* Recent XP activity — the cause→effect feed (authenticated only) */}
      {userId && (
        <section aria-labelledby="recent-xp" className="flex flex-col gap-3">
          <h2 id="recent-xp" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Recent activity
          </h2>
          <XpFeed />
        </section>
      )}

      {/* Steps 1–3 — Mint flow (login-gated) */}
      {!userId ? (
        /* 🐾 Demo showcase — logged-out visitors meet an aspirational pet,
           with one clear primary action (Claim your pet). */
        <section aria-labelledby="demo-pet" className="flex flex-col gap-3">
          <h2 id="demo-pet" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Meet your coding companion
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            <PetCard pet={DEMO_PET} demo xpOverride={DEMO_PET_XP} />
            <HVZCard>
              <div className="flex h-full flex-col justify-center gap-4 text-center sm:text-left">
                <div>
                  <p className="text-lg font-bold text-pet-ink">
                    This could be yours.
                  </p>
                  <p className="mt-1 text-sm text-pet-ink-soft leading-relaxed">
                    Mint a BROskiPet on Base, then watch it evolve through 6 stages as you
                    earn XP from quests and modules. Yours forever, on-chain.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-pet-chunky border-4 border-pet-ink bg-pet-slime px-6 py-2.5 text-sm font-bold text-pet-ink shadow-pet-pop-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pet-slime-dark/40"
                >
                  Claim your pet
                </Link>
                <p className="text-xs text-pet-ink-soft">
                  Already have an account?{' '}
                  <Link to="/login" className="text-pet-wood-dark hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </HVZCard>
          </div>
        </section>
      ) : (
        // One gacha-style panel, not three stacked "Step N" text blocks — the
        // rarity odds table sits up top and stays visible the whole time,
        // like a prize table, instead of only appearing after picking a name.
        <section aria-labelledby="mint-panel" className="flex flex-col gap-3">
          <h2 id="mint-panel" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            🎰 {pets.length > 0 ? 'Mint Another Pet' : 'Mint Your First Pet'}
          </h2>
          <HVZCard variant="chunky">
            <div className="flex flex-col gap-5">
              <div className="rounded-pet-chunky border-2 border-pet-ink/20 bg-pet-lilac/40 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-pet-ink-soft mb-2">
                  🎲 Every mint rolls one of these — luck of the draw
                </p>
                <div className="flex flex-wrap gap-2">
                  {MINT_RARITY_ROW.map((r) => (
                    <HVZTag key={r.key} variant="chunky" color={r.color}>
                      {RARITY_LABELS[r.key]}
                    </HVZTag>
                  ))}
                </div>
                <p className="text-[11px] text-pet-ink-soft mt-2">
                  Revealed when your pet hatches. Every mint costs the same (100 BROski$).
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-pet-ink-soft mb-2">
                  1. Pick a species ({SPECIES.length} available)
                </p>
                <SpeciesPicker selected={speciesId} onSelect={setSpeciesId} />
              </div>

              {species && (
                <div className="flex flex-col gap-4 border-t-2 border-pet-ink/10 pt-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-pet-ink-soft">
                      2. Name your {species.displayName}
                    </span>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      maxLength={32}
                      placeholder={`e.g. Sparkle, Bytecrunch, ${species.emoji}-Master`}
                      className="rounded-pet-chunky border-4 border-pet-ink bg-pet-cream px-3 py-2 text-pet-ink placeholder:text-pet-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-pet-slime-dark/40"
                    />
                  </label>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-pet-ink-soft">
                      3. Mint
                    </span>
                    <WalletStatusBadge />
                    <MintPetButton
                      species={species}
                      petName={petName}
                      onMinted={handleMinted}
                    />
                  </div>
                </div>
              )}
            </div>
          </HVZCard>
        </section>
      )}

      {/* Section 4 — Evolution Path, educational. Only shown here when there's
          no hero spotlight above to already cover it (pets.length === 0) —
          otherwise this duplicated the sidebar's EvolutionTimeline verbatim. */}
      {pets.length === 0 && (
        <section aria-labelledby="evolution-path" className="flex flex-col gap-3">
          <h2 id="evolution-path" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Evolution path
          </h2>
          <EvolutionTimeline />
        </section>
      )}

      {/* Section 5 — Top evolvers. Collapsed by default (native <details>,
          no JS/framer-motion needed) so this supporting content doesn't
          compete with the hero card + mint panel above for attention —
          still one click away, and a nested <h2> keeps it in the heading
          outline for screen-reader navigation even though <summary> is the
          actual toggle. */}
      <details className="group flex flex-col gap-2">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-pet-chunky border-2 border-pet-ink/15 bg-pet-lilac/20 px-3 py-2 [&::-webkit-details-marker]:hidden">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-pet-ink-soft">
            Top evolvers
          </h2>
          <span className="text-pet-ink-soft transition-transform group-open:rotate-180" aria-hidden>▾</span>
        </summary>
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-[11px] text-pet-ink-soft/70">
            Most-evolved BROskiPets across the squad
          </p>
          <PetSquadRow />
        </div>
      </details>

      {/* Section 6 — How XP feeds your pet. Same collapsed-by-default
          treatment — a once-read explainer, not a recurring focal point. */}
      <details className="group flex flex-col gap-2">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-pet-chunky border-2 border-pet-ink/15 bg-pet-lilac/20 px-3 py-2 [&::-webkit-details-marker]:hidden">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-pet-ink-soft">
            How XP feeds your pet
          </h2>
          <span className="text-pet-ink-soft transition-transform group-open:rotate-180" aria-hidden>▾</span>
        </summary>
        <div className="pt-1">
          <HVZCard>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="flex flex-col gap-1.5">
                <span className="text-2xl leading-none" aria-hidden>🎯</span>
                <p className="text-sm font-bold text-pet-ink">
                  1. Earn XP
                </p>
                <p className="text-xs text-pet-ink-soft leading-relaxed">
                  Quests, course modules, and rift events drop XP into your HUD.
                  Daily logins keep your streak alive.
                </p>
              </li>
              <li className="flex flex-col gap-1.5">
                <span className="text-2xl leading-none" aria-hidden>📈</span>
                <p className="text-sm font-bold text-pet-ink">
                  2. Pet evolves
                </p>
                <p className="text-xs text-pet-ink-soft leading-relaxed">
                  Hit a stage threshold and your pet automatically levels up:
                  Baby → Learner → Builder → Shipper → HyperFocus God → Legend.
                </p>
              </li>
              <li className="flex flex-col gap-1.5">
                <span className="text-2xl leading-none" aria-hidden>🏆</span>
                <p className="text-sm font-bold text-pet-ink">
                  3. Bigger rewards
                </p>
                <p className="text-xs text-pet-ink-soft leading-relaxed">
                  Higher-stage pets unlock squad clout, future drops, and
                  multiplied BROski$ on quests. Legend = forever bragging rights.
                </p>
              </li>
            </ol>
          </HVZCard>
        </div>
      </details>
      </div>
    </div>
  )
}
