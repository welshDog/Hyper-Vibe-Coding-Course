// Regression for the "shop -> pets same-session freshness" bug-hunt
// candidate: useOwnedCosmetics fetched once on mount only, and the
// intended "refetch when a purchase happens elsewhere" wiring was a dead
// `void refetchCosmetics` reference that never actually called the
// function. Same-tab nav to /shop and back already remounts /pets (fresh
// fetch) -- the real gap is an already-open /pets tab left stale after a
// purchase completes in a DIFFERENT tab. This simulates exactly that: no
// navigation, just a visibilitychange event, the same signal a real tab
// switch produces.
//
// Auth + REST mocked the same way as pets-portrait-overlay-resolution.spec.ts.

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'freshness-user-id'
const FAKE_JWT = 'freshness-jwt'

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
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'freshness@example.com',
      user_metadata: { full_name: 'Freshness Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'freshness-refresh', user })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

const PET = {
  id: 'pet-uuid-1', pet_id: 'broski_1', species_id: 'sonic_spider', pet_name: 'Web Slinger',
  rarity: 'common', stage: 'baby', mood: 'idle', evolution_count: 0, last_evolved_at: null,
  mint_tx_hash: '0xabc', ipfs_cid: 'cid', chain_id: 84532, created_at: '2026-01-01T00:00:00.000Z',
  cosmetics: {}, xp: 0,
  hunger: 50, hunger_updated_at: '2026-08-01T00:00:00.000Z',
  cleanliness: 50, cleanliness_updated_at: '2026-08-01T00:00:00.000Z',
  happiness: 50, happiness_updated_at: '2026-08-01T00:00:00.000Z',
  last_play_at: null,
}

const FRAME_PURCHASE = {
  item_id: 'item-frame-fresh',
  shop_items: {
    id: 'item-frame-fresh',
    name: 'Frost Frame',
    image_url: '/images/shop/pet-frame/shop_frame_frost.png',
    preview_image_url: '/images/shop/pet-frame/shop_frame_frost.png',
    overlay_image_url: null,
    metadata: { pet_slot: 'frame' },
  },
}

// Mutable holder so the route handler can see a purchase that "shows up"
// after the page has already loaded, mimicking a purchase completed in a
// different tab while this one stayed open.
function setupRestMock(page: Page, purchasesRef: { current: unknown[] }) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'freshness@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))           { await fulfillJson(route, [PET]); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases')) { await fulfillJson(route, purchasesRef.current); return }
    if (url.pathname.startsWith('/rest/v1/xp_events'))      { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))       { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))           { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'freshness@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

// Simulates a real tab regaining focus: overrides document.visibilityState
// the same way the browser does, then dispatches the exact event the app
// listens for. Not a fake of the app's behavior -- it's the real signal.
async function simulateTabReturn(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

test.describe('owned-cosmetics freshness after a purchase in another tab', () => {
  test('a cosmetic bought elsewhere appears after the tab regains focus, with no navigation', async ({ page }) => {
    const purchasesRef = { current: [] as unknown[] }
    await setupAuthMock(page)
    await setupRestMock(page, purchasesRef)
    await signIn(page)
    await page.goto('/pets')

    // Baseline: frame slot has nothing owned yet.
    await expect(page.getByText('Empty — get one in the shop →').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByLabel(/Equip Frost Frame/)).toHaveCount(0)

    // "Elsewhere": the purchase now exists server-side, but this tab was
    // never told and never navigated.
    purchasesRef.current = [FRAME_PURCHASE]
    await expect(page.getByLabel(/Equip Frost Frame/)).toHaveCount(0) // still stale before the signal

    await simulateTabReturn(page)

    await expect(page.getByLabel(/Equip Frost Frame/)).toBeVisible({ timeout: 10_000 })
  })
})
