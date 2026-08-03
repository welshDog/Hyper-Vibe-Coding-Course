# /pets Cosmetic Layers Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Dark Lab (background), Flame Aura, and BROski Holo Badge visibly deliver their promise on a pet portrait — full-bleed scene, visible surrounding glow, and a readable corner badge — by deriving real transparent/full-bleed art from the existing catalogue images and wiring it through `overlay_image_url`, the same pattern Basic Neon Frame already proved (#52).

**Architecture:** No schema change. `overlay_image_url` (added in #52) gets populated for three more `shop_items` rows via a guarded migration. `PetPortrait.tsx` gains the same overlay-then-fallback resolution for `background` that `frame` already has, plus a scale bump for `aura` and fixed larger sizes for `badge`. All three derived art assets are crops of the existing PNGs — no new art generation.

**Tech Stack:** React/TypeScript (Vite), Tailwind classes, Supabase Postgres (migration via MCP `apply_migration`), Python 3 + Pillow for asset cropping, Playwright for test coverage.

## Global Constraints

- Reuse `overlay_image_url` for all four slots (background/aura/frame/badge) keyed off `shop_items.metadata.pet_slot` — no new column, no new metadata field. (Spec: Data model)
- One proof-case item per slot this pass: Dark Lab, Flame Aura, BROski Holo Badge, plus Basic Neon Frame as a regression check only. Every other catalogue item stays on the unchanged opaque-fallback path. Full rollout stays in issue #51. (Spec: Scope)
- Background: `PetPortrait` must prefer `background.overlay_image_url`, falling back to `background.image_url` — the exact resolution pattern `frame`/`frameOverlay` already uses, including the blank/whitespace-as-absent `.trim()` guard from #52. (Spec: Rendering changes)
- Aura scale: `scale-[1.25]` → `scale-[1.5]`. (Spec: Scope table)
- Badge fixed sizes: hero `h-10 w-10` → `h-16 w-16`; lg `h-7 w-7` → `h-10 w-10`; sm `h-5 w-5` → `h-7 w-7`. Position offsets unchanged unless the live check shows clipping. (Spec: Rendering changes)
- Frame: no code change this pass — regression check only. (Spec: Scope table)
- Migration must raise if a target `shop_items` row is missing, not silently no-op — same guarded `DO` block pattern as `20260802223316_shop_items_preview_overlay_image_split.sql`. (Spec: Asset processing)
- Required automated coverage: a cosmetic with only `image_url` renders via fallback; one with both `image_url` and `overlay_image_url` renders via the overlay — covering background (new) and frame (regression). Plus the repo's prescribed `tests/vibe-labs-anon-flow.spec.ts` and `tests/vibe-labs-a11y.spec.ts`. (Spec: Testing)
- Required before merge: a live authenticated visual check with all four proof-case items equipped simultaneously on the real account's pet, covering the 6 acceptance checks in the spec's Testing section — this is a controller-only step (needs a real authenticated browser session), not delegated to a subagent.
- `main` is a protected branch — every change lands via branch → push → `gh pr create` → merge, never a direct push (`CLAUDE.md` §4).
- DB changes go through Supabase MCP `apply_migration`, never `supabase db push` (`CLAUDE.md` §2a rule 1).

---

## Asset crop reference (already measured — do not re-derive)

These three crop boxes were determined by visually inspecting each source
image with a coordinate grid overlay and test-cropping until the vignette/
dead-margin was fully cleared. Use them exactly as given:

| Source file | Crop box `(left, top, right, bottom)` | Output size |
|---|---|---|
| `frontend/public/images/shop/pet-background/shop_bg_lab_dark.png` | `(100, 100, 924, 924)` | 1024×1024 |
| `frontend/public/images/shop/pet-aura/shop_aura_flame.png` | `(75, 75, 950, 950)` | 1024×1024 |
| `frontend/public/images/shop/pet-badge/shop_badge_broski_holo.png` | `(150, 120, 910, 880)` | 1024×1024 |

`shop_items` UUIDs (confirmed live via `execute_sql`):

| Item | `id` |
|---|---|
| Dark Lab | `33330004-0000-0000-0000-000000000003` |
| Flame Aura | `33330003-0000-0000-0000-000000000003` |
| BROski Holo Badge | `33330005-0000-0000-0000-000000000001` |

---

### Task 1: Generate the three cropped overlay assets

**Files:**
- Create: `frontend/public/images/shop/pet-background/shop_bg_lab_dark_overlay.png`
- Create: `frontend/public/images/shop/pet-aura/shop_aura_flame_overlay.png`
- Create: `frontend/public/images/shop/pet-badge/shop_badge_broski_holo_overlay.png`

**Interfaces:**
- Produces: three new PNG files at the paths above, each 1024×1024, referenced by exact path string in Task 2's migration.

- [ ] **Step 1: Write and run the crop script**

Save this as a scratch script (anywhere outside the repo, e.g. your temp/scratchpad directory) and run it with `python`:

```python
from PIL import Image

JOBS = [
    (
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-background\shop_bg_lab_dark.png",
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-background\shop_bg_lab_dark_overlay.png",
        (100, 100, 924, 924),
    ),
    (
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-aura\shop_aura_flame.png",
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-aura\shop_aura_flame_overlay.png",
        (75, 75, 950, 950),
    ),
    (
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-badge\shop_badge_broski_holo.png",
        r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-badge\shop_badge_broski_holo_overlay.png",
        (150, 120, 910, 880),
    ),
]

for src, dst, box in JOBS:
    im = Image.open(src).convert("RGB")
    cropped = im.crop(box).resize((1024, 1024), Image.LANCZOS)
    cropped.save(dst)
    print("saved", dst, cropped.size)
```

Expected output: three `saved ... (1024, 1024)` lines, no errors.

- [ ] **Step 2: Verify each output file is a valid 1024×1024 image with real content**

```python
from PIL import Image
import os

files = [
    r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-background\shop_bg_lab_dark_overlay.png",
    r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-aura\shop_aura_flame_overlay.png",
    r"H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\frontend\public\images\shop\pet-badge\shop_badge_broski_holo_overlay.png",
]
for f in files:
    im = Image.open(f)
    size_bytes = os.path.getsize(f)
    assert im.size == (1024, 1024), f"{f} is {im.size}, expected (1024, 1024)"
    assert size_bytes > 50_000, f"{f} is suspiciously small ({size_bytes} bytes)"
    print(f, "OK", im.size, size_bytes, "bytes")
```

Expected: three `OK` lines. If any assertion fails, re-run Step 1 — do not proceed with a broken asset.

- [ ] **Step 3: Visually confirm each crop**

Read each of the three new PNG files (e.g. with your file-viewing tool) and confirm by eye:
- `shop_bg_lab_dark_overlay.png`: no rounded-border vignette visible anywhere near the edges — the lab scene fills edge-to-edge.
- `shop_aura_flame_overlay.png`: the flame ring fills most of the frame, no flame tips cut off at any edge.
- `shop_badge_broski_holo_overlay.png`: the BROski medallion fills most of the frame with only a thin starfield margin, no cut-off edges on the medallion itself.

If any of the three don't match, the crop box needs adjusting — do not proceed to Task 2 with a bad asset.

- [ ] **Step 4: Commit**

```bash
git add frontend/public/images/shop/pet-background/shop_bg_lab_dark_overlay.png
git add frontend/public/images/shop/pet-aura/shop_aura_flame_overlay.png
git add frontend/public/images/shop/pet-badge/shop_badge_broski_holo_overlay.png
git commit -m "feat(pets): add cropped overlay art for Dark Lab, Flame Aura, Holo Badge"
```

---

### Task 2: Migration — wire overlay_image_url for the three proof-case items

**Files:**
- Create: `supabase/migrations/20260803140000_pets_cosmetics_overlay_polish.sql`

**Interfaces:**
- Consumes: the three file paths created in Task 1 (must match exactly).
- Produces: `shop_items.overlay_image_url` set for Dark Lab, Flame Aura, and BROski Holo Badge — consumed by `PetPortrait.tsx` (Task 3) via the existing `useOwnedCosmetics`/`usePetCosmeticArt` hooks (already select `overlay_image_url`, no change needed there).

- [ ] **Step 1: Write the migration file**

```sql
BEGIN;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_lab_dark_overlay.png'
  WHERE id = '33330004-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Dark Lab (33330004-0000-0000-0000-000000000003) not found — overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-aura/shop_aura_flame_overlay.png'
  WHERE id = '33330003-0000-0000-0000-000000000003';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Flame Aura (33330003-0000-0000-0000-000000000003) not found — overlay_image_url not wired';
  END IF;
END $$;

DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-badge/shop_badge_broski_holo_overlay.png'
  WHERE id = '33330005-0000-0000-0000-000000000001';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for BROski Holo Badge (33330005-0000-0000-0000-000000000001) not found — overlay_image_url not wired';
  END IF;
END $$;

COMMIT;
```

- [ ] **Step 2: Apply via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with `name: "pets_cosmetics_overlay_polish"` and the SQL body from Step 1. Never `supabase db push`.

- [ ] **Step 3: Verify live**

Run via `mcp__supabase__execute_sql`:

```sql
SELECT id, name, image_url, overlay_image_url
FROM shop_items
WHERE id IN (
  '33330004-0000-0000-0000-000000000003',
  '33330003-0000-0000-0000-000000000003',
  '33330005-0000-0000-0000-000000000001'
);
```

Expected: 3 rows, each with a non-null `overlay_image_url` matching the paths from Task 1, and `image_url` unchanged from before this migration.

- [ ] **Step 4: Verify the migration's guard actually raises on a missing row**

Run via `mcp__supabase__execute_sql`, wrapped so it never commits:

```sql
BEGIN;
DO $$
DECLARE
  affected int;
BEGIN
  UPDATE public.shop_items
  SET overlay_image_url = '/images/shop/pet-background/shop_bg_lab_dark_overlay.png'
  WHERE id = '00000000-0000-0000-0000-000000000000';

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'shop_items row for Dark Lab not found — overlay_image_url not wired';
  END IF;
END $$;
ROLLBACK;
```

Expected: the call errors with `shop_items row for Dark Lab not found`. This confirms the guard pattern works exactly like #52's, before trusting it in the real migration.

- [ ] **Step 5: Commit the migration file**

```bash
git add supabase/migrations/20260803140000_pets_cosmetics_overlay_polish.sql
git commit -m "feat(pets): wire overlay_image_url for Dark Lab, Flame Aura, Holo Badge"
```

---

### Task 3: PetPortrait.tsx rendering changes

**Files:**
- Modify: `frontend/src/components/pets/PetPortrait.tsx`

**Interfaces:**
- Consumes: `equipped.background.overlay_image_url` / `equipped.background.image_url` (already typed on `EquippedCosmetics`, already selected by `useOwnedCosmetics.ts` and `usePetCosmeticArt.ts` — no hook changes needed).
- Produces: four new `data-testid` hooks (`pet-portrait-background`, `pet-portrait-aura`, `pet-portrait-frame`, `pet-portrait-badge`), hero-size only — consumed by Task 4's Playwright spec.

- [ ] **Step 1: Update the header comment**

Replace:

```tsx
// Stack, back → front:
//   background  fills the box behind the pet
//   aura        soft glow ring just behind the pet (scaled past the box)
```

With:

```tsx
// Stack, back → front:
//   background  fills the box behind the pet — prefers overlay_image_url
//               (full-bleed scene art), falls back to the catalogue
//               image_url (may have a baked vignette) for items without one
//   aura        soft glow ring just behind the pet (scaled past the box)
```

- [ ] **Step 2: Add background overlay resolution**

Replace:

```tsx
  const bg    = equipped?.background?.image_url
  const aura  = equipped?.aura?.image_url
```

With:

```tsx
  // Background catalogue art may have a baked vignette border (a "scene
  // inside a card"), same class of problem frame's promo-card art had —
  // only overlay_image_url (full-bleed scene art) is safe to render
  // edge-to-edge here. Blank/whitespace-only values count as absent.
  const rawBgOverlay = equipped?.background?.overlay_image_url?.trim()
  const bgOverlay = rawBgOverlay ? rawBgOverlay : undefined
  const bg = bgOverlay ?? equipped?.background?.image_url
  const aura  = equipped?.aura?.image_url
```

- [ ] **Step 3: Add the background `data-testid` and confirm className is unchanged**

Replace:

```tsx
      {bg && (
        <img
          src={bg}
          alt=""
          aria-hidden
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover ${s.rounded}`}
        />
      )}
```

With:

```tsx
      {bg && (
        <img
          src={bg}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-background' : undefined}
          className={`absolute inset-0 h-full w-full object-cover ${s.rounded}`}
        />
      )}
```

- [ ] **Step 4: Bump the aura scale and add its `data-testid`**

Replace:

```tsx
      {aura && (
        <img
          src={aura}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.25] blur-[1px] opacity-80 mix-blend-screen"
        />
      )}
```

With:

```tsx
      {aura && (
        <img
          src={aura}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-aura' : undefined}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-[1.5] blur-[1px] opacity-80 mix-blend-screen"
        />
      )}
```

- [ ] **Step 5: Add the frame `data-testid` (no other frame change)**

Replace:

```tsx
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          loading="lazy"
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
            frameOverlay ? 'scale-[1.4]' : 'scale-[1.12]'
          }`}
        />
      )}
```

With:

```tsx
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-frame' : undefined}
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${
            frameOverlay ? 'scale-[1.4]' : 'scale-[1.12]'
          }`}
        />
      )}
```

- [ ] **Step 6: Bump the badge sizes in the `SIZE` constant**

Replace:

```tsx
const SIZE = {
  hero: {
    box:     'h-64 w-64 sm:h-72 sm:w-72',
    rounded: 'rounded-pet-chunky',
    badge:   'h-10 w-10 -bottom-3 -right-3',
  },
  lg: {
    box:     'h-20 w-20',
    rounded: 'rounded-hfz-md',
    badge:   'h-7 w-7 -bottom-2 -right-2',
  },
  sm: {
    box:     'h-12 w-12',
    rounded: 'rounded-hfz-sm',
    badge:   'h-5 w-5 -bottom-1.5 -right-1.5',
  },
} as const
```

With:

```tsx
const SIZE = {
  hero: {
    box:     'h-64 w-64 sm:h-72 sm:w-72',
    rounded: 'rounded-pet-chunky',
    badge:   'h-16 w-16 -bottom-3 -right-3',
  },
  lg: {
    box:     'h-20 w-20',
    rounded: 'rounded-hfz-md',
    badge:   'h-10 w-10 -bottom-2 -right-2',
  },
  sm: {
    box:     'h-12 w-12',
    rounded: 'rounded-hfz-sm',
    badge:   'h-7 w-7 -bottom-1.5 -right-1.5',
  },
} as const
```

- [ ] **Step 7: Add the badge `data-testid`**

Replace:

```tsx
      {badge?.image_url ? (
        <img
          src={badge.image_url}
          alt={badge.name}
          title={badge.name}
          loading="lazy"
          className={`absolute ${s.badge} object-contain drop-shadow`}
        />
      ) : (
        cornerFallback
      )}
```

With:

```tsx
      {badge?.image_url ? (
        <img
          src={badge.image_url}
          alt={badge.name}
          title={badge.name}
          loading="lazy"
          data-testid={isHero ? 'pet-portrait-badge' : undefined}
          className={`absolute ${s.badge} object-contain drop-shadow`}
        />
      ) : (
        cornerFallback
      )}
```

- [ ] **Step 8: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/pets/PetPortrait.tsx
git commit -m "feat(pets): background overlay resolution, bigger aura + badge"
```

---

### Task 4: New Playwright spec — overlay resolution coverage

**Files:**
- Create: `frontend/tests/pets-portrait-overlay-resolution.spec.ts`

**Interfaces:**
- Consumes: `data-testid="pet-portrait-background"` and `data-testid="pet-portrait-frame"` from Task 3.

- [ ] **Step 1: Write the spec**

```typescript
// PetPortrait cosmetic overlay resolution — background (new this pass) +
// frame (regression check on #52's existing logic).
//
// Covers: a cosmetic equipped with only image_url renders via the opaque
// fallback path; one with both image_url and overlay_image_url set renders
// via the transparent/full-bleed overlay instead.
//
// Auth + REST mocked the same way as pets-care-actions.spec.ts.

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'portrait-user-id'
const FAKE_JWT = 'portrait-jwt'

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: JSON.stringify(payload),
  })
}

async function allowCors(route: Route) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: '',
  })
}

function setupAuthMock(page: Page) {
  return page.route('**/auth/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const user = {
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'portrait@example.com',
      user_metadata: { full_name: 'Portrait Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'portrait-refresh', user })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

function petWithCosmetic(slot: 'background' | 'frame', itemId: string) {
  return {
    id: 'pet-uuid-1', pet_id: 'broski_1', species_id: 'sonic_spider', pet_name: 'Web Slinger',
    rarity: 'common', stage: 'baby', mood: 'idle', evolution_count: 0, last_evolved_at: null,
    mint_tx_hash: '0xabc', ipfs_cid: 'cid', chain_id: 84532, created_at: '2026-01-01T00:00:00.000Z',
    cosmetics: { [slot]: itemId }, xp: 0,
    hunger: 50, hunger_updated_at: '2026-08-01T00:00:00.000Z',
    cleanliness: 50, cleanliness_updated_at: '2026-08-01T00:00:00.000Z',
    happiness: 50, happiness_updated_at: '2026-08-01T00:00:00.000Z',
    last_play_at: null,
  }
}

function purchaseFor(
  slot: 'background' | 'frame',
  itemId: string,
  imageUrl: string,
  overlayImageUrl: string | null,
) {
  return {
    item_id: itemId,
    shop_items: {
      id: itemId,
      name: `${slot} test item`,
      image_url: imageUrl,
      preview_image_url: imageUrl,
      overlay_image_url: overlayImageUrl,
      metadata: { pet_slot: slot },
    },
  }
}

function setupRestMock(page: Page, pet: unknown, purchases: unknown[]) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'portrait@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))           { await fulfillJson(route, [pet]); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases')) { await fulfillJson(route, purchases); return }
    if (url.pathname.startsWith('/rest/v1/xp_events'))      { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))       { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))           { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'portrait@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe('PetPortrait cosmetic overlay resolution', () => {
  test('background with only image_url renders the fallback art', async ({ page }) => {
    await setupAuthMock(page)
    const pet = petWithCosmetic('background', 'item-bg-1')
    await setupRestMock(page, pet, [
      purchaseFor('background', 'item-bg-1', '/images/shop/pet-background/shop_bg_lab_dark.png', null),
    ])
    await signIn(page)
    await page.goto('/pets')

    const img = page.getByTestId('pet-portrait-background')
    await expect(img).toHaveAttribute('src', '/images/shop/pet-background/shop_bg_lab_dark.png')
  })

  test('background with overlay_image_url set prefers the overlay art', async ({ page }) => {
    await setupAuthMock(page)
    const pet = petWithCosmetic('background', 'item-bg-2')
    await setupRestMock(page, pet, [
      purchaseFor(
        'background', 'item-bg-2',
        '/images/shop/pet-background/shop_bg_lab_dark.png',
        '/images/shop/pet-background/shop_bg_lab_dark_overlay.png',
      ),
    ])
    await signIn(page)
    await page.goto('/pets')

    const img = page.getByTestId('pet-portrait-background')
    await expect(img).toHaveAttribute('src', '/images/shop/pet-background/shop_bg_lab_dark_overlay.png')
  })

  test('frame with only image_url still renders the fallback art (regression, #52)', async ({ page }) => {
    await setupAuthMock(page)
    const pet = petWithCosmetic('frame', 'item-frame-1')
    await setupRestMock(page, pet, [
      purchaseFor('frame', 'item-frame-1', '/images/shop/pet-frame/shop_frame_glitch_rgb.png', null),
    ])
    await signIn(page)
    await page.goto('/pets')

    const img = page.getByTestId('pet-portrait-frame')
    await expect(img).toHaveAttribute('src', '/images/shop/pet-frame/shop_frame_glitch_rgb.png')
  })

  test('frame with overlay_image_url set still prefers the overlay art (regression, #52)', async ({ page }) => {
    await setupAuthMock(page)
    const pet = petWithCosmetic('frame', 'item-frame-2')
    await setupRestMock(page, pet, [
      purchaseFor(
        'frame', 'item-frame-2',
        '/images/shop/pet-frame/shop_frame_basic_neon.png',
        '/images/shop/pet-frame/shop_frame_basic_neon_overlay.png',
      ),
    ])
    await signIn(page)
    await page.goto('/pets')

    const img = page.getByTestId('pet-portrait-frame')
    await expect(img).toHaveAttribute('src', '/images/shop/pet-frame/shop_frame_basic_neon_overlay.png')
  })
})
```

- [ ] **Step 2: Run the new spec**

Run: `cd frontend && npx playwright test pets-portrait-overlay-resolution.spec.ts --project=chromium`
Expected: 4 passed.

- [ ] **Step 3: Commit**

```bash
git add frontend/tests/pets-portrait-overlay-resolution.spec.ts
git commit -m "test(pets): cover background overlay resolution + frame regression"
```

---

### Task 5: Full regression pass

**Files:** none (verification only).

- [ ] **Step 1: Type-check and lint**

```bash
cd frontend
npx tsc --noEmit
npx eslint src/components/pets/PetPortrait.tsx tests/pets-portrait-overlay-resolution.spec.ts
```
Expected: `tsc` clean; `eslint` reports no new errors (pre-existing repo-wide warnings/errors in unrelated files are not this task's concern).

- [ ] **Step 2: Production build**

Run: `cd frontend && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Run the existing `/pets` regression specs**

```bash
cd frontend
npx playwright test pets-care-actions.spec.ts pets-xpfeed.spec.ts pets-portrait-overlay-resolution.spec.ts --project=chromium
```
Expected: all pass (10 existing + 4 new = 14 passed).

- [ ] **Step 4: Run the repo's prescribed auth/accessibility specs**

```bash
cd frontend
npx playwright test tests/vibe-labs-anon-flow.spec.ts tests/vibe-labs-a11y.spec.ts --project=chromium
```
Expected: all pass — this pass touches no anon-flow or accessibility surface, so these should be unaffected.

- [ ] **Step 5: Commit any fixups**

If Steps 1-4 required any fixes, commit them:

```bash
git add -A
git commit -m "fix(pets): address regression findings from cosmetics polish pass"
```

(Skip this step if nothing needed fixing.)

---

## Final step: live authenticated visual QA (controller-only, not a subagent task)

This step requires a real authenticated browser session against the real
account (same account used throughout #49/#50/#52 — the pet "Luna"/
`broski_1`, owned by `44cd9ce5-5e38-4d61-b36e-dce4cb7102c2`) and cannot be
delegated to a subagent. Perform this directly after Tasks 1-5 are done and
committed on the feature branch, with the local dev server running on that
branch:

1. Start `npm run dev:frontend`, navigate to `/pets` in an authenticated
   session with Luna equipped with all four proof-case items (Dark Lab,
   Flame Aura, Basic Neon Frame, BROski Holo Badge — already her equipped
   state as of this plan).
2. Confirm each of the 6 acceptance checks from the spec's Testing section:
   - Dark Lab reads as a full scene behind Luna, not a card inside a card.
   - Flame Aura visibly wraps around/past Luna's silhouette without hiding her.
   - BROski Holo Badge is clearly readable/rewarding at a glance and stays
     in the lower-right corner, not covering Luna's face.
   - Basic Neon Frame still remains clean, border-only, text-free.
   - Refresh the page — all four stay equipped and render correctly.
   - Unequip one slot, then re-equip it — correct art returns, `4 / 4 slots`
     count is accurate throughout.
3. If any check fails, do not proceed to PR — return to the relevant task
   (asset crop for a visual failure, `PetPortrait.tsx` for a logic failure)
   and fix before opening the PR.
4. Once all 6 pass, push the branch and open a PR (title referencing this
   plan / the spec), following `CLAUDE.md`'s protected-`main` PR flow. Do
   not self-merge without explicit confirmation.
