/**
 * iCloud Cloud Storage Provider
 *
 * Implements CloudStorageProvider interface for iCloud.
 *
 * IMPORTANT: iCloud has no official public API for accessing stored files.
 * Two approaches:
 *
 * 1. **Recommended for macOS users**: Mount iCloud Drive locally
 *    - iCloud Drive syncs to ~/Library/Mobile Documents/com~apple~CloudDocs/
 *    - Use LocalFilesystemProvider to crawl this directory
 *    - Files preserve creation dates in filesystem metadata
 *    - No authentication needed beyond filesystem permissions
 *
 * 2. **Alternative**: Use Apple Business Register (CloudKit) API
 *    - Requires Apple Developer account
 *    - Complex setup with certificate signing
 *    - Limited public documentation
 *    - Not recommended for initial implementation
 *
 * This implementation delegates to LocalFilesystemProvider when iCloud Drive
 * is detected on macOS, and provides guidance for other platforms.
 *
 * Environment variables:
 * - ICLOUD_DRIVE_PATH: Optional override for iCloud Drive mount path
 *   (defaults to ~/Library/Mobile Documents/com~apple~CloudDocs on macOS)
 */

import { homedir } from "node:os";
import { join } from "node:path";
import type {
  CloudStorageProvider,
  CloudCredentials,
  CloudFile,
  ListOptions,
  ProviderHealthStatus
} from "./cloud-storage-provider";
import { LocalFilesystemProvider } from "./local-fs-integration";

export class iCloudProvider implements CloudStorageProvider {
  readonly name = "icloud" as const;

  private delegate: LocalFilesystemProvider | null = null;
  private icloudDrivePath: string;

  /**
   * Initialize iCloud provider.
   * On macOS, delegates to LocalFilesystemProvider for ~/Library/Mobile Documents.
   * On other platforms, throws error.
   */
  constructor(credentials: CloudCredentials) {
    // Determine iCloud Drive path
    const envPath = process.env['ICLOUD_DRIVE_PATH'];
    if (envPath) {
      this.icloudDrivePath = envPath;
    } else if (process.platform === "darwin") {
      // macOS: iCloud Drive is synced locally
      this.icloudDrivePath = join(
        homedir(),
        "Library/Mobile Documents/com~apple~CloudDocs"
      );
    } else {
      throw new Error(
        "iCloud: No official API available. " +
          "On macOS, set ICLOUD_DRIVE_PATH to mount location. " +
          "On other platforms, access iCloud files through browser or iCloud for Windows."
      );
    }

    // Delegate to LocalFilesystemProvider
    this.delegate = new LocalFilesystemProvider({
      ...credentials,
      provider: "local",
      folderPath: this.icloudDrivePath
    });
  }

  /**
   * Authenticate (delegates to local filesystem provider).
   */
  async authenticate(credentials: CloudCredentials): Promise<void> {
    if (!this.delegate) {
      throw new Error("iCloud: Provider not initialized");
    }
    return this.delegate.authenticate(credentials);
  }

  /**
   * OAuth not supported for iCloud via this method.
   * Users authenticate via Apple ID when enabling iCloud Drive sync.
   */
  getAuthorizationUrl(): string {
    throw new Error(
      "iCloud: OAuth not supported. " +
        "Sign into iCloud in System Preferences → Apple ID → iCloud to sync iCloud Drive locally."
    );
  }

  /**
   * Token exchange not supported (delegates to filesystem).
   */
  async exchangeCodeForToken(): Promise<CloudCredentials> {
    throw new Error("iCloud: Token exchange not supported");
  }

  /**
   * List files from iCloud Drive (via local filesystem).
   * Async iterable for memory efficiency.
   *
   * Critical: Preserves file creation times from macOS filesystem metadata.
   */
  async *listFiles(folderPath: string, options?: ListOptions): AsyncIterable<CloudFile> {
    if (!this.delegate) {
      throw new Error("iCloud: Provider not initialized");
    }

    try {
      for await (const file of this.delegate.listFiles(folderPath, options)) {
        yield file;
      }
    } catch (err) {
      throw new Error(`iCloud: Listing error: ${String(err)}`);
    }
  }

  /**
   * Get metadata for a specific file (via local filesystem).
   */
  async getMetadata(fileId: string): Promise<CloudFile> {
    if (!this.delegate) {
      throw new Error("iCloud: Provider not initialized");
    }

    try {
      return await this.delegate.getMetadata(fileId);
    } catch (err) {
      throw new Error(`iCloud: Metadata error: ${String(err)}`);
    }
  }

  /**
   * Download file from iCloud Drive (via local filesystem).
   */
  async downloadFile(
    fileId: string,
    destinationPath: string,
    onProgress?: (bytesDownloaded: number) => void
  ): Promise<void> {
    if (!this.delegate) {
      throw new Error("iCloud: Provider not initialized");
    }

    try {
      return await this.delegate.downloadFile(fileId, destinationPath, onProgress);
    } catch (err) {
      throw new Error(`iCloud: Download error: ${String(err)}`);
    }
  }

  /**
   * Check if provider is healthy.
   * On macOS: checks if iCloud Drive mount exists.
   * On other platforms: returns unhealthy.
   */
  async checkHealth(): Promise<ProviderHealthStatus> {
    if (!this.delegate) {
      return {
        healthy: false,
        provider: "icloud",
        message: "iCloud provider not initialized",
        lastChecked: new Date().toISOString()
      };
    }

    try {
      const delegateHealth = await this.delegate.checkHealth();
      return {
        ...delegateHealth,
        provider: "icloud",
        message: `iCloud Drive at ${this.icloudDrivePath}: ${delegateHealth.message}`
      };
    } catch (err) {
      return {
        healthy: false,
        provider: "icloud",
        message: String(err),
        lastChecked: new Date().toISOString()
      };
    }
  }
}

/**
 * Helper: Detect if iCloud Drive is available and mounted.
 * Returns path if available, null otherwise.
 */
export async function detectiCloudDrive(): Promise<string | null> {
  if (process.platform !== "darwin") {
    return null; // iCloud Drive only syncs locally on macOS
  }

  const envPath = process.env['ICLOUD_DRIVE_PATH'];
  if (envPath) {
    return envPath;
  }

  const defaultPath = join(
    homedir(),
    "Library/Mobile Documents/com~apple~CloudDocs"
  );

  try {
    // Try to stat the path to verify it exists
    const { stat } = await import("node:fs/promises");
    const stats = await stat(defaultPath);
    if (stats.isDirectory()) {
      return defaultPath;
    }
  } catch {
    // Path doesn't exist
  }

  return null;
}

/**
 * Documentation: Using iCloud Files with Catcher/Crawler
 *
 * **For macOS Users:**
 * 1. Enable iCloud Drive in System Preferences → Apple ID → iCloud
 * 2. Check "iCloud Drive" to sync locally
 * 3. Files sync to: ~/Library/Mobile Documents/com~apple~CloudDocs/
 * 4. Set up catcher integration with provider="icloud"
 * 5. Catcher will crawl local iCloud Drive folder
 *
 * **For iOS/iPadOS:**
 * - No local filesystem access
 * - Not currently supported by catcher
 * - Future: May support CloudKit API with proper authentication
 *
 * **For Windows (iCloud for Windows):**
 * - iCloud Drive syncs to: C:\Users\{username}\iCloudDrive\
 * - Can use local provider with folderPath set to iCloud Drive location
 * - Or set ICLOUD_DRIVE_PATH environment variable
 *
 * **Creation Date Preservation:**
 * - macOS: Uses filesystem birthtime (st_birthtime)
 *   - Preserved when files sync from iCloud
 *   - Reflects original file creation date
 * - Windows: Uses NTFS file creation time (equivalent to birthtime)
 * - Linux: No native birthtime support (would use mtime as fallback)
 */
