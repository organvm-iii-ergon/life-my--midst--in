-- Migration 012: Create artifacts table for storing creative and academic work discovered via cloud crawling
--
-- This table stores raw creative and academic artifacts (papers, images, writing, presentations)
-- discovered from cloud storage sources (Google Drive, iCloud, Dropbox, local filesystem).
--
-- Artifacts flow through an approval workflow (pending → approved → rejected → archived).
-- Every artifact is cryptographically signed with the user's DID for blockchain-style provenance.
--
-- Key design decisions:
-- 1. Denormalized indexed columns for common queries (artifact_type, status, source_provider)
-- 2. JSONB for flexible type-specific metadata (EXIF, dimensions, duration, etc.)
-- 3. UNIQUE constraint on (profile_id, source_provider, source_id) prevents duplicate ingestion
-- 4. Arrays for tags and categories (support mask filtering and user-defined taxonomy)

CREATE TABLE IF NOT EXISTS artifacts (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Cloud storage source tracking
  source_provider TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_path TEXT NOT NULL,

  -- Core file metadata
  name TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- Temporal metadata (from cloud provider)
  created_date timestamptz,
  modified_date timestamptz,
  captured_date timestamptz NOT NULL DEFAULT now(),

  -- Extracted content metadata
  title TEXT,
  description_markdown TEXT,
  authors TEXT[],
  keywords TEXT[],

  -- Media-specific metadata (EXIF, dimensions, duration, etc.)
  media_metadata jsonb DEFAULT '{}'::jsonb,

  -- Classification and curation
  tags TEXT[],
  categories TEXT[],
  confidence FLOAT,

  -- Cryptographic verification (IntegrityProof)
  integrity jsonb,

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Prevent duplicate ingestion from same source
  UNIQUE(profile_id, source_provider, source_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_artifacts_profile_id ON artifacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_source_provider ON artifacts(source_provider);
CREATE INDEX IF NOT EXISTS idx_artifacts_tags ON artifacts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_artifacts_categories ON artifacts USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_captured_date ON artifacts(captured_date DESC);
