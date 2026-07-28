import { test, expect, type Route, type Page } from '@playwright/test';

const user = {
  id: 'referral-test-user',
  email: 'referral-test@example.com',
  password: 'Password123',
  fullName: 'Referral Test User',
};

const APP_ORIGIN = 'http://localhost:5173';
const REFERRAL_CODE = 'BROREF123';

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

const corsOk = async (route: Route) => {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';
  await route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': route.request().headers()['access-control-request-headers'] ?? '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: '',
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

async function installMocks(page: Page) {
  const referralBodies: Array<Record<string, unknown>> = [];

  await page.route('**/auth/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    if (method === 'OPTIONS') {
      await corsOk(route);
      return;
    }

    if (url.pathname.startsWith('/auth/v1/token')) {
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
          user_metadata: {
            full_name: user.fullName,
            onboarded_at: '2026-05-01T00:00:00.000Z',
          },
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
        user_metadata: {
          full_name: user.fullName,
          onboarded_at: '2026-05-01T00:00:00.000Z',
        },
      });
      return;
    }

    if (url.pathname.startsWith('/auth/v1/logout')) {
      const origin = request.headers()['origin'] ?? 'http://localhost:5173';
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

    if (method === 'OPTIONS') {
      await corsOk(route);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/rpc/get_or_create_referral_code')) {
      referralBodies.push(JSON.parse(request.postData() ?? '{}') as Record<string, unknown>);
      await fulfillJson(route, REFERRAL_CODE);
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

    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const payload = {
        user_id: user.id,
        total_xp: 350,
        level: 2,
        streak_days: 3,
      };
      await fulfillJson(route, asObject ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/enrollments')) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/referrals')) {
      if (method === 'HEAD') {
        const origin = request.headers()['origin'] ?? 'http://localhost:5173';
        await route.fulfill({
          status: 200,
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': '*',
            'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
            'access-control-expose-headers': 'content-range',
            'content-range': '0-0/1',
            vary: 'origin',
          },
          body: '',
        });
        return;
      }
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    if (
      url.pathname.startsWith('/rest/v1/user_loyalty_tier') ||
      url.pathname.startsWith('/rest/v1/shop_purchases') ||
      url.pathname.startsWith('/rest/v1/rifts')
    ) {
      await fulfillJson(route, asObject ? null : []);
      return;
    }

    await fulfillJson(route, asObject ? null : []);
  });

  return { referralBodies };
}

test.describe('Referral RPC', () => {
  test('uses the zero-argument referral RPC and keeps the same code across repeated signed-in reads', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    const { referralBodies } = await installMocks(page);

    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(`${APP_ORIGIN}/register?ref=${REFERRAL_CODE}`)).toBeVisible();

    await navigateClient(page, '/tokens');
    await expect(page).toHaveURL(/\/tokens/);
    await expect(page.getByText(`${APP_ORIGIN}/register?ref=${REFERRAL_CODE}`)).toBeVisible();

    expect(referralBodies.length).toBeGreaterThanOrEqual(2);
    expect(referralBodies).toEqual(
      referralBodies.map((body) => {
        expect(body).not.toHaveProperty('p_user_id');
        return {};
      }),
    );
  });
});
