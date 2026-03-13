import { test, expect } from '@playwright/test';

test.describe('Course Browsing & Details', () => {
  const courses = [
    {
      id: '1',
      title: 'Intro to Programming',
      description: 'Learn the basics of coding.',
      price: 29.99,
      duration_minutes: 120,
      difficulty: 'beginner',
      thumbnail_url: 'https://via.placeholder.com/150',
      is_published: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Advanced React',
      description: 'Master React hooks and patterns.',
      price: 49.99,
      duration_minutes: 240,
      difficulty: 'intermediate',
      thumbnail_url: 'https://via.placeholder.com/150',
      is_published: true,
      created_at: new Date().toISOString(),
    },
  ];

  test('should display a list of courses', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Mock the courses response (list and detail)
    await page.route('**/courses*', async (route) => {
      // Check if it's an API request (not the page itself)
      if (route.request().headers()['accept']?.includes('application/json') || route.request().url().includes('rest/v1')) {
           const url = route.request().url();
           if (url.includes('id=eq.')) {
              await route.fulfill({
               status: 200,
               body: JSON.stringify(courses[0]), 
             });
           } else {
             await route.fulfill({
               status: 200,
               body: JSON.stringify(courses),
             });
           }
           return;
      }
      await route.continue();
    });

    await page.goto('/courses');
    
    await expect(page.locator('h1')).toHaveText('Course Catalog');
    
    const courseCards = page.locator('.grid > div');
    // Expect at least one course
    const count = await courseCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check first course has title and price
    await expect(courseCards.first().locator('h3, p.text-xl, .font-semibold').first()).toBeVisible();
    await expect(courseCards.first().locator('text=$')).toBeVisible();
  });

  test('should show course details when clicked', async ({ page }) => {
    // Mock the courses response (list and detail)
    await page.route('**/rest/v1/courses*', async (route) => {
        const url = route.request().url();
        if (url.includes('id=eq.')) {
           await route.fulfill({
            status: 200,
            body: JSON.stringify(courses[0]), 
          });
        } else {
          await route.fulfill({
            status: 200,
            body: JSON.stringify(courses),
          });
        }
    });

    // Mock lessons for course 1
    await page.route('**/rest/v1/lessons*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'l1', title: 'Lesson 1', duration_seconds: 600, is_free: true, order_index: 1 },
          { id: 'l2', title: 'Lesson 2', duration_seconds: 1200, is_free: false, order_index: 2 },
        ]),
      });
    });
    await page.goto('/courses');
    
    // Click on the first course
    await page.click('text=Intro to Programming'); // This might click the title or the link

    // Assert redirection to detail page
    await expect(page).toHaveURL(/\/courses\/1/);
    
    // Check details
    await expect(page.locator('h1')).toHaveText('Intro to Programming');
    await expect(page.locator('text=Lesson 1')).toBeVisible();
    await expect(page.locator('text=Lesson 2')).toBeVisible();
    
    // Check enroll button exists (assuming not logged in)
    await expect(page.locator('button:has-text("Enroll for $29.99")')).toBeVisible();
  });
});
