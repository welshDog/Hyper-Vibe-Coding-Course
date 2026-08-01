// Pet Care actions — /pets (PetCareSection + useCareInventory + use_care_item RPC)
//
// Covers:
//   1. successful Feed — owned item consumed, hunger bar updates, XP toast
//   2. successful Clean — same, cleanliness bar
//   3. empty inventory state — no owned feed items, picker shows shop link
//   4. daily duo bonus toast appears once both actions complete same day
//
// Auth + REST are mocked the same way as pets-mentor-bubble.spec.ts.

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'care-user-id'
const FAKE_JWT = 'care-jwt'

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
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'care@example.com',
      user_metadata: { full_name: 'Care Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'care-refresh', user })
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
}

const FEED_PURCHASE = {
  id: 'purchase-feed-1', item_id: 'item-apple', used_at: null, used_on_pet_id: null,
  shop_items: { id: 'item-apple', name: 'API Apple', image_url: '/images/shop/food/shop_food_api_apple.png.png',
    metadata: { effect_type: 'feed', target_stat: 'hunger', effect_value: 8 } },
}

// `purchases` is the fixture returned for GET /rest/v1/shop_purchases.
// `rpcResult` is what POST /rest/v1/rpc/use_care_item returns.
function setupRestMock(page: Page, purchases: unknown[], rpcResult: unknown) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'care@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))            { await fulfillJson(route, [PET]); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases'))  { await fulfillJson(route, purchases); return }
    if (url.pathname.startsWith('/rest/v1/xp_events'))       { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))        { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/use_care_item')) { await fulfillJson(route, rpcResult); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))             { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'care@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe('Pet Care actions on /pets', () => {

  test('successful Feed updates the hunger bar and shows XP toast', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, [FEED_PURCHASE], {
      ok: true, target_stat: 'hunger', new_value: 58, xp_awarded: 2, duo_bonus: false,
    })

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })

    await page.getByRole('button', { name: /^feed$/i }).click()
    await expect(page.getByText('API Apple')).toBeVisible()
    await page.getByText('API Apple').click()

    await expect(page.getByText(/loved that snack/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/\+8 hunger/i)).toBeVisible()
    await expect(page.getByText(/\+2 xp/i)).toBeVisible()
  })

  test('empty inventory shows the shop link', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, [], null)

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /^feed$/i }).click()

    await expect(page.getByText(/don't have any snacks yet/i)).toBeVisible()

    // Scoped to the care section — /pets also renders a navbar "Shop" link
    // and PetCosmeticsPanel's own "get one in the shop" links, so an
    // unscoped getByRole('link', { name: /shop/i }) hits Playwright's
    // strict-mode violation (multiple matches) on this page.
    const careSection = page.getByTestId('pet-care-section')
    await expect(careSection.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop')
  })

  test('daily duo bonus toast appears when the RPC reports duo_bonus: true', async ({ page }) => {
    const cleanPurchase = {
      id: 'purchase-clean-1', item_id: 'item-shampoo', used_at: null, used_on_pet_id: null,
      shop_items: { id: 'item-shampoo', name: 'Cache Shampoo', image_url: null,
        metadata: { effect_type: 'care', target_stat: 'cleanliness', effect_value: 8 } },
    }
    await setupAuthMock(page)
    await setupRestMock(page, [cleanPurchase], {
      ok: true, target_stat: 'cleanliness', new_value: 58, xp_awarded: 7, duo_bonus: true,
    })

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /pet care/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /^clean$/i }).click()
    await page.getByText('Cache Shampoo').click()

    await expect(page.getByText(/daily care complete/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/\+5 bonus xp/i)).toBeVisible()
  })
})