# 🐾 Phase 2A — Persistent Pet Collection (Build Spec)

> **Goal:** After mint, a student's pet persists across reloads and shows live XP/stage/mood.
> **Scope:** Schema + mint persistence path + `useMyPets` hook + `PetCard` component.
> **Date:** 2026-05-08
> **Source of truth:** `pets_page_deepdive_plan.md` (Phase 2 plan)

---

## 🔍 Verified State of the World (2026-05-08)

### Tables that EXIST in Supabase ✅
| Table | Shape | Notes |
|---|---|---|
| `user_xp` | `user_id, total_xp, level, streak_days, last_active, created_at` | Read by `HUDContext` — perfect for **Option A** XP mirror |
| `xp_events` | `user_id, event_type, amount, rift_multiplier, course_id, quest_id, created_at` | Future XP feed source |
| `mint_nonces` | service-role-only, replay protection | Already plumbed |
| `users.broski_tokens` | int, ≥0 | BROski$ balance |

### What's MISSING ❌
- **No `pets` table** — pet ownership lives only on-chain right now
- **No persistence path in `mint-pet-auth`** — Edge Fn signs + relays, never INSERTs a pet row
- **No `useMyPets` hook**
- **No `PetCard` / `XPBar` / `MoodBadge` components**

### What ALREADY exists in DB infra (reuse, don't recreate) ✅
- `broskipet_id_seq` Postgres sequence
- `next_pet_id()` RPC (SECURITY DEFINER, service_role only)
- `spend_tokens` + `award_tokens` RPCs (used by `mint-pet-auth`)

---

## 🗄️ Schema — New `pets` Table

```sql
-- Migration: 20260508XXXXXX_broskipets_persistence.sql
-- Caches on-chain pet ownership for fast reads. Contract is source of truth
-- for ownership; this table caches mint metadata + holds off-chain state
-- (mood, stage cache) that doesn't live on-chain.

CREATE TABLE pets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address  TEXT NOT NULL,
  pet_id          TEXT NOT NULL UNIQUE,         -- "broski_<seq>" — matches contract
  species_id      TEXT NOT NULL,                 -- matches lib/species.ts SpeciesId
  pet_name        TEXT NOT NULL CHECK (char_length(pet_name) BETWEEN 1 AND 32),
  rarity          TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','legendary')),
  stage           TEXT NOT NULL DEFAULT 'baby'
                    CHECK (stage IN ('baby','learner','builder','shipper','hyperfocus_god','legend')),
  mood            TEXT NOT NULL DEFAULT 'idle'
                    CHECK (mood IN ('idle','learning','hyperfocus','evolving')),
  evolution_count INTEGER NOT NULL DEFAULT 0 CHECK (evolution_count >= 0),
  last_evolved_at TIMESTAMPTZ,
  mint_tx_hash    TEXT NOT NULL,
  ipfs_cid        TEXT NOT NULL,
  chain_id        INTEGER NOT NULL,              -- 84532 (sepolia) or 8453 (base mainnet)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_wallet  ON pets(wallet_address);
CREATE INDEX idx_pets_top     ON pets(evolution_count DESC, created_at DESC);

-- RLS — users see only their own pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own pets" ON pets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- INSERT/UPDATE locked to service_role (Edge Fn is the only writer)
-- (no policy = no anon/authenticated INSERT — service_role bypasses RLS by default)

-- Public squad row view (column-restricted, no wallet leakage)
CREATE OR REPLACE VIEW top_pets
  WITH (security_invoker = true) AS
SELECT
  pet_id,
  species_id,
  pet_name,
  rarity,
  stage,
  evolution_count,
  created_at
FROM pets
ORDER BY evolution_count DESC, created_at DESC
LIMIT 12;

-- Anon SELECT on the view (matches leaderboard pattern from May 3)
GRANT SELECT ON top_pets TO anon, authenticated;

COMMENT ON TABLE pets IS
  'Cache of on-chain BROskiPet ownership + off-chain stage/mood. Inserted by mint-pet-auth Edge Fn after successful mint. Service-role-only writes.';
```

---

## 🔌 Mint Persistence Path — TWO MODES

The `mint-pet-auth` Edge Fn (`supabase/functions/mint-pet-auth/index.ts`) needs extending.

### Mode A — Relay (`VITE_MINT_VIA_RELAY=true`) — Easy ✅
Backend owns the tx. Right after `wallet.writeContract` returns `txHash`, INSERT the pet row with full trust.

```ts
// After step 8 in mint-pet-auth/index.ts, before returning JSON
if (txHash) {
  const { error: petInsertErr } = await adminClient
    .from('pets')
    .insert({
      user_id:         user.id,
      wallet_address:  wallet_address,
      pet_id:          petId,
      species_id:      species_id,        // ← need to add to request body
      pet_name:        pet_name ?? petId,
      rarity:          rarity ?? 'common',// ← need to add to request body
      ipfs_cid:        ipfs_cid,
      mint_tx_hash:    txHash,
      chain_id:        CHAIN_ID,
    });
  if (petInsertErr) {
    // Log but don't refund — tx is already on-chain. Treat as recoverable
    // (a later reconciliation job can backfill from contract events).
    console.error('[mint-pet-auth] pets insert failed (tx succeeded):', petInsertErr);
  }
}
```

**Frontend tweak:** `useMintPet.ts` already passes `pet_name` — add `species_id` and `rarity` to the request body. Backend validates against the species catalogue (re-export from a shared source or hardcode the 10 IDs in the Edge Fn).

### Mode B — Wallet-signed — Needs new endpoint
User submits the tx, so backend doesn't see the txHash until the frontend reports it. Add a new lightweight Edge Fn:

```
POST /functions/v1/mint-pet-confirm
Body: { tx_hash, pet_id, species_id, rarity }
```

It:
1. Verifies user JWT
2. Calls Base RPC `eth_getTransactionReceipt(tx_hash)`
3. Validates: receipt.status === 1, receipt.to === BROSKIPET_CONTRACT_ADDRESS, receipt.from === relayer/user wallet (depending on mode)
4. Parses logs for `PetMinted` event matching `petId`
5. INSERTs the row

**Phase 2A simplification:** ship Mode A only. Most users will use relay (no ETH needed). Document Mode B as Phase 2A.5 follow-up. The Pets page can already gate "Connect wallet → mint" on `VITE_MINT_VIA_RELAY` so we know which mode is active.

---

## 🪝 `useMyPets` Hook — Spec

**File:** `frontend/src/hooks/useMyPets.ts`

### Return shape
```ts
type Pet = {
  id:              string                          // UUID
  pet_id:          string                          // "broski_42"
  species_id:      SpeciesId
  pet_name:        string
  rarity:          Rarity
  stage:           PetStage
  mood:            PetMood
  evolution_count: number
  last_evolved_at: string | null                   // ISO
  mint_tx_hash:    `0x${string}`
  ipfs_cid:        string
  chain_id:        number
  created_at:      string
}

type PetStage = 'baby' | 'learner' | 'builder' | 'shipper' | 'hyperfocus_god' | 'legend'
type PetMood  = 'idle' | 'learning' | 'hyperfocus' | 'evolving'

type UseMyPetsResult = {
  pets:    Pet[]
  loading: boolean
  error:   Error | null
  refetch: () => Promise<void>
}
```

### Behavior
```ts
export function useMyPets(): UseMyPetsResult {
  // 1. Read user from useAuthStore — if no user, return empty array immediately
  // 2. Single query:
  //    supabase.from('pets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  // 3. RLS handles the user filter — the .eq() is belt-and-braces
  // 4. Subscribe to pets realtime channel filtered by user_id (optional Phase 2B)
  // 5. Expose refetch() so MintPetButton can call it after onMinted
}
```

### Where it's called
- `Pets.tsx` — top of page, renders Section 0 if `pets.length > 0`
- After mint success → `refetch()` to pick up the new row
  - With Mode A persistence in place, the row will exist by the time `useMintPet` returns success
  - Add a 1.5s debounce/retry in case Edge Fn insert is slow

### Auth states
| State | Returns |
|---|---|
| Not signed in | `pets: [], loading: false, error: null` |
| Signed in, fetching | `pets: [], loading: true` |
| Signed in, no pets | `pets: [], loading: false` — Section 0 doesn't render |
| Signed in, has pets | `pets: [...], loading: false` |
| Fetch error | `pets: [], loading: false, error: Error` — show inline retry |

---

## 🎴 `PetCard` Component — Spec

**File:** `frontend/src/components/pets/PetCard.tsx`

### Props
```ts
type PetCardProps = {
  pet:        Pet
  /** Override XP source. Default: read from useHUD (Option A — mirror user_xp). */
  xpOverride?: number
  /** Visual size variant. */
  size?:      'full' | 'mini'      // mini = used in PetSquadRow
  /** Click handler — open detail drawer in Phase 2B. */
  onClick?:   () => void
}
```

### Layout (full size)

```
┌────────────────────────────────────────┐
│  [species image — 80px, rounded-md]    │
│  ┌────────────────────────────────┐    │
│  │ Pet Name              [Common] │    │  ← name + rarity HVZTag
│  │ broski_042 · Cyber Fox         │    │  ← petId · species displayName
│  │                                │    │
│  │ Stage: Baby 🐣                 │    │
│  │ ▰▰▰▰▰▰░░░░ 240 / 500 XP        │    │  ← XPBar
│  │                                │    │
│  │ [⚡ Hyperfocus] [↗ BaseScan]   │    │  ← MoodBadge + tx link
│  └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

### Component composition
```tsx
<HVZCard>
  <div className="flex gap-4">
    <img src={species.imageUrl} alt={species.displayName} className="h-20 w-20 rounded-hfz-md object-cover" />
    <div className="flex-1 min-w-0">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-hfz-text-primary truncate">{pet.pet_name}</h3>
          <p className="text-xs text-hfz-text-secondary">{pet.pet_id} · {species.displayName}</p>
        </div>
        <HVZTag color={rarityColor(pet.rarity)}>{RARITY_LABELS[pet.rarity]}</HVZTag>
      </header>

      <div className="mt-2">
        <p className="text-xs uppercase tracking-wider text-hfz-violet-light">
          Stage: {STAGE_LABELS[pet.stage]} {STAGE_EMOJI[pet.stage]}
        </p>
        <XPBar
          xp={xpOverride ?? hudXP}
          stage={pet.stage}
          isEvolving={pet.mood === 'evolving'}
        />
      </div>

      <footer className="mt-3 flex items-center gap-2">
        <MoodBadge mood={pet.mood} />
        <a
          href={baseScanTxUrl(pet.mint_tx_hash, pet.chain_id)}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-hfz-violet-light hover:underline"
        >
          ↗ BaseScan
        </a>
      </footer>
    </div>
  </div>
</HVZCard>
```

### States
| State | Visual |
|---|---|
| `loading` | Skeleton card with shimmer (no real data needed — pass `pet={null}`, render placeholder) |
| `has-pet` | Default render |
| `mood === 'evolving'` | `XPBar` pulses; card border: `ring-2 ring-hfz-violet-light animate-pulse` |
| `stage === 'legend'` | Gold border ring + "✨ Fully Evolved" badge replaces stage label |
| Reduced motion | All `animate-pulse` → static; `XPBar` skips fill animation |

### Sub-components needed (P0, build first)
1. **`XPBar`** (`pets/XPBar.tsx`)
   - Props: `xp: number, stage: PetStage, isEvolving?: boolean`
   - Reads `EVOLUTION_STAGES` to compute `xpInStage / xpToNextStage`
   - Animated fill on mount: `width: 0 → percent` over 800ms ease-out
   - Respects `prefers-reduced-motion`
2. **`MoodBadge`** (`pets/MoodBadge.tsx`)
   - Tiny — just `<HVZTag color={MOOD_COLOR[mood]}>{MOOD_EMOJI[mood]} {MOOD_LABEL[mood]}</HVZTag>`
   - Colors: idle=neutral, learning=cyan, hyperfocus=violet, evolving=gold

### Helper config (new file: `frontend/src/lib/evolution.ts`)
```ts
export const EVOLUTION_STAGES = [
  { key: 'baby',           label: 'Baby',           emoji: '🐣', minXp: 0     },
  { key: 'learner',        label: 'Learner',        emoji: '📚', minXp: 500   },
  { key: 'builder',        label: 'Builder',        emoji: '🛠️', minXp: 1500  },
  { key: 'shipper',        label: 'Shipper',        emoji: '🚀', minXp: 3000  },
  { key: 'hyperfocus_god', label: 'HyperFocus God', emoji: '⚡', minXp: 5000  },
  { key: 'legend',         label: 'Legend',         emoji: '👑', minXp: 10000 },
] as const

export type PetStage = typeof EVOLUTION_STAGES[number]['key']

export function stageForXp(xp: number): PetStage { /* find highest stage where xp >= minXp */ }
export function progressInStage(xp: number): { current: number; next: number; percent: number }
export function baseScanTxUrl(hash: string, chainId: number): string
```

---

## 🧪 Definition of Done (Phase 2A)

- [ ] Migration `pets` table + `top_pets` view applied
- [ ] `mint-pet-auth` Edge Fn extended to INSERT pet row in relay mode
- [ ] Frontend sends `species_id` + `rarity` in mint request body
- [ ] `useMyPets` hook returns user's pets after mint without page reload
- [ ] `PetCard` renders all live states (baby/learner/.../legend, idle/.../evolving)
- [ ] `XPBar` animates on mount, respects reduced motion
- [ ] `MoodBadge` renders all 4 moods
- [ ] `Pets.tsx` shows Section 0 "Your Pets" above Step 1 when `pets.length > 0`
- [ ] Reload retains the pet (persistence verified)
- [ ] Mobile (375px) layout intact
- [ ] No regression to existing mint flow
- [ ] `design-brain` skill audit pass on `PetCard`

---

## ⚠️ Open Decisions (Need Lyndz Sign-off Before Coding)

1. **Mint mode for v1** — ship Mode A (relay) only, document Mode B as follow-up? **(Recommend yes)**
2. **Pet XP source** — Option A (mirror `user_xp.total_xp`) for v1, per-pet later? **(Recommend yes)**
3. **`top_pets` view exposed to anon?** — matches leaderboard pattern but reveals pet_name + species. OK? **(Recommend yes — pet names are vanity)**
4. **Reconciliation job** — if Edge Fn INSERT fails after a successful on-chain tx, do we need a backfill cron that reads `PetMinted` events? **(Recommend Phase 2B — log + manual fix for now, with a note in CLAUDE.md)**

---

## 🔗 Files to Touch (Build Order)

| # | File | Action |
|---|---|---|
| 1 | `supabase/migrations/20260508XXXXXX_broskipets_persistence.sql` | **CREATE** |
| 2 | `frontend/src/lib/evolution.ts` | **CREATE** |
| 3 | `frontend/src/components/pets/XPBar.tsx` | **CREATE** |
| 4 | `frontend/src/components/pets/MoodBadge.tsx` | **CREATE** |
| 5 | `frontend/src/components/pets/PetCard.tsx` | **CREATE** |
| 6 | `frontend/src/hooks/useMyPets.ts` | **CREATE** |
| 7 | `supabase/functions/mint-pet-auth/index.ts` | **EDIT** — add INSERT after relay |
| 8 | `frontend/src/hooks/useMintPet.ts` | **EDIT** — send species_id + rarity in body |
| 9 | `frontend/src/components/pets/MintPetButton.tsx` | **EDIT** — pass species_id + rarity through |
| 10 | `frontend/src/pages/Pets.tsx` | **EDIT** — render Section 0 from useMyPets, replace session-only `minted` array |

---

> Built for ADHD brains. Fast feedback. Real tools. No fluff. 🧠⚡
> by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 🐾♾️
