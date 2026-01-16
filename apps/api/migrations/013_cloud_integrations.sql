-- Migration 013: Create cloud storage integration and sync state tables
--
-- This migration creates infrastructure for OAuth-based cloud storage integrations
-- (Google Drive, iCloud, Dropbox, local filesystem) and delta sync tracking.
--
-- Two tables:
-- 1. cloud_storage_integrations: Stores encrypted OAuth credentials, folder configuration, sync metadata
-- 2. artifact_sync_state: Tracks file-level sync state for efficient delta sync detection
--
-- Key design decisions:
-- 1. Tokens encrypted at rest (actual encryption happens in application code)
-- 2. JSONB folder_config stores flexible per-provider settings
-- 3. Sync state tracked per file to enable efficient incremental syncs
-- 4. UNIQUE constraint on (integration_id, source_file_id) prevents duplicate sync records

CREATE TABLE IF NOT EXISTS cloud_storage_integrations (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Cloud provider identifier
  provider TEXT NOT NULL,

  -- OAuth credentials (encrypted in application code before storage)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at timestamptz,

  -- Folder and file filtering configuration
  -- Example:
  -- {
  --   "includedFolders": ["/Academic Papers/", "/Portfolio/"],
  --   "excludedPatterns": ["**/Private/**", "**/Draft/**"],
  --   "maxFileSizeMB": 100,
  --   "allowedMimeTypes": ["application/pdf", "image/jpeg", "image/png"]
  -- }
  folder_config jsonb DEFAULT '{}'::jsonb,

  -- Last successful sync timestamp (for delta sync)
  last_synced_at timestamptz,

  -- Integration status
  -- active: Credentials valid, integration working
  -- expired: Access token expired, needs refresh
  -- revoked: User revoked authorization
  -- error: Recent errors, manual intervention needed
  status TEXT NOT NULL DEFAULT 'active',

  -- Provider-specific metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cloud_integrations_profile_id ON cloud_storage_integrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_cloud_integrations_provider ON cloud_storage_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_integrations_status ON cloud_storage_integrations(status);
CREATE INDEX IF NOT EXISTS idx_cloud_integrations_updated_at ON cloud_storage_integrations(updated_at DESC);

-- Separate index for querying active integrations by profile
CREATE INDEX IF NOT EXISTS idx_cloud_integrations_active ON cloud_storage_integrations(profile_id, status)
  WHERE status = 'active';


-- Table for tracking sync state of individual files across cloud sources
--
-- Used during delta sync to determine which files are new, modified, or deleted.
-- Enables efficient incremental syncs without re-downloading entire cloud storage.
--
-- One record per file per integration (file may exist in multiple clouds, each tracked separately).

CREATE TABLE IF NOT EXISTS artifact_sync_state (
  id uuid PRIMARY KEY,
  integration_id uuid NOT NULL REFERENCES cloud_storage_integrations(id) ON DELETE CASCADE,

  -- Cloud provider's unique file identifier
  source_file_id TEXT NOT NULL,

  -- Last modification timestamp from cloud API (used for delta detection)
  last_modified timestamptz NOT NULL,

  -- Content hash from cloud API (optional checksum for change detection)
  checksum TEXT,

  -- Reference to created artifact (if ingested)
  artifact_id uuid REFERENCES artifacts(id) ON DELETE SET NULL,

  -- Timestamp of last sync
  synced_at timestamptz DEFAULT now(),

  -- Prevent duplicate sync records for same file in same integration
  UNIQUE(integration_id, source_file_id)
);

CREATE INDEX IF NOT EXISTS idx_artifact_sync_state_integration_id ON artifact_sync_state(integration_id);
CREATE INDEX IF NOT EXISTS idx_artifact_sync_state_artifact_id ON artifact_sync_state(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_sync_state_synced_at ON artifact_sync_state(synced_at DESC);

-- Index for efficient delta sync queries (find files modified since last sync)
CREATE INDEX IF NOT EXISTS idx_artifact_sync_state_last_modified ON artifact_sync_state(integration_id, last_modified DESC);
