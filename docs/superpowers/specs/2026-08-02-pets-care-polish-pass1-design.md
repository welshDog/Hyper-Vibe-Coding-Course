# /pets Pet Care Polish — Pass 1 — Design

## Context

An external audit ("BROski", Lyndz's other AI) produced a ranked 10-item UI
polish punch list for `/pets` based on flattened, extracted page text. Two
of its "highest impact" claims (a garbled `ContentFeedHungerHunger…`
string, and a "duplicate Next: Learner / Ready to train" complaint) turned
out to be text-extraction artifacts — aria-labels and visible text
concatenated with no whitespace, and two genuinely-distinct adjacent
elements read as one — not real visual bugs, confirmed by driving the
actual live page (`hypervibe.online/pets`, logged in, real pet "Luna").

The remaining items held up under real visual inspection and were split
into two passes. **This spec is Pass 1**, scoped to the functional heart
of the page — the Pet Care section — since that's what defines whether
`/pets` feels like a real pet game or a dashboard:

1. Care actions (Feed/Clean/Play) become distinct mini-cards, not a
   shared cluster.
2. The item picker gets real card treatment (image + hierarchy), not a
   bare text list.
3. The mood badge gets more visual presence.
4. The XP explainer's copy is corrected — it still only says "Feed and
   Clean," despite Play shipping in Wave 2.

**Pass 2** (queued, not in this spec): unifying the two inconsistent
streak displays (top-nav "0-day streak" vs. the page's own "🔥 Start your
streak today"), reducing the customisation panel's 4x-repeated "Empty —
get one in the shop →" copy, and visually grouping locked vs. unlocked
species in the mint flow. These live in different parts of the page and
don't touch the core Pet Care loop.

## Decisions made during design

1. **Every element reuses an existing primitive — no new components, no
   shared-component changes.** `HVZCard`, `HVZProgress`, `HVZTag` already
   have everything this pass needs. Lower risk, and keeps `/pets`
   visually consistent with itself rather than creating a "polish
   island" that reads as designed by a different system.
2. **Mini-cards use `HVZCard variant="chunky"`**, the same Moy-style
   thick-ink-outline treatment already used throughout `/pets` (hero
   card, Evolution Path tiles). Each action's `HVZProgress` gets a
   distinct `gradient` from the 3 that already exist — no new gradient
   invented: Feed→`gold`, Clean→`mint`, Play→`xp` (violet-cyan).
3. **Item picker rows stay visually quieter than the action mini-cards**
   — a plain bordered row (existing `pet-ink/15` border weight already
   used elsewhere on this page for lighter containers), not another
   `chunky` card. Three levels of chunky-on-chunky-on-chunky nesting
   (section → action → item) would read as heavy, not premium. Hierarchy
   stays: section card → action mini-card → quiet item row.
4. **Mood badge swaps its plain `<span>` for `HVZTag variant="chunky"`**,
   the same pill primitive already used for rarity/stage tags elsewhere
   on this page.
5. **Mood color mapping verified against the *actual rendered* pastel
   palette, not the base HyperCode palette's color names.** The
   pets-reskin CSS scope (`index.css:165-171`) remaps `TagColor` names to
   different hues than their names suggest — critically, `color="violet"`
   renders as green (`#4CAE4E`), not violet. This was caught before
   locking the mapping in, not after. Because `chunky` variant always
   uses the same cream/ink shell regardless of color (only the *text*
   color changes — confirmed in `HVZTag.tsx`), no mood can visually
   overpower another the way a filled-background badge could; the
   revised mapping is deliberately grouped into 3 semantic pairs rather
   than 6 arbitrary distinct hues:
   - **Needs attention:** Sleepy→`cyan` (sky blue), Grubby→`amber` (muted
     gold-amber)
   - **Good standing:** Content→`violet` (renders green), Zen→`mint`
     (green) — sharing a green family is acceptable since only one mood
     ever shows at a time, never side-by-side, and it reads as a
     coherent "okay" vs. "thriving" pairing rather than a collision.
   - **Celebration:** Hype→`gold` (light gold), Playful→`pink` (soft
     pastel pink)
6. **XP explainer gets a one-line copy fix**, not a restructure — the
   4-step layout, icons, and other 3 steps are untouched.

## Design details

### 1. Care action mini-cards

`frontend/src/components/pets/PetCareSection.tsx` — currently each action
is a bare `<div className="flex flex-col gap-2">` inside the shared grid.
Wrap it in `HVZCard`:

```tsx
const GRADIENT: Record<Action, 'xp' | 'gold' | 'mint'> = { feed: 'gold', care: 'mint', play: 'xp' }

// inside the (['feed','care','play'] as const).map((action) => ...) loop:
<HVZCard key={action} variant="chunky" padding={16}>
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2">
      <HVZButton variant="primary" chunky onClick={...} disabled={busy}>
        <span aria-hidden>{ACTION_EMOJI[action]}</span> {ACTION_LABEL[action]}
      </HVZButton>
      <span className="text-[11px] text-pet-ink-soft">{statLabel[action]}</span>
    </div>
    <HVZProgress
      value={statValue[action]}
      max={100}
      gradient={GRADIENT[action]}
      ariaLabel={statLabel[action]}
      trackStyle={{ border: '2px solid #241C3D', background: '#FFF8EC' }}
    />
    {/* item picker, unchanged position */}
  </div>
</HVZCard>
```

The outer grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) stays —
only the per-action wrapper changes from a bare `div` to an `HVZCard`.

### 2. Item picker — quiet row cards with art

Currently: `<ul><li><button>{item.name} (+{item.effectValue})</button></li></ul>`
— plain text, `CareItem.imageUrl` fetched but never rendered (parked
explicitly in Wave 1's final review as "forward-compat fields... for that
future pass" — this is that pass).

New row treatment — a lightweight bordered row (not a chunky card), image
thumbnail + name + value, hover-lift per the existing house motion
convention (`translateY`, never `scale`, matching `HVZCard`'s own hover
behavior when `onClick` is set):

```tsx
<ul className="flex flex-col gap-1.5">
  {items[action].map((item) => (
    <li key={item.purchaseId}>
      <button
        type="button"
        disabled={busy}
        onClick={() => { void handleUse(action, item) }}
        className="flex w-full items-center gap-2 rounded-hfz-sm border-2 border-pet-ink/15 bg-pet-lilac/10 px-2 py-1.5 text-left text-xs font-medium text-pet-ink transition-transform duration-150 hover:-translate-y-0.5 hover:border-pet-ink/25 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-hfz-sm object-cover" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-hfz-sm bg-pet-lilac/30 text-sm" aria-hidden>
            {ACTION_EMOJI[action]}
          </span>
        )}
        <span className="flex-1">{item.name}</span>
        <span className="text-pet-ink-soft">+{item.effectValue}</span>
      </button>
    </li>
  ))}
</ul>
```

Items with no `imageUrl` (several Wave-1 food/hygiene items were seeded
without one) fall back to the action's own emoji in a tinted square —
never a broken image icon.

### 3. Mood badge

```tsx
const MOOD_COLOR: Record<CareMood, TagColor> = {
  sleepy: 'cyan', grubby: 'amber', content: 'violet', zen: 'mint', hype: 'gold', playful: 'pink',
}

// replaces the plain <span> in the header:
<HVZTag variant="chunky" color={MOOD_COLOR[mood]}>
  <span aria-hidden>{MOOD_EMOJI[mood]}</span> {MOOD_LABEL[mood]}
</HVZTag>
```

Import `HVZTag` and `type TagColor` from `../ui/hvz` alongside the
existing `HVZCard`/`HVZButton`/`HVZProgress` import.

### 4. XP explainer copy fix

`frontend/src/pages/Pets.tsx:565-570`, the 4th list item's body copy:

```diff
- Feed and Clean give small XP nudges too — a bonus for
- showing up daily, on top of course progress.
+ Feed, Clean, and Play give small XP nudges too — a bonus for
+ showing up daily, on top of course progress.
```

No other changes to that list item (heading text "4. Care keeps it
going", emoji, structure all stay).

## Testing / verification plan

- No backend/RPC involvement — this is a pure frontend styling +
  one-line-copy change. No new migration, no `Test-CareAction.ps1`
  changes needed.
- Extend `frontend/tests/pets-care-actions.spec.ts`'s existing assertions
  minimally if any selector changes (e.g. if wrapping in `HVZCard`
  changes DOM structure Playwright's `getByRole`/`getByText` queries
  depend on) — the existing 21 tests should mostly pass unchanged since
  they query by role/text, not DOM structure.
- Manual visual check on `hypervibe.online/pets` (or local dev) before
  calling this done — this spec exists specifically because the prior
  audit skipped that step.
- Standard checklist: `tsc --noEmit`, `eslint`, `build`, full Playwright
  suite.

## Explicitly out of scope

- Everything in "Pass 2" (streak copy unification, customisation
  empty-slot copy, mint-flow locked/unlocked species grouping) —
  deferred to its own future spec.
- The optional "celebratory pulse on mood change" enhancement raised
  during design discussion — needs new state-tracking to detect mood
  transitions; explicitly parked, not smuggled into this pass.
- No new `HVZCard`/`HVZProgress`/`HVZTag` variants, colors, or props —
  everything in this pass uses what already exists.
- No backend, schema, or RPC changes of any kind.
