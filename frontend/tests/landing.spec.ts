import { test, expect } from '@playwright/test';

test('landing page has correct title and hero CTA', async ({ page }) => {
  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const origin = request.headers()['origin'] ?? 'http://localhost:5173';

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
          vary: 'origin',
        },
        body: '',
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        vary: 'origin',
      },
      body: JSON.stringify([]),
    });
  });

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
  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const origin = request.headers()['origin'] ?? 'http://localhost:5173';

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
          vary: 'origin',
        },
        body: '',
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        vary: 'origin',
      },
      body: JSON.stringify([]),
    });
  });

  await page.goto('/');

  await page.getByRole('link', { name: /Browse Courses/i }).first().click();

  await expect(page).toHaveURL(/.*courses/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
