import { test, expect } from '@playwright/test'

/**
 * Logged-out users no longer hit a bare login lock on /pets. They now meet an
 * aspirational DEMO pet ("Nimble Wolf") with one clear CTA — "Claim your pet"
 * → /register. The mint flow (species picker → name → mint) is still
 * members-only: Step 1 is not rendered until a user is signed in.
 *
 * (Earlier this page showed a "Log in to mint your BROskiPet" lock card. That
 * was replaced by the demo-pet showcase — see PetCard `demo` prop + Pets.tsx.)
 */
test('pets shows the demo-pet gate (not the mint flow) when logged out', async ({ page }) => {
  await page.goto('/pets')

  // /pets lazy-loads the heavy web3 chunk — the first dev-mode compile can take
  // well over the default 5s, so give the first assertion plenty of headroom.
  await expect(page.getByRole('heading', { name: /meet your coding companion/i })).toBeVisible({
    timeout: 30_000,
  })

  // The demo pet itself + the one primary action.
  await expect(page.getByText(/nimble wolf/i)).toBeVisible()
  await expect(page.getByText(/this could be yours/i)).toBeVisible()
  const claim = page.getByRole('link', { name: /claim your pet/i })
  await expect(claim).toBeVisible()
  await expect(claim).toHaveAttribute('href', /register/)

  // It's a demo, not a real on-chain pet — no BaseScan link, a "Preview" marker.
  await expect(page.getByText(/preview pet/i)).toBeVisible()

  // The old lock card is gone.
  await expect(page.getByText(/log in to mint your broskipet/i)).toHaveCount(0)

  // The mint flow is still members-only — Step 1 (species picker) is not rendered.
  await expect(page.getByText(/step 1 — pick a species/i)).toHaveCount(0)
})
