import { test, expect } from '@playwright/test'

/**
 * Logged-out users hit a hard login gate on /pets — the whole mint flow
 * (species picker → name → mint) is members-only. The species picker is
 * not rendered at all until a user is signed in. This guards that gate.
 *
 * (The earlier version of this test assumed logged-out users could pick a
 * species and saw an inline "Sign in to unlock mint" lock — that inline
 * design was replaced by the full login gate below.)
 */
test('pets mint flow is login-gated when logged out', async ({ page }) => {
  await page.goto('/pets')

  // /pets lazy-loads the heavy web3 chunk — the first dev-mode compile can
  // take well over the default 5s, so give this first assertion headroom.
  await expect(page.getByText(/log in to mint your broskipet/i)).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByRole('heading', { name: /mint a broski pet/i })).toBeVisible()

  // The mint gate's "Create account" CTA — unique to the gate (the page
  // chrome's own auth CTA reads "Start free", so no strict-mode clash).
  await expect(page.getByRole('link', { name: /create account/i })).toBeVisible()

  // Step 1 (the species picker) is NOT rendered for logged-out users.
  await expect(page.getByText(/step 1 — pick a species/i)).toHaveCount(0)
})
