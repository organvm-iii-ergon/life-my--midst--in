import { z } from "zod";
import { IntegrityProofSchema } from "./base";

/**
 * Enumeration of artifact types.
 *
 * Represents different classifications of creative and academic work
 * ingested from cloud storage sources.
 *
 * - `academic_paper`: Scholarly articles, dissertations, research papers
 * - `creative_writing`: Fiction, poetry, essays, memoirs
 * - `visual_art`: Paintings, illustrations, photography, digital art
 * - `presentation`: Slides, keynotes, talks, lectures
 * - `video`: Recorded talks, performances, documentaries
 * - `audio`: Podcasts, music recordings, interviews
 * - `dataset`: Research data, collections, archives
 * - `code_sample`: Code repositories, scripts, algorithms
 * - `other`: Uncategorized or novel artifact types
 *
 * @example
 * const type = ArtifactTypeSchema.parse("academic_paper"); // ✓
 */
export const ArtifactTypeSchema = z.enum([
  "academic_paper",
  "creative_writing",
  "visual_art",
  "presentation",
  "video",
  "audio",
  "dataset",
  "code_sample",
  "other"
]);

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

/**
 * Enumeration of cloud storage provider sources.
 *
 * Indicates where the artifact was originally discovered and ingested from.
 *
 * - `google_drive`: Google Drive file
 * - `icloud`: iCloud Photos or iCloud Drive
 * - `dropbox`: Dropbox file
 * - `local`: Local filesystem (external drives, archived folders)
 * - `manual`: Manually uploaded by user
 *
 * @example
 * const source = ArtifactSourceProviderSchema.parse("google_drive"); // ✓
 */
export const ArtifactSourceProviderSchema = z.enum([
  "google_drive",
  "icloud",
  "dropbox",
  "local",
  "manual"
]);

export type ArtifactSourceProvider = z.infer<typeof ArtifactSourceProviderSchema>;

/**
 * Enumeration of artifact approval statuses.
 *
 * Tracks the curation workflow state of an artifact.
 *
 * - `pending`: Ingested but not yet reviewed by user
 * - `approved`: User has reviewed and approved for inclusion in CV
 * - `rejected`: User declined to include in CV
 * - `archived`: Previously approved but now archived (soft delete)
 *
 * @example
 * const status = ArtifactStatusSchema.parse("pending"); // ✓
 */
export const ArtifactStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "archived"
]);

export type ArtifactStatus = z.infer<typeof ArtifactStatusSchema>;

/**
 * Schema for metadata extracted from files.
 *
 * Type-specific metadata that varies by file type:
 * - PDFs: page count, fonts, embedded media
 * - Images: EXIF data, camera info, GPS coordinates, dimensions
 * - Presentations: slide count, notes
 * - Videos: duration, resolution, codec
 * - Audio: duration, sample rate, bitrate
 *
 * @example
 * const metadata = {
 *   dimensions: { width: 1920, height: 1080 },
 *   exif: { cameraModel: "Canon EOS R5", iso: 400 },
 *   duration: 3600 // seconds
 * };
 */
export const MediaMetadataSchema = z.record(z.unknown()).optional();

export type MediaMetadata = z.infer<typeof MediaMetadataSchema>;

/**
 * Schema for a creative or academic artifact discovered via cloud storage crawling.
 *
 * Artifacts represent raw creative and academic work (papers, images, writing, presentations)
 * discovered from cloud storage sources. They are distinct from Projects and Publications:
 * - Projects: Professional work with organizations/roles
 * - Publications: Formal academic/creative output with venues
 * - Artifacts: Raw work discovered via crawling, awaiting curation
 *
 * Artifacts flow through an approval workflow (pending → approved) and can be linked
 * to existing Projects/Publications via ContentEdge relationships.
 *
 * Every artifact is cryptographically signed with the user's DID for blockchain-style
 * provenance (IntegrityProof). Optional external verification available for high-value
 * artifacts (dissertations, publications, exhibitions).
 *
 * Properties:
 * - `id`: UUID of the artifact
 * - `profileId`: UUID of the profile this artifact belongs to
 * - `sourceProvider`: Where the artifact was discovered (google_drive, icloud, etc.)
 * - `sourceId`: Cloud provider's unique file ID (for deduplication)
 * - `sourcePath`: Original path/URL in cloud storage
 * - `name`: Filename or title
 * - `artifactType`: Classification (academic_paper, visual_art, etc.)
 * - `mimeType`: MIME type (application/pdf, image/jpeg, etc.)
 * - `fileSize`: File size in bytes
 * - `createdDate`: Original creation date from cloud metadata
 * - `modifiedDate`: Last modification date from cloud metadata
 * - `capturedDate`: When we ingested it (always set, auto-generated)
 * - `title`: Extracted title (from LLM or metadata)
 * - `descriptionMarkdown`: Markdown description or summary
 * - `authors`: Array of author names (if extractable)
 * - `keywords`: Array of extracted keywords/tags
 * - `mediaMetadata`: Type-specific metadata (EXIF, dimensions, etc.)
 * - `tags`: User-defined tags for filtering/masking
 * - `categories`: User-defined categories (taxonomy still evolving)
 * - `confidence`: LLM classification confidence (0.0-1.0)
 * - `integrity`: Cryptographic proof (SHA256 hash + DID signature)
 * - `status`: Approval workflow status (pending/approved/rejected/archived)
 * - `createdAt`: Timestamp when artifact record was created
 * - `updatedAt`: Timestamp when artifact record was last updated
 *
 * @example
 * const artifact = ArtifactSchema.parse({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   profileId: "450e8400-e29b-41d4-a716-446655440000",
 *   sourceProvider: "google_drive",
 *   sourceId: "1abc123xyz",
 *   sourcePath: "/Academic Papers/2015_dissertation.pdf",
 *   name: "2015_dissertation.pdf",
 *   artifactType: "academic_paper",
 *   mimeType: "application/pdf",
 *   fileSize: 2500000,
 *   capturedDate: new Date().toISOString(),
 *   title: "Temporal Dynamics of Narrative Systems",
 *   authors: ["Jane Doe"],
 *   keywords: ["narrative", "temporal", "systems thinking"],
 *   tags: ["research", "phd", "completed"],
 *   status: "pending",
 *   confidence: 0.95,
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * });
 */
export const ArtifactSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),

  // Source tracking
  sourceProvider: ArtifactSourceProviderSchema,
  sourceId: z.string(), // Cloud provider's file ID for deduplication
  sourcePath: z.string(), // Original path/URL in cloud storage

  // Core file metadata
  name: z.string(), // Filename
  artifactType: ArtifactTypeSchema,
  mimeType: z.string(), // e.g., "application/pdf", "image/jpeg"
  fileSize: z.number().int().positive(), // Bytes

  // Temporal metadata
  createdDate: z.string().datetime().optional(), // Original creation date
  modifiedDate: z.string().datetime().optional(), // Last modified date
  capturedDate: z.string().datetime(), // When we ingested it

  // Extracted content metadata
  title: z.string().optional(), // Extracted or user-provided title
  descriptionMarkdown: z.string().optional(), // Summary or description
  authors: z.array(z.string()).optional(), // Extracted author names
  keywords: z.array(z.string()).optional(), // Extracted keywords

  // Media-specific metadata (EXIF, dimensions, duration, etc.)
  mediaMetadata: MediaMetadataSchema,

  // Classification & curation
  tags: z.array(z.string()).optional(), // User-defined tags for masks/filtering
  categories: z.array(z.string()).optional(), // User-defined taxonomy (evolving)
  confidence: z.number().min(0).max(1).optional(), // LLM classification confidence

  // Cryptographic verification
  integrity: IntegrityProofSchema.optional(), // SHA256 hash + DID signature

  // Approval workflow
  status: ArtifactStatusSchema.default("pending"),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Artifact = z.infer<typeof ArtifactSchema>;

/**
 * Schema for cloud storage integration configuration.
 *
 * Stores OAuth credentials, folder mappings, and sync state for
 * cloud storage providers (Google Drive, Dropbox, iCloud, local filesystem).
 *
 * Tokens are encrypted at rest using the core crypto utilities.
 *
 * Properties:
 * - `id`: UUID of this integration
 * - `profileId`: UUID of profile this integration belongs to
 * - `provider`: Cloud storage provider (google_drive, icloud, dropbox, local)
 * - `accessTokenEncrypted`: Encrypted OAuth access token
 * - `refreshTokenEncrypted`: Encrypted OAuth refresh token
 * - `tokenExpiresAt`: When access token expires
 * - `folderConfig`: Configuration for which folders to sync
 *   - `includedFolders`: Array of folder paths/IDs to include
 *   - `excludedPatterns`: Array of glob patterns to exclude
 *   - `maxFileSizeMB`: Maximum file size to ingest
 *   - `allowedMimeTypes`: Array of allowed MIME types
 * - `lastSyncedAt`: Timestamp of last successful sync
 * - `status`: Integration status (active/expired/revoked/error)
 * - `metadata`: Additional provider-specific metadata
 * - `createdAt`: Timestamp when integration was created
 * - `updatedAt`: Timestamp when integration was last updated
 */
export const CloudStorageIntegrationSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  provider: ArtifactSourceProviderSchema.exclude(["manual"]),
  accessTokenEncrypted: z.string().optional(),
  refreshTokenEncrypted: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  folderConfig: z.object({
    includedFolders: z.array(z.string()).optional(),
    excludedPatterns: z.array(z.string()).optional(),
    maxFileSizeMB: z.number().positive().default(100),
    allowedMimeTypes: z.array(z.string()).optional()
  }).optional(),
  lastSyncedAt: z.string().datetime().optional(),
  status: z.enum(["active", "expired", "revoked", "error"]).default("active"),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type CloudStorageIntegration = z.infer<typeof CloudStorageIntegrationSchema>;

/**
 * Schema for tracking sync state of individual files during delta sync.
 *
 * Used to detect which files are new, modified, or deleted since the last sync.
 * Enables efficient incremental syncs without re-downloading entire cloud storage.
 *
 * Properties:
 * - `id`: UUID of this sync state entry
 * - `integrationId`: UUID of the integration this file belongs to
 * - `sourceFileId`: Cloud provider's file ID
 * - `lastModified`: Last modification timestamp from cloud API
 * - `checksum`: Hash/checksum from cloud API (for change detection)
 * - `artifactId`: UUID of the artifact record (if created)
 * - `syncedAt`: Timestamp when this file was last synced
 */
export const ArtifactSyncStateSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string().uuid(),
  sourceFileId: z.string(),
  lastModified: z.string().datetime(),
  checksum: z.string().optional(),
  artifactId: z.string().uuid().optional(),
  syncedAt: z.string().datetime().default(() => new Date().toISOString())
});

export type ArtifactSyncState = z.infer<typeof ArtifactSyncStateSchema>;
