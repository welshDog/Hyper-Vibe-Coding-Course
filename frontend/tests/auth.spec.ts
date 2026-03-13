import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const user = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
  };

  test('should allow a user to sign up', async ({ page }) => {
    // Mock the sign-up response
    await page.route('**/auth/v1/signup', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: user.email,
            user_metadata: { full_name: user.fullName },
          },
          session: null, 
        }),
      });
    });

    await page.goto('/register');
    
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    // Expect redirection to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow a user to sign in and sign out', async ({ page }) => {
    // Log all requests
    await page.route('**', async (route) => {
        console.log('Request:', route.request().url());
        await route.continue();
    });

    // Mock the sign-in response
    await page.route('**/auth/v1/**', async (route) => {
      console.log('Intercepted:', route.request().url(), route.request().method());
      
      if (route.request().url().includes('token')) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              access_token: 'fake-jwt-token',
              token_type: 'bearer',
              expires_in: 3600,
              refresh_token: 'fake-refresh-token',
              user: {
                id: 'test-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                email: user.email,
                user_metadata: { full_name: user.fullName },
                app_metadata: { provider: 'email' },
                created_at: new Date().toISOString(),
              },
            }),
          });
          return;
      }
      
      if (route.request().url().includes('logout')) {
           await route.fulfill({ status: 204 });
           return;
      }

      if (route.request().url().includes('user')) {
           // This handles auth/v1/user
           await route.fulfill({
            status: 200,
            body: JSON.stringify({
              id: 'test-user-id',
              aud: 'authenticated',
              role: 'authenticated',
              email: user.email,
              user_metadata: { full_name: user.fullName },
            }),
          });
          return;
      }

      await route.continue();
    });

    // Mock public.users table for profile
    await page.route('**/rest/v1/users*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          email: user.email,
          full_name: user.fullName,
          role: 'student',
          created_at: new Date().toISOString(),
        }), 
      });
    });

    // Mock user endpoint
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: { full_name: user.fullName },
        }),
      });
    });

    // Mock enrollments for dashboard
    await page.route('**/rest/v1/enrollments*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      });
    });

    await page.goto('/login');
    
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    
    await page.click('button[type="submit"]');

    // Verify dashboard access
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h2')).toContainText(`Welcome back, ${user.fullName.split(' ')[0]}!`);

    // Test Sign Out
    await page.route('**/auth/v1/logout', async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL('/');
    
    // Verify "Sign in" button is visible again
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});
