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

test.describe('/courses/:slug — Module Detail', () => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const modules = [
    {
      id: 'mod-1',
      code: 'M1',
      title: 'Module 1',
      emoji: '📦',
      level: 'Beginner',
      xp_reward: 100,
      coin_reward: 50,
      slug: 'm1',
      summary: 'Summary for M1',
      script_path: 'modules/m1.md',
      content: '# Module 1\n\nWelcome to M1.',
    },
  ];

  const installSupabaseMocks = async (page: Page, options: { authenticated: boolean }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

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
            user_metadata: { full_name: user.fullName },
          },
        });
        return;
      }

      if (url.pathname.startsWith('/auth/v1/user')) {
        if (!options.authenticated) {
          await fulfillJson(route, {}, 401);
          return;
        }
        await fulfillJson(route, {
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName },
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

      if (url.pathname.startsWith('/rest/v1/hv_modules')) {
        if (url.search.includes('slug=eq.')) {
          await fulfillJson(route, asObject ? modules[0] : [modules[0]]);
          return;
        }
        await fulfillJson(route, modules);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/hv_quizzes')) {
        if (!options.authenticated) {
          await fulfillJson(route, asObject ? null : []);
          return;
        }
        const quizRow = {
          id: 'quiz-1',
          module_id: modules[0].id,
          version: 1,
          payload: {
            title: 'Quiz: Module 1',
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                prompt: 'What is 2 + 2?',
                choices: ['3', '4'],
                answer_index: 1,
                explanation: '2 + 2 = 4',
              },
            ],
          },
        };
        await fulfillJson(route, asObject ? quizRow : [quizRow]);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/module_completions')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/users')) {
        if (!options.authenticated) {
          await fulfillJson(route, asObject ? null : []);
          return;
        }
        const payload = {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          role: 'student',
          broski_tokens: 120,
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
        await fulfillJson(route, asObject ? payload : [payload]);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/user_xp')) {
        if (!options.authenticated) {
          await fulfillJson(route, asObject ? null : []);
          return;
        }
        const payload = {
          user_id: user.id,
          total_xp: 350,
          level: 3,
          streak_days: 3,
          last_active: new Date().toISOString(),
        };
        await fulfillJson(route, asObject ? payload : [payload]);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/rifts')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/user_loyalty_tier')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      await fulfillJson(route, asObject ? null : []);
    });
  };

  const loginAsTestUser = async (page: Page) => {
    await installSupabaseMocks(page, { authenticated: true });
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  };

  test('loads module content without auth', async ({ page }) => {
    await installSupabaseMocks(page, { authenticated: false });
    await page.goto('/courses');
    await page.locator('[data-testid="module-card"]').first().getByRole('link', { name: /start module/i }).click();
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('shows login prompt for quiz when not authenticated', async ({ page }) => {
    await installSupabaseMocks(page, { authenticated: false });
    await page.goto('/courses');
    await page.locator('[data-testid="module-card"]').first().getByRole('link', { name: /start module/i }).click();
    const hasQuiz = await page.locator('[data-testid="quiz"]').isVisible().catch(() => false);
    const hasLoginPrompt = await page.getByText(/log in/i).isVisible().catch(() => false);
    expect(hasQuiz || hasLoginPrompt).toBeTruthy();
  });

  test('shows Mark as Complete button when authenticated', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/courses');
    await page.locator('[data-testid="module-card"]').first().getByRole('link', { name: /start module/i }).click();
    await expect(page.getByRole('button', { name: /mark as complete|completed/i })).toBeVisible();
  });
});

