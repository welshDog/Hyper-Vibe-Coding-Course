import { test, expect, type Page, type Route } from '@playwright/test';

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
        broski_tokens: 10,
        avatar_url: null,
        created_at: '2026-07-01T12:00:00.000Z',
      };
      await fulfillJson(route, asObject ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const payload = {
        user_id: user.id,
        total_xp: 30,
        level: 1,
        streak_days: 1,
      };
      await fulfillJson(route, asObject ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/rifts')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/rpc/get_or_create_referral_code')) {
      await fulfillJson(route, 'REF-CODE');
      return;
    }

    if (url.pathname.startsWith('/rest/v1/referrals')) {
      if (method === 'HEAD') {
        await route.fulfill({
          status: 200,
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': '*',
            'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
            'access-control-expose-headers': 'content-range',
            'content-range': '0-0/0',
            vary: 'origin',
          },
          body: '',
        });
        return;
      }
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/enrollments')) {
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
      const completions = [{ module_id: 'mod-1' }];
      await fulfillJson(route, asObject ? completions[0] : completions);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/shop_purchases')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/pets')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    await fulfillJson(route, asObject ? null : []);
  });
};

test.describe('/dashboard — hv_modules read-side progress', () => {
  test('shows hv module progress when enrollments are empty', async ({ page }) => {
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
    await navigateClient(page, '/dashboard');

    await expect(
      page.getByText('Your quests will show up here — go pick a course! 🎯', { exact: true }),
    ).toHaveCount(0);
    await expect(page.getByText('1 of 12 modules complete', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /continue/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /continue/i })).toHaveAttribute('href', '/courses');
  });
});
