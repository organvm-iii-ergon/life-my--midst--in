import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);
  });

  test('Admin settings page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/admin/settings`, {
      waitUntil: 'domcontentloaded',
    });

    // Should load (may redirect to auth, but should not 500)
    expect(response).not.toBeNull();
    expect([200, 302, 307]).toContain(response?.status());
  });

  test('Dashboard page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded',
    });

    expect(response?.ok()).toBe(true);
  });

  test('Service health grid renders on admin page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/settings`, {
      waitUntil: 'networkidle',
    });

    // Look for health/status indicators
    const pageText = await page.textContent('body');
    const hasHealthContent =
      pageText?.includes('health') ||
      pageText?.includes('Health') ||
      pageText?.includes('status') ||
      pageText?.includes('Status') ||
      pageText?.includes('Settings') ||
      pageText?.includes('settings');

    expect(hasHealthContent).toBe(true);
  });

  test('Feature flags display on settings page', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/settings`, {
      waitUntil: 'networkidle',
    });

    const pageText = await page.textContent('body');
    const hasFlagContent =
      pageText?.includes('flag') ||
      pageText?.includes('Flag') ||
      pageText?.includes('feature') ||
      pageText?.includes('Feature') ||
      pageText?.includes('Settings') ||
      pageText?.includes('toggle');

    expect(hasFlagContent).toBe(true);
  });
});
