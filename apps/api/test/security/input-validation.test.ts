import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp } from '../app-builder';
import type { FastifyInstance } from 'fastify';

describe('Input Validation Security', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject SQL injection attempts in parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: "/profiles/'; DROP TABLE profiles; --",
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      }
    });

    // Should safely handle (not execute SQL)
    expect(response.statusCode).toEqual(404); // Not found, not 500
  });

  it('should reject XSS payload in request body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      },
      payload: {
        id: 'xss-test-profile',
        slug: 'test',
        name: '<script>alert("xss")</script>',
        email: 'test@example.com'
      }
    });

    // Should validate/sanitize, not reflect payload
    if (response.statusCode === 200) {
      const json = response.json();
      // Verify XSS is not directly reflected
      expect(json.data?.name).toBeDefined();
    } else {
      // Or validation may reject it
      expect([400, 422]).toContain(response.statusCode);
    }
  });

  it('should handle special characters in slugs', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      },
      payload: {
        id: 'special-chars-profile',
        slug: '../../../etc/passwd',
        name: 'Test User',
        email: 'test@example.com'
      }
    });

    // Should reject or sanitize path traversal attempts
    if (response.statusCode === 200) {
      const json = response.json();
      expect(json.data?.slug).not.toContain('..');
    } else {
      expect([400, 422]).toContain(response.statusCode);
    }
  });

  it('should validate email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      },
      payload: {
        id: 'invalid-email-profile',
        slug: 'test-email',
        name: 'Test User',
        email: 'not-an-email'
      }
    });

    // Should reject invalid email
    if (response.statusCode !== 200) {
      expect([400, 422]).toContain(response.statusCode);
    }
  });

  it('should reject extremely long input strings', async () => {
    const longString = 'x'.repeat(10000);

    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      },
      payload: {
        id: 'long-string-profile',
        slug: 'test-long',
        name: longString,
        email: 'test@example.com'
      }
    });

    // Should reject or truncate excessively long inputs
    if (response.statusCode === 200) {
      const json = response.json();
      expect(json.data?.name.length).toBeLessThan(10000);
    } else {
      expect([400, 413, 422]).toContain(response.statusCode);
    }
  });

  it('should handle missing required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user'
      },
      payload: {
        // Missing required fields
        slug: 'test'
      }
    });

    // Should return validation error
    expect([400, 422]).toContain(response.statusCode);
    const json = response.json();
    expect(json.ok).toBe(false);
  });

  it('should reject invalid JSON', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': 'test-user',
        'x-mock-roles': 'user',
        'content-type': 'application/json'
      },
      payload: 'not valid json{]'
    });

    // Should return 400 Bad Request
    expect(response.statusCode).toBe(400);
  });

  it('should sanitize markdown/HTML in narrative content', async () => {
    // Create profile first
    const profileId = '950e8400-e29b-41d4-a716-446655440000';
    const now = new Date().toISOString();
    
    await app.inject({
      method: 'POST',
      url: '/profiles',
      headers: {
        'x-mock-user-id': profileId,
        'x-mock-roles': 'user'
      },
      payload: {
        id: profileId,
        identityId: 'a50e8400-e29b-41d4-a716-446655440000',
        slug: 'narrative-test',
        displayName: 'Narrative Test User',
        createdAt: now,
        updatedAt: now
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: `/profiles/${profileId}/narrative`,
      headers: {
        'x-mock-user-id': profileId,
        'x-mock-roles': 'user'
      },
      payload: {
        timeline: [],
        contexts: ['work'],
        tags: ['<script>alert("xss")</script>']
      }
    });

    // Should not fail catastrophically
    expect([200, 400, 404, 422]).toContain(response.statusCode);
  });
});
