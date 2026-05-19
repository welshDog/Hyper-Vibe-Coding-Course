import { test, expect, type Route } from '@playwright/test';

/**
 * P0 regression — "Dashboard + Courses infinite loading" (snapshot 2026-05-19).
 *
 * Root cause: auth.ts ran `await applySession()` (a Supabase `from('users')`
 * query) directly inside the `onAuthStateChange` callback. Supabase v2 holds
 * an internal auth lock for that callback, so the awaited DB call deadlocked
 * → applySession's `finally` never ran → store `loading` stuck `true` →
 * App.tsx's store-loading-gated PrivateRoute showed "Loading..." forever.
 *
 * Fix: defer applySession off the callback (release the lock first) + a
 * watchdog so `loading` can never stick `true` if the profile fetch hangs.
 *
 * This test makes the profile fetch (`/rest/v1/users`) hang forever. The
 * invariant: the app MUST escape the global loading gate within the watchdog
 * window (it lands on /login) instead of infinite-loading. Pre-fix this hangs
 * until the Playwright timeout and fails; post-fix it settles in ~8-10s.
 */

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

const corsPreflight = async (route: Route) => {
  const request = route.request();
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
};

test.describe('P0 regression — auth never infinite-loads', () => {
  const user = { email: 'test@example.com', password: 'Password123', fullName: 'Test User' };

  test('a hung profile fetch must NOT trap the app on the global loader', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await page.route('**/auth/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'OPTIONS') {
        await corsPreflight(route);
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
            user_metadata: { full_name: user.fullName },
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
          user_metadata: { full_name: user.fullName },
        });
        return;
      }

      await fulfillJson(route, {});
    });

    await page.route('**/rest/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'OPTIONS') {
        await corsPreflight(route);
        return;
      }

      // The deadlock surface: the profile lookup hangs forever. Pre-fix this
      // wedged store `loading` at true permanently. Never fulfill it.
      if (url.pathname.startsWith('/rest/v1/users')) {
        await new Promise(() => {});
        return;
      }

      await fulfillJson(route, []);
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // INVARIANT: a real session + a hung profile fetch must resolve to the
    // login redirect (loading released, no usable profile) within the
    // watchdog window — NOT an infinite global loader. The watchdog is
    // PROFILE_LOAD_TIMEOUT_MS (8s) + buffer for build/route latency.
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

    // And it must NOT be parked on the global loading text.
    await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
  });
});
