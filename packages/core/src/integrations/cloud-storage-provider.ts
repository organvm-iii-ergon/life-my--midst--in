/**
 * Cloud Storage Provider Integration Interface
 *
 * Defines the contract for cloud storage providers (Google Drive, Dropbox, iCloud, local filesystem).
 * Implementations handle OAuth authentication, file listing, downloading, and metadata extraction.
 *
 * Design Principles:
 * - Async iterator pattern for file listing (memory-efficient pagination)
 * - Streaming file downloads (supports large files)
 * - Consistent metadata extraction across providers
 * - Error handling with provider-specific retry logic
 */

/**
 * Credentials needed to authenticate with a cloud provider.
 * Varies by provider:
 * - Google Drive: OAuth 2.0 client ID, secret, refresh token
 * - Dropbox: OAuth 2.0 refresh token
 * - iCloud: Username, password, or API token (complex 2FA handling)
 * - Local filesystem: Directory path (no auth needed)
 */
export interface CloudCredentials {
  provider: "google_drive" | "icloud" | "dropbox" | "local";
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  folderPath?: string; // For local filesystem
  metadata?: Record<string, unknown>; // Provider-specific metadata
}

/**
 * Options for listing files from cloud storage.
 * Supports filtering, pagination, and recursive traversal.
 */
export interface ListOptions {
  recursive?: boolean; // Traverse subdirectories
  pageSize?: number; // Pagination size (default: 100)
  includeMetadata?: boolean; // Include extended metadata (EXIF, etc.)
  filters?: {
    mimeTypes?: string[]; // e.g., ["application/pdf", "image/jpeg"]
    maxFileSize?: number; // Bytes
    excludePatterns?: string[]; // Glob patterns to exclude (e.g., "**/Private/**")
    includePatterns?: string[]; // Glob patterns to include (e.g., "**/Academic/**")
  };
}

/**
 * Metadata about a file in cloud storage.
 * Extracted from cloud provider API responses.
 */
export interface CloudFile {
  // Core identifiers
  fileId: string; // Cloud provider's unique file ID (for download/metadata)
  name: string; // Filename
  path: string; // Full path in cloud storage
  parentId?: string; // Parent folder ID (useful for hierarchy)

  // Basic metadata
  mimeType: string; // e.g., "application/pdf", "image/jpeg"
  size: number; // File size in bytes

  // Temporal metadata (crucial for artifacts)
  createdTime: string; // ISO 8601 creation timestamp (original file creation date)
  modifiedTime: string; // ISO 8601 last modification timestamp
  accessedTime?: string; // Last access time (if available)

  // Optional metadata from provider
  checksum?: string; // MD5, SHA256, or provider's checksum (for change detection)
  isFolder?: boolean; // Whether this is a directory
  webViewLink?: string; // URL to view file in web UI
  downloadUrl?: string; // URL to download file (if available)

  // Extended metadata (EXIF, document properties, etc.)
  // Populated only if ListOptions.includeMetadata = true
  extendedMetadata?: {
    exif?: Record<string, unknown>; // Image EXIF data
    documentMetadata?: Record<string, unknown>; // PDFs, DOCX: author, title, etc.
    imageMetadata?: Record<string, unknown>; // Images: dimensions, camera, GPS
    videoMetadata?: Record<string, unknown>; // Videos: duration, resolution, codec
    audioMetadata?: Record<string, unknown>; // Audio: duration, sample rate, bitrate
    [key: string]: unknown; // Provider-specific metadata
  };
}

/**
 * File metadata extracted by file processors.
 * Raw text and metadata extracted from downloaded files.
 */
export interface ExtractedFileMetadata {
  textContent?: string; // Extracted text (first 5000 chars for LLM classification)
  title?: string; // Extracted title (from PDF metadata, DOCX properties, etc.)
  author?: string; // Extracted author name
  keywords?: string[]; // Extracted keywords
  pageCount?: number; // For PDFs
  wordCount?: number; // For text documents
  dimensions?: { width: number; height: number }; // For images/videos
  duration?: number; // For audio/video (seconds)
  [key: string]: unknown; // Format-specific metadata
}

/**
 * Health check result for a cloud storage provider.
 * Used to verify credentials are valid and provider is accessible.
 */
export interface ProviderHealthStatus {
  healthy: boolean;
  provider: string;
  message?: string; // Error message if not healthy
  lastChecked: string; // ISO 8601 timestamp
  tokenExpiry?: string; // When OAuth token expires
}

/**
 * Interface for cloud storage providers.
 * Implementations: GoogleDriveProvider, DropboxProvider, iCloudProvider, LocalFilesystemProvider
 */
export interface CloudStorageProvider {
  /**
   * Provider name identifier.
   */
  readonly name: "google_drive" | "icloud" | "dropbox" | "local";

  /**
   * Authenticate with the cloud provider.
   * For OAuth-based providers (Google Drive, Dropbox, iCloud), this would
   * exchange an OAuth code for access/refresh tokens.
   * For local filesystem, this would verify folder accessibility.
   *
   * @param credentials Credentials needed for authentication
   * @throws Error if authentication fails
   */
  authenticate(credentials: CloudCredentials): Promise<void>;

  /**
   * List files in a folder from cloud storage.
   * Returns an async iterable for memory-efficient pagination.
   *
   * Important: This should extract creation dates from cloud metadata,
   * as they're crucial for artifact temporal tracking.
   *
   * @param folderPath Folder path/ID to list files from
   * @param options Listing options (filters, pagination, etc.)
   * @returns Async iterable of CloudFile objects
   * @throws Error if folder doesn't exist or access is denied
   *
   * @example
   * for await (const file of provider.listFiles("/My Drive/Academic Papers")) {
   *   console.log(`File: ${file.name}, Created: ${file.createdTime}`);
   * }
   */
  listFiles(folderPath: string, options?: ListOptions): AsyncIterable<CloudFile>;

  /**
   * Download a file from cloud storage to local filesystem.
   * Streams the download for memory efficiency (supports large files).
   *
   * @param fileId Cloud provider's file ID
   * @param destinationPath Local filesystem path to write to
   * @param onProgress Optional progress callback (bytes downloaded)
   * @throws Error if file not found or download fails
   *
   * @example
   * await provider.downloadFile("file_id_xyz", "/tmp/artifact.pdf", (bytes) => {
   *   console.log(`Downloaded ${bytes} bytes`);
   * });
   */
  downloadFile(
    fileId: string,
    destinationPath: string,
    onProgress?: (bytesDownloaded: number) => void
  ): Promise<void>;

  /**
   * Get detailed metadata about a specific file.
   * Used to detect changes (via checksum/modifiedTime) for delta sync.
   *
   * @param fileId Cloud provider's file ID
   * @returns File metadata including creation time, modification time, checksum
   * @throws Error if file not found
   */
  getMetadata(fileId: string): Promise<CloudFile>;

  /**
   * Check if the provider is healthy and credentials are valid.
   * Called periodically to detect token expiry or revocation.
   *
   * @returns Health status
   */
  checkHealth(): Promise<ProviderHealthStatus>;

  /**
   * Refresh OAuth token (if provider uses OAuth and token is expiring).
   * Called automatically before API requests if token is near expiry.
   *
   * @throws Error if refresh fails
   */
  refreshToken?(): Promise<void>;

  /**
   * Get OAuth authorization URL (for interactive auth flow).
   * Used by API endpoints to redirect user to OAuth provider.
   *
   * @param redirectUri Callback URL after authorization
   * @param scopes Requested OAuth scopes
   * @returns Full authorization URL
   *
   * @example
   * const url = provider.getAuthorizationUrl("http://localhost:3001/callback", ["files.readonly"]);
   * // Redirect user to this URL in browser
   */
  getAuthorizationUrl?(redirectUri: string, scopes?: string[]): string;

  /**
   * Exchange OAuth authorization code for tokens (part of OAuth flow).
   * Called by API callback handler after user authorizes.
   *
   * @param code Authorization code from OAuth provider
   * @param redirectUri Must match the one used in getAuthorizationUrl
   * @returns CloudCredentials with access/refresh tokens
   * @throws Error if code exchange fails
   */
  exchangeCodeForToken?(code: string, redirectUri: string): Promise<CloudCredentials>;
}

/**
 * Factory for creating provider instances.
 * Routes to provider-specific implementations.
 *
 * @example
 * const provider = createCloudStorageProvider("google_drive", credentials);
 */
export async function createCloudStorageProvider(
  providerType: "google_drive" | "icloud" | "dropbox" | "local",
  credentials: CloudCredentials
): Promise<CloudStorageProvider> {
  let provider: CloudStorageProvider;

  switch (providerType) {
    case "google_drive": {
      const { GoogleDriveProvider } = await import("./google-drive-integration");
      provider = new GoogleDriveProvider(credentials);
      break;
    }
    case "dropbox": {
      const { DropboxProvider } = await import("./dropbox-integration");
      provider = new DropboxProvider(credentials);
      break;
    }
    case "icloud": {
      const { iCloudProvider } = await import("./icloud-integration");
      provider = new iCloudProvider(credentials);
      break;
    }
    case "local": {
      const { LocalFilesystemProvider } = await import("./local-fs-integration");
      provider = new LocalFilesystemProvider(credentials);
      break;
    }
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }

  // Verify credentials are valid
  try {
    await provider.authenticate(credentials);
  } catch (err) {
    throw new Error(`Failed to authenticate with ${providerType}: ${String(err)}`);
  }

  return provider;
}
