// Browser verification — the PetMentorBubble now renders on /pets (via
// PetMentorDock mounted in <Layout>) for a signed-in user, holds a chat, and
// reflects the Edge Function's mood_update on the avatar/badge.
//
// Auth + REST + the pet-mentor-chat function are mocked the same way as
// pets-xpfeed.spec.ts, so this is deterministic and offline (no real LLM call).

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'mentor-user-id'
const FAKE_JWT = 'mentor-jwt'

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
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'mentor@example.com',
      user_metadata: { full_name: 'Mentor Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'mentor-refresh', user })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

const PET = {
  id: 'pet-uuid-1', pet_id: 'broski_1', species_id: 'sonic_spider', pet_name: 'Web Slinger',
  rarity: 'common', stage: 'baby', mood: 'idle', evolution_count: 0, last_evolved_at: null,
  mint_tx_hash: '0xabc', ipfs_cid: 'cid', chain_id: 84532, created_at: '2026-01-01T00:00:00.000Z', cosmetics: {},
}

function setupRestMock(page: Page) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'mentor@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))           { await fulfillJson(route, [PET]); return }
    if (url.pathname.startsWith('/rest/v1/shop_purchases')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/xp_events'))      { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))       { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))           { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

function setupChatMock(page: Page) {
  return page.route('**/functions/v1/pet-mentor-chat', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    await fulfillJson(route, { response: 'Ship it. Two minutes, not twenty. 🕷️', mood_update: 'hyperfocus' })
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'mentor@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe('Pet mentor bubble on /pets', () => {
  test('renders for a signed-in user, chats, and reflects mood_update', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page)
    await setupChatMock(page)

    await signIn(page)
    await page.goto('/pets')

    // Mounted via PetMentorDock in <Layout> — the fix this session. Greeting
    // auto-opens the panel ~2s after mount.
    const dialog = page.getByRole('dialog', { name: /chat with sonic spider/i })
    await expect(dialog).toBeVisible({ timeout: 20_000 })

    // Initial mood seeded from pet.mood = 'idle'.
    await expect(dialog.getByText('Idle', { exact: true })).toBeVisible()

    // Send a message → mocked reply renders in-character.
    await dialog.getByRole('textbox', { name: /message sonic spider/i }).fill('I keep overthinking this')
    await dialog.getByRole('button', { name: /^send$/i }).click()
    await expect(dialog.getByText(/ship it\. two minutes/i)).toBeVisible({ timeout: 15_000 })

    // mood_update = 'hyperfocus' → the MoodBadge flips.
    await expect(dialog.getByText('Hyperfocus', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Idle', { exact: true })).toHaveCount(0)

    await page.screenshot({ path: 'test-results/pets-mentor-bubble.png' })
  })

  test('does NOT render for a logged-out visitor', async ({ page }) => {
    await page.goto('/pets')
    await expect(page.getByRole('button', { name: /open chat with/i })).toHaveCount(0)
  })
})
