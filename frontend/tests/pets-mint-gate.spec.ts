import { test, expect } from '@playwright/test'

test('pets mint panel prompts sign-in when logged out', async ({ page }) => {
  await page.goto('/pets')
  await page.getByRole('button', { name: 'Choose Chaos Cat' }).click()

  const signInBtn = page.getByRole('button', { name: 'Sign in to unlock mint' })
  await expect(signInBtn).toBeVisible()
  const bg = await signInBtn.evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(bg).toContain('linear-gradient')

  await expect(page.locator('[data-hud-broski]')).toHaveText('—')
  await expect(page.locator('[data-mint-broski]')).toHaveText('—')

  await expect(page.getByText('Sign in to check your BROski$ balance')).toBeVisible()
  await expect(page.getByLabel('Mint locked')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Connect wallet to mint 🔗' })).toHaveCount(0)
})
