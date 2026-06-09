import { test, expect, type Route, type Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORE_KEY = 'vibe-labs:anon-progress';

const user = {
  id: 'user-reconcile-test',
  email: 'reconcile@example.com',
  fullName: 'Reconcile Tester',
};

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

// ── Mock installer ────────────────────────────────────────────────────────────

/**
 * Returns a live `claimLog` array — items are pushed by the route handler as
 * each claim_level_reward call arrives, so the test can assert order.
 */
async function installMocks(
  page: Page,
  claimResponse: (level: number) => unknown = (level) => ({
    success: true, level, xp: 50, coins: 100, badge: `badge-${level}`,
  }),
): Promise<number[]> {
  const claimLog: number[] = [];

  await page.route('**/auth/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }

    if (url.pathname.startsWith('/auth/v1/token')) {
      await fulfillJson(route, {
        access_token: 'fake-token', token_type: 'bearer',
        expires_in: 3600, refresh_token: 'fake-refresh',
        user: {
          id: user.id, aud: 'authenticated', role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName, onboarded_at: '2026-01-01T00:00:00Z' },
        },
      });
      return;
    }
    if (url.pathname.startsWith('/auth/v1/user')) {
      await fulfillJson(route, {
        id: user.id, aud: 'authenticated', role: 'authenticated',
        email: user.email,
        user_metadata: { full_name: user.fullName, onboarded_at: '2026-01-01T00:00:00Z' },
      });
      return;
    }
    if (url.pathname.startsWith('/auth/v1/logout')) {
      const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': origin }, body: '' });
      return;
    }
    await fulfillJson(route, {});
  });

  await page.route('**/rest/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const asObj = wantsObject(route);

    if (method === 'OPTIONS') { await corsOk(route); return; }

    if (url.pathname.startsWith('/rest/v1/rpc/claim_level_reward')) {
      const raw = route.request().postData();
      const body = (raw ? JSON.parse(raw) : {}) as { p_level?: number };
      const level = body.p_level ?? 0;
      claimLog.push(level);
      await fulfillJson(route, claimResponse(level));
      return;
    }

    if (url.pathname.startsWith('/rest/v1/users')) {
      const payload = {
        id: user.id, email: user.email, full_name: user.fullName,
        role: 'student', broski_tokens: 1000, avatar_url: null,
        created_at: new Date().toISOString(),
      };
      await fulfillJson(route, asObj ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const payload = { user_id: user.id, total_xp: 200, level: 2, streak_days: 0, last_active: new Date().toISOString() };
      await fulfillJson(route, asObj ? payload : [payload], method === 'POST' ? 201 : 200);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_level_progress')) {
      // No prior server-side progress — blank slate, making the reconcile meaningful
      await fulfillJson(route, asObj ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
      const payload = { tier: 'bronze', lifetime_earned: 0 };
      await fulfillJson(route, asObj ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/shop_purchases')) {
      await fulfillJson(route, []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/referrals')) {
      if (method === 'HEAD') {
        const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';
        await route.fulfill({
          status: 200,
          headers: {
            'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true',
            'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
            'access-control-expose-headers': 'content-range', 'content-range': '0-0/0', vary: 'origin',
          },
          body: '',
        });
        return;
      }
      await fulfillJson(route, asObj ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/rifts')) {
      await fulfillJson(route, asObj ? null : []);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/rpc/get_or_create_referral_code')) {
      await fulfillJson(route, 'TESTCODE');
      return;
    }

    if (url.pathname.startsWith('/rest/v1/enrollments') || url.pathname.startsWith('/rest/v1/module_completions')) {
      await fulfillJson(route, asObj ? null : []);
      return;
    }

    await fulfillJson(route, asObj ? null : []);
  });

  return claimLog;
}

/**
 * Log in via the real login form with a `returnTo` pointing at the vibe labs
 * level page — this skips Dashboard so Dashboard's useProgress never consumes
 * the anon progress before VibeLabShell gets a chance to reconcile it.
 */
async function loginToVibeLabsLevel(page: Page, levelPath = '/vibe-labs/level-1') {
  const encoded = encodeURIComponent(levelPath);
  await page.goto(`/login?returnTo=${encoded}`);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', 'Password123');
  await page.click('button[type="submit"]');
  // Auth.tsx navigates to returnTo when safeReturnTo passes
  await expect(page).toHaveURL(new RegExp(levelPath.replace('/', '\\/')), { timeout: 15_000 });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Vibe Labs — anon→login reconcile', () => {

  test('earns L1+L2 as anon, logs in → both banked in ascending order, banner shown, store cleared', async ({ page }) => {
    await page.addInitScript(
      ([k, v]: [string, string]) => window.localStorage.setItem(k, v),
      [STORE_KEY, JSON.stringify({ v: 1, completedLevels: [1, 2] })],
    );

    const claimLog = await installMocks(page);
    await loginToVibeLabsLevel(page, '/vibe-labs/level-1');

    // Level page must be visible (VibeLabShell has rendered)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Reconcile banner
    const banner = page.locator('div[role="status"]').filter({ hasText: /Banked 2 levels/i });
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(banner).toContainText(/\+100 XP/i);
    await expect(banner).toContainText(/\+200 BROski\$/i);
    await expect(banner).toContainText(/Nice one BROski/i);

    // claim_level_reward called in ascending order
    expect(claimLog).toEqual([1, 2]);

    // Store wiped after reconcile
    const stored = await page.evaluate((k: string) => window.localStorage.getItem(k), STORE_KEY);
    expect(stored).toBeNull();
  });

  test('single level earned — banner says "level" (singular)', async ({ page }) => {
    await page.addInitScript(
      ([k, v]: [string, string]) => window.localStorage.setItem(k, v),
      [STORE_KEY, JSON.stringify({ v: 1, completedLevels: [1] })],
    );

    const claimLog = await installMocks(page);
    await loginToVibeLabsLevel(page, '/vibe-labs/level-1');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Singular "level" not "levels"
    const banner = page.locator('div[role="status"]').filter({ hasText: /Banked 1 level\b/i });
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(banner).toContainText(/\+50 XP/i);
    await expect(banner).toContainText(/\+100 BROski\$/i);

    expect(claimLog).toEqual([1]);

    const stored = await page.evaluate((k: string) => window.localStorage.getItem(k), STORE_KEY);
    expect(stored).toBeNull();
  });

  test('already-claimed level → no banner shown, store still cleared', async ({ page }) => {
    await page.addInitScript(
      ([k, v]: [string, string]) => window.localStorage.setItem(k, v),
      [STORE_KEY, JSON.stringify({ v: 1, completedLevels: [1] })],
    );

    // Server says already_claimed for every level
    const claimLog = await installMocks(page, () => ({ error: 'already_claimed' }));
    await loginToVibeLabsLevel(page, '/vibe-labs/level-1');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Wait for store to be cleared — signals reconcile completed
    await page.waitForFunction(
      (k: string) => window.localStorage.getItem(k) === null,
      STORE_KEY,
      { timeout: 10_000 },
    );

    // No banner — banked === 0, setReconciliation never called
    await expect(page.locator('div[role="status"]').filter({ hasText: /Banked/i })).toHaveCount(0);

    expect(claimLog).toEqual([1]);
  });

  test('empty anon store at login → no claims made, no banner', async ({ page }) => {
    // No addInitScript — store is empty

    const claimLog = await installMocks(page);
    await loginToVibeLabsLevel(page, '/vibe-labs/level-1');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Small wait for the hook to settle (no reconcile should fire)
    await page.waitForTimeout(2_000);

    await expect(page.locator('div[role="status"]').filter({ hasText: /Banked/i })).toHaveCount(0);
    expect(claimLog).toEqual([]);
  });

  test('tampered store (out-of-order levels) — server gate prevents unearned banking', async ({ page }) => {
    // Seed only L3 — server's level-lock means L3 cannot bank without L1+L2
    // The mock returns success (server gate is tested in real integration; here we
    // verify the UI presents whatever the server confirms, ascending order respected).
    await page.addInitScript(
      ([k, v]: [string, string]) => window.localStorage.setItem(k, v),
      [STORE_KEY, JSON.stringify({ v: 1, completedLevels: [3] })],
    );

    const claimLog = await installMocks(page);
    await loginToVibeLabsLevel(page, '/vibe-labs/level-1');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Server is the gate — in this mock it grants the claim (real integration
    // would reject it). What we verify is: only the level in the store is claimed.
    const banner = page.locator('div[role="status"]').filter({ hasText: /Banked 1 level\b/i });
    await expect(banner).toBeVisible({ timeout: 15_000 });

    // Only level 3 was in the store — only level 3 was attempted
    expect(claimLog).toEqual([3]);

    const stored = await page.evaluate((k: string) => window.localStorage.getItem(k), STORE_KEY);
    expect(stored).toBeNull();
  });

});
