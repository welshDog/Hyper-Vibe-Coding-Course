import { test, expect, type Route, type Page } from '@playwright/test';

// ── helpers ──────────────────────────────────────────────────────────────────
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

const navigateClient = async (page: Page, path: string) => {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
};

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Enrollment & Learning', () => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  // Price MUST be 0 — non-zero courses redirect to Stripe (tested separately)
  const course = {
    id: '1',
    title: 'Intro to Programming',
    description: 'Learn the basics of coding.',
    price_pence: 0,
    duration_minutes: 120,
    difficulty: 'beginner',
    thumbnail_url: 'https://via.placeholder.com/150',
    is_active: true,
  };

  const lessons = [
    {
      id: 'l1',
      title: 'Lesson 1',
      duration_seconds: 600,
      is_free: true,
      order_index: 1,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      content: 'Lesson 1 Content',
      course_id: '1',
    },
    {
      id: 'l2',
      title: 'Lesson 2',
      duration_seconds: 1200,
      is_free: false,
      order_index: 2,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      content: 'Lesson 2 Content',
      course_id: '1',
    },
  ];

  // Tracks server-side enrollment state across the test
  let isEnrolled = false;
  let completedQuestIds: string[] = [];
  let completedLessonIds: string[] = [];

  const quests = [
    { id: 'q-first-lesson', title: 'First Lesson' },
    { id: 'q-quiz-master', title: 'Quiz Master' },
    { id: 'q-course-complete', title: 'Course Complete' },
    { id: 'q-streak-5', title: '5-Day Streak' },
  ];

  test.beforeEach(async ({ page }) => {
    isEnrolled = false;
    completedQuestIds = [];
    completedLessonIds = [];

    const handleSupabaseRequest = async (route: Route) => {
      const request = route.request();
      const url = new URL(request.url());
      const asObject = wantsObject(route);
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

      // Auth: token exchange (login)
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
            // onboarded_at present => Login routes to /dashboard (the onboarding gate in Auth.tsx)
            user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
          },
        });
        return;
      }

      // Auth: logout
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

      // Auth: get user
      if (url.pathname.startsWith('/auth/v1/user')) {
        await fulfillJson(route, {
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName, onboarded_at: '2026-05-01T00:00:00.000Z' },
        });
        return;
      }

      // DB: users profile
      if (url.pathname.startsWith('/rest/v1/users')) {
        const payload = {
          id: user.id,
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
          user_id: user.id,
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

      // DB: courses
      if (url.pathname.startsWith('/rest/v1/courses')) {
        await fulfillJson(route, asObject ? course : [course]);
        return;
      }

      // DB: lessons
      if (url.pathname.startsWith('/rest/v1/lessons')) {
        await fulfillJson(route, asObject ? lessons[0] : lessons);
        return;
      }

      // DB: enrollments
      if (url.pathname.startsWith('/rest/v1/enrollments')) {
        const method = request.method();

        // Enrollment upsert (POST with on-conflict header)
        if (method === 'POST') {
          isEnrolled = true;
          const payload = {
            id: 'enrollment-1',
            user_id: user.id,
            course_id: course.id,
            progress_percentage: 0,
          };
          await fulfillJson(route, asObject ? payload : [payload], 201);
          return;
        }

        // Progress percentage update (PATCH)
        if (method === 'PATCH') {
          const payload = { id: 'enrollment-1', progress_percentage: 50 };
          await fulfillJson(route, asObject ? payload : [payload]);
          return;
        }

        // Enrollment check (GET with filters)
        const enrolled = isEnrolled;
        if (!enrolled) {
          await fulfillJson(route, asObject ? null : []);
          return;
        }
        const payload = {
          id: 'enrollment-1',
          user_id: user.id,
          course_id: course.id,
          progress_percentage: 0,
        };
        await fulfillJson(route, asObject ? payload : [payload]);
        return;
      }

      // DB: progress
      if (url.pathname.startsWith('/rest/v1/progress')) {
        if (method === 'POST') {
          const body = JSON.parse(request.postData() ?? '{}') as {
            lesson_id?: string;
            completed?: boolean;
          };
          if (body.lesson_id && body.completed === true && !completedLessonIds.includes(body.lesson_id)) {
            completedLessonIds.push(body.lesson_id);
          }
          const lessonId = body.lesson_id ?? lessons[0].id;
          await fulfillJson(
            route,
            asObject
              ? { id: 'progress-1', lesson_id: lessonId, completed: true }
              : [{ id: 'progress-1', lesson_id: lessonId, completed: true }],
            201,
          );
          return;
        }
        const payload = completedLessonIds.map((lessonId, idx) => ({
          id: `progress-${idx + 1}`,
          lesson_id: lessonId,
          completed: true,
        }));
        await fulfillJson(route, asObject ? payload[0] ?? null : payload);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/quests')) {
        await fulfillJson(route, asObject ? quests[0] : quests);
        return;
      }

      if (url.pathname.startsWith('/rest/v1/rpc/complete_quest')) {
        const payload = JSON.parse(request.postData() ?? '{}') as { p_quest_id?: string };
        const questId = payload.p_quest_id ?? '';
        const alreadyDone = completedQuestIds.includes(questId);
        if (!alreadyDone && questId) completedQuestIds.push(questId);
        await fulfillJson(route, alreadyDone ? { success: false, error: 'Quest already completed' } : { success: true });
        return;
      }

      if (url.pathname.startsWith('/rest/v1/')) {
        await fulfillJson(route, asObject ? null : []);
        return;
      }

      if (url.pathname.startsWith('/auth/v1/')) {
        await fulfillJson(route, {});
        return;
      }

      await route.continue();
    };

    await page.route('**/auth/v1/**', handleSupabaseRequest);
    await page.route('**/rest/v1/**', handleSupabaseRequest);

    await page.addInitScript(() => {
      if (window.sessionStorage.getItem('__e2e_localstorage_cleared__')) return;
      window.localStorage.clear();
      window.sessionStorage.setItem('__e2e_localstorage_cleared__', '1');
    });

    // ── Log in before each test ───────────────────────────────────────────
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();
  });

  test('should enroll in a free course and navigate to lesson player', async ({ page }) => {
    await navigateClient(page, '/catalog');

    // Wait for course card to appear
    await expect(page.getByText(course.title, { exact: false })).toBeVisible({ timeout: 15_000 });

    // Navigate to course detail
    await page.getByRole('button', { name: 'View →' }).first().click();
    await expect(page).toHaveURL(/\/catalog\/1/, { timeout: 10_000 });
    await expect(page.locator('h1')).toHaveText(course.title);

    // Enroll (free course → direct enrollment, no Stripe redirect).
    // A free course's CTA reads "Let's GO — free →" (paid courses say "Enroll — £x").
    const enrollButton = page.getByRole('button', { name: /let's go.*free/i });
    await expect(enrollButton).toBeVisible();
    await enrollButton.click();

    // Should navigate to lesson player
    await expect(page).toHaveURL(/\/learn\//, { timeout: 10_000 });
  });

  test('should display lesson player with correct content', async ({ page }) => {
    // Go directly to lesson player (simulate already-enrolled state)
    isEnrolled = true;
    await navigateClient(page, '/learn/1');

    await expect(page.getByTestId('lesson-player-container')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('course-title')).toHaveText(course.title);
    await expect(page.getByTestId('current-lesson-title')).toHaveText('Lesson 1');
    await expect(page.getByTestId('lesson-list')).toBeVisible();
  });

  test('should mark a lesson complete and update progress', async ({ page }) => {
    isEnrolled = true;
    await navigateClient(page, '/learn/1');

    await expect(page.getByTestId('mark-complete-btn')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('mark-complete-btn').click();

    // Completed icon appears for lesson 0
    await expect(page.getByTestId('lesson-completed-icon-0')).toBeVisible({ timeout: 5_000 });

    // Progress text updates
    await expect(page.getByTestId('progress-text')).toHaveText('1 / 2 completed');

    await expect.poll(() => completedQuestIds).toContain('q-first-lesson');
  });

  test('should award Course Complete quest when all lessons are completed', async ({ page }) => {
    isEnrolled = true;
    await navigateClient(page, '/learn/1');

    await expect(page.getByTestId('mark-complete-btn')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('mark-complete-btn').click();
    await expect.poll(() => completedQuestIds).toContain('q-first-lesson');

    await page.getByTestId('lesson-item-1').click();
    await expect(page.getByTestId('current-lesson-title')).toHaveText('Lesson 2', { timeout: 15_000 });

    await expect(page.getByTestId('mark-complete-btn')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('mark-complete-btn').click();

    await expect(page.getByTestId('lesson-completed-icon-1')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('progress-text')).toHaveText('2 / 2 completed');

    await expect.poll(() => completedQuestIds).toContain('q-course-complete');
  });

  test('should navigate between lessons', async ({ page }) => {
    isEnrolled = true;
    await navigateClient(page, '/learn/1');

    await expect(page.getByTestId('current-lesson-title')).toHaveText('Lesson 1', { timeout: 15_000 });

    // Previous button disabled on first lesson
    await expect(page.getByTestId('prev-lesson-btn')).toBeDisabled();

    // Go to next lesson
    await page.getByTestId('next-lesson-btn').click();
    await expect(page.getByTestId('current-lesson-title')).toHaveText('Lesson 2');

    // Now Previous is enabled, Next is disabled
    await expect(page.getByTestId('prev-lesson-btn')).not.toBeDisabled();
    await expect(page.getByTestId('next-lesson-btn')).toBeDisabled();
  });

  test('should redirect unenrolled user away from lesson player', async ({ page }) => {
    // isEnrolled stays false — enrollment check returns empty
    await navigateClient(page, '/learn/1');

    // LessonPlayer should redirect to course detail when not enrolled
    await expect(page).toHaveURL(/\/catalog\/1/, { timeout: 10_000 });
  });
});
