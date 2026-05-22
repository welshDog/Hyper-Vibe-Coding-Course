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

test.describe('Authentication', () => {
  const user = {
    email: 'test@example.com',
    password: 'Password123',
    fullName: 'Test User',
  };

  test('should allow a user to sign up', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await page.route('**/auth/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();

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

      if (url.pathname.startsWith('/auth/v1/signup')) {
        await fulfillJson(route, {
          user: {
            id: 'test-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: user.email,
            user_metadata: { full_name: user.fullName },
          },
          session: null,
        });
        return;
      }

      await fulfillJson(route, {});
    });

    // HaveIBeenPwned leaked-password check (lib/hibp.ts) — mock as "clean"
    // (empty range => password's hash suffix absent => 0 breaches) so signup
    // proceeds deterministically and offline. The form's password
    // ('Password123') is itself a known-breached string, so without this the
    // real HIBP call would block the signup.
    await page.route('https://api.pwnedpasswords.com/**', async (route) => {
      const request = route.request();
      const origin = request.headers()['origin'] ?? 'http://localhost:5173';
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*',
            'access-control-allow-methods': 'GET,OPTIONS',
            vary: 'origin',
          },
          body: '',
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        headers: { 'access-control-allow-origin': origin, vary: 'origin' },
        body: '',
      });
    });

    await page.goto('/register');
    
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    await expect(page.getByRole('heading', { name: 'Account live!' })).toBeVisible();
    await page.getByRole('button', { name: /Go to login/ }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow a user to sign in and sign out', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await page.route('**/auth/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();

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

      if (url.pathname.startsWith('/auth/v1/token')) {
        await fulfillJson(route, {
          access_token: 'fake-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: 'test-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: user.email,
            // onboarded_at present => Login routes to /dashboard, not /welcome
            // (the onboarding gate in Auth.tsx). This test covers a returning,
            // already-onboarded user.
            user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
          },
        });
        return;
      }

      if (url.pathname.startsWith('/auth/v1/user')) {
        await fulfillJson(route, {
          id: 'test-user-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
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

      if (url.pathname.startsWith('/rest/v1/users')) {
        const payload = {
          id: 'test-user-id',
          email: user.email,
          full_name: user.fullName,
          role: 'student',
          broski_tokens: 120,
          created_at: new Date().toISOString(),
        };
        await fulfillJson(route, asObject ? payload : [payload]);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/user_xp')) {
        const payload = {
          user_id: 'test-user-id',
          total_xp: 350,
          streak_days: 3,
        };
        await fulfillJson(route, asObject ? payload : [payload], method === 'POST' ? 201 : 200);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/rifts')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/enrollments')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/rpc/get_or_create_referral_code')) {
        await fulfillJson(route, 'REF-CODE');
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

      await fulfillJson(route, asObject ? null : []);
    });

    await page.goto('/login');
    
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    // Verify dashboard access
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();
    const hudBar = page.locator('div.z-50');
    await expect(hudBar.getByText('XP', { exact: true })).toBeVisible();
    await expect(hudBar.getByText('BROski$', { exact: true })).toBeVisible();

    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL('/');
    
    // Verify "Sign in" button is visible again
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});
