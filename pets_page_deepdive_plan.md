# 🐾 BROskiPets `/pets` Page — Phase 2: Post-Mint Experience

> **Repo:** `Hyper-Vibe-Coding-Course` (Vite + React, NOT Next.js)
> **Page:** `frontend/src/pages/Pets.tsx`
> **Status:** ✅ **PHASES 2A → 2D + 2A.5 COMPLETE** (verified on disk 2026-05-09). This file is now a historical record of the plan that shipped.
> **Owner:** Lyndz Williams — @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁿

---

## 🏁 What Shipped (verified 2026-05-09)

| Phase | Status | Evidence on disk |
|---|---|---|
| 2A — Persistent Collection | ✅ Done | `migrations/20260508120000_broskipets_persistence.sql`, `hooks/useMyPets.ts`, `components/pets/PetCard.tsx` + `XPBar.tsx` + `MoodBadge.tsx` |
| 2A.5 — Wallet-signed persistence | ✅ Done | `supabase/functions/mint-pet-confirm/index.ts` (verifies tx receipt + idempotent INSERT), wired into `hooks/useMintPet.ts` |
| 2B — Evolution Path | ✅ Done | `components/pets/EvolutionTimeline.tsx` |
| 2C — Social + Education | ✅ Done | `components/pets/PetSquadRow.tsx`, `hooks/useTopPets.ts` |
| 2D — Polish | ✅ Done | `components/pets/PetCardSkeleton.tsx` + Tailwind `shimmer`/`goldSweep`/`fadeInUp` keyframes |

**What's actually NEXT** (not in this file's original scope):
- 🟠 Phase 3 — on-chain `evolve()` transactions (needs contract method + agent key wiring)
- 🟠 V2.4 sync question — does V2.4 need a `pets`/`mint_nonces` sync endpoint?
- 🟡 Elevation ideas from design-brain audit (Asymmetric Timeline, Trading-card tilt, #1 squad hero, BROski$ celebration micros, reduced-motion sweep)

---

## 📜 Original Plan (preserved below — for reference only)

---

## ✅ What's Already Live (Do NOT Rebuild)

| Piece | File | Notes |
|---|---|---|
| 3-step mint UI (species → name+rarity → mint) | `frontend/src/pages/Pets.tsx` | Header + Steps 1–3 + just-minted session list |
| `SpeciesPicker` | `frontend/src/components/pets/SpeciesPicker.tsx` | 10 species, visual grid |
| `MintPetButton` | `frontend/src/components/pets/MintPetButton.tsx` | Wallet connect + balance gate + tx flow |
| `useMintPet` hook | `frontend/src/hooks/useMintPet.ts` | EIP-712 auth via Edge Fn, two modes (wallet-signed / relay) |
| 10 species + Pinata CIDs | `frontend/src/lib/species.ts` | Real IPFS CIDs pinned 2026-05-07 |
| Wagmi config | `frontend/src/lib/wagmi.ts` | Base Sepolia + Base mainnet |
| Contract ABI/address | `frontend/src/lib/contracts/broskiPet.ts` | `mintWithAuth` flow |
| Edge Fn: mint auth | `supabase/functions/mint-pet-auth/` | Deducts BROski$, signs auth |
| DB: `mint_nonces`, pet ID seq | Supabase migrations May 7 | Replay-protection live |

**Reality check:** Pets are on **Base** (Sepolia testnet + Base mainnet). The EEPVengers contract on Ethereum Sepolia (`0x3691...`, 78 EEPs) is the **other repo** (`BROskiPets-LLM-dNFT`) — different stack, not what's wired into the course frontend.

---

## 🎯 Phase 2 Goal (Single Sentence)

> **After a student mints, the `/pets` page should make their pet feel ALIVE — showing level, XP toward next evolution, recent activity, and where it's heading — without touching the working mint flow.**

---

## 🧱 What's Missing Right Now

The current page ends after mint with a small session-only "fresh mints" card list. No persistent pet view, no XP wiring, no evolution roadmap, no squad. After the user reloads, their just-minted pet vanishes from the UI.

**Three real gaps:**
1. **No persistent collection** — `minted` state is in-memory only. A reload wipes it.
2. **No live pet stats** — XP, level, mood, evolution progress aren't surfaced.
3. **No "what's next" signal** — student doesn't know what feeds their pet or where it evolves to.

---

## 📐 Page Structure After Phase 2

```
┌────────────────────────────────────────────┐
│ Header (existing)                          │
├────────────────────────────────────────────┤
│ 🆕 SECTION 0 — Your Pets (if user has any) │  ← NEW, top of page when collection > 0
│   [PetCard] [PetCard] [PetCard]            │
├────────────────────────────────────────────┤
│ Step 1 — Pick species (existing)           │
│ Step 2 — Name + rarity (existing)          │
│ Step 3 — Mint (existing)                   │
├────────────────────────────────────────────┤
│ 🆕 SECTION 4 — Evolution Path              │  ← NEW, static educational
├────────────────────────────────────────────┤
│ 🆕 SECTION 5 — Top Evolvers (squad row)    │  ← NEW, social proof
├────────────────────────────────────────────┤
│ 🆕 SECTION 6 — How XP Feeds Your Pet       │  ← NEW, 3 steps, compact
└────────────────────────────────────────────┘
```

---

## 🆕 New Components to Build

All under `frontend/src/components/pets/`. Reuse `HVZCard`, `HVZTag`, `HVZButton` from `../ui/hvz` — do **not** introduce new card primitives.

| Component | File | Priority | Depends on |
|---|---|---|---|
| `PetCard` | `pets/PetCard.tsx` | 🔴 P0 | species.ts, HVZCard, XPBar, MoodBadge |
| `XPBar` | `pets/XPBar.tsx` | 🔴 P0 | none — pure component |
| `MoodBadge` | `pets/MoodBadge.tsx` | 🔴 P0 | HVZTag |
| `EvolutionTimeline` | `pets/EvolutionTimeline.tsx` | 🟠 P1 | static stage config |
| `PetSquadRow` | `pets/PetSquadRow.tsx` | 🟡 P2 | Supabase pets view |
| `useMyPets` hook | `hooks/useMyPets.ts` | 🔴 P0 | supabase, wagmi useAccount |

### `PetCard` — the core unit

```
┌──────────────────────────┐
│ [species image]          │
│  Pet Name                │
│  EEP #042 · Common       │  ← rarity tag
│  Stage: Baby 🐣          │  ← evolution stage
│  ┌────────────────┐      │
│  │ XPBar 60% ▰▰▰░ │      │  ← animated fill
│  └────────────────┘      │
│  240 / 500 XP to Learner │
│  Mood: ⚡ Hyperfocus     │  ← MoodBadge
│  [View on BaseScan ↗]    │  ← link tx hash
└──────────────────────────┘
```

**States to handle:**
- `loading` — skeleton
- `has-pet` — full card
- `evolving` — pulse glow + countdown to cooldown end
- `max-stage` — gold "Fully Evolved" badge

---

## 🗄️ Data Model (Check Before Creating)

⚠️ **Verify in Supabase first** — some of these may already exist from the May 7 mint migrations or the gamification stack. Use `list_tables` before applying.

### Likely needed (check first)

```sql
-- Pet ownership + stats. The contract is the source of truth for ownership;
-- this is the cache/index for fast reads + mood/XP that don't live on-chain.
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  pet_id BIGINT NOT NULL UNIQUE,           -- on-chain tokenId from mint sequence
  species_id TEXT NOT NULL,                 -- matches lib/species.ts SpeciesId
  pet_name TEXT NOT NULL,
  rarity TEXT NOT NULL,                     -- common | uncommon | rare | legendary
  stage TEXT NOT NULL DEFAULT 'baby',       -- baby | learner | builder | shipper | hyperfocus_god | legend
  xp INTEGER NOT NULL DEFAULT 0,
  mood TEXT NOT NULL DEFAULT 'idle',        -- idle | learning | hyperfocus | evolving
  evolution_count INTEGER NOT NULL DEFAULT 0,
  last_evolved_at TIMESTAMPTZ,
  mint_tx_hash TEXT NOT NULL,
  ipfs_cid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: user reads their own pets, public reads top-N for squad row
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own pets" ON pets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "public reads top pets" ON pets FOR SELECT
  USING (true);  -- locked down via a view that limits columns instead

-- View for squad row (no wallet leakage)
CREATE OR REPLACE VIEW top_pets AS
SELECT pet_id, species_id, pet_name, stage, xp, evolution_count, rarity
FROM pets
ORDER BY evolution_count DESC, xp DESC
LIMIT 12;
```

### Skip this — already exists

- `xp_events` / `user_xp` — covered by HUDContext + leaderboard view (May 5 ecosystem)
- `mint_nonces` — already live (May 7 migration)

### Hook the existing XP system into pets

Don't build a new XP feed. The HUD already reads `user_xp`. The pet's XP can either:
- **Option A (simple):** mirror `user_xp.total_xp` 1:1 — every pet shows the same XP. One pet per user feels.
- **Option B (per-pet):** add `pets.xp` column, increment via `awardXP` callsite. Multi-pet ready.

**Recommend Option A for v1** — ships fastest, matches the "your companion evolves with you" story. Upgrade to Option B if/when multi-pet becomes a thing.

---

## 🔌 Wiring `useMyPets`

```ts
// hooks/useMyPets.ts
export function useMyPets() {
  const user = useAuthStore(s => s.user)
  const { address } = useAccount()
  // Read from `pets` table where user_id = user.id
  // Returns { pets, loading, error, refetch }
}
```

**Where it gets populated:** the Edge Function `mint-pet-auth` (or a new `mint-pet-confirm`) should INSERT into `pets` after a successful mint. Either:
1. Listen for `PetMinted` events on-chain (cleanest, eventual consistency)
2. Have the frontend POST `tx_hash + petId` to a confirm endpoint after `mining` state (faster, but trust user input — verify tx receipt server-side)

⚠️ **Open question for V2.4 sync** (already flagged in CLAUDE.md): does V2.4 need an event listener too? Decide before wiring confirmation path.

---

## 🎨 Design Direction

**Reuse existing tokens.** The repo already has the hvz design system: `text-hfz-text-primary`, `bg-hfz-space-black`, `border-hfz-border-violet`, `text-hfz-violet-light`, `rounded-hfz-md`. Don't introduce Boska/Satoshi or a fresh palette — that fights the live design.

**Motion (apply sparingly):**
- XP bar: animated fill on mount (ease-out 800ms)
- Evolving state: violet pulse glow (`animate-pulse` on a ring)
- Just-minted: gold shimmer sweep once, then settle
- Reduced-motion users: respect `prefers-reduced-motion` — skip all animations

The `design-brain` skill should drive the actual visual polish pass. Trigger it when building `PetCard`.

---

## 📋 Phased Build Order

### Phase 2A — Persistent Collection (Day 1, ~3 hrs)
- [ ] Verify which pet-related tables already exist in Supabase
- [ ] Create `pets` table + RLS + `top_pets` view if missing
- [ ] Wire mint confirmation: Edge Fn or frontend → INSERT into `pets`
- [ ] Build `useMyPets` hook
- [ ] Build `XPBar`, `MoodBadge`, `PetCard` (primitive components first)
- [ ] Add Section 0 "Your Pets" above Step 1 in `Pets.tsx` (only render when `pets.length > 0`)
- [ ] Replace session-only `mintedPets` array with refetch from `useMyPets` after mint success

### Phase 2B — Evolution Path (Day 2, ~1.5 hrs)
- [ ] Define `EVOLUTION_STAGES` config in `lib/species.ts` or new `lib/evolution.ts`
  - Stages: Baby (0) → Learner (500) → Builder (1500) → Shipper (3000) → HyperFocus God (5000) → Legend (10000)
- [ ] Build `EvolutionTimeline` component
- [ ] Add Section 4 to `Pets.tsx`
- [ ] Hook current XP → highlight current stage

### Phase 2C — Social + Education (Day 3, ~1.5 hrs)
- [ ] Build `PetSquadRow` reading from `top_pets` view
- [ ] Add Section 5 to `Pets.tsx`
- [ ] Add Section 6 "How XP feeds your pet" (3-column compact)
- [ ] Mobile QA at 375px

### Phase 2D — Polish (Day 4, ~1.5 hrs)
- [ ] Trigger `design-brain` skill on `PetCard` for tilt/glow audit
- [ ] Reduced-motion fallbacks
- [ ] Loading skeletons
- [ ] Empty states (signed in, no pets yet — should NOT render Section 0)
- [ ] Test full flow: register → mint → reload → see persistent pet

---

## 🔗 Ecosystem Connections (Existing Hooks to Reuse)

| Connection | Already wired? | Action |
|---|---|---|
| Course XP → pet XP | ✅ HUDContext + `user_xp` table | Read `user_xp.total_xp` for Option A |
| Leaderboard ↔ pets | ✅ `leaderboard` view (public anon SELECT) | Add `top_pets` as a sibling view |
| BROski$ ↔ mint cost | ✅ Edge Fn deducts on mint auth | No work needed |
| Quests → XP → pet evolution | ✅ `complete_quest` RPC awards XP | Stage will auto-update if XP read is live |
| Rift events → pet mood | 🟡 `rifts` table exists, no pet hook yet | Future — mood = "hyperfocus" while rift active |

---

## ✅ Definition of Done (Phase 2)

The `/pets` page is **Phase-2 done** when:

1. A signed-in student with at least one minted pet sees their collection above the mint flow on page load ✅
2. Each `PetCard` shows: image, name, rarity, current stage, XP bar with progress to next stage, mood, BaseScan link ✅
3. Reloading the page does NOT lose the pet (persistent, not session-only) ✅
4. Evolution Timeline shows current stage highlighted + XP to next ✅
5. Squad row shows top 6 evolved pets across all users ✅
6. Mobile (375px) works without horizontal scroll ✅
7. The live mint flow still works **identically** to before — zero regression ✅
8. `design-brain` skill has signed off on visual quality ✅

---

## 🚫 Explicitly Out of Scope

- ❌ Rebuilding the mint flow (it works — leave it)
- ❌ Switching to Ethereum Sepolia or the EEPVengers contract (different repo)
- ❌ Adding 78 EEPs (we have 10 species — that's the spec)
- ❌ Next.js migration (this is Vite + React)
- ❌ New design tokens / fonts (use hvz primitives)
- ❌ On-chain evolve transactions (Phase 3 — needs contract method + agent key wiring)
- ❌ V2.4 sync endpoint (decide first — flagged in CLAUDE.md)

---

> Built for ADHD brains. Fast feedback. Real tools. No fluff. 🧠⚡
> by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 🐾♾️
