import { test, expect, type Route, type Page } from '@playwright/test';

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

const navigateClient = async (page: Page, path: string) => {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
};

const installSupabaseMocks = async (page: Page) => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'Password123',
    fullName: 'Test User',
  };

  await page.route('**/auth/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
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

    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh-token',
        user: {
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
        },
      });
      return;
    }

    if (url.pathname.startsWith('/auth/v1/user')) {
      await fulfillJson(route, {
        id: user.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: user.email,
        user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
      });
      return;
    }

    if (url.pathname.startsWith('/auth/v1/logout')) {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
          vary: 'origin',
        },
        body: '',
      });
      return;
    }

    await fulfillJson(route, {});
  });

  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const asObject = wantsObject(route);
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

    if (url.pathname.startsWith('/rest/v1/users')) {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: 'student',
        broski_tokens: 120,
        avatar_url: null,
        created_at: '2026-07-01T12:00:00.000Z',
      };
      await fulfillJson(route, asObject ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/enrollments')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/achievements')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/shop_purchases')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/discord_links')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/hv_modules')) {
      const modules = Array.from({ length: 12 }, (_, idx) => ({
        id: `mod-${idx + 1}`,
      }));
      await fulfillJson(route, asObject ? modules[0] : modules);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/module_completions')) {
      const completions = [
        { module_id: 'mod-1' },
        { module_id: 'mod-2' },
        { module_id: 'mod-3' },
      ];
      await fulfillJson(route, asObject ? completions[0] : completions);
      return;
    }

    await fulfillJson(route, asObject ? null : []);
  });
};

test.describe('/profile — hv_modules read-side progress', () => {
  test('shows module progress when legacy enrollments are empty', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await installSupabaseMocks(page);
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.getByRole('button', { name: "Let's GO →" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await navigateClient(page, '/profile');

    await expect(page.getByText('Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('3/12', { exact: true })).toBeVisible();
    await expect(page.getByText('0 of 12 modules complete', { exact: true })).toHaveCount(0);
    await expect(page.getByText('3 of 12 modules complete', { exact: true })).toBeVisible();
    await expect(page.getByText('Legacy course enrollments will show up here when you pick one. 🎯', { exact: true })).toBeVisible();
    await expect(page.getByText('Badges', { exact: true })).toBeVisible();
  });
});
