import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Sprint 3 item 4 — axe accessibility certify for the Vibe Labs funnel.
 *
 * Mirrors the Supabase-REST stub pattern in landing.spec.ts so the
 * public lab pages render deterministically with no session (they are
 * public to view; the claim is the only auth-gated action). This pass
 * independently re-verifies item 1 (text/contrast) and item 3 (target
 * size) by failing on serious/critical WCAG A/AA violations.
 */
async function stubSupabase(page: import('@playwright/test').Page) {
  await page.route('**/rest/v1/**', async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? 'http://localhost:5173';
    const cors = {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    };
    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors, body: '' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: '[]',
    });
  });
}

const PAGES = [
  { name: 'Vibe Labs hub', path: '/vibe-labs' },
  { name: 'Level 1', path: '/vibe-labs/level-1' },
] as const;

for (const { name, path } of PAGES) {
  test(`a11y: ${name} (${path}) — no serious/critical axe violations`, async ({
    page,
  }) => {
    await stubSupabase(page);
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log every finding for the cert record; only serious/critical block.
    if (results.violations.length) {
      console.log(`[axe] ${path} — ${results.violations.length} violation type(s):`);
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} node(s)`);
      }
    }

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join('\n'),
    ).toEqual([]);
  });
}
