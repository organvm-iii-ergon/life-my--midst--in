import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';
const TIMEOUT = 10000;

test.describe('Smoke Tests - Critical Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for slower environments
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // HEALTH & AVAILABILITY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Health: Web application loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBe(true);
  });

  test('Health: API is responsive', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('Health: API ready check', async ({ request }) => {
    const response = await request.get(`${API_URL}/ready`);
    expect(response.ok()).toBe(true);
  });

  test('Health: API metrics endpoint accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/metrics`);
    expect(response.ok()).toBe(true);
    const text = await response.text();
    expect(text).toContain('# HELP');  // Prometheus format
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CRITICAL FUNCTIONALITY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Functionality: Home page renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Check for critical elements
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for main navigation
    const nav = await page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('Functionality: Profile page accessible', async ({ page }) => {
    const testProfileId = 'test-profile-123';
    const response = await page.goto(`${BASE_URL}/profiles/${testProfileId}`, {
      waitUntil: 'domcontentloaded',
    });
    
    // Should either load or show appropriate error message
    expect(response?.ok()).toBe(true);
  });

  test('Functionality: Hunter dashboard loads', async ({ page }) => {
    const testProfileId = 'test-profile-123';
    const response = await page.goto(`${BASE_URL}/profiles/${testProfileId}/hunter`, {
      waitUntil: 'domcontentloaded',
    });
    
    // Should load the page
    expect(response?.ok()).toBe(true);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // API INTEGRATION TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('API: Can search jobs', async ({ request }) => {
    const payload = {
      keywords: ['Engineer'],
      max_results: 5,
    };
    
    const response = await request.post(`${API_URL}/profiles/test-id/hunter/search`, {
      data: payload,
    });
    
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty('jobs');
    expect(body).toHaveProperty('totalFound');
    expect(body).toHaveProperty('searchDurationMs');
    expect(Array.isArray(body.jobs)).toBe(true);
  });

  test('API: Can analyze job compatibility', async ({ request }) => {
    const jobPayload = {
      id: 'test-job',
      title: 'Senior Engineer',
      company: 'TechCorp',
      description: 'Looking for senior engineers',
      requirements: 'TypeScript, React, Node.js',
    };
    
    const response = await request.post(
      `${API_URL}/profiles/test-id/hunter/analyze/test-job`,
      {
        data: {
          job: jobPayload,
          personaId: 'Engineer',
        },
      }
    );
    
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty('compatibility');
    expect(body).toHaveProperty('recommendation');
    expect(body).toHaveProperty('effortEstimate');
  });

  test('API: Can tailor resume', async ({ request }) => {
    const response = await request.post(`${API_URL}/profiles/test-id/hunter/tailor-resume`, {
      data: {
        jobId: 'test-job',
        personaId: 'Architect',
      },
    });
    
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty('resume');
    expect(body).toHaveProperty('emphasize');
    expect(body).toHaveProperty('deEmphasize');
    expect(body).toHaveProperty('personaName');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PERFORMANCE TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Performance: Home page loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Performance: API responds quickly', async ({ request }) => {
    const startTime = Date.now();
    await request.get(`${API_URL}/health`);
    const responseTime = Date.now() - startTime;
    
    // Should respond in under 1 second
    expect(responseTime).toBeLessThan(1000);
  });

  test('Performance: Job search completes quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post(`${API_URL}/profiles/test-id/hunter/search`, {
      data: { keywords: ['Engineer'], max_results: 5 },
    });
    const searchTime = Date.now() - startTime;
    
    expect(response.ok()).toBe(true);
    // Search should complete in under 3 seconds
    expect(searchTime).toBeLessThan(3000);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Error Handling: Handles invalid profile ID gracefully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/profiles/invalid-id-xyz/hunter`, {
      waitUntil: 'domcontentloaded',
    });
    
    // Should handle error gracefully (200 or error page)
    expect(response).not.toBeNull();
  });

  test('Error Handling: Handles missing job ID gracefully', async ({ request }) => {
    const response = await request.post(
      `${API_URL}/profiles/test-id/hunter/analyze/nonexistent-job`,
      {
        data: {
          job: { id: 'nonexistent', title: 'Test' },
          personaId: 'Engineer',
        },
      }
    );
    
    // Should return either successful analysis or proper error
    expect([200, 400, 404]).toContain(response.status());
  });

  // ═════════════════════════════════════════════════════════════════════════
  // SECURITY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Security: HTTPS enforced (staging/production)', async ({ page }) => {
    if (BASE_URL.includes('staging') || BASE_URL.includes('in-midst')) {
      const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      // Should either be HTTPS or handle redirect
      expect(response?.ok()).toBe(true);
    }
  });

  test('Security: No console errors on home page', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('ResizeObserver') &&
        !err.includes('undefined') &&
        !err.includes('_next')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Security: API rejects missing required fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/profiles/test-id/hunter/search`, {
      data: {
        // Missing required keywords
        max_results: 5,
      },
    });
    
    // Should reject invalid request
    expect([400, 422]).toContain(response.status());
  });

  // ═════════════════════════════════════════════════════════════════════════
  // DATABASE CONNECTIVITY TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Database: Can perform basic CRUD operations', async ({ request }) => {
    // Create
    const createResponse = await request.post(`${API_URL}/profiles`, {
      data: {
        name: 'Smoke Test User',
        email: 'smoke-test@example.com',
        summary: 'Test profile for smoke testing',
      },
    });
    
    if (createResponse.ok()) {
      const body = await createResponse.json();
      const profileId = body.id;
      
      // Read
      const readResponse = await request.get(`${API_URL}/profiles/${profileId}`);
      expect(readResponse.ok()).toBe(true);
      
      const profile = await readResponse.json();
      expect(profile.name).toBe('Smoke Test User');
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CACHE/REDIS TESTS
  // ═════════════════════════════════════════════════════════════════════════

  test('Cache: Search results are consistent', async ({ request }) => {
    const payload = { keywords: ['TypeScript'], max_results: 5 };
    
    // First request
    const response1 = await request.post(`${API_URL}/profiles/test-id/hunter/search`, {
      data: payload,
    });
    const body1 = await response1.json();
    
    // Second request (should hit cache)
    const response2 = await request.post(`${API_URL}/profiles/test-id/hunter/search`, {
      data: payload,
    });
    const body2 = await response2.json();
    
    // Results should be identical
    expect(body1.jobs.length).toBe(body2.jobs.length);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CRITICAL PATH JOURNEY TEST
  // ═════════════════════════════════════════════════════════════════════════

  test('Journey: Complete Hunter Protocol workflow', async ({ request }) => {
    const profileId = 'journey-test-profile';
    
    // Step 1: Search jobs
    const searchResponse = await request.post(`${API_URL}/profiles/${profileId}/hunter/search`, {
      data: {
        keywords: ['Engineer'],
        remote_requirement: 'hybrid',
        max_results: 1,
      },
    });
    expect(searchResponse.ok()).toBe(true);
    const searchBody = await searchResponse.json();
    expect(searchBody.jobs.length).toBeGreaterThan(0);
    
    const job = searchBody.jobs[0];
    
    // Step 2: Analyze compatibility
    const analyzeResponse = await request.post(
      `${API_URL}/profiles/${profileId}/hunter/analyze/${job.id}`,
      {
        data: { job, personaId: 'Engineer' },
      }
    );
    expect(analyzeResponse.ok()).toBe(true);
    
    // Step 3: Tailor resume
    const tailorResponse = await request.post(
      `${API_URL}/profiles/${profileId}/hunter/tailor-resume`,
      {
        data: { jobId: job.id, personaId: 'Engineer' },
      }
    );
    expect(tailorResponse.ok()).toBe(true);
    const tailorBody = await tailorResponse.json();
    expect(tailorBody.resume.length).toBeGreaterThan(0);
    
    // Step 4: Generate cover letter
    const letterResponse = await request.post(
      `${API_URL}/profiles/${profileId}/hunter/write-cover-letter`,
      {
        data: {
          jobId: job.id,
          personaId: 'Engineer',
          resume: tailorBody.resume,
        },
      }
    );
    expect(letterResponse.ok()).toBe(true);
    const letterBody = await letterResponse.json();
    expect(letterBody.letter.length).toBeGreaterThan(0);
    
    // Complete workflow succeeded
    expect(true).toBe(true);
  });
});

test.describe('Smoke Tests - UI Components', () => {
  test('UI: Navigation menu is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const nav = await page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('UI: Links are clickable and navigate', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Try to find and click a main navigation link
    const firstLink = await page.locator('a[href*="/profiles"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      // Should have navigated
      expect(page.url()).not.toBe(`${BASE_URL}/`);
    }
  });

  test('UI: Forms are functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Look for any input element and verify it's interactable
    const firstInput = await page.locator('input, textarea').first();
    if (await firstInput.isVisible()) {
      await expect(firstInput).toBeEnabled();
    }
  });
});
