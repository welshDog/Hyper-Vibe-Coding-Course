# BROskiPets Care System — Wave 1 (Feed + Clean) — Design

## Context

`broskipets-care-brainstorm-report.md` (repo root) laid out a full 3-wave
vision for turning the BROski$ shop's existing item categories into a pet
care loop: hunger/happiness/cleanliness/focus stats, a mood layer,
feed/play/clean/boost actions, and rare relics. This design scopes down to
**Wave 1 only** — the report's own recommended starting point: Snacks &
Fuel + Clean & Tidy + Pet Care, i.e. Feed and Clean actions against two
stats (Hunger, Cleanliness). No mood layer, no Happiness/Focus yet.

Two codebase facts (confirmed via exploration during brainstorming, not
known to the original report) shaped every decision below:

- **Fully greenfield.** No `effect_type`/`target_stat`/inventory-count/"use
  item" system exists anywhere today. `shop_items.metadata.consumable` only
  controls rebuy-ability, not a quantity or a stat effect — a consumable
  purchase just creates another `shop_purchases` row with no concept of
  "used."
- **`pets.mood` is a live, DB-enforced, unrelated system.** It's a `CHECK`
  column (`idle|learning|hyperfocus|evolving`) force-reset to `'idle'` by
  `evolve_pet()`, and drives real UI (`PetMentorBubble` chat, mood-based
  styling). The report's proposed care-mood layer (Sleepy/Grubby/Playful/
  etc.) cannot reuse or extend this column without touching
  evolution/mentor-chat logic — hence it's deferred entirely rather than
  half-built on top of an incompatible field.

## Decisions made during design

1. **Hero pet only.** Feed/Clean act on whichever pet is currently
   spotlighted, matching how `Evolve` already works — no pet-picker UI, no
   `pet_id` selection surface. Every user with 1+ pets already has a hero
   pet resolved by `Pets.tsx`.
2. **Only Hunger and Cleanliness ship.** Happiness/Focus wait for Wave 2
   (Toys/Boosters). Shipping inert stat bars nobody can move yet was
   rejected as bad UX for no benefit.
3. **No mood layer in Wave 1**, for the schema-conflict reason above. The
   report calls its own mood layer "optional" — revisit once Happiness
   exists too and richer mood derivation is actually possible.
4. **Daily care "duo" bonus ships now** (+5 pet XP for doing both Feed and
   Clean the same day), rather than waiting for the report's "trio" (which
   needs Play, a Wave-2 action). Upgrades naturally to a trio bonus once
   Play ships.
5. **Stats drift toward a neutral midpoint (50) over 5 days of inaction**,
   rather than never decaying. A deliberate, small departure from the
   report's literal "no decay" wording, chosen specifically so the bars
   stay meaningful long after the "buy stuff and max it once" phase — never
   drifts toward 0/"starving," only back to neutral.
6. **`use_care_item` writes directly to `pets.xp` for the one pet acted
   on**, deliberately bypassing the existing `fan_out_pet_xp()` trigger.
   That trigger mirrors account-wide `user_xp` increases to *all* of a
   user's pets equally (see `2026-07-31-per-pet-xp-design.md`) — correct
   for course-driven XP, wrong for "you fed Luna specifically." This is a
   second, independent write path onto `pets.xp`, not a modification of the
   existing one.

## Item-Effect Matrix (Wave 1)

`shop_items.metadata` gains three new keys (existing JSONB extension point,
same pattern as `consumable`/`pet_slot`/`boost`): `effect_type`
(`'feed' | 'care'`), `target_stat` (`'hunger' | 'cleanliness'`),
`effect_value` (integer). This is the report's own core insight — separate
*behaviour* from display `category` — implemented as a metadata patch to
the Wave-1-relevant rows, no `ALTER TABLE` on `shop_items` needed.

Effect value tiered by price: `<25 tokens → +8`, `25–40 → +14`, `45+ → +22`.

| Item(s) | Price | effect_type | target_stat | effect_value |
|---|---|---|---|---|
| API Apple, Hyper Donut, Markdown Muffin | 18–20 | feed | hunger | +8 |
| BROski Burger, Hyper Energy Drink, Pixel Sushi | 25–40 | feed | hunger | +14 |
| Cache Shampoo, Lint Brush, Log Floss | 18–22 | care | cleanliness | +8 |
| Classic Kibble | 20 | feed | hunger | +8 |
| Power Snack, Choc Drop Treat | 25–35 | feed | hunger | +14 |
| HyperFuel | 45 | feed | hunger | +22 |

**Judgment calls on the remaining 3 `pet_care` items** (their filenames/
descriptions don't cleanly say "feed," despite the shared display
category):

- Holo Puzzle, Quantum Toy, Debug Duck — filenames literally say
  `toy`/`rubber_duck`. Tagged `effect_type: 'play'`, `target_stat:
  'happiness'` — still purchasable, **inert until Wave 2** (no `happiness`
  stat exists yet, and no action targets `play` items).
- Rainbow Treat — description says "Maximum joy," not hunger. Same call:
  `play`/`happiness`, deferred.
- Legendary Vibe Treat (90 tokens, "ascends briefly") — priced well above
  the rest of the category (90 vs 18–60) and reads like a timed buff, not a
  meal. Tagged `boost`, deferred to Wave 2/3 review alongside Pet Boosters
  rather than force-fit into `feed`.

Net: **13 items actionable in Wave 1**; the other 5 stay purchasable (no
regression to today's shop) but simply don't appear in the Feed/Clean
picker until later waves unlock their effect types.

XP payout: **+2 pet XP** per Feed or Clean action, **+5 pet XP** daily duo
bonus (once per calendar day, guarded — see schema below).

## Schema changes

```sql
-- pets: new stat + tracking columns
ALTER TABLE public.pets
  ADD COLUMN hunger                 integer NOT NULL DEFAULT 50
    CHECK (hunger BETWEEN 0 AND 100),
  ADD COLUMN hunger_updated_at      timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN cleanliness            integer NOT NULL DEFAULT 50
    CHECK (cleanliness BETWEEN 0 AND 100),
  ADD COLUMN cleanliness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_feed_at           timestamptz NULL,
  ADD COLUMN last_clean_at          timestamptz NULL,
  ADD COLUMN last_duo_bonus_date    date NULL;

-- shop_purchases: inventory/usage tracking
ALTER TABLE public.shop_purchases
  ADD COLUMN used_at         timestamptz NULL,
  ADD COLUMN used_on_pet_id  uuid NULL REFERENCES public.pets(id);
```

- Stats start at **50** (neutral), not 0 — a fresh pet shouldn't read as
  "starving."
- `used_at IS NULL` = still-available inventory. One purchase row = one
  use, matching the existing "rebuy = new row" consumable pattern exactly —
  no new inventory-count table needed.
- `last_feed_at`/`last_clean_at` record which half of the duo happened most
  recently. A single date field can't distinguish *which* action fired —
  caught during design review (an earlier single-`last_care_bonus_date`
  draft was ambiguous about this).
- `last_duo_bonus_date` is a **narrow, single-purpose guard** against
  double-awarding the bonus within one day (Feed→Clean→Feed→Clean same day
  must only pay out once): award only when
  `last_feed_at::date = CURRENT_DATE AND last_clean_at::date = CURRENT_DATE
  AND last_duo_bonus_date IS DISTINCT FROM CURRENT_DATE`.

### Drift helper — dual mirror, DB canonical

```sql
CREATE OR REPLACE FUNCTION public.drifted_stat(
  v_raw integer, v_updated_at timestamptz
) RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT LEAST(100, GREATEST(0, ROUND(
    v_raw + (50 - v_raw) * LEAST(
      1.0, EXTRACT(EPOCH FROM (now() - v_updated_at)) / (5 * 86400)
    )
  )))::integer;
$$;
```

5-day linear return-to-neutral. **The SQL result is the source of truth** —
`use_care_item` computes the pre-drift value itself before adding the
action's boost, so the stored value never silently disagrees with what the
user saw. A TS mirror of this same formula exists **only** for optimistic
live display of the bars between actions (same dual-mirror pattern already
used for `xp_to_stage()`/`progressInStage()` in `frontend/src/lib/
evolution.ts`) — it is never a write source.

### RPC: `use_care_item`

```sql
CREATE OR REPLACE FUNCTION public.use_care_item(
  p_purchase_id uuid, p_pet_id uuid, p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller       uuid := auth.uid();
  v_purchase     shop_purchases%ROWTYPE;
  v_item         shop_items%ROWTYPE;
  v_pet          pets%ROWTYPE;
  v_effect_type  text;
  v_target_stat  text;
  v_effect_value integer;
  v_current      integer;
  v_new_value    integer;
  v_duo_awarded  boolean := false;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_action NOT IN ('feed', 'care') THEN
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
  IF v_target_stat NOT IN ('hunger', 'cleanliness') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_stat');
  END IF;

  IF v_target_stat = 'hunger' THEN
    v_current := drifted_stat(v_pet.hunger, v_pet.hunger_updated_at);
  ELSE
    v_current := drifted_stat(v_pet.cleanliness, v_pet.cleanliness_updated_at);
  END IF;
  v_new_value := LEAST(100, v_current + v_effect_value);

  UPDATE shop_purchases
    SET used_at = now(), used_on_pet_id = p_pet_id
    WHERE id = p_purchase_id;

  IF v_target_stat = 'hunger' THEN
    UPDATE pets SET
      hunger = v_new_value, hunger_updated_at = now(),
      xp = xp + 2, last_feed_at = now()
    WHERE id = p_pet_id;
  ELSE
    UPDATE pets SET
      cleanliness = v_new_value, cleanliness_updated_at = now(),
      xp = xp + 2, last_clean_at = now()
    WHERE id = p_pet_id;
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;
  IF v_pet.last_feed_at::date = CURRENT_DATE
     AND v_pet.last_clean_at::date = CURRENT_DATE
     AND v_pet.last_duo_bonus_date IS DISTINCT FROM CURRENT_DATE THEN
    UPDATE pets SET xp = xp + 5, last_duo_bonus_date = CURRENT_DATE
      WHERE id = p_pet_id;
    v_duo_awarded := true;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'target_stat', v_target_stat,
    'new_value',   v_new_value,
    'xp_awarded',  2 + (CASE WHEN v_duo_awarded THEN 5 ELSE 0 END),
    'duo_bonus',   v_duo_awarded
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.use_care_item(uuid, uuid, text) TO authenticated;
```

`p_action` is passed explicitly by the UI (which button was clicked) and
cross-checked against the item's own `effect_type` — this is the
`wrong_effect_type` guard, and it means a Feed click can never accidentally
consume a Clean item even if the picker's client-side filter had a bug.

## Frontend changes

- New component `frontend/src/components/pets/PetCareSection.tsx` — full
  width, placed between the hero row and `<EvolutionTimeline>` in
  `Pets.tsx`. (Not the sidebar, not the hero card footer — this session's
  `EvolutionTimeline` work already found that squeezing content-heavy
  components into the narrow sidebar column was a mistake; a picker grid
  has the same space needs.)
- Two buttons: 🍔 Feed, 🧼 Clean, each showing a live Hunger/Cleanliness bar
  (drifted value, computed client-side via a TS mirror of `drifted_stat`).
  The Clean button passes `p_action: 'care'` to the RPC (matching
  `effect_type`, not the button's display label) — same naming the item
  matrix already uses.
- Click → expands a grid of owned, unused, effect-matching items — query
  `shop_purchases` joined to `shop_items`, filtered `used_at IS NULL` and
  `metadata->>'effect_type' = 'feed' | 'care'`. Empty state: "You don't
  have any snacks yet — grab some in the shop 🛍️" linking to `/shop`.
- Select item → call `use_care_item(purchase_id, pet_id, action)`. On
  success: stat bar animates, toast feedback ("Luna loved that snack! 🍎 +8
  Hunger · +2 XP"), a second toast if `duo_bonus: true`, then refetch (item
  disappears from the picker, `heroPet` stats/XP update). **Await-then-
  refetch, no optimistic UI** — same convention as the existing
  `handleEquip`/`handleUnequip` in `Pets.tsx`.
- Errors map through a new `prettyCareError()` following the exact pattern
  of the existing `prettyEquipError()`: `not_your_pet`, `not_owned`,
  `already_used`, `wrong_effect_type`, `not_authenticated` → friendly copy.
- Expand the currently-sparse "How XP feeds your pet" placeholder into 2-3
  lines explaining account XP vs pet XP vs care-action XP (closes the
  report's open question 7).
- `Pet` type (`PetCard.tsx`) gains `hunger`, `hunger_updated_at`,
  `cleanliness`, `cleanliness_updated_at` — no hook change needed,
  `useMyPets.ts` already does `.select('*')`.

## Error handling

- `use_care_item` runs as a single `SECURITY DEFINER` transaction — the
  purchase-consume, stat update, and XP write either all land or none do.
- The `already_used` check on `shop_purchases.used_at` prevents double-spend
  from a double-click or two tabs open at once (no separate lock needed —
  the `UPDATE ... WHERE used_at IS NULL`-style guard is implicit in the
  `NOT FOUND`/`used_at IS NOT NULL` checks above, since the row is only
  looked up once inside the function's own transaction).
- `wrong_effect_type` protects against a stale/mismatched client picker
  state (e.g. item's metadata changed between page load and the click).

## RLS

To confirm during implementation (via `get_advisors(security)` after the
migration, same verification step the per-pet-XP design used):

- `pets.hunger`/`cleanliness` and friends inherit the existing lockdown on
  `pets` (RLS enabled, `SELECT`-only for owners, no client `UPDATE`) — no
  new policy needed, since all writes go through this `SECURITY DEFINER`
  RPC.
- `shop_purchases.used_at`/`used_on_pet_id` should **not** be
  client-writable — purchases are currently created server-side by the
  `shop-purchase` Edge Function, not via direct client `INSERT`, so this is
  expected to already be locked down the same way; confirm no stray
  `authenticated` `UPDATE` policy exists on `shop_purchases` before
  shipping (if one does, it's a pre-existing issue to flag, not something
  this migration should silently paper over).

## Testing / verification plan

1. Apply the migration via `apply_migration`, then `get_advisors(security)`
   — confirm no new warnings.
2. Live RPC verification via `execute_sql` wrapped in `BEGIN/ROLLBACK`
   before wiring the frontend (same approach used for the per-pet-XP
   trigger in Session 7): feed a real test pet with a real owned item,
   confirm `hunger` rises by the right tier, `xp` rises by 2, purchase row
   marked used; attempt to reuse the same purchase, confirm `already_used`.
3. Daily-duo check: Feed then Clean same pet same day, confirm `xp` rose by
   `2 + 2 + 5` and `duo_bonus: true` only on the second call; Feed again
   same day, confirm no second bonus.
4. Drift check: manually backdate a test pet's `hunger_updated_at` by 5+
   days, confirm `drifted_stat` returns ~50 regardless of stored `hunger`.
5. New `frontend/tests/pets-care-actions.spec.ts` (Playwright, mocked
   routes following `pets-xpfeed.spec.ts`'s pattern): successful feed,
   successful clean, empty-inventory state, daily-duo toast appears once.
6. Standard pre-done checklist: `npx tsc --noEmit`, `npx eslint`,
   `npm run build`, full Playwright suite green.

## Explicitly out of scope

- Mood layer/badge of any kind (Decision 3).
- Happiness/Focus stats, Toys, Boosters, Relics, Play action — all Wave
  2/3 per the report's own build order.
- Elaborate animations/mood sparkles — report itself warns against
  investing here before the core loop is proven.
- Cross-pet care (acting on a non-hero pet) — Decision 1.
- Re-classifying the 5 deferred `pet_care` items' shop *display* category —
  they stay visually in "Pet Care" for now; only their `metadata` gains the
  `play`/`boost` tags that make them inert until later waves.
