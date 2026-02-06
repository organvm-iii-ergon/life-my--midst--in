/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../../../test/app-builder';

/**
 * Search Route Integration Tests
 *
 * Tests the semantic search endpoints (/search/jobs, /search/profiles, /search/embed).
 * Uses InMemoryEmbeddingsRepo + mock EmbeddingsService (apiKey contains "test"
 * so generateEmbedding returns [0.1, 0.2, 0.3] without calling OpenAI).
 */
describe('Search Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /search/jobs', () => {
    it('returns results for a valid query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/jobs',
        payload: { query: 'senior engineer', limit: 5 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.results)).toBe(true);
    });

    it('accepts optional profileId filter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/jobs',
        payload: {
          query: 'react developer',
          limit: 3,
          profileId: 'test-profile-123',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().ok).toBe(true);
    });

    it('rejects missing query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/jobs',
        payload: { limit: 5 },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().ok).toBe(false);
    });

    it('rejects empty string query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/jobs',
        payload: { query: '' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /search/profiles', () => {
    it('returns results for a valid query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/profiles',
        payload: { query: 'machine learning researcher', limit: 10 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.results)).toBe(true);
    });

    it('uses default limit when not specified', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/profiles',
        payload: { query: 'developer' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().ok).toBe(true);
    });

    it('rejects missing query', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/profiles',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /search/embed', () => {
    it('generates and stores a new embedding', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload: {
          profileId: 'test-profile-embed',
          contentType: 'bio',
          text: 'Experienced software engineer with 10 years of TypeScript expertise.',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(body.cached).toBe(false);
    });

    it('returns cached=true for identical content', async () => {
      const payload = {
        profileId: 'test-profile-cache',
        contentType: 'summary',
        text: 'This is a stable summary that does not change.',
      };

      // First call — stores the embedding
      const first = await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload,
      });
      expect(first.json().ok).toBe(true);
      expect(first.json().cached).toBe(false);

      // Second call with same text — should detect it's not stale
      const second = await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload,
      });
      expect(second.json().ok).toBe(true);
      expect(second.json().cached).toBe(true);
    });

    it('regenerates embedding when content changes', async () => {
      const profileId = 'test-profile-regen';
      const contentType = 'headline';

      // First embed
      await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload: { profileId, contentType, text: 'Original headline text' },
      });

      // Second embed with different text — new hash, should not be cached
      const updated = await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload: { profileId, contentType, text: 'Updated headline with new keywords' },
      });

      expect(updated.json().ok).toBe(true);
      expect(updated.json().cached).toBe(false);
    });

    it('rejects missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/search/embed',
        payload: { profileId: 'test' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
