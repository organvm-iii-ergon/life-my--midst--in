import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Runs against the live Next.js + Fastify stack.
 * In CI, webServer entries auto-start both apps.
 * Locally, use `pnpm dev` in a separate terminal and run `pnpm e2e`.
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  outputDir: './test-results',

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Auto-start the web + API servers in CI */
  ...(process.env.CI
    ? {
        webServer: [
          {
            command: 'pnpm --filter @in-midst-my-life/api dev',
            url: 'http://localhost:3001/health',
            reuseExistingServer: false,
            timeout: 30_000,
          },
          {
            command: 'pnpm --filter @in-midst-my-life/web dev',
            url: 'http://localhost:3000',
            reuseExistingServer: false,
            timeout: 30_000,
          },
        ],
      }
    : {}),
});
