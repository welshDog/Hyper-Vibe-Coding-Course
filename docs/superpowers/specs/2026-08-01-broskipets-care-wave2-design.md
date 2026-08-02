# BROskiPets Care System — Wave 2 (Play + Happiness + Mood) — Design

## Context

Wave 1 (`docs/superpowers/specs/2026-08-01-broskipets-care-wave1-design.md`,
shipped same day, PR #45) delivered Feed + Clean actions against two stats
(Hunger, Cleanliness), deliberately deferring Happiness/Focus and the mood
layer until Play's item source (the 4 items already tagged
`effect_type: 'play', target_stat: 'happiness'` but left unpriced) could
actually move a real stat. That blocker is resolved — this design adds the
third action (Play), the third stat (Happiness), and a pure-derived mood
layer, closing the loop the original brainstorm report envisioned for its
own Wave 2, extended to include mood since Happiness now exists to feed it.

**Scope, confirmed with Lyndz:** Happiness + Play + mood only. Two things
explicitly excluded from this wave despite being adjacent ideas raised in
conversation:
- **Focus + Pet Boosters** — Focus's natural item source is Boosters
  (timed *activated* buffs: `duration_minutes`, an active-effects row,
  expiry tracking), a structurally heavier mechanic than a simple
  consume-once action. Shipping Focus now would mean either an inert stat
  with no way to move it, or building Boosters as a rushed side-effect of
  this wave — both rejected. Focus ships with Boosters in a later wave.
- **Streaks/soft goals** ("keep Luna playful 3 days running") — new scope
  beyond anything the original brainstorm report proposed for any wave, and
  it needs mood/happiness *history* to already be real before a goal system
  can be built on top of it. Own future brainstorm, not bundled here.

## Decisions made during design

1. **Happiness stat is a mechanical clone of Hunger/Cleanliness.** Same
   `integer NOT NULL DEFAULT 50 CHECK (BETWEEN 0 AND 100)` shape, same
   `drifted_stat()` 5-day return-to-neutral formula (reused verbatim, no
   new formula). No reason to invent a different pattern for the third stat
   when the first two are already proven in production.
2. **Play item pricing reuses Wave 1's exact tiering rule** (`<25 → +8`,
   `25–40 → +14`, `45+ → +22`) against the 4 items Wave 1 already tagged
   `play`/`happiness` but deliberately left `effect_value` unset for this
   reason. No new judgment calls: Debug Duck (30) → +14, Rainbow Treat (40)
   → +14, Holo Puzzle (50) → +22, Quantum Toy (60) → +22.
3. **Play XP is +3, not +2.** The original brainstorm report specified
   Feed +2 / Play +3 / Clean +2 — Wave 1 matched the report for Feed/Clean;
   this wave matches it for Play. A deliberately small differentiation, not
   a mechanic change.
4. **The daily bonus upgrades from duo to trio**, exactly as Wave 1's own
   plan document anticipated ("upgrade to the full trio bonus naturally
   once Wave 2 ships Play"). Feed + Clean + Play all in the same calendar
   day → **+10** (was +5 for Feed+Clean only). `last_duo_bonus_date` is
   renamed to `last_care_bonus_date` since its semantics changed — a stale
   name would mislead the next reader more than a rename costs.
5. **Mood is a pure derived function, not a stored column.** Computed from
   the three *drifted* stat values (via `drifted_stat()`, same as the
   display bars already use) plus `last_play_at` recency. This was the
   right call for three independent reasons: it can never drift out of
   sync with the stats it's based on (nothing to desync — it's recomputed
   from them every time), it needs zero migration/RLS surface of its own,
   and it structurally cannot collide with the existing `pets.mood` column
   (idle/learning/hyperfocus/evolving, driven by `evolve_pet()` and
   `PetMentorBubble`) because there is no new column to collide with.
6. **Mood is display-only — no gameplay effect.** Matches the original
   report's "personality without maintenance burden" principle. `use_
   care_item` does not read or write mood in any way; the RPC's only
   change this wave is the new `play`/`happiness` branch and the trio-bonus
   condition.
7. **Mood badge lives inside `PetCareSection`**, next to the three stat
   bars it's derived from — the causal link ("here's why Luna is Grubby")
   stays visible in the same place, with no risk of visual confusion with
   the existing hero-card `MoodBadge`.

## Mood mapping

Six values, adapted from the report's original flavor list — "Focused" is
dropped since it depends on Boosters (out of scope this wave). Evaluated in
priority order, first match wins — needs-based moods (Sleepy/Grubby) take
priority over positive ones, matching the report's intent that neglect
signals should surface before celebration ones:

| Priority | Condition | Mood |
|---|---|---|
| 1 | `hunger < 35` | 😴 Sleepy |
| 2 | `cleanliness < 35` | 🧼 Grubby |
| 3 | `hunger >= 65 AND cleanliness >= 65 AND happiness >= 65` | 😌 Zen |
| 4 | `happiness >= 80 AND` played within 24h | 🎉 Hype |
| 5 | `happiness >= 65` | 🙂 Playful |
| 6 | else | 😐 Content |

All thresholds apply to the **drifted** (displayed) stat values, not the
raw stored ones — consistent with what the player actually sees on the
bars.

## Item-Effect Matrix additions

Effect value tiered by price, identical rule to Wave 1: `<25 → +8`,
`25–40 → +14`, `45+ → +22`. These 4 items already carry
`effect_type: 'play', target_stat: 'happiness'` in `metadata` (set by
Wave 1's migration) — this wave patches in `effect_value` only.

| Item | Price | effect_value |
|---|---|---|
| Debug Duck | 30 | +14 |
| Rainbow Treat | 40 | +14 |
| Holo Puzzle | 50 | +22 |
| Quantum Toy | 60 | +22 |

No other items change tag. Legendary Vibe Treat stays `boost`-tagged,
untouched, still deferred to a future Boosters wave.

## Schema changes

```sql
-- pets: Happiness stat + play tracking
ALTER TABLE public.pets
  ADD COLUMN happiness            integer NOT NULL DEFAULT 50
    CHECK (happiness BETWEEN 0 AND 100),
  ADD COLUMN happiness_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_play_at         timestamptz NULL;

ALTER TABLE public.pets
  RENAME COLUMN last_duo_bonus_date TO last_care_bonus_date;
```

`drifted_stat()` (Wave 1) is reused as-is — no change needed, it already
takes `(raw, updated_at)` generically.

### `use_care_item` — extended, not replaced

Same function, same signature (`p_purchase_id uuid, p_pet_id uuid,
p_action text`), same error codes, same `SECURITY DEFINER` /
`authenticated`-only ACL (no new grant work — inherits the Wave 1 fix that
explicitly revoked `anon`/`PUBLIC`). Changes:

- `p_action` now accepts `'play'` alongside `'feed'`/`'care'`.
- The stat-branch `IF/ELSIF` gains a third arm for `target_stat = 'happiness'`,
  updating `happiness`/`happiness_updated_at`/`last_play_at` — mechanically
  identical to the existing hunger/cleanliness arms.
- The bonus condition becomes three-way: `last_feed_at::date = CURRENT_DATE
  AND last_clean_at::date = CURRENT_DATE AND last_play_at::date =
  CURRENT_DATE AND last_care_bonus_date IS DISTINCT FROM CURRENT_DATE` →
  award **+10** (was +5), stamp `last_care_bonus_date`.
- The check-then-act race guard on `shop_purchases.used_at` (the Wave 1
  fix: `UPDATE ... WHERE id = p_purchase_id AND used_at IS NULL` +
  row-count check) is unchanged and already covers Play purchases —
  nothing new to guard here, it's the same purchase-row mechanism.

## Mood derivation — TS only

A new pure function, living alongside `driftedStat()` in
`frontend/src/lib/evolution.ts` (same home, same "no DB write source"
status):

```typescript
export type CareMood = 'sleepy' | 'grubby' | 'zen' | 'hype' | 'playful' | 'content'

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

Callers pass the already-**drifted** values (`driftedStat(pet.hunger,
pet.hunger_updated_at)`, etc.) — never the raw stored numbers.

## UI Flow

`PetCareSection` (Wave 1) gains a third action:

- Action loop extends from `(['feed', 'care'] as const)` to
  `(['feed', 'care', 'play'] as const)`, with `play` → 🎮 label, Happiness
  bar, and the same picker/toast/refetch mechanics already built — no new
  interaction pattern, purely a third instance of the existing one.
- A new mood badge renders at the top of the section (or directly under
  the header), computed via `deriveCareMood()` from the three current
  drifted stat values + `pet.last_play_at`. Recomputes on every render, no
  extra fetch.
- Toast copy for Play follows Feed/Clean's exact pattern: "Luna loved that
  toy! 🧩 +14 Happiness · +3 XP", with the same second-line trio-bonus
  toast ("Daily care complete! +10 bonus XP 🎉") swapped in for the old
  duo-bonus copy.

## Testing / verification plan

1. Extend `scripts/Test-CareAction.ps1` (or add a sibling script) with a
   Play-action fixture (one of the 4 newly-priced items) and a trio-bonus
   check: Feed → Clean → Play same day, confirm the bonus fires once at
   +10 on the third action, not on the second.
2. Re-run the existing Feed/Clean regression checks (including the
   concurrency race-condition test) to confirm the `last_duo_bonus_date` →
   `last_care_bonus_date` rename and the three-way bonus condition didn't
   regress the two-action path — i.e. Feed + Clean alone (no Play same
   day) should NOT fire any bonus under the new three-way condition, a
   behavior change from Wave 1 worth an explicit test.
3. `get_advisors(security)` after migration — expect no new warnings
   beyond the same accepted `SECURITY DEFINER` class.
4. New/extended Playwright coverage for the Play button, the mood badge's
   6 states (or a representative subset — testing all 6 via mocked pet
   fixtures is cheap), and the trio-bonus toast.
5. Standard checklist: `tsc --noEmit`, `eslint`, `npm run build`, full
   Playwright suite.

## Explicitly out of scope

- Focus stat, Pet Boosters, any timed/activated buff mechanic.
- Streaks, soft goals, or any multi-day tracking beyond the existing
  single-day trio-bonus window.
- Any gameplay effect tied to mood (XP multipliers, unlocks, etc.) — mood
  is display-only.
- Changing the item picker from list to grid (parked from Wave 1's final
  review, still deferred).
- Sacred Relics, cross-pet care, elaborate animations — unchanged from
  Wave 1's exclusions, still out of scope.
