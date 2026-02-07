import { describe, it, expect } from 'vitest';
import {
  TemplateListingSchema,
  TemplateListingCreateSchema,
  TemplateReviewSchema,
  TemplateImportSchema,
  ListingVisibilitySchema,
} from '../src/marketplace';

describe('Marketplace Schemas', () => {
  const validListing = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    authorId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    authorName: 'Test Author',
    title: 'Analyst Mask Template',
    description: 'A data-focused mask for analytical presentations.',
    maskConfig: { tone: 'formal', ontology: 'cognitive' },
    tags: ['technical', 'analytics'],
    visibility: 'public' as const,
    rating: 4.5,
    ratingCount: 10,
    downloads: 25,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  };

  describe('TemplateListingSchema', () => {
    it('accepts a valid listing', () => {
      const result = TemplateListingSchema.safeParse(validListing);
      expect(result.success).toBe(true);
    });

    it('rejects listing with missing title', () => {
      const { title: _title, ...noTitle } = validListing;
      void _title;
      const result = TemplateListingSchema.safeParse(noTitle);
      expect(result.success).toBe(false);
    });

    it('rejects title exceeding 120 characters', () => {
      const result = TemplateListingSchema.safeParse({
        ...validListing,
        title: 'x'.repeat(121),
      });
      expect(result.success).toBe(false);
    });

    it('rejects description exceeding 2000 characters', () => {
      const result = TemplateListingSchema.safeParse({
        ...validListing,
        description: 'x'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects rating above 5', () => {
      const result = TemplateListingSchema.safeParse({
        ...validListing,
        rating: 5.1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative downloads', () => {
      const result = TemplateListingSchema.safeParse({
        ...validListing,
        downloads: -1,
      });
      expect(result.success).toBe(false);
    });

    it('defaults tags to empty array', () => {
      const { tags: _tags, ...noTags } = validListing;
      void _tags;
      const result = TemplateListingSchema.safeParse(noTags);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it('rejects more than 10 tags', () => {
      const result = TemplateListingSchema.safeParse({
        ...validListing,
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ListingVisibilitySchema', () => {
    it('accepts public, unlisted, private', () => {
      expect(ListingVisibilitySchema.safeParse('public').success).toBe(true);
      expect(ListingVisibilitySchema.safeParse('unlisted').success).toBe(true);
      expect(ListingVisibilitySchema.safeParse('private').success).toBe(true);
    });

    it('rejects unknown visibility', () => {
      expect(ListingVisibilitySchema.safeParse('hidden').success).toBe(false);
    });
  });

  describe('TemplateListingCreateSchema', () => {
    it('accepts valid create payload', () => {
      const result = TemplateListingCreateSchema.safeParse({
        title: 'New Template',
        description: 'A template',
        maskConfig: { ontology: 'expressive' },
        tags: ['creative'],
        visibility: 'public',
      });
      expect(result.success).toBe(true);
    });

    it('rejects payload with missing title', () => {
      const result = TemplateListingCreateSchema.safeParse({
        description: 'A template',
        maskConfig: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TemplateReviewSchema', () => {
    const validReview = {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      listingId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      reviewerId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      reviewerName: 'Reviewer',
      rating: 4,
      comment: 'Great template!',
      createdAt: '2026-01-20T00:00:00.000Z',
    };

    it('accepts a valid review', () => {
      const result = TemplateReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('rejects rating below 1', () => {
      const result = TemplateReviewSchema.safeParse({ ...validReview, rating: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects rating above 5', () => {
      const result = TemplateReviewSchema.safeParse({ ...validReview, rating: 6 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer rating', () => {
      const result = TemplateReviewSchema.safeParse({ ...validReview, rating: 3.5 });
      expect(result.success).toBe(false);
    });

    it('rejects comment exceeding 1000 characters', () => {
      const result = TemplateReviewSchema.safeParse({
        ...validReview,
        comment: 'x'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TemplateImportSchema', () => {
    it('accepts a valid import record', () => {
      const result = TemplateImportSchema.safeParse({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        listingId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        importerId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        importedAt: '2026-02-01T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('rejects import with invalid UUID', () => {
      const result = TemplateImportSchema.safeParse({
        id: 'not-a-uuid',
        listingId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        importerId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        importedAt: '2026-02-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });
});
