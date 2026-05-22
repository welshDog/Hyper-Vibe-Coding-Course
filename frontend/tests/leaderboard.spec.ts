import { test, expect, type Route } from '@playwright/test';

const fulfillJson = async (route: Route, payload: unknown, status = 200) => {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'access-control-expose-headers': 'content-range',
      vary: 'origin',
    },
    body: JSON.stringify(payload),
  });
};

const wantsObject = (route: Route) =>
  Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'));

test.describe('/leaderboard — Rankings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const asObject = wantsObject(route);

      if (method === 'OPTIONS') {
        const origin = request.headers()['origin'] ?? 'http://localhost:5173';
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

      if (url.pathname.startsWith('/rest/v1/leaderboard')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      await fulfillJson(route, asObject ? null : []);
    });

    await page.route('**/auth/v1/**', async (route) => {
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

      await fulfillJson(route, {});
    });
  });

  test('loads without auth', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible({ timeout: 15_000 });
  });

  test('shows table column headers', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('columnheader', { name: 'Rank' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Level' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'XP' })).toBeVisible();
  });

  test('shows empty state gracefully when no data', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible({ timeout: 15_000 });
    const hasRows = (await page.locator('tbody tr').count()) > 0;
    const hasEmptyState = await page
      .getByText(/no one on the leaderboard yet/i)
      .isVisible()
      .catch(() => false);
    expect(hasRows || hasEmptyState).toBeTruthy();
  });
});
