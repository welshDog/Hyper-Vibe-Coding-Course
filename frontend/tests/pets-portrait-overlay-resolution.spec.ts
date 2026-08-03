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
