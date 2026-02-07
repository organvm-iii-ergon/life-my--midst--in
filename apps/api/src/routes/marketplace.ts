/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import type { FastifyPluginCallback } from 'fastify';
import { randomUUID } from 'node:crypto';
import { TemplateListingCreateSchema, TemplateReviewSchema } from '@in-midst-my-life/schema';
import type { MarketplaceRepo } from '../repositories/marketplace';
import { createMarketplaceRepo } from '../repositories/marketplace';

const marketplaceRoutes: FastifyPluginCallback = (server, _opts, done) => {
  const repo: MarketplaceRepo = (server as any)['marketplaceRepo'] ?? createMarketplaceRepo();

  // ─── Browse Listings ──────────────────────────────────────

  /**
   * GET /marketplace/listings
   * Browse marketplace listings with optional filters.
   */
  server.get('/marketplace/listings', async (request, reply) => {
    const query = request.query as {
      visibility?: 'public' | 'unlisted';
      tag?: string;
      search?: string;
      sort?: 'rating' | 'downloads' | 'newest';
      limit?: string;
      offset?: string;
    };

    const listings = await repo.listListings({
      visibility: query.visibility,
      tag: query.tag,
      search: query.search,
      sort: query.sort,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      offset: query.offset ? parseInt(query.offset, 10) : undefined,
    });

    return reply.send(listings);
  });

  /**
   * GET /marketplace/listings/:id
   * Get a single listing by ID.
   */
  server.get('/marketplace/listings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const listing = await repo.getListing(id);
    if (!listing) {
      return reply.status(404).send({ error: 'Listing not found' });
    }
    return reply.send(listing);
  });

  // ─── Author Operations ──────────────────────────────────────

  /**
   * POST /marketplace/listings
   * Create a new marketplace listing. Requires auth.
   */
  server.post('/marketplace/listings', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const parsed = TemplateListingCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request', details: parsed.error.issues });
    }

    const now = new Date().toISOString();
    const listing = await repo.createListing({
      id: randomUUID(),
      authorId: request.user.sub,
      authorName: request.user.email?.split('@')[0] ?? request.user.sub,
      title: parsed.data.title,
      description: parsed.data.description ?? '',
      maskConfig: parsed.data.maskConfig,
      tags: parsed.data.tags ?? [],
      visibility: parsed.data.visibility ?? 'public',
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send(listing);
  });

  /**
   * PATCH /marketplace/listings/:id
   * Update a listing. Author only.
   */
  server.patch('/marketplace/listings/:id', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const { id } = request.params as { id: string };
    const existing = await repo.getListing(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Listing not found' });
    }
    if (existing.authorId !== request.user.sub) {
      return reply.status(403).send({ error: 'Only the author can update this listing' });
    }

    const body = request.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (body['title'] !== undefined) patch['title'] = body['title'];
    if (body['description'] !== undefined) patch['description'] = body['description'];
    if (body['maskConfig'] !== undefined) patch['maskConfig'] = body['maskConfig'];
    if (body['tags'] !== undefined) patch['tags'] = body['tags'];
    if (body['visibility'] !== undefined) patch['visibility'] = body['visibility'];

    const updated = await repo.updateListing(id, patch);
    return reply.send(updated);
  });

  /**
   * DELETE /marketplace/listings/:id
   * Delete a listing. Author only.
   */
  server.delete('/marketplace/listings/:id', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const { id } = request.params as { id: string };
    const existing = await repo.getListing(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Listing not found' });
    }
    if (existing.authorId !== request.user.sub) {
      return reply.status(403).send({ error: 'Only the author can delete this listing' });
    }

    await repo.deleteListing(id);
    return reply.status(204).send();
  });

  /**
   * GET /marketplace/my-listings
   * List all listings by the authenticated user.
   */
  server.get('/marketplace/my-listings', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
    const listings = await repo.listByAuthor(request.user.sub);
    return reply.send(listings);
  });

  // ─── Reviews ──────────────────────────────────────

  /**
   * GET /marketplace/listings/:id/reviews
   * Get all reviews for a listing.
   */
  server.get('/marketplace/listings/:id/reviews', async (request, reply) => {
    const { id } = request.params as { id: string };
    const reviews = await repo.getReviews(id);
    return reply.send(reviews);
  });

  /**
   * POST /marketplace/listings/:id/reviews
   * Add or update a review. Requires auth.
   */
  server.post('/marketplace/listings/:id/reviews', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const { id } = request.params as { id: string };
    const existing = await repo.getListing(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Listing not found' });
    }

    // Authors cannot review their own listing
    if (existing.authorId === request.user.sub) {
      return reply.status(403).send({ error: 'Cannot review your own listing' });
    }

    const body = request.body as { rating?: number; comment?: string };
    const reviewData = {
      id: randomUUID(),
      listingId: id,
      reviewerId: request.user.sub,
      reviewerName: request.user.email?.split('@')[0] ?? request.user.sub,
      rating: body.rating,
      comment: body.comment ?? '',
      createdAt: new Date().toISOString(),
    };

    const parsed = TemplateReviewSchema.safeParse(reviewData);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid review', details: parsed.error.issues });
    }

    const review = await repo.addReview(parsed.data);
    return reply.status(201).send(review);
  });

  // ─── Import ──────────────────────────────────────

  /**
   * POST /marketplace/listings/:id/import
   * Import a marketplace template into the user's masks.
   */
  server.post('/marketplace/listings/:id/import', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const { id } = request.params as { id: string };
    const listing = await repo.getListing(id);
    if (!listing) {
      return reply.status(404).send({ error: 'Listing not found' });
    }

    const importRecord = await repo.recordImport({
      id: randomUUID(),
      listingId: id,
      importerId: request.user.sub,
      importedAt: new Date().toISOString(),
    });

    return reply.status(201).send({
      import: importRecord,
      maskConfig: listing.maskConfig,
    });
  });

  done();
};

export default marketplaceRoutes;
