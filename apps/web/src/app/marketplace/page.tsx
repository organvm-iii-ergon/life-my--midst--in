'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Star, Download, ArrowUpDown } from 'lucide-react';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

interface MarketplaceListing {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  tags: string[];
  visibility: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

type SortOption = 'rating' | 'downloads' | 'newest';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [tagFilter, setTagFilter] = useState('');

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (tagFilter) params.set('tag', tagFilter);

      const url = `${apiBase}/marketplace/listings?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: MarketplaceListing[] = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, tagFilter]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const allTags = Array.from(new Set(listings.flatMap((l) => l.tags))).sort();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="hero-title" style={{ marginBottom: '0.5rem' }}>
            Mask Marketplace
          </h1>
          <p className="text-muted">Discover and import mask templates shared by the community</p>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
                minWidth: '200px',
              }}
            >
              <Search size={18} />
              <input
                className="input"
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
                aria-label="Search marketplace templates"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} />
              <select
                className="input"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                style={{ maxWidth: '180px' }}
                aria-label="Sort listings"
              >
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>

            {allTags.length > 0 && (
              <select
                className="input"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                style={{ maxWidth: '180px' }}
                aria-label="Filter by tag"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            <span className="text-muted">
              {listings.length} template{listings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p className="text-muted">Loading marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p className="text-muted">
              {search || tagFilter
                ? 'No templates match your filters. Try broadening your search.'
                : 'No templates published yet. Be the first to share a mask template!'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{listing.title}</h3>
                  <p
                    className="text-muted"
                    style={{
                      margin: '0 0 0.75rem',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {listing.description || 'No description provided.'}
                  </p>

                  {listing.tags.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {listing.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            borderRadius: '999px',
                            backgroundColor: 'var(--ds-surface, #f5f0eb)',
                            color: 'var(--ds-text-secondary, #6b6057)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--ds-text-secondary, #6b6057)',
                      borderTop: '1px solid var(--ds-border, #e5e0db)',
                      paddingTop: '0.75rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span>by {listing.authorName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star
                          size={14}
                          fill={listing.rating > 0 ? 'var(--ds-accent, #d36b3c)' : 'none'}
                        />
                        {listing.rating > 0 ? listing.rating.toFixed(1) : '-'}
                        {listing.ratingCount > 0 && ` (${listing.ratingCount})`}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Download size={14} />
                        {listing.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
