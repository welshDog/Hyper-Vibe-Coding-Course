# /pets Cosmetic Layers Visual Polish — Design

## Context

Issue #51 (opened alongside PR #50/#52's frame-cover investigation) tracks
rolling the proven `overlay_image_url` compositing pattern out to the rest
of `/pets` cosmetics. PR #52 proved the pattern end to end on one item
(Basic Neon Frame) by generating brand-new procedural art, since the
existing frame catalogue art had a promo-card wrapper (baked border +
"BEGINNER TIER"/"PET CARD" text) that made it fundamentally uncompositable.

This spec is the next slice of that rollout — one proof-case item per
remaining slot (Background, Aura, Badge) — but the diagnosis differs from
Frame's. Before assuming every slot needs from-scratch art like Frame did,
the actual current assets were inspected directly:

- **Dark Lab** (background): not a rendering bug — `PetPortrait.tsx`
  already renders backgrounds `absolute inset-0 object-cover`. The image
  itself has a rounded-square vignette border baked in, so even full-bleed
  rendering shows "a card within a card." The real in-scene lab content
  (server racks, HUD screens, floor panel) is good art sitting past that
  border.
- **Flame Aura**: already blend-mode-compatible (near-black background,
  `mix-blend-screen` mostly works today) — this is *not* the ghosted-text
  failure mode Frame had. The flame ring itself is good art; it just has a
  lot of dead starfield margin around it at 1024×1024, so at the current
  portrait scale (`1.25`) it doesn't read as clearing Luna's silhouette.
- **BROski Holo Badge**: same dead-margin problem as Aura — the medallion
  is small relative to its own canvas. Its baked "PREMIUM COLLECTIBLE /
  EST. 2024" caption is not a Frame-style problem: it sits inside the
  badge's own small corner-chip footprint and never overlaps Luna's face.

**Decision: crop/re-export the existing art for all three slots, rather
than generating new art.** Cheaper than a second procedural-art pass, and
preserves the existing painted-art style/quality instead of introducing a
visibly different (flatter, procedural) look next to it — which is what
would happen if Aura/Badge/Background were regenerated the way Frame's
border was.

## Data model

No schema change. Reuses `overlay_image_url` (added in #52) for all three
slots, keyed off the existing `shop_items.metadata.pet_slot` value
(`background | aura | frame | badge`) — `PetPortrait.tsx` already branches
render logic per slot, so a separate "render mode" metadata field would
just duplicate information `pet_slot` already carries. No new
`background_image_url` column.

## Scope

One proof-case item per slot, same low-risk pattern as the Frame fix:

| Slot | Item | Source operation | Render change in `PetPortrait.tsx` |
|---|---|---|---|
| Background | Dark Lab | Crop past the baked vignette into the real lab-scene content, re-export at 1024×1024 | None — `absolute inset-0 object-cover` is already correct |
| Aura | Flame Aura | Tight crop to the flame ring, trimming dead starfield margin | Scale `1.25` → `1.5` |
| Badge | BROski Holo Badge | Tight crop to the medallion, trimming dead starfield margin | Size `h-10 w-10` (hero) → `h-16 w-16`, proportional bump on `lg`/`sm` tiers; position unchanged (bottom-right corner chip) |
| Frame | Basic Neon Frame | None | None — regression check only |

Every other item in each slot stays on the existing opaque-fallback path
(same look as today, no regression) until it gets its own `overlay_image_url`
— that full rollout stays in issue #51, not this pass.

## Asset processing

All three derived images are produced by cropping the **existing** PNG
files in `frontend/public/images/shop/pet-*/`, not generated from scratch:

- Identify the crop rectangle by inspecting the source image directly
  (same manual-inspection step used to diagnose this spec — no assumed
  coordinates).
- Crop past the vignette/dead-margin, re-export as a new file alongside
  the original (e.g. `shop_bg_lab_dark_overlay.png`,
  `shop_aura_flame_overlay.png`, `shop_badge_broski_holo_overlay.png`) —
  the original opaque file stays untouched as `image_url`/
  `preview_image_url` for the shop and picker.
- Background's crop only needs to remove the border vignette — the
  in-scene content is already meant to fill frame, no transparency
  required (it's a full painted scene, not an overlay).
- Aura and Badge crops preserve whatever transparency/near-black
  background the source already has — no new alpha work needed since
  neither had Frame's "opaque promo card" problem.

## Rendering changes in `PetPortrait.tsx`

Layering order is unchanged (`background → pet → aura → frame(legendary
ring) → frame → badge`, matching the existing DOM order — no `z-index`
needed, stacking already follows document order):

- **Background**: no code change.
- **Aura**: `scale-[1.25]` → `scale-[1.5]` on the aura `<img>`.
- **Frame**: no code change (already ships the overlay-vs-fallback split
  from #52).
- **Badge**: `SIZE.hero.badge` grows from `h-10 w-10` to `h-16 w-16`
  (position offsets `-bottom-3 -right-3` stay as-is); `lg`/`sm` tiers get
  a proportional bump from their current `h-7 w-7` / `h-5 w-5`.

All three items resolve their overlay art the same way Frame already
does: prefer `overlay_image_url`, fall back to `image_url` unchanged for
every other item in that slot.

## Testing

Existing Playwright specs (`pets-care-actions.spec.ts`, `pets-xpfeed.spec.ts`)
use mocked routes and don't render real cosmetic art, so they're a
regression check only — not new coverage for this pass. The real
acceptance gate is a live authenticated visual check, same pattern as the
Frame fix:

**Required before merge — equip all four proof-case items on Luna (or the
live account's real pet) simultaneously and confirm, live:**

1. Dark Lab reads as a full scene behind Luna, not a card inside a card.
2. Flame Aura visibly wraps around/past Luna's silhouette without hiding her.
3. BROski Holo Badge is clearly readable/rewarding at a glance and stays
   in the lower-right corner, not covering Luna's face.
4. Basic Neon Frame still remains clean, border-only, text-free (regression
   check — no code touches it this pass).
5. Refresh the page — all four stay equipped and render correctly.
6. Unequip one slot, then re-equip it — correct art returns, `4 / 4 slots`
   count is accurate throughout.

## Out of scope

- Regenerating or cropping any item beyond the four proof cases above —
  full catalogue rollout (4 more frames, 4 more auras, 4 more badges, 4
  more backgrounds) stays tracked in issue #51.
- Any change to the shop/picker display (`preview_image_url` path,
  `PetCosmeticsPanel.tsx`) — this pass only touches portrait compositing.
- Pass 2 of the earlier UI polish (streak-copy unification, customisation
  empty-slot copy, mint-flow species grouping) — unrelated, still
  separately queued.
