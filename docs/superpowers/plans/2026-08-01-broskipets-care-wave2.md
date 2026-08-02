# BROskiPets Care System — Wave 2 (Play + Happiness + Mood) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Play action + Happiness stat to the existing Wave 1 care
loop, upgrade the daily bonus from duo (Feed+Clean) to trio (Feed+Clean+
Play), and add a purely-derived (no new storage) mood badge to
`PetCareSection`.

**Architecture:** One migration extends the existing `pets` table (adds
`happiness`/`happiness_updated_at`/`last_play_at`, renames
`last_duo_bonus_date`→`last_care_bonus_date`), prices the 4 shop items
Wave 1 already tagged `play`/`happiness` but left unpriced, and extends
`use_care_item` from a 2-way to a 3-way branch (same function, same
signature — not a new RPC). The frontend extends the existing
`PetCareSection`/`useCareInventory` from 2 actions to 3, and adds one new
pure function (`deriveCareMood`) alongside the existing `driftedStat` in
`evolution.ts`.

**Tech Stack:** Same as Wave 1 — Supabase Postgres (`SECURITY DEFINER`
RPC), React/TypeScript, Playwright (mocked-route e2e), PowerShell
(real-JWT DB verification, extending the existing `Test-CareAction.ps1`).

**Spec:** `docs/superpowers/specs/2026-08-01-broskipets-care-wave2-design.md`
— read this first for the *why*. This plan implements that spec.

**Prerequisite reading for both tasks:** Wave 1 is fully merged on `main`
(PR #45). This plan extends, in place, the exact files Wave 1 created:
`supabase/migrations/20260801120000_broskipets_care_wave1.sql` (read-only
reference — Wave 2 does NOT edit this file, it adds a new migration),
`frontend/src/components/pets/PetCareSection.tsx`,
`frontend/src/hooks/useCareInventory.ts`, `frontend/src/lib/evolution.ts`,
`frontend/src/components/pets/PetCard.tsx`,
`frontend/tests/pets-care-actions.spec.ts`.

## Global Constraints

- Database changes go through Supabase MCP `apply_migration` — **NEVER**
  `supabase db push`.
- No `framer-motion`, no orange, `/pets` uses its own `pet-*` token system
  and the `HVZCard`/`HVZButton`/`HVZProgress`/`HVZTag` primitives — same as
  Wave 1.
- Mood is **display-only** — it must not affect `use_care_item`'s logic,
  XP, or stat math in any way. If a task's implementation makes the RPC
  read or branch on anything mood-related, that's a spec violation.
- **`DEMO_PET` in `frontend/src/pages/Pets.tsx` must get the 2 new
  `Pet` fields (`happiness`, `happiness_updated_at`) the moment the `Pet`
  type grows.** This exact class of bug (a `@ts-nocheck` file silently
  drifting out of sync with a widened type) was caught by Wave 1's final
  whole-branch review, not any task-scoped review — don't repeat it.
- Wave-2 scope boundary (do not build any of this): Focus stat, Pet
  Boosters, any timed/activated buff, streaks/soft goals, any gameplay
  effect tied to mood, changing the item picker from list to grid. See
  spec's "Explicitly out of scope."
- Before claiming any task done: `npx tsc --noEmit`, `npx eslint`,
  `npm run build` must all be clean.
- `main` is protected — work lands via `git checkout -b`, push,
  `gh pr create`, `gh pr merge --merge --delete-branch` (0 approvals
  required, self-merge fine).

---

## Task 1: Database — Happiness stat, Play pricing, `use_care_item` 3-way extension

**Files:**
- Create: `supabase/migrations/20260801130000_broskipets_care_wave2.sql`
- Modify: `scripts/Test-CareAction.ps1`

**Interfaces:**
- Produces: `use_care_item` now accepts `p_action: 'play'` in addition to
  `'feed'`/`'care'` (same signature: `(p_purchase_id uuid, p_pet_id uuid,
  p_action text)`). Success shape changes the `duo_bonus` key to
  **`care_bonus`** (deliberate rename — see Decisions below) and the bonus
  amount from 5 to 10. `xp_awarded` is now 3 (not 2) when `target_stat =
  'happiness'`. Error codes unchanged.
- Produces new `pets` columns: `happiness`, `happiness_updated_at`,
  `last_play_at`. Renames `last_duo_bonus_date` → `last_care_bonus_date`.
- Produces `shop_items.metadata.effect_value` on the 4 already-`play`-tagged
  rows (they already have `effect_type`/`target_stat` from Wave 1 — this
  migration adds only the missing `effect_value` key).

- [ ] **Step 1: Read the existing migration and current test script**

Read `supabase/migrations/20260801120000_broskipets_care_wave1.sql` in
full (the exact `use_care_item` body you're extending) and
`scripts/Test-CareAction.ps1` in full (the exact script you're modifying —
do not rewrite it from scratch, extend it in place). Confirm your local
checkout matches what's quoted in this brief exactly; if it doesn't,
STOP and report — that means Wave 1's merged state differs from what this
plan assumed.

- [ ] **Step 2: Extend the verification script FIRST — update the now-stale duo-bonus assertions, add a Play case, add a trio-bonus case**

This is the "write the failing test first" step for this task: the
**existing** script's final assertions are about to become factually wrong
under this migration (Feed+Clean alone currently expects `duo_bonus: true`
and final `xp: 9` — under Wave 2's 3-way bonus condition, Feed+Clean alone
must no longer trigger any bonus at all, since Play is now required too).
Fix those assertions to reflect the new behavior, then add new Play and
trio-bonus coverage. Concretely, in `scripts/Test-CareAction.ps1`:

1. Add a fourth known item id near the top, alongside the existing three:
   ```powershell
   $ItemDebugDuck = '33330007-0000-0000-0000-000000000006'  # pet_care, play/happiness, +14 (after this migration), 30 tokens
   ```
2. In the "Seeding owned-but-unused purchases" section, seed a 4th
   purchase using `$ItemDebugDuck` (`spent_tokens = 30`), capture its id
   as `$PurchasePlay1`.
3. **Change the existing "Clean with Cache Shampoo (expect duo bonus)"
   step's expectations.** Under Wave 2, Feed+Clean alone (no Play) must
   NOT trigger the bonus. Update the assertions:
   ```powershell
   Step "use_care_item: Clean with Cache Shampoo (expect NO bonus yet - Play still missing)"
   $r4 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
       -Body @{ p_purchase_id = $PurchaseClean1; p_pet_id = $PetId; p_action = 'care' }
   if (-not $r4.ok) { throw "Clean failed: $($r4.error)" }
   if ($r4.target_stat -ne 'cleanliness') { throw "Expected target_stat=cleanliness, got $($r4.target_stat)" }
   if ($r4.new_value -ne 58) { throw "Expected new_value=58 (50+8), got $($r4.new_value)" }
   if ($r4.care_bonus) { throw "care_bonus should be FALSE - Play hasn't happened yet this run" }
   if ($r4.xp_awarded -ne 2) { throw "Expected xp_awarded=2 (base only, no bonus), got $($r4.xp_awarded)" }
   Ok "Clean succeeded, correctly NO bonus yet: cleanliness=$($r4.new_value) xp_awarded=$($r4.xp_awarded)"
   ```
4. **Add a new step immediately after, for Play completing the trio:**
   ```powershell
   Step "use_care_item: Play with Debug Duck (expect trio bonus now)"
   $r5 = Invoke-Json -Method POST -Url "$SupabaseUrl/rest/v1/rpc/use_care_item" -Headers $userHeaders `
       -Body @{ p_purchase_id = $PurchasePlay1; p_pet_id = $PetId; p_action = 'play' }
   if (-not $r5.ok) { throw "Play failed: $($r5.error)" }
   if ($r5.target_stat -ne 'happiness') { throw "Expected target_stat=happiness, got $($r5.target_stat)" }
   if ($r5.new_value -ne 64) { throw "Expected new_value=64 (50+14), got $($r5.new_value)" }
   if (-not $r5.care_bonus) { throw "care_bonus should be TRUE - Feed+Clean+Play all done today" }
   if ($r5.xp_awarded -ne 13) { throw "Expected xp_awarded=13 (3 base + 10 trio bonus), got $($r5.xp_awarded)" }
   Ok "Play succeeded with trio bonus: happiness=$($r5.new_value) xp_awarded=$($r5.xp_awarded)"
   ```
5. **Update the final DB-state check** to also assert `happiness` and the
   final total xp:
   ```powershell
   $petFinal = Invoke-Json -Method GET -Url "$SupabaseUrl/rest/v1/pets?id=eq.$PetId&select=hunger,cleanliness,happiness,xp,last_care_bonus_date" -Headers $adminHeaders
   if ($petFinal[0].cleanliness -ne 58) { throw "DB cleanliness mismatch: $($petFinal[0].cleanliness)" }
   if ($petFinal[0].happiness -ne 64) { throw "DB happiness mismatch: $($petFinal[0].happiness)" }
   if ($petFinal[0].xp -ne 17) { throw "DB final xp mismatch: expected 17 (2 feed + 2 clean + 3 play + 10 bonus), got $($petFinal[0].xp)" }
   if (-not $petFinal[0].last_care_bonus_date) { throw "last_care_bonus_date not stamped" }
   Ok "Final DB state confirmed: hunger=58, cleanliness=58, happiness=64, xp=17"
   ```
   (Note: this replaces the Wave 1 script's old expectation of `xp -ne 9` —
   xp is now 17 because Play's own +3 and the +10 trio bonus both stack on
   top of the prior Feed+Clean total of 4.)
6. Add `$ItemDebugDuck`'s purchase id to the `finally` block's cleanup (it
   already does a blanket `DELETE ... WHERE user_id=eq.$UserId` on
   `shop_purchases`, so no change needed there — just confirm this by
   reading the existing cleanup block).

- [ ] **Step 3: Run the script, confirm it fails**

Run: `pwsh ./scripts/Test-CareAction.ps1`
Expected: FAILS — either the Debug Duck purchase creation succeeds (item/
column already exist) but the `use_care_item` call with `p_action: 'play'`
returns `invalid_action` (the RPC doesn't accept `'play'` yet), or the
`happiness` column doesn't exist yet on the `pets` INSERT/SELECT. Either
is the correct red — confirms the migration genuinely doesn't exist yet.

- [ ] **Step 4: Write the migration**

Create `supabase/migrations/20260801130000_broskipets_care_wave2.sql`:

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: BROskiPets Care System — Wave 2 (Play + Happiness + mood support)
--
-- Adds the Happiness stat (identical shape to Wave 1's Hunger/Cleanliness),
-- prices the 4 shop items Wave 1 pre-tagged play/happiness but left
-- unpriced, and extends use_care_item from 2-way to 3-way (feed/care/play).
-- Upgrades the daily bonus from duo (+5, Feed+Clean) to trio (+10,
-- Feed+Clean+Play) — last_duo_bonus_date is renamed to reflect its new
-- semantics. The mood layer itself needs NO schema here — it's a pure
-- frontend-derived value computed from the stats this migration produces.
--
-- See docs/superpowers/specs/2026-08-01-broskipets-care-wave2-design.md
-- for full design rationale.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. pets: Happiness stat + play tracking ─────────────────────────────────
ALTER TABLE public.pets
  ADD COLUMN happiness            integer NOT NULL DEFAULT 50
    CHECK (happiness BETWEEN 0 AND 100),
  ADD COLUMN happiness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_play_at         timestamptz NULL;

-- Semantics changed (duo -> trio bonus below) - rename rather than leave a
-- stale name for the next reader.
ALTER TABLE public.pets
  RENAME COLUMN last_duo_bonus_date TO last_care_bonus_date;

-- ── 2. shop_items.metadata — price the 4 Wave-1-deferred play items ────────
-- Same tiering rule as Wave 1 (<25 -> +8, 25-40 -> +14, 45+ -> +22).
-- These rows already carry effect_type:"play", target_stat:"happiness" from
-- Wave 1 - this only adds the missing effect_value key via jsonb merge.
UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_value":14}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000006', -- Debug Duck (30 tokens)
  '33330007-0000-0000-0000-000000000009'  -- Rainbow Treat (40 tokens)
);

UPDATE public.shop_items SET metadata = metadata ||
  '{"effect_value":22}'::jsonb
WHERE id IN (
  '33330007-0000-0000-0000-000000000004', -- Holo Puzzle (50 tokens)
  '33330007-0000-0000-0000-000000000005'  -- Quantum Toy (60 tokens)
);

-- ── 3. use_care_item — extended from 2-way to 3-way (same function, same
--       signature; CREATE OR REPLACE preserves the existing REVOKE/GRANT
--       ACL from Wave 1 - Postgres keeps a function's privileges across a
--       REPLACE since the object identity by signature is unchanged. This
--       is verified live in Step 5 below, not just assumed.) ──────────────
CREATE OR REPLACE FUNCTION public.use_care_item(
  p_purchase_id uuid, p_pet_id uuid, p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller        uuid := auth.uid();
  v_purchase      shop_purchases%ROWTYPE;
  v_item          shop_items%ROWTYPE;
  v_pet           pets%ROWTYPE;
  v_effect_type   text;
  v_target_stat   text;
  v_effect_value  integer;
  v_current       integer;
  v_new_value     integer;
  v_bonus_awarded boolean := false;
  v_rows          integer;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_action NOT IN ('feed', 'care', 'play') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;

  SELECT * INTO v_purchase FROM shop_purchases
    WHERE id = p_purchase_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
  END IF;
  IF v_purchase.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND user_id = v_caller;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_your_pet');
  END IF;

  SELECT * INTO v_item FROM shop_items WHERE id = v_purchase.item_id;
  v_effect_type  := v_item.metadata ->> 'effect_type';
  v_target_stat  := v_item.metadata ->> 'target_stat';
  v_effect_value := COALESCE((v_item.metadata ->> 'effect_value')::integer, 0);

  IF v_effect_type IS DISTINCT FROM p_action THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_effect_type');
  END IF;
  IF v_target_stat NOT IN ('hunger', 'cleanliness', 'happiness') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_stat');
  END IF;

  IF v_target_stat = 'hunger' THEN
    v_current := drifted_stat(v_pet.hunger, v_pet.hunger_updated_at);
  ELSIF v_target_stat = 'cleanliness' THEN
    v_current := drifted_stat(v_pet.cleanliness, v_pet.cleanliness_updated_at);
  ELSE
    v_current := drifted_stat(v_pet.happiness, v_pet.happiness_updated_at);
  END IF;
  v_new_value := LEAST(100, v_current + v_effect_value);

  UPDATE shop_purchases
    SET used_at = now(), used_on_pet_id = p_pet_id
    WHERE id = p_purchase_id AND used_at IS NULL;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  IF v_target_stat = 'hunger' THEN
    UPDATE pets SET
      hunger = v_new_value, hunger_updated_at = now(),
      xp = xp + 2, last_feed_at = now()
    WHERE id = p_pet_id;
  ELSIF v_target_stat = 'cleanliness' THEN
    UPDATE pets SET
      cleanliness = v_new_value, cleanliness_updated_at = now(),
      xp = xp + 2, last_clean_at = now()
    WHERE id = p_pet_id;
  ELSE
    UPDATE pets SET
      happiness = v_new_value, happiness_updated_at = now(),
      xp = xp + 3, last_play_at = now()
    WHERE id = p_pet_id;
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;
  IF v_pet.last_feed_at::date = CURRENT_DATE
     AND v_pet.last_clean_at::date = CURRENT_DATE
     AND v_pet.last_play_at::date = CURRENT_DATE
     AND v_pet.last_care_bonus_date IS DISTINCT FROM CURRENT_DATE THEN
    UPDATE pets SET xp = xp + 10, last_care_bonus_date = CURRENT_DATE
      WHERE id = p_pet_id;
    v_bonus_awarded := true;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'target_stat', v_target_stat,
    'new_value',   v_new_value,
    'xp_awarded',  (CASE WHEN v_target_stat = 'happiness' THEN 3 ELSE 2 END)
                   + (CASE WHEN v_bonus_awarded THEN 10 ELSE 0 END),
    'care_bonus',  v_bonus_awarded
  );
END;
$$;

COMMIT;
```

- [ ] **Step 5: Apply the migration**

Use the Supabase MCP tool: `apply_migration` against project ref
`tlavrxiaegbtyfmjfdcz`. **Do not** use `supabase db push`.

- [ ] **Step 6: Security advisor check — specifically verify the ACL-preservation assumption**

Use the Supabase MCP tool: `get_advisors` with `type: security`. Expected:
no new warnings — specifically, confirm `use_care_item` is still NOT
`anon`-executable after the `CREATE OR REPLACE` (i.e. the
`anon_security_definer_function_executable` warning must NOT reappear). If
it does reappear, the "REPLACE preserves ACLs" assumption in this
migration's comment was wrong for this Postgres version — re-add the
`REVOKE ... FROM PUBLIC` / `REVOKE ... FROM anon` /
`GRANT ... TO authenticated` block from Wave 1's migration to the end of
this one and re-verify.

- [ ] **Step 7: Run the verification script again, confirm it passes**

Run: `pwsh ./scripts/Test-CareAction.ps1`
Expected: `ALL CHECKS PASSED`, every step green including the new Play and
trio-bonus checks, and the updated Feed+Clean-alone check correctly
showing `care_bonus: false`.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/20260801130000_broskipets_care_wave2.sql scripts/Test-CareAction.ps1
git commit -m "feat(pets): add Happiness stat, Play action, trio bonus to care RPC"
```

---

## Task 2: Frontend — Play action, Happiness bar, mood badge

**Depends on:** Task 1.

**Files:**
- Modify: `frontend/src/lib/evolution.ts` (add `CareMood` type + `deriveCareMood()`)
- Modify: `frontend/src/components/pets/PetCard.tsx` (extend `Pet` type)
- Modify: `frontend/src/pages/Pets.tsx` (`DEMO_PET` gets the 2 new fields)
- Modify: `frontend/src/hooks/useCareInventory.ts` (add `playItems`)
- Modify: `frontend/src/components/pets/PetCareSection.tsx` (3rd action + mood badge)
- Modify: `frontend/tests/pets-care-actions.spec.ts` (extend fixtures, add Play + mood tests, fix the now-stale duo-bonus test)

**Interfaces:**
- Consumes: `use_care_item` now accepts `p_action: 'play'`; response key
  `duo_bonus` is now `care_bonus`; `xp_awarded` is 3 for happiness-targeted
  actions, still 2 for hunger/cleanliness; bonus amount is 10.
- Produces: `deriveCareMood(hunger: number, cleanliness: number, happiness: number, lastPlayAt: string | null, now?: Date): CareMood` in
  `evolution.ts`, where `CareMood = 'sleepy' | 'grubby' | 'zen' | 'hype' |
  'playful' | 'content'`.
- Produces: `useCareInventory()` now also returns `playItems: CareItem[]`.

- [ ] **Step 1: Extend the failing Playwright spec first**

Modify `frontend/tests/pets-care-actions.spec.ts`:

1. Add `happiness: 50, happiness_updated_at: '2026-08-01T00:00:00.000Z'`
   to the `PET` fixture object (alongside the existing hunger/cleanliness
   fields).
2. Add a `PLAY_PURCHASE` fixture:
   ```typescript
   const PLAY_PURCHASE = {
     id: 'purchase-play-1', item_id: 'item-duck', used_at: null, used_on_pet_id: null,
     shop_items: { id: 'item-duck', name: 'Debug Duck', image_url: null,
       metadata: { effect_type: 'play', target_stat: 'happiness', effect_value: 14 } },
   }
   ```
3. Add a new test, modeled directly on the existing "successful Feed"/
   "successful Clean" tests:
   ```typescript
   test('successful Play updates the happiness bar and shows XP toast', async ({ page }) => {
     await setupAuthMock(page)
     await setupRestMock(page, [PLAY_PURCHASE], {
       ok: true, target_stat: 'happiness', new_value: 64, xp_awarded: 3, care_bonus: false,
     })

     await signIn(page)
     await page.goto('/pets')

     await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })

     await page.getByRole('button', { name: /^play$/i }).click()
     await expect(page.getByText('Debug Duck')).toBeVisible()
     await page.getByText('Debug Duck').click()

     await expect(page.getByText(/loved that toy/i)).toBeVisible({ timeout: 10_000 })
     await expect(page.getByText(/\+14 happiness/i)).toBeVisible()
     await expect(page.getByText(/\+3 xp/i)).toBeVisible()
   })
   ```
4. **Fix the now-stale "daily duo bonus" test.** Rename it and update its
   RPC mock response and assertions to the trio/`care_bonus` shape (this
   test currently asserts `duo_bonus`/`+5 bonus xp`, which no longer
   exists as a key):
   ```typescript
   test('daily care bonus toast appears when the RPC reports care_bonus: true', async ({ page }) => {
     const playPurchase = {
       id: 'purchase-play-2', item_id: 'item-duck-2', used_at: null, used_on_pet_id: null,
       shop_items: { id: 'item-duck-2', name: 'Quantum Toy', image_url: null,
         metadata: { effect_type: 'play', target_stat: 'happiness', effect_value: 22 } },
     }
     await setupAuthMock(page)
     await setupRestMock(page, [playPurchase], {
       ok: true, target_stat: 'happiness', new_value: 72, xp_awarded: 13, care_bonus: true,
     })

     await signIn(page)
     await page.goto('/pets')

     await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
     await page.getByRole('button', { name: /^play$/i }).click()
     await page.getByText('Quantum Toy').click()

     await expect(page.getByText(/daily care complete/i)).toBeVisible({ timeout: 10_000 })
     await expect(page.getByText(/\+10 bonus xp/i)).toBeVisible()
   })
   ```
5. Add a mood-badge test covering the two ends of the priority chain (a
   needs-based override and the thriving state), reusing the same `PET`
   fixture pattern with different stat values per case:
   ```typescript
   test('mood badge reflects Grubby when cleanliness is low', async ({ page }) => {
     const grubbyPet = { ...PET, cleanliness: 20 }
     await setupAuthMock(page)
     await setupRestMock(page, [], null)
     await page.route('**/rest/v1/pets**', async (route) => { await fulfillJson(route, [grubbyPet]) })

     await signIn(page)
     await page.goto('/pets')

     await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
     await expect(page.getByText(/grubby/i)).toBeVisible()
   })

   test('mood badge reflects Zen when all stats are high', async ({ page }) => {
     const zenPet = { ...PET, hunger: 80, cleanliness: 80, happiness: 80 }
     await setupAuthMock(page)
     await setupRestMock(page, [], null)
     await page.route('**/rest/v1/pets**', async (route) => { await fulfillJson(route, [zenPet]) })

     await signIn(page)
     await page.goto('/pets')

     await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
     await expect(page.getByText(/zen/i)).toBeVisible()
   })
   ```
   (`page.route` registered after `setupRestMock` overrides just the
   `/pets` handler for these two tests — Playwright uses the most
   recently registered matching route.)
6. Update the file's header comment to list all 6 scenarios now covered.

- [ ] **Step 2: Run it, confirm the new/changed tests fail**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: the Play test fails (no Play button exists), the renamed bonus
test fails (component doesn't send/expect `care_bonus`), the mood tests
fail (no mood badge exists). The original Feed/Clean/empty-state tests
should still pass unchanged — confirms you haven't broken anything Task
2's prior code already had working.

- [ ] **Step 3: Add `CareMood` + `deriveCareMood()` to `evolution.ts`**

Append after the existing `driftedStat()` function:

```typescript
export type CareMood = 'sleepy' | 'grubby' | 'zen' | 'hype' | 'playful' | 'content'

/**
 * Purely derived from the three drifted care stats + recent Play activity
 * — no DB storage, no write path, never touches use_care_item. Deliberately
 * distinct from `PetMood` above (idle/learning/hyperfocus/evolving), which
 * is a real DB column driven by evolve_pet() and PetMentorBubble chat.
 * Priority order: needs-based moods (Sleepy/Grubby) override positive ones.
 */
export function deriveCareMood(
  hunger: number, cleanliness: number, happiness: number,
  lastPlayAt: string | null, now: Date = new Date()
): CareMood {
  if (hunger < 35) return 'sleepy'
  if (cleanliness < 35) return 'grubby'
  if (hunger >= 65 && cleanliness >= 65 && happiness >= 65) return 'zen'
  const playedRecently = lastPlayAt !== null &&
    (now.getTime() - new Date(lastPlayAt).getTime()) < 24 * 60 * 60 * 1000
  if (happiness >= 80 && playedRecently) return 'hype'
  if (happiness >= 65) return 'playful'
  return 'content'
}
```

- [ ] **Step 4: Extend the `Pet` type**

In `frontend/src/components/pets/PetCard.tsx`, add after the existing
`cleanliness_updated_at: string` line. Note `last_play_at` is included here
even though it's not a "stat" — the RPC has written this column since
Wave 1's migration, but nothing in the TS layer has read it until this
task's mood computation needs it in Step 7:

```typescript
  happiness:              number
  happiness_updated_at:   string
  last_play_at:           string | null
```

- [ ] **Step 5: Update `DEMO_PET` in `Pets.tsx` — do not skip this**

In `frontend/src/pages/Pets.tsx`, find the `DEMO_PET` const (has
`hunger: 50, hunger_updated_at: ..., cleanliness: 50, cleanliness_updated_at:
...` from Wave 1's own fix). Add:

```typescript
  happiness:              50,
  happiness_updated_at:   new Date().toISOString(),
```

This file is `@ts-nocheck` — `tsc` cannot catch a missed field here. This
is the exact bug class Wave 1's final review caught; do not let it recur.

- [ ] **Step 6: Add `playItems` to `useCareInventory.ts`**

In `frontend/src/hooks/useCareInventory.ts`:
1. Update the header comment: change "Feed/Clean items" to "Feed/Clean/Play
   items" and `('feed' | 'care'` to `('feed' | 'care' | 'play'`.
2. Add `playItems: CareItem[]` to the `UseCareInventoryResult` type.
3. Add the corresponding `useMemo`, same pattern as `feedItems`/`careItems`:
   ```typescript
   const playItems = useMemo(
     () => rows.filter((r) => r.shop_items?.metadata?.effect_type === 'play').map(toCareItem).filter((i): i is CareItem => i !== null),
     [rows],
   )
   ```
4. Add `playItems` to the final `return`.

- [ ] **Step 7: Extend `PetCareSection.tsx` — third action + mood badge**

In `frontend/src/components/pets/PetCareSection.tsx`:

1. `type Action = 'feed' | 'care' | 'play'`
2. `ACTION_LABEL`: add `play: 'Play'`. `ACTION_EMOJI`: add `play: '🎮'`.
3. Add a noun map for toast/empty-state copy (replaces the inline
   `action === 'feed' ? 'snack' : 'clean-up'` ternary, which can't extend
   to 3 branches cleanly):
   ```typescript
   const ACTION_NOUN: Record<Action, string> = { feed: 'snack', care: 'clean-up', play: 'toy' }
   const EMPTY_NOUN: Record<Action, string> = { feed: 'snacks', care: 'cleaning supplies', play: 'toys' }
   ```
4. `CareRpcResult`: rename `duo_bonus?: boolean` to `care_bonus?: boolean`.
5. Rename `DUO_BONUS_XP = 5` to `CARE_BONUS_XP = 10`.
6. Add the two new mood display maps near the top (after `ACTION_EMOJI`):
   ```typescript
   const MOOD_EMOJI: Record<CareMood, string> = {
     sleepy: '😴', grubby: '🧼', zen: '😌', hype: '🎉', playful: '🙂', content: '😐',
   }
   const MOOD_LABEL: Record<CareMood, string> = {
     sleepy: 'Sleepy', grubby: 'Grubby', zen: 'Zen', hype: 'Hype', playful: 'Playful', content: 'Content',
   }
   ```
   Import `CareMood` and `deriveCareMood` from `../../lib/evolution`
   alongside the existing `driftedStat` import.
7. In the component body:
   - `const { feedItems, careItems, playItems, loading, refetch } = useCareInventory()`
   - `items`: add `play: playItems`.
   - `statValue`: add `play: driftedStat(pet.happiness, pet.happiness_updated_at)`.
   - `statLabel`: add `play: 'Happiness'`.
   - Add: `const mood = deriveCareMood(statValue.feed, statValue.care, statValue.play, pet.last_play_at)`
     (`pet.last_play_at` — added to the `Pet` type in Step 4.)
8. In `handleUse`: replace `action === 'feed' ? 'snack' : 'clean-up'` with
   `ACTION_NOUN[action]`; replace `result.duo_bonus` with
   `result.care_bonus` (both occurrences); replace `DUO_BONUS_XP` with
   `CARE_BONUS_XP` (both occurrences).
9. In the JSX: change `(['feed', 'care'] as const)` to
   `(['feed', 'care', 'play'] as const)`; change the grid className from
   `grid-cols-1 sm:grid-cols-2` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
   replace the empty-state ternary
   `action === 'feed' ? 'snacks' : 'cleaning supplies'` with
   `EMPTY_NOUN[action]`.
10. Add the mood badge to the header:
    ```tsx
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
        Pet Care
      </h2>
      <span className="inline-flex items-center gap-1 rounded-hfz-sm border-2 border-pet-ink/15 bg-pet-lilac/20 px-2 py-1 text-xs font-semibold text-pet-ink">
        <span aria-hidden>{MOOD_EMOJI[mood]}</span> {MOOD_LABEL[mood]}
      </span>
    </header>
    ```
    (replaces the existing single-child `<header className="mb-4">...
    </header>`.)

- [ ] **Step 8: Run the Playwright spec again, confirm it passes**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: all tests PASS (Feed, Clean, Play, empty state, care-bonus, both
mood tests).

- [ ] **Step 9: Full verification pass**

Run in order: `npx tsc --noEmit`, `npx eslint .`, `npm run build`,
`npx playwright test` (full suite — expect the same pre-existing,
already-documented `shop.spec.ts:542` flake and no other failures; do not
treat that one as a regression, but do confirm no NEW failures appeared).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/lib/evolution.ts frontend/src/components/pets/PetCard.tsx frontend/src/pages/Pets.tsx frontend/src/hooks/useCareInventory.ts frontend/src/components/pets/PetCareSection.tsx frontend/tests/pets-care-actions.spec.ts
git commit -m "feat(pets): add Play action, Happiness bar, and care-mood badge"
```

---

## Self-Review Notes

**Spec coverage:** every spec section maps to a task step — Happiness
stat + item pricing (Task 1 Step 4), 3-way RPC extension + trio bonus
(Task 1 Step 4), mood derivation (Task 2 Step 3), mood placement (Task 2
Step 7.10), UI flow for Play (Task 2 Step 7), testing plan items 1-5 (Task
1 Steps 2-7, Task 2 Steps 1-8).

**Type/name consistency confirmed:** `care_bonus` (RPC response key) is
used identically in the SQL (Task 1), the PowerShell assertions (Task 1),
and `PetCareSection.tsx`'s `handleUse` (Task 2) — no `duo_bonus` survives
anywhere. `CareMood`'s 6 values are identical across `deriveCareMood()`'s
return type, `MOOD_EMOJI`, and `MOOD_LABEL`. `playItems` is defined once in
`useCareInventory.ts` and consumed as-is.

**Caught during self-review, fixed inline (not carried over from an
earlier draft):** `pet.last_play_at` needed to be added to the `Pet` type
for the mood computation in Step 7 to type-check — folded directly into
Task 2 Step 4.

**Scope check:** two tasks, DB then frontend, mirrors Wave 1's shape
exactly — right-sized.

## Execution Handoff

Plan complete and saved to
`docs/superpowers/plans/2026-08-01-broskipets-care-wave2.md`. Two execution
options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task,
review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using
executing-plans, batch execution with checkpoints.

Which approach?
