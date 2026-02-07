import { z } from 'zod';

/**
 * Marketplace template listing visibility levels.
 */
export const ListingVisibilitySchema = z.enum(['public', 'unlisted', 'private']);

/**
 * Schema for a marketplace template listing.
 *
 * A listing represents a mask configuration template that can be shared,
 * imported, and rated by other users. This is the core entity of the
 * Minimum Viable Marketplace (Phase 9).
 */
export const TemplateListingSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).default(''),
  /** The mask configuration being shared */
  maskConfig: z.record(z.unknown()),
  /** Categorization tags */
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  visibility: ListingVisibilitySchema.default('public'),
  /** Average rating (1-5, computed) */
  rating: z.number().min(0).max(5).default(0),
  /** Number of ratings received */
  ratingCount: z.number().int().min(0).default(0),
  /** Number of times imported */
  downloads: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TemplateListing = z.infer<typeof TemplateListingSchema>;

/**
 * Schema for creating a new listing (subset of fields).
 */
export const TemplateListingCreateSchema = TemplateListingSchema.pick({
  title: true,
  description: true,
  maskConfig: true,
  tags: true,
  visibility: true,
});

/**
 * Schema for a review on a marketplace listing.
 */
export const TemplateReviewSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).default(''),
  createdAt: z.string().datetime(),
});

export type TemplateReview = z.infer<typeof TemplateReviewSchema>;

/**
 * Schema for importing a marketplace template into your masks.
 */
export const TemplateImportSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  importerId: z.string().uuid(),
  importedAt: z.string().datetime(),
});

export type TemplateImport = z.infer<typeof TemplateImportSchema>;
