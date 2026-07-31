# Per-Pet XP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each BROskiPet its own XP counter (fed automatically from the account's course-wide XP) instead of every pet a user owns sharing one identical account-level progress bar.

**Architecture:** A single Postgres trigger on `user_xp` fans out every XP increase to all of a user's `pets` rows (`pets.xp += delta`). `evolve_pet()` is updated to read `pets.xp` instead of `user_xp.total_xp`. Five frontend files switch their XP source from `useHUD().xp` to the specific pet's own `xp` field.

**Tech Stack:** Supabase Postgres (migrations via `apply_migration` MCP tool — never `supabase db push`), React + TypeScript frontend, Playwright for E2E verification.

## Global Constraints

- Never run `supabase db push` — apply all schema changes via the Supabase MCP `apply_migration` tool.
- Wrap any exploratory/verification SQL in `BEGIN; ... ROLLBACK;` — never leave test data in the live database.
- `main` requires a PR — no direct push. Flow: `git checkout -b <branch>` → push → `gh pr create` → `gh pr merge --merge --delete-branch`.
- No `framer-motion` anywhere in this repo.
- Before claiming any task done: `npx tsc --noEmit` + `npx eslint <touched files>` + `npm run build` clean. Task 4 additionally requires a full `npx playwright test` run — do not skip this; skipping it during the earlier pets reskin work is exactly what let two real regressions ship undetected this session.
- Full design rationale, rejected alternatives, and decision log live in `docs/superpowers/specs/2026-07-31-per-pet-xp-design.md` — read it if anything in this plan is unclear, it is not repeated here.

---

### Task 1: Database — `pets.xp` column, fan-out trigger, `evolve_pet` v2

**Files:**
- Create: `supabase/migrations/20260731190000_per_pet_xp.sql`

**Interfaces:**
- Produces: `pets.xp` (integer column, every pet row), used by Task 2's `Pet` TypeScript type and by `evolve_pet()`.
- Produces: `evolve_pet(p_pet_id uuid)` RPC — same name/signature/return shape as before (`{ok, stage, evolution_count}` on success; `{ok: false, error, stage, earned, xp}` on `not_ready`), callable from the frontend exactly as `EvolveButton.tsx` already calls it today (no frontend change needed for this RPC's call site).

- [ ] **Step 1: Verify current state before changing anything**

Run via the Supabase MCP `execute_sql` tool (read-only, no transaction needed):

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'pets' and column_name = 'xp';
```

Expected: zero rows (the column doesn't exist yet).

- [ ] **Step 2: Write the migration file**

Create `supabase/migrations/20260731190000_per_pet_xp.sql` with this exact content:

```sql
-- Migration: per-pet XP
--
-- Gives each pet its own XP counter instead of every pet a user owns
-- sharing one account-wide progress bar. A trigger on user_xp fans every
-- XP increase out to all of that user's pets, and evolve_pet() is updated
-- to gate evolution on the pet's own XP instead of the account total —
-- necessary once pets can diverge, or a newly-minted (lower-XP) pet could
-- leapfrog evolution using XP it hasn't itself earned.
--
-- Full design rationale: docs/superpowers/specs/2026-07-31-per-pet-xp-design.md
--
-- Idempotent — safe to re-run.

ALTER TABLE pets ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pets_xp_non_negative'
      AND conrelid = 'public.pets'::regclass
  ) THEN
    ALTER TABLE pets ADD CONSTRAINT pets_xp_non_negative CHECK (xp >= 0);
  END IF;
END;
$$;

-- ── Fan-out trigger ──────────────────────────────────────────────────────
-- Fires whenever user_xp.total_xp is inserted or increases, and adds the
-- same delta to every pet that user owns. Positive-only guard means
-- decreases (corrections, bugs) never claw XP back out of pets.

CREATE OR REPLACE FUNCTION fan_out_pet_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delta integer;
BEGIN
  v_delta := NEW.total_xp - COALESCE(OLD.total_xp, 0);
  IF v_delta > 0 THEN
    UPDATE pets SET xp = xp + v_delta WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fan_out_pet_xp ON user_xp;

CREATE TRIGGER trg_fan_out_pet_xp
  AFTER INSERT OR UPDATE OF total_xp ON user_xp
  FOR EACH ROW EXECUTE FUNCTION fan_out_pet_xp();

-- ── evolve_pet v2 — reads pets.xp instead of user_xp.total_xp ───────────
-- Same signature, same forward-only guarantee, same grants. v_pet.xp is
-- already in scope from the existing SELECT * INTO v_pet — no new query.

CREATE OR REPLACE FUNCTION evolve_pet(p_pet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller  uuid   := auth.uid();
  v_pet     pets%ROWTYPE;
  v_earned  text;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  v_earned := xp_to_stage(v_pet.xp);

  IF stage_rank(v_earned) <= stage_rank(v_pet.stage) THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'error',   'not_ready',
      'stage',   v_pet.stage,
      'earned',  v_earned,
      'xp',      v_pet.xp
    );
  END IF;

  UPDATE pets
  SET
    stage           = v_earned,
    evolution_count = evolution_count + 1,
    last_evolved_at = now(),
    mood            = 'idle'
  WHERE id = p_pet_id AND user_id = v_caller;

  RETURN jsonb_build_object(
    'ok',              true,
    'stage',           v_earned,
    'evolution_count', v_pet.evolution_count + 1
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION evolve_pet(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION evolve_pet(uuid) TO authenticated;
```

- [ ] **Step 3: Apply the migration**

Use the Supabase MCP `apply_migration` tool with `name: "per_pet_xp"` and `query` set to the full SQL body above (everything between but not including the markdown fence).

- [ ] **Step 4: Verify the column and trigger exist**

```sql
select column_name, column_default from information_schema.columns
where table_schema = 'public' and table_name = 'pets' and column_name = 'xp';

select tgname from pg_trigger where tgname = 'trg_fan_out_pet_xp';
```

Expected: one row for `xp` (default `0`), one row for the trigger name.

- [ ] **Step 5: Verify fan-out behavior with real data, rolled back**

This uses the repo's one real pet (Luna) to prove the trigger works, and creates a second pet for the same real user to prove multi-pet fan-out — all inside a transaction that gets rolled back, so nothing persists:

```sql
BEGIN;

-- Add a second pet for Luna's owner to test multi-pet fan-out
INSERT INTO pets (user_id, wallet_address, pet_id, species_id, pet_name, rarity, stage, mint_tx_hash, ipfs_cid, chain_id)
SELECT user_id, wallet_address, 'plan-verify-pet-2', species_id, 'PlanVerifyPet', 'common', 'baby', '0xplanverify', 'plan-verify-cid', chain_id
FROM pets WHERE pet_name = 'Luna';

-- No-backfill check: the owner already has ~415 total_xp (real, pre-existing
-- account XP), but the freshly-minted pet must start at 0 regardless —
-- proving the DEFAULT 0 doesn't inherit or backfill from the account total.
SELECT pet_name, xp FROM pets WHERE pet_name = 'PlanVerifyPet';
-- Expect: xp = 0, even though user_xp.total_xp for this owner is ~415.

-- Simulate an XP award the same way complete_module() does it
UPDATE user_xp SET total_xp = total_xp + 50
WHERE user_id = (SELECT user_id FROM pets WHERE pet_name = 'Luna' LIMIT 1);

-- Both pets should show +50 xp — including the one just created in this
-- same transaction, proving a pet only needs to exist at trigger-fire time
-- (not to have existed since account creation) to receive an event.
SELECT pet_name, xp FROM pets
WHERE user_id = (SELECT user_id FROM pets WHERE pet_name = 'Luna' LIMIT 1);

ROLLBACK;
```

Expected in the final SELECT: `Luna` at `50`, `PlanVerifyPet` at `50`. If either is `0` or missing, stop — the trigger isn't firing or isn't scoped to the right user. If `PlanVerifyPet` showed anything other than `0` in the no-backfill check, stop — the column default is wrong or something is backfilling it.

- [ ] **Step 6: Re-confirm `pets` RLS is still locked down**

The new `xp` column must inherit the same lockdown as every other `pets` column — no client should be able to write it directly.

```sql
select polname, polcmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'pets';
```

Expected: only the pre-existing `"users read own pets"` SELECT policy — no `INSERT`/`UPDATE` policy for `authenticated`. If a new policy appeared, something is wrong (this migration doesn't touch RLS at all, so its absence changing would indicate a mistake elsewhere).

**Note on testing `evolve_pet` directly:** `execute_sql` runs as the Postgres role, not a real authenticated session, so `auth.uid()` is always `NULL` there and `evolve_pet` will always return `not_authenticated` no matter what you pass it — this is expected, not a bug. Verify its *logic* instead by checking `xp_to_stage(pets.xp)` / `stage_rank(...)` values directly (as done in Step 5), and verify the *real* RPC path via the Task 4 Playwright/manual check.

- [ ] **Step 7: Re-run the security advisor check**

Use the Supabase MCP `get_advisors` tool with `type: "security"`. Expected: no new warnings beyond `evolve_pet`'s existing (already-accepted, pre-existing) `SECURITY DEFINER`-executable notice.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/20260731190000_per_pet_xp.sql
git commit -m "feat(pets): per-pet XP - fan-out trigger + evolve_pet v2"
```

---

### Task 2: Frontend — `Pet` type + `PetCard` XP source

**Files:**
- Modify: `frontend/src/components/pets/PetCard.tsx`

**Interfaces:**
- Consumes: `pets.xp` (Task 1) — flows in automatically via `useMyPets.ts`'s existing `.select('*')`, no hook change needed.
- Produces: `Pet.xp: number` — the type every other frontend task in this plan relies on.

- [ ] **Step 1: Add `xp` to the `Pet` type**

In `frontend/src/components/pets/PetCard.tsx`, find the `Pet` type definition:

```typescript
export type Pet = {
  id:              string
  pet_id:          string
  species_id:      SpeciesId
  pet_name:        string
  rarity:          Rarity
  stage:           PetStage
  mood:            PetMood
  evolution_count: number
  last_evolved_at: string | null
  mint_tx_hash:    `0x${string}`
  ipfs_cid:        string
  chain_id:        number
  created_at:      string
  cosmetics?:      Partial<Record<PetCosmeticSlot, string>>
}
```

Add `xp: number` to it (position doesn't matter, keep alphabetical-ish grouping — after `evolution_count` reads naturally):

```typescript
export type Pet = {
  id:              string
  pet_id:          string
  species_id:      SpeciesId
  pet_name:        string
  rarity:          Rarity
  stage:           PetStage
  mood:            PetMood
  evolution_count: number
  xp:              number
  last_evolved_at: string | null
  mint_tx_hash:    `0x${string}`
  ipfs_cid:        string
  chain_id:        number
  created_at:      string
  cosmetics?:      Partial<Record<PetCosmeticSlot, string>>
}
```

- [ ] **Step 2: Add `xp: 0` to `DEMO_PET`**

`DEMO_PET` lives in `frontend/src/pages/Pets.tsx`, not this file — this step is a forward pointer, actually done in Task 3 Step 1 (listed here so Task 2's type change doesn't leave `DEMO_PET` failing `tsc`). Skip if executing tasks in order; if executing Task 2 in isolation, temporarily add `xp: 0,` to `DEMO_PET` in `Pets.tsx` now so `tsc` stays green, and don't duplicate it in Task 3.

- [ ] **Step 3: Change the XP source in `PetCard`**

Find:

```typescript
  const xp = xpOverride ?? hud?.xp ?? 0
```

Replace with:

```typescript
  const xp = xpOverride ?? pet.xp ?? 0
```

`hud` (from `useHUD()`) is still used elsewhere in this file for other purposes — do not remove the `useHUD()` call itself, only this one line changes. If this was the *only* remaining use of `hud` in the file after this change, leave the `useHUD()` call in place anyway — removing it is out of scope for this task (verify with a grep in Step 4, don't guess).

- [ ] **Step 4: Verify no other `hud.xp`/`hud?.xp` reference remains in this file**

```bash
grep -n "hud" frontend/src/components/pets/PetCard.tsx
```

Confirm every remaining match is unrelated to XP (if `useHUD()` has no other use in this file at all, remove the now-dead `const hud = useHUD()` line and its import — but only if genuinely unused, verified by this grep, not assumed).

- [ ] **Step 5: Typecheck and lint**

```bash
npx tsc --noEmit
npx eslint frontend/src/components/pets/PetCard.tsx
```

Expected: clean (aside from any pre-existing warnings already present before this change — compare against a `git stash` baseline if unsure whether a warning is new).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/pets/PetCard.tsx
git commit -m "feat(pets): PetCard reads pet.xp instead of account-wide hud.xp"
```

---

### Task 3: Frontend — `Pets.tsx` rewiring (hero sidebar, fallback, status card, HUD cleanup)

**Files:**
- Modify: `frontend/src/pages/Pets.tsx`

**Interfaces:**
- Consumes: `Pet.xp` (Task 2), `heroPet` (already computed in this file — the existing render-time hero-selection logic is untouched by this task).
- Produces: nothing new — this task only changes which value existing props receive.

- [ ] **Step 1: Add `xp: 0` to `DEMO_PET`**

Find the `DEMO_PET` constant near the top of the file and add `xp: 0,` (it's not a real pet, `xpOverride={DEMO_PET_XP}` already drives its displayed XP everywhere it's rendered — this field only exists to satisfy the `Pet` type from Task 2):

```typescript
const DEMO_PET: Pet = {
  id:              'demo',
  pet_id:          'broski_demo',
  species_id:      'power_pup',
  pet_name:        'Nimble Wolf',
  rarity:          'rare',
  stage:           'learner',
  mood:            'hyperfocus',
  evolution_count: 1,
  xp:              0,
  last_evolved_at: null,
  mint_tx_hash:    '0x0000000000000000000000000000000000000000000000000000000000000000',
  ipfs_cid:        '',
  chain_id:        84532,
  created_at:      new Date().toISOString(),
}
```

- [ ] **Step 2: Pass `xpOverride={heroPet.xp}` to the hero-zone `EvolutionTimeline`, and fix `PetStatusCard`'s `xp` prop**

This file has two separate spots to change:

**2a.** In the hero + sidebar block (inside the `pets.length > 0` branch), find `PetStatusCard`'s call site and change its `xp` prop:

```jsx
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
                    xp={heroPet.xp}
                    equippedCount={Object.keys(resolveEquipped(heroPet)).length}
                  />
                </div>
```

(only the `xp={xp}` → `xp={heroPet.xp}` line changes — everything else in this block is shown for location context, not to be re-typed.)

**2b.** `EvolutionTimeline` for the spotlighted pet is a separate, full-width call sitting between this hero+sidebar grid and the collection picker strip below it (it was moved out of the sidebar column in an earlier session pass). Find:

```jsx
              <EvolutionTimeline />
```

directly under the closing `</div>` of the hero+sidebar grid (not the one further down inside the `pets.length === 0` fallback — that one is Step 3), and change it to:

```jsx
              <EvolutionTimeline xpOverride={heroPet.xp} />
```

- [ ] **Step 3: Pass `xpOverride={0}` to the no-pets-yet fallback `EvolutionTimeline`**

Find the standalone Section 4 (only renders when `pets.length === 0`):

```jsx
      {pets.length === 0 && (
        <section aria-labelledby="evolution-path" className="flex flex-col gap-3">
          <h2 id="evolution-path" className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
            Evolution path
          </h2>
          <EvolutionTimeline />
        </section>
      )}
```

Change `<EvolutionTimeline />` to `<EvolutionTimeline xpOverride={0} />`. A freshly-minted pet always starts at 0 XP (Task 1 fan-out only applies going forward from mint time) — showing the account's banked `total_xp` here would overpromise what the mint flow actually delivers.

- [ ] **Step 4: Remove `xp` from this file's own `useHUD()` destructure, once confirmed unused**

Find:

```typescript
  const { tokens, streak, xp } = useHUD()
```

First confirm nothing else in this file reads the bare `xp` variable (not `heroPet.xp`, not `pet.xp` — the standalone identifier):

```bash
grep -n "\bxp\b" frontend/src/pages/Pets.tsx
```

Every remaining match should be `heroPet.xp`, `pet.xp`, `DEMO_PET_XP`, or similar — never a bare standalone `xp`. If confirmed clean, change the destructure to:

```typescript
  const { tokens, streak } = useHUD()
```

- [ ] **Step 5: Typecheck, lint, build**

```bash
npx tsc --noEmit
npx eslint frontend/src/pages/Pets.tsx
npm run build
```

Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Pets.tsx
git commit -m "feat(pets): wire EvolutionTimeline and PetStatusCard to per-pet XP"
```

---

### Task 4: Full verification pass

**Files:** none (verification only — no new files, no modifications).

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: nothing — this is the plan's exit gate.

- [ ] **Step 1: Full static verification**

```bash
npx tsc --noEmit
npx eslint frontend/src
npm run build
```

Expected: clean. If `eslint` reports pre-existing errors unrelated to this feature (there are a handful of known pre-existing ones in `frontend/tests/shop.spec.ts` as of this plan's writing — `prefer-const`/unused-var issues, unrelated to pets), confirm via `git diff` that none of them are in code this plan touched, and do not fix them here — out of scope.

- [ ] **Step 2: Full Playwright suite**

```bash
cd frontend
npx playwright test --reporter=list
```

Expected: same pass count as the pre-existing baseline (209/210 as of this plan's writing, with one known pre-existing flaky test in `shop.spec.ts`'s "agent access polling" — unrelated to pets, do not attempt to fix it as part of this task). If any *pets*-related spec newly fails, that is a real regression from this plan's changes — stop and fix before proceeding, the same way two real regressions were caught and fixed earlier this session by skipping this exact step.

- [ ] **Step 3: Live multi-pet verification against real data (read-only + rolled back)**

Using the Supabase MCP `execute_sql` tool:

```sql
BEGIN;

-- Confirm the real pet's xp column reads correctly through to a computed
-- evolution-eligibility check, using the same logic evolve_pet now uses.
SELECT
  pet_name,
  xp,
  stage,
  xp_to_stage(xp) AS earned_stage,
  stage_rank(xp_to_stage(xp)) AS earned_rank,
  stage_rank(stage) AS current_rank
FROM pets;

ROLLBACK;
```

Expected: `earned_rank <= current_rank` for every real pet (no pet should show itself eligible to evolve past a stage it hasn't earned) — if any row shows `earned_rank > current_rank`, that pet is eligible to evolve and calling `/rest/v1/rpc/evolve_pet` for it as that pet's real owner (a manual step, not automatable here — requires a real logged-in session) should now succeed where it previously wouldn't have.

- [ ] **Step 4: Manual UI check on the dev server**

```bash
npm run dev:frontend
```

Log in with a real account that owns at least one pet, visit `/pets`, and confirm:
- The hero card's XP bar shows a number that changes independently of the top HUD bar's XP number (they'll only match by coincidence for a pet that's owned every XP event since account creation — for any pet minted later than the account's first XP event, they should differ).
- The Evolution Path card (now full-width) reflects the spotlighted pet's own XP, not the account total.
- Switching the hero spotlight via the collection picker strip (if the test account owns 2+ pets) shows a different XP value per pet.

This step touches a live dev session with a real account — not something to run unattended; do it interactively and record what was observed before marking this step done.

- [ ] **Step 5: Ship via the branch-protection flow**

```bash
git checkout -b feat/per-pet-xp
git push -u origin feat/per-pet-xp
gh pr create --title "feat(pets): per-pet XP" --body "See docs/superpowers/specs/2026-07-31-per-pet-xp-design.md for full design rationale. Implements the plan in docs/superpowers/plans/2026-07-31-per-pet-xp-plan.md."
```

Do not self-merge without the same explicit go-ahead this session's other fixes required — bring the PR link back for review before merging, since this is a live schema change on top of a night with two already-caught regressions.
