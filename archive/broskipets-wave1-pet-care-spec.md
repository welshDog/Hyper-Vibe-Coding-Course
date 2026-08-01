# BROskiPets Wave 1 Pet Care Spec

This document defines the Wave 1 pet care system for `/pets`, covering schema changes, item behavior, UI flow, error handling, testing, and explicit non-goals. The design is intentionally narrow, matching the current greenfield state of the care system and the phased rollout approach already used elsewhere in the product.[cite:64][cite:55][cite:65]

## Scope

Wave 1 covers only feed and clean actions for the spotlighted hero pet on `/pets`.[cite:28] It includes Hunger and Cleanliness as the only new pet-care stats, a daily care duo bonus, inventory consumption for eligible shop purchases, and a new full-width Pet Care section between the hero row and Evolution Path.[cite:64]

Wave 1 does not include a new mood layer, Happiness or Focus stats, Play, Toys, Boosters, Relics, cross-pet care, or elaborate animation systems.[cite:64][cite:55]

## Core decisions

### Targeting

Care actions apply only to the currently spotlighted hero pet.[cite:28] This matches the current `/pets` interaction model, keeps the action flow simple, and avoids introducing a pet-picker UI in the first wave.[cite:55]

### Stats

Wave 1 ships only two care stats:

- Hunger
- Cleanliness

No Happiness or Focus fields are added in Wave 1 because the in-scope item categories only move Hunger and Cleanliness, and inert future-facing stats would add complexity without useful behavior yet.[cite:64][cite:55]

### Mood

Wave 1 adds no new care-mood concept.[cite:64] The existing `pets.mood` system remains untouched and continues serving the already-wired app logic; care actions use stat changes and toasts rather than introducing a second mood-like layer.[cite:64]

### Daily loop

Wave 1 includes a daily care duo bonus: doing both Feed and Clean on the same day awards a one-time bonus in addition to the base XP on each action.[cite:64] This gives the first wave a complete daily loop without waiting for Play to exist in a later wave.[cite:65]

### Stat drift

Hunger and Cleanliness drift gently toward a neutral midpoint instead of staying pegged forever at 100.[cite:64] This preserves meaningful visual feedback over time while avoiding punitive decay, because stats do not collapse toward failure states and care never removes XP or stage progress.[cite:64]

## Data model

### `pets` additions

Add the following columns to `pets`:

- `hunger integer NOT NULL DEFAULT 50 CHECK (hunger BETWEEN 0 AND 100)`
- `hunger_updated_at timestamptz`
- `cleanliness integer NOT NULL DEFAULT 50 CHECK (cleanliness BETWEEN 0 AND 100)`
- `cleanliness_updated_at timestamptz`
- `last_feed_at timestamptz NULL`
- `last_clean_at timestamptz NULL`
- `last_duo_bonus_date date NULL`

The default value is 50, not 0, so a newly minted or untouched pet reads as neutral rather than neglected.[cite:64]

### `shop_purchases` additions

Add:

- `used_at timestamptz NULL`
- `used_on_pet_id uuid NULL REFERENCES pets(id)`

`used_at IS NULL` means the purchased consumable is still unused inventory, with one purchase row corresponding to one future use.[cite:64]

### `shop_items.metadata` additions

Continue using the existing JSONB metadata field and patch in behavior keys rather than altering the catalog schema:

- `effect_type`: `feed` or `care`
- `target_stat`: `hunger` or `cleanliness`
- `effect_value`: integer stat boost

This keeps mechanical behavior separate from display category, which matters because the seeded shop taxonomy mixes item presentation and gameplay meaning.[cite:64]

## Drift model

The backend is the canonical source of truth for drifted stat values.[cite:64] The frontend mirrors the same formula only for live display between actions and never as a write source.[cite:64]

Wave 1 uses a five-day return-to-neutral curve:

`effective = raw + (50 - raw) * min(1, daysSince(updated_at) / 5)`

This means a stat gradually settles back toward 50 over time, never below that midpoint unless an explicit future mechanic changes the model.[cite:64]

## Care RPC

### `use_care_item(purchase_id, pet_id)`

Wave 1 adds a new RPC for targeted care actions.[cite:64] It must:

- Verify the caller is authenticated.[cite:64]
- Verify the purchase belongs to the caller.[cite:64]
- Verify the pet belongs to the caller.[cite:64]
- Verify `used_at IS NULL`.[cite:64]
- Verify the item metadata is Wave-1 compatible and effect-matching for the chosen action.[cite:64]
- Compute the current drifted stat value on the server.[cite:64]
- Apply the stat boost and clamp within 0 to 100.[cite:64]
- Stamp `used_at` and `used_on_pet_id`.[cite:64]
- Award `+2 pet XP` directly to `pets.xp` for the targeted pet.[cite:64][cite:31]
- Check whether both Feed and Clean have happened today and award the daily duo bonus once only, guarded by `last_duo_bonus_date`.[cite:64]

This RPC writes directly to `pets.xp` instead of going through the account-wide fan-out trigger, because feeding one pet is intentionally a targeted action rather than a global account progression event.[cite:68][cite:31]

## Item-effect matrix

Wave 1 uses a simple price-tier mapping instead of per-item hand tuning:[cite:64]

- `<25 tokens` → `+8`
- `25–40 tokens` → `+14`
- `45+ tokens` → `+22`

### Actionable items in Wave 1

| Item | Price | effect_type | target_stat | effect_value |
|---|---:|---|---|---:|
| API Apple | 18 | feed | hunger | 8 |
| Hyper Donut | 20 | feed | hunger | 8 |
| Markdown Muffin | 18–20 | feed | hunger | 8 |
| BROski Burger | 25–40 | feed | hunger | 14 |
| Hyper Energy Drink | 25–40 | feed | hunger | 14 |
| Pixel Sushi | 25–40 | feed | hunger | 14 |
| Cache Shampoo | 18–22 | care | cleanliness | 8 |
| Lint Brush | 18–22 | care | cleanliness | 8 |
| Log Floss | 18–22 | care | cleanliness | 8 |
| Classic Kibble | 20 | feed | hunger | 8 |
| Power Snack | 25–35 | feed | hunger | 14 |
| Choc Drop Treat | 25–35 | feed | hunger | 14 |
| HyperFuel | 45 | feed | hunger | 22 |

This produces 13 Wave-1 actionable items while keeping the rules consistent and easy to reason about.[cite:64]

### Deferred items

The following seeded items remain purchasable but are not surfaced in the Wave-1 Feed/Clean picker:

- `Holo Puzzle`, `Quantum Toy`, `Debug Duck` → future `play` / `happiness` items for Wave 2.[cite:64]
- `Rainbow Treat` → future happiness-oriented item, not Wave-1 hunger care.[cite:64]
- `Legendary Vibe Treat` → better treated as a future temporary boost item than a meal.[cite:64]

This preserves the live catalog while keeping Wave 1 mechanically honest.[cite:64]

## UI flow

### Placement

Add a new full-width **Pet Care** section between the hero row and Evolution Path.[cite:28] This follows the same layout lesson learned when cramped sidebar placement proved wrong for a content-heavy Evolution Timeline; the care picker also needs real horizontal room.[cite:28]

### Primary controls

The section contains:

- `🍔 Feed`
- `🧼 Clean`
- Live Hunger and Cleanliness bars using the client-side drift mirror for display only.[cite:64]

### Picker behavior

When a player clicks Feed or Clean, expand a grid of owned, unused, effect-matching items using `shop_purchases` joined with `shop_items`, filtered by:

- current user ownership
- `used_at IS NULL`
- `effect_type` matching the chosen action

If the player owns no valid items, show an empty state such as:

> You don't have any snacks yet — grab some in the shop 🛍️

The empty state should link to `/shop`.[cite:28]

### Action resolution

1. Player clicks Feed or Clean.[cite:28]
2. Matching item grid expands.[cite:28]
3. Player selects one item.[cite:28]
4. Frontend calls `use_care_item(purchase_id, pet_id)`.[cite:64]
5. On success, animate the stat bar and show a toast such as `Luna loved that snack! 🍎 +8 Hunger · +2 XP`.[cite:64]
6. If the daily duo bonus fires, show a second bonus toast.[cite:64]
7. Refetch pet and inventory data after the awaited RPC, following the existing await-then-refetch pattern used by current equip flows.[cite:28]

Wave 1 uses no optimistic UI for care actions; server confirmation is required before the picker closes and the item disappears.[cite:64]

## Error handling

Use the same mapped-error pattern already used elsewhere on `/pets`, with friendly frontend copy derived from backend error codes.[cite:28] Wave-1 error cases include:

- `not_authenticated`
- `not_your_pet`
- `not_owned`
- `wrong_effect_type`
- `already_used` or equivalent inventory-exhausted error

This keeps the UX consistent with existing item-management flows rather than introducing a brand-new error style for care actions.[cite:28]

## Copy update

Expand the current placeholder help copy into a short explainer that distinguishes:

- account XP
- per-pet XP
- care-action XP

This closes the current comprehension gap and supports the broader per-pet progression model already established on the page.[cite:29][cite:31]

## Testing

### Database verification

Before frontend wiring, verify the migration and RPC live through Supabase tooling using `apply_migration` plus `execute_sql` wrapped in `BEGIN/ROLLBACK`, mirroring the verification approach already used for per-pet XP work.[cite:31]

### Playwright

Add a new mocked Playwright spec following the existing pets flow pattern:

- successful Feed action
- successful Clean action
- empty inventory state
- daily duo bonus fires once
- repeated same-day actions do not award the duo bonus twice

Use a dedicated file such as `pets-care-actions.spec.ts`.[cite:64]

## Non-goals

The following are explicitly out of scope for Wave 1:[cite:64][cite:55]

- New care mood badge or mood layer
- Happiness stat
- Focus stat
- Play action
- Toys
- Boosters
- Relics
- Cross-pet care targeting
- Elaborate animation systems
- Any redesign of the existing `pets.mood` column behavior

## Build order

Recommended implementation order:[cite:55][cite:65]

1. Migration for `pets` and `shop_purchases` columns.[cite:64]
2. Metadata patch for eligible `shop_items`.[cite:64]
3. `use_care_item(purchase_id, pet_id)` RPC with drift, validation, XP award, and duo-bonus logic.[cite:64]
4. Live DB verification in transaction-wrapped SQL tests.[cite:31]
5. `/pets` Pet Care section UI.[cite:28]
6. Playwright coverage for success, empty state, and duo-bonus edge cases.[cite:64]
7. Copy/help panel update clarifying account XP vs pet XP vs care XP.[cite:29]

## Handoff note

This Wave-1 design is intentionally narrow and implementation-ready. It establishes a complete first care loop without introducing the later-wave systems that depend on Happiness, Play, Boosters, or a second mood layer.[cite:64][cite:55]
