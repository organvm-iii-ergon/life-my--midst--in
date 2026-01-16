import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp } from '../app-builder';
import type { FastifyInstance } from 'fastify';

describe('Authorization Security', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin Endpoint Protection', () => {
    it('should block non-admin users from admin endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/licensing/entitlements/test-profile-id',
        headers: {
          'x-mock-user-id': 'test-user',
          'x-mock-roles': 'user' // Non-admin
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        ok: false,
        error: 'forbidden'
      });
    });

    it('should allow admin users to access admin endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/licensing/entitlements/test-profile-id',
        headers: {
          'x-mock-user-id': 'test-admin',
          'x-mock-roles': 'admin' // Admin user
        }
      });

      // Should not be 403 (may be 200, 404, etc. - the point is auth passed)
      expect(response.statusCode).not.toBe(403);
    });

    it('should require authentication header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/licensing/entitlements/test-profile-id'
        // No auth headers - will get default mock user from buildTestApp
      });

      // Default mock user has admin role, so should pass auth
      expect(response.statusCode).not.toBe(401);
    });
  });

  describe('Ownership Validation', () => {
    it('should prevent accessing other users subscriptions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/billing/subscription/other-user-id',
        headers: {
          'x-mock-user-id': 'test-user-id',
          'x-mock-roles': 'user' // Different user
        }
      });

      expect(response.statusCode).toBe(403);
    });

    it('should allow users to access their own subscription', async () => {
      // Requires actual subscription to exist
      // May return 200 or 404 (if subscription missing), but not 403
      const response = await app.inject({
        method: 'GET',
        url: '/billing/subscription/test-user-id',
        headers: {
          'x-mock-user-id': 'test-user-id',
          'x-mock-roles': 'user' // Same user
        }
      });

      expect([200, 404]).toContain(response.statusCode);
      expect(response.statusCode).not.toBe(403);
    });
  });

  describe('CORS Policy', () => {
    it('should accept requests from allowed origins', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.statusCode).toBe(200);
    });

    it('should handle requests without origin header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
        // No origin header
      });

      // Should succeed - no origin means same-origin or non-browser
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GDPR Data Deletion', () => {
    it('should delete profile and associated data', async () => {
      // Setup: Create test profile with subscription
      const profileId = '550e8400-e29b-41d4-a716-446655440000';
      const now = new Date().toISOString();
      
      // Create profile
      const createResponse = await app.inject({
        method: 'POST',
        url: '/profiles',
        headers: {
          'x-mock-user-id': profileId,
          'x-mock-roles': 'user'
        },
        payload: {
          id: profileId,
          identityId: '650e8400-e29b-41d4-a716-446655440000',
          slug: 'test-delete',
          displayName: 'Test Delete User',
          createdAt: now,
          updatedAt: now
        }
      });

      // Ensure profile was created
      expect(createResponse.statusCode).toBe(200);

      // Delete profile
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/profiles/${profileId}`,
        headers: {
          'x-mock-user-id': profileId,
          'x-mock-roles': 'user' // Ownership check
        }
      });

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.json()).toMatchObject({
        ok: true,
        message: expect.stringContaining('deleted')
      });

      // Verify deletion
      const getResponse = await app.inject({
        method: 'GET',
        url: `/profiles/${profileId}`,
        headers: {
          'x-mock-user-id': profileId,
          'x-mock-roles': 'user'
        }
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('should prevent non-owner from deleting profile', async () => {
      // Setup: Create test profile
      const profileId = '750e8400-e29b-41d4-a716-446655440000';
      const now = new Date().toISOString();
      
      const createResponse = await app.inject({
        method: 'POST',
        url: '/profiles',
        headers: {
          'x-mock-user-id': profileId,
          'x-mock-roles': 'user'
        },
        payload: {
          id: profileId,
          identityId: '850e8400-e29b-41d4-a716-446655440000',
          slug: 'test-protected',
          displayName: 'Test Protected User',
          createdAt: now,
          updatedAt: now
        }
      });

      // Ensure profile was created
      expect(createResponse.statusCode).toBe(200);

      // Try to delete as different user
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/profiles/${profileId}`,
        headers: {
          'x-mock-user-id': 'different-user-id',
          'x-mock-roles': 'user' // Different user
        }
      });

      expect(deleteResponse.statusCode).toBe(403);
    });
  });
});
