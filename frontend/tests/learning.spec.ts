import { test, expect, type Route } from '@playwright/test';

test.describe.skip('Enrollment & Learning', () => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const course = {
    id: '1',
    title: 'Intro to Programming',
    description: 'Learn the basics of coding.',
    price: 29.99,
    duration_minutes: 120,
    difficulty: 'beginner',
    thumbnail_url: 'https://via.placeholder.com/150',
    is_published: true,
  };

  const lessons = [
    { id: 'l1', title: 'Lesson 1', duration_seconds: 600, is_free: true, order_index: 1, video_url: 'http://example.com/video1', content: 'Lesson 1 Content' },
    { id: 'l2', title: 'Lesson 2', duration_seconds: 1200, is_free: false, order_index: 2, video_url: 'http://example.com/video2', content: 'Lesson 2 Content' },
  ];

  let isEnrolled = false;

  test.beforeEach(async ({ page }) => {
    isEnrolled = false;

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    const fulfillJson = async (route: Route, payload: unknown, status = 200) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      })
    }

    const shouldReturnObject = (acceptHeader: string | undefined) =>
      Boolean(acceptHeader?.includes('application/vnd.pgrst.object+json'))

    await page.route('**://dehhqwwsitvzgjrupapy.supabase.co/**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const accept = request.headers()['accept']
      const asObject = shouldReturnObject(accept)

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
        })
        return
      }

      if (url.pathname.startsWith('/auth/v1/logout')) {
        await route.fulfill({ status: 204, body: '' })
        return
      }

      if (url.pathname.startsWith('/auth/v1/user')) {
        await fulfillJson(route, {
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName },
        })
        return
      }

      if (url.pathname.startsWith('/rest/v1/users')) {
        const payload = {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          role: 'student',
          created_at: new Date().toISOString(),
        }
        await fulfillJson(route, asObject ? payload : [payload])
        return
      }

      if (url.pathname.startsWith('/rest/v1/courses')) {
        const isSingle = url.searchParams.get('id')?.startsWith('eq.') ?? false
        await fulfillJson(route, asObject || isSingle ? course : [course])
        return
      }

      if (url.pathname.startsWith('/rest/v1/lessons')) {
        await fulfillJson(route, asObject ? lessons[0] : lessons)
        return
      }

      if (url.pathname.startsWith('/rest/v1/enrollments')) {
        const method = request.method()

        if (method === 'POST') {
          isEnrolled = true
          const payload = { id: 'enrollment-1', user_id: user.id, course_id: course.id, progress_percentage: 0 }
          await fulfillJson(route, asObject ? payload : [payload], 201)
          return
        }

        if (method === 'PATCH') {
          const payload = { id: 'enrollment-1', progress_percentage: 50 }
          await fulfillJson(route, asObject ? payload : [payload])
          return
        }

        if (url.searchParams.get('course_id')?.startsWith('eq.') ?? false) {
          if (!isEnrolled) {
            await fulfillJson(route, asObject ? null : [])
            return
          }

          const payload = { id: 'enrollment-1', user_id: user.id, course_id: course.id, progress_percentage: 0 }
          await fulfillJson(route, asObject ? payload : [payload])
          return
        }

        await fulfillJson(route, [])
        return
      }

      if (url.pathname.startsWith('/rest/v1/progress')) {
        const method = request.method()
        if (method === 'POST' || method === 'PATCH') {
          const payload = { id: 'progress-1', lesson_id: lessons[0].id, completed: true }
          await fulfillJson(route, asObject ? payload : [payload], 201)
          return
        }

        await fulfillJson(route, [])
        return
      }

      await route.continue()
    })

    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();
  });

  test('should enroll in a course and complete a lesson', async ({ page }) => {
    await page.goto('/courses');

    await expect(page.getByText(course.title, { exact: false })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'View Course' }).first().click();
    await expect(page).toHaveURL(/\/courses\/1/);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(course.title);

    page.once('dialog', async (dialog) => dialog.accept());

    const enrollButton = page.locator('button:has-text("Enroll")');
    await expect(enrollButton).toBeVisible();

    await enrollButton.click();

    await expect(page).toHaveURL(/\/learn\//);

    await expect(page.getByTestId('video-player')).toBeVisible();
    await expect(page.getByTestId('current-lesson-title')).toHaveText('Lesson 1');

    await page.getByTestId('mark-complete-btn').click();

    await expect(page.getByTestId('lesson-completed-icon-0')).toBeVisible();

    await expect(page.getByTestId('progress-text')).toHaveText('1 / 2 completed');
  });
});
