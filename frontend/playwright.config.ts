import { defineConfig, devices } from '@playwright/test';

const isCI = process.env.CI === 'true' || process.env.CI === '1'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  /* Default assertion timeout. Generous on purpose: routes lazy-load heavy
   * chunks (web3, course content) and a single dev server feeds several
   * parallel workers, so first-paint can lag past the 5s default under load. */
  expect: { timeout: 15_000 },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    /* Pin the mint config for E2E.
     *
     * vite.config.ts sets `envDir` to the REPO ROOT, so `frontend/.env.local` is
     * never read — a contract address written there is silently ignored and
     * `IS_BROSKIPET_CONFIGURED` comes out false, which renders the mint button as
     * "Mint temporarily unavailable". Pinning it here keeps the mint specs
     * deterministic instead of depending on whichever env files a given machine
     * happens to have. Vite picks up VITE_-prefixed vars from process.env. */
    env: {
      VITE_BROSKIPET_CONTRACT_ADDRESS: '0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a',
      VITE_MINT_VIA_RELAY: 'true',
    },
  },
});
