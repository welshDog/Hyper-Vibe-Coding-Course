import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'pets-selection-user-id'
const FAKE_JWT = 'pets-selection-jwt'

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
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'selection@example.com',
      user_metadata: { full_name: 'Selection Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, {
        access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'selection-refresh', user,
      })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

const PETS = [
  {
    id: 'pet-luna', pet_id: 'broski_1', species_id: 'blizzard_lizard', pet_name: 'Luna',
    rarity: 'rare', stage: 'learner', mood: 'hyperfocus', evolution_count: 1, last_evolved_at: '2026-08-05T10:00:00.000Z',
    mint_tx_hash: '0xluna', ipfs_cid: 'cid-luna', chain_id: 84532, created_at: '2026-08-05T10:00:00.000Z',
    cosmetics: {}, xp: 414,
    hunger: 50, hunger_updated_at: '2026-08-05T10:00:00.000Z',
    cleanliness: 50, cleanliness_updated_at: '2026-08-05T10:00:00.000Z',
    happiness: 50, happiness_updated_at: '2026-08-05T10:00:00.000Z',
    last_play_at: null,
  },
  {
    id: 'pet-bolt', pet_id: 'broski_2', species_id: 'hyper_hamster', pet_name: 'Bolt',
    rarity: 'common', stage: 'baby', mood: 'idle', evolution_count: 0, last_evolved_at: null,
    mint_tx_hash: '0xbolt', ipfs_cid: 'cid-bolt', chain_id: 84532, created_at: '2026-08-05T09:00:00.000Z',
    cosmetics: {}, xp: 2,
    hunger: 50, hunger_updated_at: '2026-08-05T10:00:00.000Z',
    cleanliness: 50, cleanliness_updated_at: '2026-08-05T10:00:00.000Z',
    happiness: 50, happiness_updated_at: '2026-08-05T10:00:00.000Z',
    last_play_at: null,
  },
]

function setupRestMock(page: Page) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'selection@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 1200, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets')) { await fulfillJson(route, PETS); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/xp_events')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/')) { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'selection@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test('pet picker exposes pressed state when selection changes', async ({ page }) => {
  await setupAuthMock(page)
  await setupRestMock(page)

  await signIn(page)
  await page.goto('/pets')

  const collectionStrip = page.getByRole('list', { name: /your full pet collection/i })
  const lunaButton = collectionStrip.getByRole('button', { name: /luna/i })
  const boltButton = collectionStrip.getByRole('button', { name: /bolt/i })

  await expect(lunaButton).toHaveAttribute('aria-pressed', 'true')
  await expect(boltButton).toHaveAttribute('aria-pressed', 'false')

  await boltButton.click()

  await expect(boltButton).toHaveAttribute('aria-pressed', 'true')
  await expect(lunaButton).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText(/bolt xp/i)).toBeVisible()
})
