// Recent XP activity feed — /pets (XpFeed + useXpEvents)
//
// Covers the three states of the feed:
//   1. seeded rows  — three xp_events render with icon/label, +amount, time-ago,
//                      and a rift-multiplier badge when rift_multiplier > 1.
//   2. empty state  — signed in, zero events → warm "Your first XP lands here".
//   3. logged out   — the whole "Recent activity" section is absent (auth-gated).
//
// Auth + REST are mocked the same way as pets-relay-smoke.spec.ts: route
// **/auth/v1/** to a fake session and **/rest/v1/** to fixture data. The feed's
// query is GET /rest/v1/xp_events?...&user_id=eq.<id>&order=created_at.desc&limit=5.

import { test, expect, type Page, type Route } from '@playwright/test'

const FAKE_USER_ID = 'xpfeed-user-id'
const FAKE_JWT     = 'xpfeed-jwt'

// ── CORS-aware JSON fulfil (same shape as the relay smoke test) ───────────────

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin':      origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers':     '*',
      'access-control-allow-methods':     'GET,POST,PATCH,DELETE,OPTIONS',
      'access-control-expose-headers':    'content-range',
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
      'access-control-allow-origin':      origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers':     '*',
      'access-control-allow-methods':     'GET,POST,PATCH,DELETE,OPTIONS',
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
      id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'xpfeed@example.com',
      user_metadata: { full_name: 'XP Feed Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
    }
    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, { access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600, refresh_token: 'xpfeed-refresh', user })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, user); return }
    await fulfillJson(route, {})
  })
}

// `xpEvents` is the fixture returned for GET /rest/v1/xp_events.
function setupRestMock(page: Page, xpEvents: unknown[]) {
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/xp_events')) { await fulfillJson(route, xpEvents); return }
    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'xpfeed@example.com', broski_tokens: 200, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets'))      { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/top_pets'))  { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))      { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

async function signIn(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'xpfeed@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

test.describe('Pets — recent XP activity feed', () => {

  test('renders seeded xp_events with label, amount, and rift badge', async ({ page }) => {
    const events = [
      { id: 'e1', event_type: 'daily_login',     amount: 25,  rift_multiplier: 2,    course_id: null, quest_id: null, created_at: minsAgo(5)        },
      { id: 'e2', event_type: 'git_commit',      amount: 10,  rift_multiplier: null, course_id: null, quest_id: null, created_at: minsAgo(120)      },
      { id: 'e3', event_type: 'module_complete', amount: 150, rift_multiplier: 1,    course_id: 'hv',  quest_id: null, created_at: minsAgo(60 * 26) },
    ]
    await setupAuthMock(page)
    await setupRestMock(page, events)

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible({ timeout: 30_000 })

    const dailyRow  = page.getByRole('listitem').filter({ hasText: 'Daily streak' })
    const commitRow = page.getByRole('listitem').filter({ hasText: 'Git commit' })
    const moduleRow = page.getByRole('listitem').filter({ hasText: 'Module complete' })

    await expect(dailyRow).toBeVisible()
    await expect(commitRow).toBeVisible()
    await expect(moduleRow).toBeVisible()

    // Amounts land in the right rows (BROski$ gold pill).
    await expect(dailyRow).toContainText('+25')
    await expect(commitRow).toContainText('+10')
    await expect(moduleRow).toContainText('+150')

    // Rift multiplier badge only on the boosted (×2) event.
    await expect(dailyRow).toContainText('2×')
    await expect(commitRow).not.toContainText('×')

    // Empty state must NOT show when there are rows.
    await expect(page.getByText(/your first xp lands here/i)).toHaveCount(0)
  })

  test('shows the warm empty state when the user has no xp_events', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, [])

    await signIn(page)
    await page.goto('/pets')

    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/your first xp lands here/i)).toBeVisible()
    // No event rows rendered.
    await expect(page.getByText(/broski\$/i).filter({ hasText: /\+/ })).toHaveCount(0)
  })

  test('feed is hidden entirely when logged out', async ({ page }) => {
    await page.goto('/pets')
    // The demo gate proves the page rendered for a logged-out visitor…
    await expect(page.getByText(/meet your coding companion/i)).toBeVisible({ timeout: 30_000 })
    // …and the auth-gated feed is absent.
    await expect(page.getByRole('heading', { name: /recent activity/i })).toHaveCount(0)
  })
})
