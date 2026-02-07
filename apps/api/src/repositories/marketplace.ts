import type { Pool } from 'pg';

export interface MarketplaceListingRecord {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  maskConfig: Record<string, unknown>;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  rating: number;
  ratingCount: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceReviewRecord {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MarketplaceImportRecord {
  id: string;
  listingId: string;
  importerId: string;
  importedAt: string;
}

export interface MarketplaceListingQuery {
  visibility?: 'public' | 'unlisted';
  tag?: string;
  search?: string;
  sort?: 'rating' | 'downloads' | 'newest';
  limit?: number;
  offset?: number;
}

export interface MarketplaceRepo {
  createListing(listing: MarketplaceListingRecord): Promise<MarketplaceListingRecord>;
  getListing(id: string): Promise<MarketplaceListingRecord | undefined>;
  updateListing(
    id: string,
    patch: Partial<MarketplaceListingRecord>,
  ): Promise<MarketplaceListingRecord | undefined>;
  deleteListing(id: string): Promise<boolean>;
  listListings(query?: MarketplaceListingQuery): Promise<MarketplaceListingRecord[]>;
  listByAuthor(authorId: string): Promise<MarketplaceListingRecord[]>;

  addReview(review: MarketplaceReviewRecord): Promise<MarketplaceReviewRecord>;
  getReviews(listingId: string): Promise<MarketplaceReviewRecord[]>;

  recordImport(rec: MarketplaceImportRecord): Promise<MarketplaceImportRecord>;
  getImportCount(listingId: string): Promise<number>;
}

// ─── In-Memory Implementation ──────────────────────────────────────

class InMemoryMarketplaceRepo implements MarketplaceRepo {
  private listings = new Map<string, MarketplaceListingRecord>();
  private reviews = new Map<string, MarketplaceReviewRecord>();
  private imports = new Map<string, MarketplaceImportRecord>();

  createListing(listing: MarketplaceListingRecord): Promise<MarketplaceListingRecord> {
    this.listings.set(listing.id, listing);
    return Promise.resolve(listing);
  }

  getListing(id: string): Promise<MarketplaceListingRecord | undefined> {
    return Promise.resolve(this.listings.get(id));
  }

  updateListing(
    id: string,
    patch: Partial<MarketplaceListingRecord>,
  ): Promise<MarketplaceListingRecord | undefined> {
    const existing = this.listings.get(id);
    if (!existing) return Promise.resolve(undefined);
    const updated = { ...existing, ...patch, id: existing.id, updatedAt: new Date().toISOString() };
    this.listings.set(id, updated);
    return Promise.resolve(updated);
  }

  deleteListing(id: string): Promise<boolean> {
    return Promise.resolve(this.listings.delete(id));
  }

  listListings(query?: MarketplaceListingQuery): Promise<MarketplaceListingRecord[]> {
    let results = Array.from(this.listings.values());

    if (query?.visibility) {
      results = results.filter((l) => l.visibility === query.visibility);
    } else {
      results = results.filter((l) => l.visibility === 'public');
    }

    if (query?.tag) {
      const tag = query.tag.toLowerCase();
      results = results.filter((l) => l.tags.some((t) => t.toLowerCase() === tag));
    }

    if (query?.search) {
      const search = query.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(search) || l.description.toLowerCase().includes(search),
      );
    }

    const sort = query?.sort ?? 'newest';
    if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sort === 'downloads') results.sort((a, b) => b.downloads - a.downloads);
    else results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const offset = query?.offset ?? 0;
    const limit = query?.limit ?? 20;
    return Promise.resolve(results.slice(offset, offset + limit));
  }

  listByAuthor(authorId: string): Promise<MarketplaceListingRecord[]> {
    return Promise.resolve(
      Array.from(this.listings.values()).filter((l) => l.authorId === authorId),
    );
  }

  addReview(review: MarketplaceReviewRecord): Promise<MarketplaceReviewRecord> {
    this.reviews.set(review.id, review);
    // Recalculate listing rating
    const listing = this.listings.get(review.listingId);
    if (listing) {
      const reviews = Array.from(this.reviews.values()).filter(
        (r) => r.listingId === review.listingId,
      );
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      listing.rating = reviews.length > 0 ? total / reviews.length : 0;
      listing.ratingCount = reviews.length;
    }
    return Promise.resolve(review);
  }

  getReviews(listingId: string): Promise<MarketplaceReviewRecord[]> {
    return Promise.resolve(
      Array.from(this.reviews.values()).filter((r) => r.listingId === listingId),
    );
  }

  recordImport(rec: MarketplaceImportRecord): Promise<MarketplaceImportRecord> {
    this.imports.set(rec.id, rec);
    const listing = this.listings.get(rec.listingId);
    if (listing) {
      listing.downloads += 1;
    }
    return Promise.resolve(rec);
  }

  getImportCount(listingId: string): Promise<number> {
    return Promise.resolve(
      Array.from(this.imports.values()).filter((i) => i.listingId === listingId).length,
    );
  }
}

// ─── Postgres Implementation ──────────────────────────────────────

interface ListingRow {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  description: string;
  mask_config: Record<string, unknown>;
  tags: string[];
  visibility: string;
  rating: string; // NUMERIC comes as string from pg
  rating_count: number;
  downloads: number;
  created_at: string;
  updated_at: string;
}

function rowToListing(row: ListingRow): MarketplaceListingRecord {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    title: row.title,
    description: row.description,
    maskConfig: row.mask_config,
    tags: row.tags,
    visibility: row.visibility as MarketplaceListingRecord['visibility'],
    rating: parseFloat(row.rating),
    ratingCount: row.rating_count,
    downloads: row.downloads,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

interface ReviewRow {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function rowToReview(row: ReviewRow): MarketplaceReviewRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

class PostgresMarketplaceRepo implements MarketplaceRepo {
  constructor(private pool: Pool) {}

  async createListing(listing: MarketplaceListingRecord): Promise<MarketplaceListingRecord> {
    const { rows } = await this.pool.query<ListingRow>(
      `INSERT INTO marketplace_listings
        (id, author_id, author_name, title, description, mask_config, tags,
         visibility, rating, rating_count, downloads, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        listing.id,
        listing.authorId,
        listing.authorName,
        listing.title,
        listing.description,
        JSON.stringify(listing.maskConfig),
        listing.tags,
        listing.visibility,
        listing.rating,
        listing.ratingCount,
        listing.downloads,
        listing.createdAt,
        listing.updatedAt,
      ],
    );
    const row = rows[0];
    if (!row) throw new Error('Insert returned no rows');
    return rowToListing(row);
  }

  async getListing(id: string): Promise<MarketplaceListingRecord | undefined> {
    const { rows } = await this.pool.query<ListingRow>(
      'SELECT * FROM marketplace_listings WHERE id = $1',
      [id],
    );
    const row = rows[0];
    return row ? rowToListing(row) : undefined;
  }

  async updateListing(
    id: string,
    patch: Partial<MarketplaceListingRecord>,
  ): Promise<MarketplaceListingRecord | undefined> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (patch.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(patch.title);
    }
    if (patch.description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(patch.description);
    }
    if (patch.maskConfig !== undefined) {
      sets.push(`mask_config = $${idx++}`);
      values.push(JSON.stringify(patch.maskConfig));
    }
    if (patch.tags !== undefined) {
      sets.push(`tags = $${idx++}`);
      values.push(patch.tags);
    }
    if (patch.visibility !== undefined) {
      sets.push(`visibility = $${idx++}`);
      values.push(patch.visibility);
    }
    if (patch.rating !== undefined) {
      sets.push(`rating = $${idx++}`);
      values.push(patch.rating);
    }
    if (patch.ratingCount !== undefined) {
      sets.push(`rating_count = $${idx++}`);
      values.push(patch.ratingCount);
    }
    if (patch.downloads !== undefined) {
      sets.push(`downloads = $${idx++}`);
      values.push(patch.downloads);
    }

    sets.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const { rows } = await this.pool.query<ListingRow>(
      `UPDATE marketplace_listings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    const row = rows[0];
    return row ? rowToListing(row) : undefined;
  }

  async deleteListing(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query('DELETE FROM marketplace_listings WHERE id = $1', [
      id,
    ]);
    return (rowCount ?? 0) > 0;
  }

  async listListings(query?: MarketplaceListingQuery): Promise<MarketplaceListingRecord[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const visibility = query?.visibility ?? 'public';
    conditions.push(`visibility = $${idx++}`);
    values.push(visibility);

    if (query?.tag) {
      conditions.push(`$${idx++} = ANY(tags)`);
      values.push(query.tag);
    }

    if (query?.search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${query.search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sort = query?.sort ?? 'newest';
    const orderBy =
      sort === 'rating'
        ? 'rating DESC'
        : sort === 'downloads'
          ? 'downloads DESC'
          : 'created_at DESC';
    const limit = query?.limit ?? 20;
    const offset = query?.offset ?? 0;

    const { rows } = await this.pool.query<ListingRow>(
      `SELECT * FROM marketplace_listings ${where} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx}`,
      [...values, limit, offset],
    );
    return rows.map(rowToListing);
  }

  async listByAuthor(authorId: string): Promise<MarketplaceListingRecord[]> {
    const { rows } = await this.pool.query<ListingRow>(
      'SELECT * FROM marketplace_listings WHERE author_id = $1 ORDER BY created_at DESC',
      [authorId],
    );
    return rows.map(rowToListing);
  }

  async addReview(review: MarketplaceReviewRecord): Promise<MarketplaceReviewRecord> {
    const { rows } = await this.pool.query<ReviewRow>(
      `INSERT INTO marketplace_reviews (id, listing_id, reviewer_id, reviewer_name, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (listing_id, reviewer_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [
        review.id,
        review.listingId,
        review.reviewerId,
        review.reviewerName,
        review.rating,
        review.comment,
        review.createdAt,
      ],
    );

    // Update listing rating
    await this.pool.query(
      `UPDATE marketplace_listings SET
         rating = (SELECT COALESCE(AVG(rating), 0) FROM marketplace_reviews WHERE listing_id = $1),
         rating_count = (SELECT COUNT(*) FROM marketplace_reviews WHERE listing_id = $1),
         updated_at = NOW()
       WHERE id = $1`,
      [review.listingId],
    );

    const row = rows[0];
    if (!row) throw new Error('Insert returned no rows');
    return rowToReview(row);
  }

  async getReviews(listingId: string): Promise<MarketplaceReviewRecord[]> {
    const { rows } = await this.pool.query<ReviewRow>(
      'SELECT * FROM marketplace_reviews WHERE listing_id = $1 ORDER BY created_at DESC',
      [listingId],
    );
    return rows.map(rowToReview);
  }

  async recordImport(rec: MarketplaceImportRecord): Promise<MarketplaceImportRecord> {
    await this.pool.query(
      `INSERT INTO marketplace_imports (id, listing_id, importer_id, imported_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (listing_id, importer_id) DO NOTHING`,
      [rec.id, rec.listingId, rec.importerId, rec.importedAt],
    );

    // Increment downloads
    await this.pool.query(
      `UPDATE marketplace_listings SET
         downloads = (SELECT COUNT(*) FROM marketplace_imports WHERE listing_id = $1),
         updated_at = NOW()
       WHERE id = $1`,
      [rec.listingId],
    );

    return rec;
  }

  async getImportCount(listingId: string): Promise<number> {
    const { rows } = await this.pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM marketplace_imports WHERE listing_id = $1',
      [listingId],
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  }
}

// ─── Factory ──────────────────────────────────────

export function createMarketplaceRepo(pool?: Pool): MarketplaceRepo {
  return pool ? new PostgresMarketplaceRepo(pool) : new InMemoryMarketplaceRepo();
}
