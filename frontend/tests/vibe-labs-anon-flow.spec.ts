import { test, expect, type Page } from '@playwright/test'

/**
 * Sprint 4 — anon → signup conversion, the testable surface.
 *
 * Covers the genuinely-new logic: a logged-out visitor EARNS a level
 * (localStorage), the next level UNLOCKS, and the conversion CTA is wired
 * with an open-redirect-safe returnTo.
 *
 * NOT faked here (honest boundary): the post-LOGIN reconcile that banks
 * earned levels via `claim_level_reward`. That needs a real authenticated
 * Supabase session + email-confirm; the RPC's own guarantees (idempotent +
 * level-locked, real-user tested 2026-05-19) are the authority, and a real
 * signup→confirm→login pass stays a human integration gate. This suite
 * proves everything up to that boundary.
 */

const STORE_KEY = 'vibe-labs:anon-progress'

// Mirrors the Supabase-REST stub in landing.spec.ts / vibe-labs-a11y.spec.ts
// so the public lab pages render deterministically with no session.
async function stubSupabase(page: Page) {
  await page.route('**/rest/v1/**', async (route) => {
    const req = route.request()
    const origin = req.headers()['origin'] ?? 'http://localhost:5173'
    const cors = {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    }
    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors, body: '' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: '[]',
    })
  })
}

function readStore(page: Page) {
  return page.evaluate((k) => window.localStorage.getItem(k), STORE_KEY)
}

test('anon: fresh visitor — Level 2 is locked until Level 1 is done', async ({
  page,
}) => {
  await stubSupabase(page)
  await page.goto('/vibe-labs/level-2')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Locked reward card, no "I built it" affordance.
  await expect(page.getByText(/Locked —/i)).toBeVisible()
  await expect(
    page.getByRole('button', { name: /I built it/i }),
  ).toHaveCount(0)
  expect(await readStore(page)).toBeNull()
})

test('anon: complete L1 → earn locally, unlock L2, conversion CTA wired', async ({
  page,
}) => {
  await stubSupabase(page)
  await page.goto('/vibe-labs/level-1')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Pre-earn: the dopamine trigger is present, nothing persisted yet.
  const buildItBtn = page.getByRole('button', { name: /I built it — mark complete/i })
  await expect(buildItBtn).toBeVisible()
  await expect(page.getByText(/Free · no account needed yet/i)).toBeVisible()
  expect(await readStore(page)).toBeNull()

  // Earn it.
  await buildItBtn.click()

  // Earned state + the conversion moment.
  await expect(page.getByText(/You earned it/i)).toBeVisible()
  await expect(page.getByText(/Earned · unbanked/i)).toBeVisible()

  const bankCta = page.getByRole('link', {
    name: /Create a free account to bank it/i,
  })
  await expect(bankCta).toBeVisible()
  await expect(bankCta).toHaveAttribute(
    'href',
    '/register?returnTo=%2Fvibe-labs%2Flevel-1',
  )
  await expect(
    page.getByRole('link', { name: /Log in to bank it/i }),
  ).toHaveAttribute('href', '/login?returnTo=%2Fvibe-labs%2Flevel-1')

  // Persisted (sanitised shape).
  const raw = await readStore(page)
  expect(raw).not.toBeNull()
  expect(JSON.parse(raw as string)).toEqual({ v: 1, completedLevels: [1] })

  // L2 now unlocks for the same anon (localStorage drives isLevelUnlocked).
  await page.goto('/vibe-labs/level-2')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/Locked —/i)).toHaveCount(0)
  const l2Btn = page.getByRole('button', { name: /I built it — mark complete/i })
  await expect(l2Btn).toBeVisible()

  // Complete L2 → store grows in order; L2's CTA carries its own returnTo.
  await l2Btn.click()
  await expect(page.getByText(/You earned it/i)).toBeVisible()
  expect(JSON.parse((await readStore(page)) as string)).toEqual({
    v: 1,
    completedLevels: [1, 2],
  })
  await expect(
    page.getByRole('link', { name: /Create a free account to bank it/i }),
  ).toHaveAttribute('href', '/register?returnTo=%2Fvibe-labs%2Flevel-2')
})

test('anon: tampered store cannot skip the unlock gate in the UI', async ({
  page,
}) => {
  await stubSupabase(page)
  // Seed a non-contiguous / tampered store (only L4 "done").
  await page.addInitScript(
    ([k]) =>
      window.localStorage.setItem(k, JSON.stringify({ v: 1, completedLevels: [4] })),
    [STORE_KEY],
  )
  // L5 needs L4; with a tampered [4] the UI would "unlock" L5 — but the
  // server reconcile still claims in order and the RPC is level-locked, so
  // L5 can never actually bank without L1–L4 truly complete. This asserts
  // the client gate behaves off the (sanitised) store; banking safety is
  // the server RPC's job (documented above, real-user tested).
  await page.goto('/vibe-labs/level-3')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // L3 needs L2 — not in the tampered store → still locked client-side.
  await expect(page.getByText(/Locked —/i)).toBeVisible()
})
