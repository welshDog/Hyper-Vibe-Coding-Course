import { test, expect } from '@playwright/test';

test('landing page has correct title and buttons', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Hyper Vibe Coding Course/);

  // Check for the "Get Started" button
  const getStartedBtn = page.getByRole('button', { name: /Get Started/i }).first();
  await expect(getStartedBtn).toBeVisible();

  // Check for the "View Pricing" button
  const viewPricingBtn = page.getByRole('button', { name: /View Pricing/i }).first();
  await expect(viewPricingBtn).toBeVisible();
});

test('can navigate to pricing page', async ({ page }) => {
  await page.goto('/');
  
  // Click the "View Pricing" button
  await page.getByRole('button', { name: /View Pricing/i }).first().click();

  // Expect URL to contain "pricing"
  await expect(page).toHaveURL(/.*pricing/);
  
  // Expect header to be visible
  await expect(page.getByRole('heading', { name: /Pricing/i })).toBeVisible();
});
