/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from './app-builder';

describe('marketplace routes', () => {
  let app: FastifyInstance;

  const userId = '00000000-0000-0000-0000-000000000001';
  const otherUserId = '00000000-0000-0000-0000-000000000099';

  beforeAll(async () => {
    app = await buildTestApp();
  });

  // ── Listing CRUD ──

  it('creates a listing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: {
        title: 'Test Template',
        description: 'A useful template',
        maskConfig: { tone: 'formal', ontology: 'cognitive' },
        tags: ['test', 'formal'],
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Test Template');
    expect(body.authorId).toBe(userId);
    expect(body.tags).toEqual(['test', 'formal']);
    expect(body.rating).toBe(0);
    expect(body.downloads).toBe(0);
  });

  it('lists public listings', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/marketplace/listings',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0].title).toBe('Test Template');
  });

  it('gets a single listing by id', async () => {
    // First create
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: {
        title: 'Detail Test',
        description: 'For detail view',
        maskConfig: {},
        tags: [],
      },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'GET',
      url: `/marketplace/listings/${listing.id}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Detail Test');
  });

  it('returns 404 for non-existent listing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/marketplace/listings/00000000-0000-0000-0000-000000000000',
    });
    expect(res.statusCode).toBe(404);
  });

  it('updates a listing by its author', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: {
        title: 'Update Me',
        maskConfig: {},
      },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'PATCH',
      url: `/marketplace/listings/${listing.id}`,
      payload: { title: 'Updated Title' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Updated Title');
  });

  it('prevents non-author from updating a listing', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { title: 'Protected', maskConfig: {} },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'PATCH',
      url: `/marketplace/listings/${listing.id}`,
      headers: { 'x-mock-user-id': otherUserId },
      payload: { title: 'Hacked' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('deletes a listing by its author', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { title: 'Delete Me', maskConfig: {} },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'DELETE',
      url: `/marketplace/listings/${listing.id}`,
    });
    expect(res.statusCode).toBe(204);

    // Verify deleted
    const getRes = await app.inject({
      method: 'GET',
      url: `/marketplace/listings/${listing.id}`,
    });
    expect(getRes.statusCode).toBe(404);
  });

  it('lists current user listings via my-listings', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/marketplace/my-listings',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body.every((l: any) => l.authorId === userId)).toBe(true);
  });

  // ── Search & Filters ──

  it('searches listings by title', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/marketplace/listings?search=Test+Template',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.some((l: any) => l.title === 'Test Template')).toBe(true);
  });

  it('filters listings by tag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/marketplace/listings?tag=formal',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.every((l: any) => l.tags.includes('formal'))).toBe(true);
  });

  // ── Reviews ──

  it('adds a review from a different user', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { title: 'Reviewable', maskConfig: {} },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'POST',
      url: `/marketplace/listings/${listing.id}/reviews`,
      headers: { 'x-mock-user-id': otherUserId },
      payload: { rating: 4, comment: 'Nice template!' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().rating).toBe(4);
  });

  it('prevents author from reviewing own listing', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { title: 'Self Review', maskConfig: {} },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'POST',
      url: `/marketplace/listings/${listing.id}/reviews`,
      payload: { rating: 5, comment: 'I love my own work' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('gets reviews for a listing', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { title: 'Get Reviews', maskConfig: {} },
    });
    const listing = createRes.json();

    // Add a review from another user
    await app.inject({
      method: 'POST',
      url: `/marketplace/listings/${listing.id}/reviews`,
      headers: { 'x-mock-user-id': otherUserId },
      payload: { rating: 3, comment: 'Decent' },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/marketplace/listings/${listing.id}/reviews`,
    });
    expect(res.statusCode).toBe(200);
    const reviews = res.json();
    expect(reviews.length).toBe(1);
    expect(reviews[0].rating).toBe(3);
  });

  // ── Import ──

  it('imports a listing template', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: {
        title: 'Importable',
        maskConfig: { tone: 'casual' },
      },
    });
    const listing = createRes.json();

    const res = await app.inject({
      method: 'POST',
      url: `/marketplace/listings/${listing.id}/import`,
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.import).toBeDefined();
    expect(body.maskConfig).toEqual({ tone: 'casual' });
  });

  it('returns 404 when importing non-existent listing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/marketplace/listings/00000000-0000-0000-0000-000000000000/import',
    });
    expect(res.statusCode).toBe(404);
  });

  // ── Validation ──

  it('rejects listing with missing title', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/marketplace/listings',
      payload: { maskConfig: {} },
    });
    expect(res.statusCode).toBe(400);
  });
});
