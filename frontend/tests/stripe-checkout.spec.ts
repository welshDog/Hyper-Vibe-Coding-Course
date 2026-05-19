import { test, expect, type Route } from '@playwright/test';

/**
 * Stripe Path A regression — TokensPage "Buy" button → V2.4 → Stripe-hosted
 * checkout redirect. Closes the biggest gap surfaced in
 * STRIPE_INTEGRATION_REPORT_2026-05-20.md (zero automated coverage of any
 * Stripe path).
 *
 * Strategy: mock Supabase auth + REST so the user reaches /tokens authed,
 * mock V2.4's /api/stripe/checkout response, intercept the Stripe-hosted
 * page so the redirect lands somewhere we control. Assert two invariants:
 *   (1) the frontend POSTed the correct slug + user_id to V2.4
 *   (2) the browser was redirected to a checkout.stripe.com URL
 *
 * This is the only piece of "test stripe" that's terminal-automatable —
 * the 4242 4242 4242 4242 card test on the real Stripe-hosted page is a
 * human gate (see the report's § Manual E2E Test Runbook).
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
  const req = route.request();
  const origin = req.headers()['origin'] ?? 'http://localhost:5173';
  await route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': req.headers()['access-control-request-headers'] ?? '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: '',
  });
};

const wantsObject = (route: Route) =>
  Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'));

test.describe('Stripe checkout — token pack purchase (Path A)', () => {
  const user = {
    email: 'test@example.com',
    password: 'Password123',
    fullName: 'Test User',
  };

  test('TokensPage Buy button POSTs the slug to V2.4 and redirects to Stripe', async ({ page }) => {
    // NOTE: do NOT addInitScript localStorage.clear() — Playwright's per-test
    // context is already isolated, and addInitScript fires on every nav, so
    // it would wipe the Supabase session on page.goto('/tokens') below and
    // sign the user out before they reach the Buy button.

    // ── Supabase auth (returning user → /dashboard, not /welcome) ──
    await page.route('**/auth/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'OPTIONS') return corsPreflight(route);

      const buyer = {
        id: 'test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: user.email,
        user_metadata: {
          full_name: user.fullName,
          onboarded_at: '2026-01-01T00:00:00Z',
        },
      };

      if (url.pathname.startsWith('/auth/v1/token')) {
        return fulfillJson(route, {
          access_token: 'fake-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh-token',
          user: buyer,
        });
      }
      if (url.pathname.startsWith('/auth/v1/user')) return fulfillJson(route, buyer);
      return fulfillJson(route, {});
    });

    // ── Supabase REST ──
    await page.route('**/rest/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      if (method === 'OPTIONS') return corsPreflight(route);

      const asObject = wantsObject(route);

      if (url.pathname.startsWith('/rest/v1/users')) {
        const payload = {
          id: 'test-user-id',
          email: user.email,
          full_name: user.fullName,
          role: 'student',
          broski_tokens: 50,
          created_at: new Date().toISOString(),
        };
        return fulfillJson(route, asObject ? payload : [payload]);
      }
      if (url.pathname.startsWith('/rest/v1/rpc/get_or_create_referral_code')) {
        return fulfillJson(route, 'REF-CODE');
      }
      if (url.pathname.startsWith('/rest/v1/token_transactions')) {
        return fulfillJson(route, asObject ? null : []);
      }
      if (url.pathname.startsWith('/rest/v1/referrals') && method === 'HEAD') {
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
      return fulfillJson(route, asObject ? null : []);
    });

    // ── V2.4 /api/stripe/checkout (the thing we're guarding) ──
    let checkoutRequest: { price_id?: string; user_id?: string } | null = null;
    await page.route('**/api/stripe/checkout', async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') return corsPreflight(route);
      checkoutRequest = JSON.parse(request.postData() ?? '{}');
      return fulfillJson(route, {
        checkout_url:
          'https://checkout.stripe.com/c/pay/cs_test_FAKE_REGRESSION#fidkdWxOYHwnPyd1blpx',
        session_id: 'cs_test_FAKE_REGRESSION',
      });
    });

    // ── Intercept the Stripe-hosted page so navigation lands safely ──
    await page.route('https://checkout.stripe.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Stub Stripe checkout (test only)</body></html>',
      });
    });

    // Sign in
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

    // Navigate to TokensPage + click the Starter Pack "Buy" button
    await page.goto('/tokens');
    await expect(page.getByText('Starter Pack')).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: /Buy for £5/i }).click();

    // INVARIANT 1 — frontend POSTed the right slug + user_id to V2.4
    await expect
      .poll(() => checkoutRequest?.price_id, { timeout: 5_000 })
      .toBe('starter');
    expect(checkoutRequest?.user_id).toBe('test-user-id');

    // INVARIANT 2 — browser redirected to a Stripe-hosted checkout URL
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 5_000 });
  });
});
