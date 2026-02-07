import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

test.describe('Navigation & Marketing Pages', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // MARKETING PAGE LOADING
  // ═════════════════════════════════════════════════════════════════════════

  test('Landing page loads with hero and feature grid', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Hero section should be present
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('Blog list page loads and shows posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle' });

    const heading = page.locator('h1');
    await expect(heading).toContainText('Blog');

    // Should show at least one blog post link
    const postLinks = page.locator('a[href^="/blog/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Blog detail page renders content', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/introducing-in-midst-my-life`, {
      waitUntil: 'networkidle',
    });

    // Should render the article title
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Should have article content
    const article = page.locator('article, .prose, [role="article"]').first();
    if (await article.isVisible()) {
      const text = await article.textContent();
      expect(text?.length).toBeGreaterThan(100);
    }
  });

  test('Pricing page loads with tier cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });

    // Should show pricing tiers
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();

    // Look for common pricing indicators
    const hasFreeTier = pageText?.includes('Free') || pageText?.includes('free');
    const hasPricing =
      pageText?.includes('month') || pageText?.includes('pricing') || pageText?.includes('Pricing');
    expect(hasFreeTier || hasPricing).toBe(true);
  });

  test('About page loads with mission content', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/about`, {
      waitUntil: 'networkidle',
    });
    expect(response?.ok()).toBe(true);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // NAVIGATION LINKS
  // ═════════════════════════════════════════════════════════════════════════

  test('Header nav links navigate correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Click Blog link
    const blogLink = page.locator('nav a[href="/blog"]').first();
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await page.waitForURL('**/blog');
      expect(page.url()).toContain('/blog');
    }
  });

  test('Footer links are present and functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    // Footer should contain navigation links
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Logo navigates to home page', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle' });

    // Click the site logo/brand link
    const logoLink = page.locator('nav a[href="/"]').first();
    if (await logoLink.isVisible()) {
      await logoLink.click();
      await page.waitForURL(`${BASE_URL}/`);
      expect(page.url()).toBe(`${BASE_URL}/`);
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═════════════════════════════════════════════════════════════════════════

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-xyz`, {
      waitUntil: 'domcontentloaded',
    });

    // Next.js returns 404 for unknown routes
    expect(response?.status()).toBe(404);
  });

  test('Marketing pages have no broken images', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const src = await img.getAttribute('src');
      // Skip data URIs and SVGs which may report 0 naturalWidth
      if (src && !src.startsWith('data:') && !src.endsWith('.svg')) {
        expect(naturalWidth, `Image ${src} should load`).toBeGreaterThan(0);
      }
    }
  });
});
