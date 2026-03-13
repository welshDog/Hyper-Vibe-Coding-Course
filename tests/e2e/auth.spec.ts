import { test, expect } from '@playwright/test'

test('user can register and log in', async ({ page }) => {
  await page.goto('/')

  // Register
  await page.click('text=Register')
  await page.fill('[name=email]', 'test@vibetest.com')
  await page.fill('[name=password]', 'testpassword123')
  await page.fill('[name=displayName]', 'Vibe Tester')
  await page.click('[type=submit]')

  // Should land on dashboard
  await expect(page.locator('text=Resume Where I Left Off')).toBeVisible()
})

test('dashboard shows XP progress bar', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'demo@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('[type=submit]')

  await expect(page.locator('text=XP total')).toBeVisible()
  await expect(page.locator('text=Streak')).toBeVisible()
})

test('accessibility controls are visible', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'demo@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('[type=submit]')

  await expect(page.locator('text=A11y Settings')).toBeVisible()
})
