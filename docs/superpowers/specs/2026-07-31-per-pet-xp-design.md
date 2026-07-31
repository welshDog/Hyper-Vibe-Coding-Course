# Per-Pet XP — Design

## Context

The Pets page (`/pets`) currently displays XP progress toward the next
evolution stage using `useHUD().xp` — the user's account-wide course XP
(`user_xp.total_xp`). This means every pet a user owns shows an identical
XP bar, regardless of when it was minted or what it's individually earned.
The result reads as "an XP bar decoration on top of account XP" rather than
"my pet has its own life" — the gap between "account-wide pet page" and
"proper personal companion" this design closes.

**A related, more serious bug was found and already fixed separately**
(migration `20260731180000_fix_evolve_pet_xp_source`, merged to `main`
same day): `evolve_pet()` was reading XP from `user_level_progress` — the
unrelated Vibe Labs leveling system, which has 0 rows in production — so
clicking "Evolve" has likely never actually worked for any real pet. That
fix pointed `evolve_pet` at `user_xp.total_xp` as an immediate correctness
fix. This design's Decision 4 (below) supersedes that fix again, pointing
`evolve_pet` at the new per-pet `pets.xp` instead — the natural endpoint
once pets have their own XP, not scope creep on top of the hotfix.

## Decisions made during design

1. **XP attribution model**: every XP-earning event credits **all** of a
   user's currently-owned pets, at full value each (not split, no "active
   pet" selection UI). Simplest mental model, matches how account XP
   already works today, needs no new UI concept.
2. **Backfill**: none. Every pet's `xp` column defaults to and starts at
   `0`, regardless of current `stage` or the account's existing
   `total_xp`. A pet already at Learner keeps its `stage` (stages never
   demote) but starts accumulating its own XP counter from `0`.
3. **Mechanism**: a single Postgres trigger on `user_xp`, not per-function
   application code. See Approach A below — chosen over the alternative of
   modifying every XP-awarding function individually (rejected: several
   award paths already exist — module completion, quests, streaks,
   referrals — and any one missed in that approach silently drifts out of
   sync; a single trigger can't be forgotten by a future feature).
4. **`evolve_pet` reads `pets.xp`**, not `user_xp.total_xp`. Necessary
   consequence of (1)+(2): once pets can diverge in XP, gating eligibility
   on the *account's* total would let a newly-minted (lower-XP) pet
   leapfrog evolution using XP it hasn't itself earned.
5. **No `pet_id` needed on `xp_events`.** Since every pet earns every
   event identically, there's no per-pet attribution to store — "Recent
   Activity" can describe an event as feeding all of the user's pets
   equally, which is simpler than the original "pet-linked activity" ask
   implied.

## Approaches considered

**A — Trigger on `user_xp`, fans XP out to all owned pets (chosen).**
Add `pets.xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0)`. A trigger fires
`AFTER INSERT OR UPDATE OF total_xp ON user_xp`, computes the delta
(`NEW.total_xp - COALESCE(OLD.total_xp, 0)`), and if positive, runs
`UPDATE pets SET xp = xp + delta WHERE user_id = NEW.user_id`. Confirmed
against the real `complete_module()` function: it upserts `user_xp` via
`INSERT ... ON CONFLICT (user_id) DO UPDATE SET total_xp = total_xp + v_xp`
— exactly the shape this trigger fires on for both brand-new and existing
users. Zero changes needed to `complete_module`, quests, streaks, or any
future XP-awarding code — they all already have to touch
`user_xp.total_xp` for the HUD to reflect the award, so hooking there is a
true single choke point.

**B — Modify every XP-awarding function directly** (rejected). More
"visible" per-function, but requires finding and correctly touching every
current XP-award code path with no structural guarantee a future one
won't be missed.

**C — Derive per-pet XP as a computed view** (rejected). Doesn't cleanly
support "starts at 0 from mint moment" without inventing a per-pet
baseline-offset column anyway — reintroduces the stored-column need with
more complexity, no benefit.

## Schema changes

```sql
ALTER TABLE pets ADD COLUMN xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0);

CREATE FUNCTION fan_out_pet_xp() RETURNS trigger AS $$
DECLARE v_delta integer;
BEGIN
  v_delta := NEW.total_xp - COALESCE(OLD.total_xp, 0);
  IF v_delta > 0 THEN
    UPDATE pets SET xp = xp + v_delta WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_fan_out_pet_xp
  AFTER INSERT OR UPDATE OF total_xp ON user_xp
  FOR EACH ROW EXECUTE FUNCTION fan_out_pet_xp();
```

The `v_delta > 0` guard means decreases (an admin correction, a bug) never
claw XP back out of pets — pets only ever gain, matching the existing
"stages can never demote" philosophy `evolve_pet` already has.

**`evolve_pet` v2** (supersedes the `20260731180000` hotfix): the function
already does `SELECT * INTO v_pet FROM pets WHERE id = p_pet_id ...`, so
`v_pet.xp` is already in scope — this version *removes* the separate
`SELECT ... FROM user_xp` entirely rather than adding a query, and compares
`xp_to_stage(v_pet.xp)` against `v_pet.stage` instead:

```sql
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
```

(`v_xp` is gone — `v_pet.xp` replaces it everywhere. `stage_rank`/`xp_to_stage`
helpers, grants, and the forward-only guarantee are unchanged from the
original `20260616000037` migration.)

**RLS — confirmed clean, no new policy needed.** `pets` has RLS enabled
with only a `SELECT` policy for owners; there is no `authenticated`
`INSERT`/`UPDATE` policy at all (existing comment: "service_role bypasses
RLS for INSERT/UPDATE"). The new `xp` column inherits this lockdown for
free — no client can write it directly, only the trigger (which runs with
the function owner's privileges regardless of RLS) and `evolve_pet`'s own
internal logic (which never writes `xp`, only reads it) touch it.

## Frontend changes

- **`Pet` type** (`frontend/src/components/pets/PetCard.tsx`): add
  `xp: number`. No hook change needed — `useMyPets.ts` already does
  `.select('*')`, so the new column flows through automatically.
- **`PetCard`**: XP source changes from `xpOverride ?? hud?.xp ?? 0` to
  `xpOverride ?? pet.xp ?? 0`. `xpOverride` stays — it's what the
  logged-out demo pet (`DEMO_PET`, not a real row) relies on; every real
  pet now reads its own row.
- **`EvolutionTimeline`** in the hero sidebar (`pages/Pets.tsx`): pass
  `xpOverride={heroPet.xp}` so it reflects the spotlighted pet's own
  progress, not the account total.
- **`EvolutionTimeline`** in the no-pets-yet fallback: pass
  `xpOverride={0}` explicitly. A freshly-minted pet starts at 0 regardless
  of banked account XP (Decision 2) — showing "Baby, 0/500" here is
  accurate; showing the account's `total_xp` would overpromise what the
  mint flow actually delivers.
- **`PetStatusCard`**: `xp` prop source changes from `Pets.tsx`'s
  `useHUD().xp` to `heroPet.xp`.
- **`Pets.tsx`**: drop `xp` from its own `useHUD()` destructure once
  nothing on the page reads it directly (`tokens`/`streak` stay, for the
  resource strip).
- **Confirmed unaffected**: `PetSquadRow` (already reads `stage` directly
  from the `top_pets` view, never touched account XP), `MoodBadge` /
  `PetCosmeticsPanel` (mood and cosmetics are already real per-pet
  columns, unrelated to XP), the mini picker-strip cards (render no XP bar
  at all), the mint flow (doesn't touch XP).

## Error handling

- The trigger runs inside the same transaction as the `user_xp` upsert
  (Postgres triggers are transactional) — if the fan-out fails, the whole
  XP-award transaction rolls back. No possible state where account XP
  increased but pets didn't.
- A pet minted in the instant around an XP event either existed before the
  trigger's `UPDATE` ran (gets it) or didn't (misses it, unaffected) — not
  a race condition to fix, just the "starts accumulating from mint moment"
  behavior working as intended.

## Testing / verification plan

1. Apply the migration via `apply_migration`, then `get_advisors(security)`
   — confirm no new warnings beyond `evolve_pet`'s existing (already
   accepted) `SECURITY DEFINER` notice.
2. Live-data check against the real pet in the DB (Luna): note `pets.xp`
   pre-migration (0, column just added), trigger a real course-XP award
   path, confirm `pets.xp` moved by the same delta as `user_xp.total_xp`.
3. Multi-pet check: with a second pet on the same test account, confirm
   one XP event bumps *both* pets by the full amount, not split.
4. Confirm a pet minted *after* an XP event does not retroactively receive
   it — starts at 0 regardless of the account's existing `total_xp`.
5. `npx tsc --noEmit` / `npx eslint` / `npm run build` clean after the
   `Pet` type + `PetCard` / `EvolutionTimeline` / `PetStatusCard` changes.
   Manual check that the hero card's XP bar reflects `pets.xp` and
   diverges correctly between two pets of different ages.
6. Re-confirm `pets` RLS still has no `authenticated` UPDATE policy after
   the migration — the new column shouldn't accidentally get exposed.

## Explicitly out of scope

- No `pet_id` column on `xp_events` (Decision 5).
- No per-pet XP multipliers/boosts — noted as a possible future addition
  that would live on evolve/boost actions, not this trigger.
- No changes to `user_xp`/HUD display — it remains the account-wide
  currency/level driver exactly as today; this design only adds a parallel
  per-pet counter fed from the same source.
