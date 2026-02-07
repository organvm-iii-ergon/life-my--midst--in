'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Download, ArrowLeft, User } from 'lucide-react';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

interface MarketplaceListing {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  maskConfig: Record<string, unknown>;
  tags: string[];
  visibility: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceReview {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.['listingId'] as string;

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadListing = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const [listingRes, reviewsRes] = await Promise.all([
        fetch(`${apiBase}/marketplace/listings/${listingId}`),
        fetch(`${apiBase}/marketplace/listings/${listingId}/reviews`),
      ]);

      if (listingRes.ok) {
        const data: MarketplaceListing = await listingRes.json();
        setListing(data);
      }
      if (reviewsRes.ok) {
        const data: MarketplaceReview[] = await reviewsRes.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load listing:', err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  const handleImport = async () => {
    if (!listing) return;
    setImporting(true);
    try {
      const res = await fetch(`${apiBase}/marketplace/listings/${listing.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setImportSuccess(true);
      }
    } catch (err) {
      console.error('Failed to import:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!listing) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${apiBase}/marketplace/listings/${listing.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        setReviewComment('');
        setReviewRating(5);
        void loadListing();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '2rem' }}>
        <div
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '4rem 0' }}
        >
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '2rem' }}>
        <div
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '4rem 0' }}
        >
          <h2>Listing Not Found</h2>
          <p className="text-muted">This template may have been removed or made private.</p>
          <button
            className="btn"
            onClick={() => router.push('/marketplace')}
            style={{ marginTop: '1rem' }}
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Back link */}
        <button
          onClick={() => router.push('/marketplace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ds-accent, #d36b3c)',
            marginBottom: '1.5rem',
            padding: 0,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </button>

        {/* Listing Header */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{listing.title}</h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--ds-text-secondary, #6b6057)',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} /> {listing.authorName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star
                    size={14}
                    fill={listing.rating > 0 ? 'var(--ds-accent, #d36b3c)' : 'none'}
                  />
                  {listing.rating > 0 ? listing.rating.toFixed(1) : 'No ratings'}
                  {listing.ratingCount > 0 &&
                    ` (${listing.ratingCount} review${listing.ratingCount !== 1 ? 's' : ''})`}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Download size={14} /> {listing.downloads} import
                  {listing.downloads !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div>
              {importSuccess ? (
                <span style={{ color: 'var(--ds-success, #2d7d46)', fontWeight: 600 }}>
                  Imported!
                </span>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => void handleImport()}
                  disabled={importing}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {importing ? 'Importing...' : 'Import Template'}
                </button>
              )}
            </div>
          </div>

          {listing.description && (
            <p style={{ margin: '0.75rem 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {listing.description}
            </p>
          )}

          {listing.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '1rem' }}>
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
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
        </div>

        {/* Mask Config Preview */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>Mask Configuration</h2>
          <pre
            style={{
              backgroundColor: 'var(--ds-surface, #f5f0eb)',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.8rem',
              maxHeight: '300px',
              margin: 0,
            }}
          >
            {JSON.stringify(listing.maskConfig, null, 2)}
          </pre>
        </div>

        {/* Reviews */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Reviews ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review this template!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--ds-border, #e5e0db)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {review.reviewerName}
                    </span>
                    <div style={{ display: 'flex', gap: '0.15rem' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? 'var(--ds-accent, #d36b3c)' : 'none'}
                          stroke="var(--ds-accent, #d36b3c)"
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--ds-text-secondary, #6b6057)',
                      }}
                    >
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Leave a Review</h2>
          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Rating
            </label>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewRating(i + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.15rem',
                  }}
                  aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                >
                  <Star
                    size={22}
                    fill={i < reviewRating ? 'var(--ds-accent, #d36b3c)' : 'none'}
                    stroke="var(--ds-accent, #d36b3c)"
                  />
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label
              htmlFor="review-comment"
              style={{
                display: 'block',
                marginBottom: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              className="input"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this template..."
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => void handleSubmitReview()}
            disabled={submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
