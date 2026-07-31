import { test, expect, type Route, type Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Mock data ─────────────────────────────────────────────────────────────────

const user = {
  id: 'user-shop-test',
  email: 'shop@example.com',
  fullName: 'Shop Tester',
};

const ITEMS = {
  // Standard collectible — no consumable, no agent_access
  frame: {
    id: 'item-frame-1', name: 'Gold Frame', description: 'Gleaming gold frame.',
    category: 'frame', price_tokens: 500, price_gbp: null,
    is_available: true, metadata: {}, created_at: new Date().toISOString(),
  },
  // Consumable (re-buyable)
  food: {
    id: 'item-food-1', name: 'Energy Snack', description: 'Refuel your grind.',
    category: 'food', price_tokens: 50, price_gbp: null,
    is_available: true, metadata: { consumable: true }, created_at: new Date().toISOString(),
  },
  // Agent access — async provisioning
  agent: {
    id: 'item-agent-1', name: 'Sandbox Access', description: 'Full V2.4 sandbox.',
    category: 'agent_access', price_tokens: 300, price_gbp: 29.00,
    is_available: true, metadata: { type: 'agent_access', v24_tier: 'sandbox' },
    created_at: new Date().toISOString(),
  },
  // Pet cosmetic — equip on pet
  petAura: {
    id: 'item-aura-1', name: 'Fire Aura', description: 'Blazing aura.',
    category: 'pet_aura', price_tokens: 200, price_gbp: null,
    is_available: true, metadata: {}, created_at: new Date().toISOString(),
  },
  // Item with price_gbp for GBP rendering test
  withGbp: {
    id: 'item-gbp-1', name: 'Pro Pack', description: 'Bonus content pack.',
    category: 'bonus_content', price_tokens: 400, price_gbp: 9.99,
    is_available: true, metadata: { content_url: 'https://example.com/pack' },
    created_at: new Date().toISOString(),
  },
};

const ALL_ITEMS = Object.values(ITEMS);

// ── Auth + REST mock installer ────────────────────────────────────────────────

type MockOptions = {
  tier?: 'bronze' | 'silver' | 'gold' | 'hyper';
  balance?: number;
  purchases?: unknown[];
};

const installMocks = async (
  page: Page,
  getPurchases: () => unknown[],
  opts: MockOptions = {},
) => {
  const { tier = 'bronze', balance = 1000 } = opts;

  // Auth
  await page.route('**/auth/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';

    if (method === 'OPTIONS') { await corsOk(route); return; }

    if (url.pathname.startsWith('/auth/v1/token')) {
      await fulfillJson(route, {
        access_token: 'fake-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake-refresh',
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
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': origin }, body: '' });
      return;
    }
    await fulfillJson(route, {});
  });

  // REST
  await page.route('**/rest/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const asObj = wantsObject(route);

    if (method === 'OPTIONS') { await corsOk(route); return; }

    if (url.pathname.startsWith('/rest/v1/users')) {
      const payload = {
        id: user.id, email: user.email, full_name: user.fullName,
        role: 'student', broski_tokens: balance, avatar_url: null,
        created_at: new Date().toISOString(),
      };
      await fulfillJson(route, asObj ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const payload = { user_id: user.id, total_xp: 500, level: 4, streak_days: 2, last_active: new Date().toISOString() };
      await fulfillJson(route, asObj ? payload : [payload], method === 'POST' ? 201 : 200);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/shop_items')) {
      await fulfillJson(route, ALL_ITEMS);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
      const payload = { tier, lifetime_earned: tier === 'bronze' ? 0 : 2000 };
      await fulfillJson(route, asObj ? payload : [payload]);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/shop_purchases')) {
      const current = getPurchases();
      await fulfillJson(route, current);
      return;
    }

    // Navbar / HUD extras
    if (url.pathname.startsWith('/rest/v1/referrals')) {
      if (method === 'HEAD') {
        const origin = route.request().headers()['origin'] ?? 'http://localhost:5173';
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
    if (url.pathname.startsWith('/rest/v1/enrollments')) {
      await fulfillJson(route, asObj ? null : []);
      return;
    }
    if (url.pathname.startsWith('/rest/v1/module_completions')) {
      await fulfillJson(route, asObj ? null : []);
      return;
    }

    await fulfillJson(route, asObj ? null : []);
  });
};

const loginAndGoToShop = async (page: Page) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', 'Password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  // Navigate to shop via client-side routing
  await page.evaluate(() => {
    window.history.pushState({}, '', '/shop');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: /spend your tokens/i })).toBeVisible({ timeout: 15_000 });
};

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('BROski$ Shop', () => {

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.route('**/auth/v1/**', async (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      if (url.pathname.startsWith('/auth/v1/user')) { await fulfillJson(route, {}, 401); return; }
      await fulfillJson(route, {});
    });
    await page.route('**/rest/v1/**', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      await fulfillJson(route, wantsObject(route) ? null : []);
    });
    await page.goto('/shop');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('loads shop with item categories and balance', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'bronze', balance: 1000 });
    await loginAndGoToShop(page);

    // Balance shown in header
    await expect(page.getByTestId('shop-balance')).toContainText('1,000');
    // Category headings from the items
    await expect(page.getByRole('heading', { name: /Card Frames/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Snacks & Fuel/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Agent Access/i })).toBeVisible();
  });

  test('price_gbp renders when present; absent items show no GBP text', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { balance: 2000 });
    await loginAndGoToShop(page);

    // agent has price_gbp: 29.00
    await expect(page.getByText(/£29\.00/)).toBeVisible();
    // withGbp item: £9.99
    await expect(page.getByText(/£9\.99/)).toBeVisible();
    // frame: price_gbp null — no GBP text next to its price
    const frameSection = page.getByRole('heading', { name: /Card Frames/i });
    await expect(frameSection).toBeVisible();
    // Gold Frame shows token price but no GBP
    await expect(page.getByText('Gold Frame', { exact: true })).toBeVisible();
  });

  test('silver tier — discounted price and tier label shown', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'silver', balance: 2000 });
    await loginAndGoToShop(page);

    // frame: 500 tokens, silver −5% = 475
    await expect(page.getByText('475')).toBeVisible();
    // Tier label on header
    await expect(page.getByText(/−5% every buy/i)).toBeVisible();
  });

  test('gold tier discount — frame at −10%', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'gold', balance: 2000 });
    await loginAndGoToShop(page);

    // frame: 500 × 0.90 = floor(450)
    await expect(page.getByText('450')).toBeVisible();
    await expect(page.getByText(/−10% every buy/i)).toBeVisible();
  });

  test('insufficient funds — buy button disabled', async ({ page }) => {
    let purchases: unknown[] = [];
    // balance 10, frame costs 500
    await installMocks(page, () => purchases, { tier: 'bronze', balance: 10 });
    await loginAndGoToShop(page);

    const frameCard = page.getByText('Gold Frame').locator('../..').locator('..');
    await expect(page.getByTitle(/Need \d+ more BROski\$/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('buy → confirm modal opens with correct price → cancel → no purchase', async ({ page }) => {
    let purchaseCalled = false;
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'bronze', balance: 2000 });

    // Edge function should NOT be called
    await page.route('**/functions/v1/shop-purchase', async (route) => {
      purchaseCalled = true;
      await fulfillJson(route, { success: false, error: 'Should not be called' });
    });

    await loginAndGoToShop(page);

    // Click "Buy →" for Gold Frame
    await page.getByLabel('Buy Gold Frame').click();

    // Confirm modal appears
    await expect(page.getByRole('dialog', { name: /Confirm purchase of Gold Frame/i })).toBeVisible();
    await expect(page.getByText(/Buy "Gold Frame"/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /spend 🪙 500/i })).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).not.toBeVisible({ timeout: 5_000 });
    expect(purchaseCalled).toBe(false);
  });

  test('buy standard collectible (frame) → success notification → card shows fulfillment block', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'bronze', balance: 2000 });

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      purchases = [{
        id: 'purchase-1', item_id: ITEMS.frame.id,
        spent_tokens: 500, purchased_at: new Date().toISOString(),
        fulfillment_metadata: null,
      }];
      await fulfillJson(route, {
        success: true,
        item_name: 'Gold Frame',
        spent_tokens: 500,
        new_balance: 1500,
      });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Gold Frame').click();
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    await page.getByRole('button', { name: /spend 🪙 500/i }).click();

    // Success notification
    await expect(page.getByTestId('shop-notification')).toContainText(/NICE ONE BROski/i, { timeout: 10_000 });
    // Card now shows fulfillment block — "Added to your collection"
    await expect(page.getByText(/Added to your collection/i)).toBeVisible({ timeout: 10_000 });
    // "Buy →" button should be gone (owned non-consumable)
    await expect(page.getByLabel('Buy Gold Frame')).not.toBeVisible();
  });

  test('buy pet cosmetic → shows "Equip on your BROskiPet" fulfillment', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { balance: 2000 });

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      purchases = [{
        id: 'purchase-aura', item_id: ITEMS.petAura.id,
        spent_tokens: 200, purchased_at: new Date().toISOString(),
        fulfillment_metadata: null,
      }];
      await fulfillJson(route, { success: true, item_name: 'Fire Aura', spent_tokens: 200, new_balance: 800 });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Fire Aura').click();
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    await page.getByRole('button', { name: /spend/i }).click();

    await expect(page.getByText(/Equip on your BROskiPet/i)).toBeVisible({ timeout: 10_000 });
  });

  test('buy consumable (food) → buy again still available → count increments', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { balance: 2000 });

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      purchases = [
        ...purchases,
        {
          id: `purchase-food-${Date.now()}`, item_id: ITEMS.food.id,
          spent_tokens: 50, purchased_at: new Date().toISOString(),
          fulfillment_metadata: null,
        },
      ];
      await fulfillJson(route, { success: true, item_name: 'Energy Snack', spent_tokens: 50, new_balance: 1950 });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Energy Snack').click();
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    await page.getByRole('button', { name: /spend 🪙 50/i }).click();

    // Consumable: success notification
    await expect(page.getByTestId('shop-notification')).toContainText(/stocked up on Energy Snack/i, { timeout: 10_000 });

    // "Buy again →" button still present (NOT locked to "Owned")
    await expect(page.getByLabel('Buy Energy Snack')).toBeVisible({ timeout: 10_000 });
    // Count badge shows "1 owned"
    await expect(page.getByText(/1 owned/i)).toBeVisible();
    // Buy again → button shows "Buy again →"
    await expect(page.getByLabel('Buy Energy Snack')).toContainText(/buy again/i);
  });

  test('edge function error → error notification shown', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { balance: 2000 });

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      await fulfillJson(route, {
        success: false,
        error: "Couldn't complete that purchase — your 500 BROski$ have been refunded. Give it another go.",
      });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Gold Frame').click();
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    await page.getByRole('button', { name: /spend 🪙 500/i }).click();

    await expect(page.getByTestId('shop-notification')).toContainText(/refunded/i, { timeout: 10_000 });
    // Card should still show the buy button (not owned)
    await expect(page.getByLabel('Buy Gold Frame')).toBeVisible();
  });

  test('server applies tier discount — spent_tokens reflects server charge', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { tier: 'gold', balance: 2000 });

    let invokedBody: Record<string, unknown> = {};

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      const raw = route.request().postData();
      invokedBody = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
      purchases = [{
        id: 'purchase-frame-gold', item_id: ITEMS.frame.id,
        spent_tokens: 450, purchased_at: new Date().toISOString(),
        fulfillment_metadata: null,
      }];
      // Server charges 450 (500 × 0.90), not 500
      await fulfillJson(route, { success: true, item_name: 'Gold Frame', spent_tokens: 450, new_balance: 1550 });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Gold Frame').click();

    // Confirm modal shows discounted price
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    await expect(page.getByText(/gold tier −10%/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /spend 🪙 450/i })).toBeVisible();

    await page.getByRole('button', { name: /spend 🪙 450/i }).click();

    // Wait for notification (confirms route handler has completed)
    await expect(page.getByTestId('shop-notification')).toContainText(/-450/i, { timeout: 10_000 });
    // Edge function received the correct item_id (discount is server-side)
    expect(invokedBody.item_id).toBe(ITEMS.frame.id);
  });

  test('agent access buy → provision pending spinner shown', async ({ page }) => {
    let purchases: unknown[] = [];
    await installMocks(page, () => purchases, { balance: 2000 });

    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      purchases = [{
        id: 'purchase-agent-1', item_id: ITEMS.agent.id,
        spent_tokens: 300, purchased_at: new Date().toISOString(),
        fulfillment_metadata: { provision_status: 'pending' },
      }];
      await fulfillJson(route, {
        success: true,
        item_name: 'Sandbox Access',
        spent_tokens: 300,
        new_balance: 1700,
        agent_access_pending: true,
      });
    });

    await loginAndGoToShop(page);
    await page.getByLabel('Buy Sandbox Access').click();
    // Named filter — the pet mentor bubble (mounted globally across the
    // course chrome since commit eaa86e7) has its own "Chat with X" dialog
    // that can coexist with this one, making a bare getByRole('dialog')
    // ambiguous (strict-mode violation).
    await expect(page.getByRole('dialog', { name: /^confirm purchase/i })).toBeVisible();
    // Modal shows £29.00 GBP price
    await expect(page.getByText(/£29\.00/)).toBeVisible();
    await page.getByRole('button', { name: /spend 🪙 300/i }).click();

    // Notification confirms agent access queued
    await expect(page.getByTestId('shop-notification')).toContainText(/Agent access queued/i, { timeout: 10_000 });
    // Pending spinner shown in fulfillment block
    await expect(page.getByText(/Spinning up your sandbox/i)).toBeVisible({ timeout: 10_000 });
  });

  test('agent access polling — pending transitions to provisioned on next fetch', async ({ page }) => {
    let pollCount = 0;
    const pendingPurchase = {
      id: 'purchase-agent-poll', item_id: ITEMS.agent.id,
      spent_tokens: 300, purchased_at: new Date().toISOString(),
      fulfillment_metadata: { provision_status: 'pending' },
    };
    const provisionedPurchase = {
      ...pendingPurchase,
      fulfillment_metadata: {
        provision_status: 'provisioned',
        mission_control_url: 'https://mc.hypercode.zone/access/abc123',
        api_key_hint: 'hc_…xyz9',
        expires_at: '2027-06-09T00:00:00Z',
      },
    };

    // Start with pending purchase already in the DB
    const getPurchases = () => {
      pollCount++;
      if (pollCount <= 2) return [pendingPurchase];
      return [provisionedPurchase];
    };

    await installMocks(page, getPurchases, { balance: 2000 });
    // No buy needed — purchase pre-exists in mock
    await page.route('**/functions/v1/shop-purchase', async (route) => {
      if (route.request().method() === 'OPTIONS') { await corsOk(route); return; }
      await fulfillJson(route, { success: false, error: 'should not be called in this test' });
    });

    await page.clock.install();
    await loginAndGoToShop(page);

    // Initially shows pending spinner
    await expect(page.getByText(/Spinning up your sandbox/i)).toBeVisible({ timeout: 10_000 });

    // Advance clock past the 6s poll interval (twice to get past pollCount ≤ 2)
    await page.clock.fastForward(6_001);
    await page.clock.fastForward(6_001);

    // Should now show "Open Mission Control" link
    await expect(page.getByRole('link', { name: /Open Mission Control/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/hc_…xyz9/i)).toBeVisible();
  });

});
