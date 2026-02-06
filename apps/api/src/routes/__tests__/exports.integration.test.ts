/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../../../test/app-builder';

describe('Export Integration Tests', () => {
  let app: FastifyInstance;
  let testProfileId: string;

  beforeAll(async () => {
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      payload: {
        id,
        identityId: crypto.randomUUID(),
        displayName: 'Export Test User',
        slug: 'export-test-' + Math.random().toString(36).slice(2, 7),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });
    testProfileId = response.json().data.id;
  });

  describe('POST /profiles/export/json-ld', () => {
    it('generates full JSON-LD export from inline profile data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/json-ld',
        payload: {
          profile: {
            id: testProfileId,
            displayName: 'Jane Doe',
            headline: 'Software Engineer',
            bio: 'Experienced developer',
          },
          experiences: [
            {
              title: 'Senior Engineer',
              company: 'TechCorp',
              startDate: '2022-01-01',
              endDate: '2024-01-01',
            },
          ],
          educations: [],
          skills: [{ name: 'TypeScript', level: 'expert' }],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(body.data['@context']).toBeDefined();
      expect(body.format).toBe('application/ld+json');
      expect(body.context).toBe('full');
    });

    it('generates minimal JSON-LD export', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/json-ld',
        payload: {
          profile: {
            id: testProfileId,
            displayName: 'Jane Doe',
          },
          minimal: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(body.context).toBe('minimal');
    });

    it('generates JSON-LD with script tag wrapper', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/json-ld',
        payload: {
          profile: { displayName: 'Jane Doe' },
          includeScript: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.scriptTag).toBeDefined();
      expect(body.scriptTag).toContain('<script type="application/ld+json">');
    });

    it('adds breadcrumb context to JSON-LD', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/json-ld',
        payload: {
          profile: { displayName: 'Jane Doe' },
          breadcrumbs: [
            { name: 'Home', url: 'https://example.com' },
            { name: 'Profiles', url: 'https://example.com/profiles' },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
    });

    it('rejects invalid request body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/json-ld',
        payload: {
          // Missing required 'profile' field
          experiences: [],
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe('invalid_request');
    });
  });

  describe('GET /profiles/:profileId/export/jsonld', () => {
    it('returns JSON-LD for existing profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/profiles/${testProfileId}/export/jsonld`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/ld+json');
    });

    it('returns 404 for non-existent profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/profiles/nonexistent-profile-id/export/jsonld',
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.error).toBe('profile_not_found');
    });
  });

  describe('GET /profiles/:profileId/export/pdf', () => {
    it('returns PDF for existing profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/profiles/${testProfileId}/export/pdf`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('inline');
    });

    it('returns PDF as download when requested', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/profiles/${testProfileId}/export/pdf?download=true`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('returns 404 for non-existent profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/profiles/nonexistent-profile-id/export/pdf',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /profiles/export/pdf', () => {
    it('generates PDF from inline profile data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/pdf',
        payload: {
          profile: {
            displayName: 'Jane Doe',
            headline: 'Engineer',
          },
          experiences: [],
          educations: [],
          skills: [],
          colorScheme: 'modern',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('generates minimal PDF', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/pdf',
        payload: {
          profile: { displayName: 'Jane Doe' },
          minimal: true,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('rejects invalid request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/pdf',
        payload: {
          // Missing required 'profile'
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /profiles/export/sitemap-entry', () => {
    it('generates sitemap XML entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/sitemap-entry',
        payload: {
          url: 'https://example.com/profiles/jane',
          priority: 0.9,
          changeFrequency: 'weekly',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(body.xmlFormat).toContain('<loc>https://example.com/profiles/jane</loc>');
      expect(body.xmlFormat).toContain('<priority>0.9</priority>');
    });

    it('uses sensible defaults', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/sitemap-entry',
        payload: {
          url: 'https://example.com/test',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.priority).toBe(0.8);
      expect(body.data.changeFrequency).toBe('weekly');
    });

    it('rejects invalid URL', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles/export/sitemap-entry',
        payload: {
          url: 'not-a-url',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
