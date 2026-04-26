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

    await page.goto('/courses');
    
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

    await page.goto('/courses');
    
    // Click on the first course
    await page.getByRole('link', { name: 'Intro to Programming' }).click();

    // Assert redirection to detail page
    await expect(page).toHaveURL(/\/courses\/1/);
    
    // Check details
    await expect(page.locator('h1')).toHaveText('Intro to Programming');
    await expect(page.locator('text=Lesson 1')).toBeVisible();
    await expect(page.locator('text=Lesson 2')).toBeVisible();
    
    // Check enroll button exists (assuming not logged in)
    await expect(page.getByRole('button', { name: 'Enroll — £29.99' })).toBeVisible();
  });
});
