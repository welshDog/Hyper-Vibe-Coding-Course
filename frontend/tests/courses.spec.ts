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

test.describe('Course Browsing & Details', () => {
  const courses = [
    {
      id: '1',
      title: 'Intro to Programming',
      description: 'Learn the basics of coding.',
      price_pence: 2999,
      duration_minutes: 120,
      difficulty: 'beginner',
      thumbnail_url: 'https://via.placeholder.com/150',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Advanced React',
      description: 'Master React hooks and patterns.',
      price_pence: 4999,
      duration_minutes: 240,
      difficulty: 'intermediate',
      thumbnail_url: 'https://via.placeholder.com/150',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  test('should display a list of courses', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.route('**/rest/v1/**', async (route) => {
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

      if (url.pathname.startsWith('/rest/v1/courses')) {
        const asObject = wantsObject(route);
        if (url.search.includes('id=eq.')) {
          await fulfillJson(route, asObject ? courses[0] : [courses[0]]);
          return;
        }
        await fulfillJson(route, courses);
        return;
      }

      await fulfillJson(route, wantsObject(route) ? null : []);
    });

    await page.goto('/catalog');
    
    await expect(page.locator('h1')).toHaveText('Course Catalog');
    
    await expect(page.getByText('Intro to Programming', { exact: false })).toBeVisible();
    await expect(page.getByText('£29.99', { exact: false })).toBeVisible();
  });

  test('should show course details when clicked', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.route('**/rest/v1/**', async (route) => {
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

      if (url.pathname.startsWith('/rest/v1/courses')) {
        const asObject = wantsObject(route);
        if (url.search.includes('id=eq.')) {
          await fulfillJson(route, asObject ? courses[0] : [courses[0]]);
          return;
        }
        await fulfillJson(route, courses);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/lessons')) {
        await fulfillJson(route, [
          {
            id: 'l1',
            title: 'Lesson 1',
            duration_seconds: 600,
            is_free: true,
            order_index: 1,
            course_id: '1',
          },
          {
            id: 'l2',
            title: 'Lesson 2',
            duration_seconds: 1200,
            is_free: false,
            order_index: 2,
            course_id: '1',
          },
        ]);
        return;
      }

      await fulfillJson(route, wantsObject(route) ? null : []);
    });

    await page.goto('/catalog');
    
    // Click on the first course
    await page.getByRole('link', { name: 'Intro to Programming' }).click();

    // Assert redirection to detail page
    await expect(page).toHaveURL(/\/catalog\/1/);
    
    // Check details
    await expect(page.locator('h1')).toHaveText('Intro to Programming');
    await expect(page.locator('text=Lesson 1')).toBeVisible();
    await expect(page.locator('text=Lesson 2')).toBeVisible();
    
    // Check enroll button exists (assuming not logged in)
    await expect(page.getByRole('button', { name: 'Enroll — £29.99' })).toBeVisible();
  });
});

test.describe('/courses — Module List Page', () => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const modules = Array.from({ length: 12 }, (_, idx) => {
    const n = idx + 1;
    return {
      id: `mod-${n}`,
      code: `M${n}`,
      title: `Module ${n}`,
      emoji: '📦',
      level: 'Beginner',
      xp_reward: 100,
      coin_reward: 50,
      slug: `m${n}`,
      summary: `Summary for M${n}`,
      script_path: `modules/m${n}.md`,
      content: `# Module ${n}\n\nWelcome to M${n}.`,
    };
  });

  const installSupabaseMocks = async (page: any, options: { authenticated: boolean }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await page.route('**/auth/v1/**', async (route: Route) => {
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

    await page.route('**/rest/v1/**', async (route: Route) => {
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
          const slug = decodeURIComponent((url.search.match(/slug=eq\.([^&]+)/)?.[1] ?? '').trim());
          const mod = modules.find((m) => m.slug === slug) ?? modules[0];
          await fulfillJson(route, asObject ? mod : [mod]);
          return;
        }
        await fulfillJson(route, modules);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/module_completions')) {
        if (!options.authenticated) {
          await fulfillJson(route, asObject ? null : []);
          return;
        }
        const payload = [{ id: 'mc-1', user_id: user.id, module_id: modules[0].id }];
        await fulfillJson(route, asObject ? payload[0] : payload);
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
        await fulfillJson(route, asObject ? payload : [payload], method === 'POST' ? 201 : 200);
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

  const loginAsTestUser = async (page: any) => {
    await installSupabaseMocks(page, { authenticated: true });
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  };

  test('loads course grid without auth', async ({ page }) => {
    await installSupabaseMocks(page, { authenticated: false });
    await page.goto('/courses');
    await expect(page.getByRole('heading', { name: /modules/i })).toBeVisible();
    await expect(page.locator('[data-testid="module-card"]').first()).toBeVisible();
  });

  test('shows M1 through M12 module codes', async ({ page }) => {
    await installSupabaseMocks(page, { authenticated: false });
    await page.goto('/courses');
    for (const code of ['M1', 'M2', 'M3', 'M12']) {
      await expect(page.getByText(code)).toBeVisible();
    }
  });

  test('Start Module button links to correct slug', async ({ page }) => {
    await installSupabaseMocks(page, { authenticated: false });
    await page.goto('/courses');
    const firstCard = page.locator('[data-testid="module-card"]').first();
    const link = firstCard.getByRole('link', { name: /start module/i });
    await expect(link).toHaveAttribute('href', /\/courses\//);
  });

  test('shows completion progress when authenticated', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/courses');
    await expect(page.getByText(/modules complete/i)).toBeVisible();
  });
});
