import { test, expect } from '@playwright/test';

test('landing page has correct title and hero CTA', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Hyper Vibe Coding Course/);

  // Hero waitlist submit button (primary CTA on the landing page)
  const joinWaitlistBtn = page.getByRole('button', { name: /Join waitlist/i }).first();
  await expect(joinWaitlistBtn).toBeVisible();

  // Secondary CTA — "Browse Courses →" link
  const browseCoursesLink = page.getByRole('link', { name: /Browse Courses/i }).first();
  await expect(browseCoursesLink).toBeVisible();
});

test('can navigate to courses page from landing', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Browse Courses/i }).first().click();

  await expect(page).toHaveURL(/.*courses/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
