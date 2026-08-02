# /pets Pet Care Polish — Pass 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Pet Care section (Feed/Clean/Play) real visual
separation, upgrade the item picker from plain text to art-bearing rows,
give the mood badge real presence, and fix a stale copy line in the XP
explainer — pure frontend polish, no backend/schema/RPC involvement.

**Architecture:** One component (`PetCareSection.tsx`) gets its per-action
columns wrapped in `HVZCard`, its item-picker `<li>` rows upgraded to
show `CareItem.imageUrl` (fetched since Wave 1, never rendered until
now), and its mood badge swapped from a plain `<span>` to `HVZTag`. One
line of copy changes in `Pets.tsx`. No new components, no shared-component
changes.

**Tech Stack:** React/TypeScript, Tailwind, the existing `HVZCard`/
`HVZProgress`/`HVZTag` primitives, Playwright for verification.

**Spec:** `docs/superpowers/specs/2026-08-02-pets-care-polish-pass1-design.md`
— read this first for the *why* and the verified `TagColor` palette
mapping. This plan implements that spec.

## Global Constraints

- No new components, no new `HVZCard`/`HVZProgress`/`HVZTag` variants,
  colors, or props — everything in this pass uses what already exists.
- No `framer-motion`, no orange, `/pets` uses its own `pet-*` token
  system — same constraints as every prior wave on this page.
- Hover motion follows the house convention: `translateY`, never `scale`
  (matches `HVZCard`'s own hover-lift behavior and Emil's micro-interaction
  rule already in use elsewhere on this page).
- Item picker rows must stay visually **quieter** than the action
  mini-cards — a light bordered row, not another `chunky` `HVZCard`.
  Hierarchy is section card → chunky action mini-card → quiet item row;
  do not collapse this into uniform nesting.
- Mood color mapping is fixed by the spec's verified palette — do not
  substitute colors without re-checking `index.css`'s pets-reskin
  remapping first (`violet` renders green in this scope, not violet).
- **Item rows must stay visually aligned when an item name wraps to two
  lines** — the `+effectValue` column should still read as a clean,
  consistent right-hand column scanning down the list, not jump around
  per-row based on name length. Use `items-start` (not `items-center`)
  on the row's flex container so the icon and value badge anchor to the
  top of the row regardless of how many lines the name takes — verify
  this explicitly with a real long item name during manual testing (Wave
  1 seeded some genuinely long names, e.g. "Legendary Vibe Treat",
  "Cosmic Swirl Aura" — though not all are Wave-1-actionable, pick
  whichever long name IS actionable for this check, e.g. "HyperFuel" is
  short — if no naturally-long actionable name exists, temporarily widen
  the browser viewport narrow enough to force a wrap on any name during
  the manual check, then restore).
- Before claiming done: `npx tsc --noEmit`, `npx eslint`, `npm run build`
  must all be clean, plus the existing `pets-care-actions.spec.ts` suite
  passing unchanged (no new test scenarios required by the spec — this
  is a presentation-only change over already-tested behavior).
- `main` is protected — work lands via `git checkout -b`, push,
  `gh pr create`, `gh pr merge --merge --delete-branch`.

---

## Task 1: Pet Care mini-cards, item picker art, mood badge, XP copy fix

**Files:**
- Modify: `frontend/src/components/pets/PetCareSection.tsx`
- Modify: `frontend/src/pages/Pets.tsx`

**Interfaces:** None — this task doesn't produce anything a later task
consumes; it's the only task in this plan.

- [ ] **Step 1: Read the current files fresh**

Read `frontend/src/components/pets/PetCareSection.tsx` and
`frontend/src/pages/Pets.tsx` lines 555-572 (the "How XP feeds your pet"
4th list item) in full before editing. Confirm they match what the spec
quotes — nothing has touched these files since Wave 2 merged, but verify
rather than assume.

- [ ] **Step 2: Run the existing Playwright spec, confirm baseline green**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: all tests currently passing (this is your baseline — if
anything is already red, STOP and report rather than build on top of a
broken baseline).

- [ ] **Step 3: Wrap each action in `HVZCard variant="chunky"`**

In `PetCareSection.tsx`:

1. Add a gradient lookup near the other action-keyed consts (`ACTION_LABEL`,
   `ACTION_EMOJI`, etc.):
   ```typescript
   const GRADIENT: Record<Action, 'xp' | 'gold' | 'mint'> = { feed: 'gold', care: 'mint', play: 'xp' }
   ```
2. Change the per-action `<div key={action} className="flex flex-col gap-2">`
   wrapper to render an `HVZCard` around that same content:
   ```tsx
   {(['feed', 'care', 'play'] as const).map((action) => (
     <HVZCard key={action} variant="chunky" padding={16}>
       <div className="flex flex-col gap-2">
         {/* existing button row, HVZProgress, and conditional item-picker block go here, unchanged in content */}
       </div>
     </HVZCard>
   ))}
   ```
   The `key` moves from the inner `div` to the outer `HVZCard`. Everything
   currently inside that `div` (the button row, the `HVZProgress`, and the
   `{openAction === action && (...)}` conditional block) stays exactly as
   it is, just now living one level deeper inside the card.
3. On the `HVZProgress` call inside that block, change
   `gradient="xp"` to `gradient={GRADIENT[action]}`.
4. The outer grid (`className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"`)
   is unchanged — only its children's wrapper type changes.

- [ ] **Step 4: Upgrade item picker rows to show art**

Still in `PetCareSection.tsx`, replace the current item-list rendering:

```tsx
<ul className="flex flex-col gap-1.5">
  {items[action].map((item) => (
    <li key={item.purchaseId}>
      <button
        type="button"
        disabled={busy}
        onClick={() => { void handleUse(action, item) }}
        className="w-full text-left text-xs font-medium text-pet-ink hover:text-pet-wood-dark disabled:opacity-50"
      >
        {item.name} <span className="text-pet-ink-soft">(+{item.effectValue})</span>
      </button>
    </li>
  ))}
</ul>
```

with:

```tsx
<ul className="flex flex-col gap-1.5">
  {items[action].map((item) => (
    <li key={item.purchaseId}>
      <button
        type="button"
        disabled={busy}
        onClick={() => { void handleUse(action, item) }}
        className="flex w-full items-start gap-2 rounded-hfz-sm border-2 border-pet-ink/15 bg-pet-lilac/10 px-2 py-1.5 text-left text-xs font-medium text-pet-ink transition-transform duration-150 hover:-translate-y-0.5 hover:border-pet-ink/25 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-hfz-sm object-cover" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-hfz-sm bg-pet-lilac/30 text-sm" aria-hidden>
            {ACTION_EMOJI[action]}
          </span>
        )}
        <span className="flex-1">{item.name}</span>
        <span className="shrink-0 text-pet-ink-soft">+{item.effectValue}</span>
      </button>
    </li>
  ))}
</ul>
```

Note `items-start` (not `items-center`) on the button's flex row, and
`shrink-0` on the trailing value span — both are the fix for the
name-wrapping alignment concern flagged in the Global Constraints above.
`alt=""` on the image is intentional (decorative — the item name is
already visible as adjacent text, an alt description would be redundant
for screen readers).

- [ ] **Step 5: Mood badge → `HVZTag`**

Still in `PetCareSection.tsx`:

1. Add the import: change
   `import { HVZCard, HVZButton, HVZProgress } from '../ui/hvz'`
   to
   `import { HVZCard, HVZButton, HVZProgress, HVZTag, type TagColor } from '../ui/hvz'`
2. Add the color map near `MOOD_EMOJI`/`MOOD_LABEL`:
   ```typescript
   const MOOD_COLOR: Record<CareMood, TagColor> = {
     sleepy: 'cyan', grubby: 'amber', content: 'violet', zen: 'mint', hype: 'gold', playful: 'pink',
   }
   ```
3. Replace the header's plain `<span>` mood badge:
   ```tsx
   <span className="inline-flex items-center gap-1 rounded-hfz-sm border-2 border-pet-ink/15 bg-pet-lilac/20 px-2 py-1 text-xs font-semibold text-pet-ink">
     <span aria-hidden>{MOOD_EMOJI[mood]}</span> {MOOD_LABEL[mood]}
   </span>
   ```
   with:
   ```tsx
   <HVZTag variant="chunky" color={MOOD_COLOR[mood]}>
     <span aria-hidden>{MOOD_EMOJI[mood]}</span> {MOOD_LABEL[mood]}
   </HVZTag>
   ```

- [ ] **Step 6: XP explainer copy fix**

In `frontend/src/pages/Pets.tsx`, find the 4th "How XP feeds your pet"
list item (heading "4. Care keeps it going", around line 565). Change its
body paragraph text from:

```
Feed and Clean give small XP nudges too — a bonus for
showing up daily, on top of course progress.
```

to:

```
Feed, Clean, and Play give small XP nudges too — a bonus for
showing up daily, on top of course progress.
```

No other change to that list item (heading, emoji, surrounding structure
all stay as-is).

- [ ] **Step 7: Re-run the Playwright spec, confirm still green**

Run: `npx playwright test tests/pets-care-actions.spec.ts`
Expected: all tests still passing. The spec queries by role/text
(`getByRole('button', {name: /^feed$/i})`, `getByText('API Apple')`, etc.)
which the `HVZCard`/row-styling changes shouldn't affect — but confirm
rather than assume, since the item row's accessible structure did change
slightly (added a decorative image/icon before the text).

If anything broke, diagnose before proceeding — a likely cause would be
the item name text now being one of several text nodes inside the button
rather than the sole content, which `getByText` should still handle, but
verify.

- [ ] **Step 8: Manual visual verification**

This is the step the original punch-list audit skipped, and exactly why
this spec exists — don't skip it here either.

1. Run the local dev server (`npm run dev` from `frontend/`) and open
   `/pets` for a logged-in account with at least one pet and a mix of
   owned Feed/Clean/Play items (or use `hypervibe.online/pets` directly
   if a local seeded account isn't available).
2. Confirm the three action cards read as visually distinct units, not a
   shared cluster.
3. Open each action's item picker and confirm images render (or the
   emoji fallback shows cleanly for items without `imageUrl`).
4. **Specifically check the name-wrap alignment case**: find or force an
   item with a long enough name to wrap to two lines (narrow the browser
   viewport if no naturally-long actionable item name is available) and
   confirm the `+effectValue` badge and icon stay anchored to the top of
   the row, and the value column still reads as a clean scan down the
   list rather than jumping vertically per row.
5. Confirm the mood badge now shows a colored chunky pill matching the
   spec's mapping, and that it's legible (not `violet`/green blending
   into the `pet-lilac` header/page background — if it does look too
   close in practice, that's a real finding to bring back before calling
   this done, not something to silently work around).
6. Confirm the XP explainer's 4th panel now reads "Feed, Clean, and Play".

- [ ] **Step 9: Full verification pass**

Run in order: `npx tsc --noEmit`, `npx eslint .`, `npm run build`,
`npx playwright test` (full suite — expect the same pre-existing,
already-documented `shop.spec.ts:542` flake and no other new failures).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/pets/PetCareSection.tsx frontend/src/pages/Pets.tsx
git commit -m "feat(pets): polish Pet Care section - mini-cards, item art, mood badge, XP copy"
```

---

## Self-Review Notes

**Spec coverage:** all 4 spec items map directly to plan steps — mini-cards
(Step 3), item picker art (Step 4), mood badge (Step 5), XP copy (Step 6).
The spec's hierarchy constraint (section → chunky action card → quiet item
row) is preserved by construction — item rows use a plain bordered
`border-pet-ink/15` treatment, never `HVZCard`.

**Type/name consistency confirmed:** `GRADIENT`, `MOOD_COLOR`, and the
existing `ACTION_EMOJI`/`ACTION_LABEL`/`MOOD_EMOJI`/`MOOD_LABEL` all key
off the same `Action`/`CareMood` types already defined in this file — no
new type introduced, no drift risk between them.

**Carried forward from spec review (Lyndz's QA note):** the item-row
name-wrap alignment concern is now explicit in both the Global Constraints
and Step 8's manual verification checklist, with a concrete code answer
(`items-start` + `shrink-0`) rather than left as an open question for the
implementer to solve from scratch.

**Scope check:** single task, single component plus one copy line — no
further decomposition needed. Smaller than either prior wave (pure
frontend, no backend split).

## Execution Handoff

Plan complete and saved to
`docs/superpowers/plans/2026-08-02-pets-care-polish-pass1.md`. Two
execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent for this
task, review after, fast iteration.

**2. Inline Execution** — execute the task in this session using
executing-plans, with a checkpoint for review.

Which approach?
