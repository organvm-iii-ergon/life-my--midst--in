/**
 * Local Filesystem Cloud Storage Provider
 *
 * Implements CloudStorageProvider interface for local filesystem paths.
 * Useful for:
 * - External USB drives or archives
 * - NAS (Network Attached Storage) mounted locally
 * - iCloud Drive on macOS (mounts at ~/Library/Mobile Documents)
 * - Local backups organized in folders
 * - Development/testing with mock data
 *
 * No OAuth required - uses filesystem permissions.
 *
 * Environment variables:
 * - None required (paths passed via credentials.folderPath)
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { createReadStream } from "node:fs";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import type {
  CloudStorageProvider,
  CloudCredentials,
  CloudFile,
  ListOptions,
  ProviderHealthStatus
} from "./cloud-storage-provider";

export class LocalFilesystemProvider implements CloudStorageProvider {
  readonly name = "local" as const;

  private basePath: string;
  private depth: number = 0;

  /**
   * Initialize local filesystem provider.
   */
  constructor(credentials: CloudCredentials, depth?: number) {
    const folderPath = credentials.folderPath;
    if (!folderPath) {
      throw new Error("Local filesystem: Missing folderPath in credentials");
    }

    this.basePath = folderPath;
    this.depth = depth || 10; // Max recursion depth
  }

  /**
   * Authenticate (no-op for local filesystem).
   */
  async authenticate(_credentials: CloudCredentials): Promise<void> {
    // Verify the path is accessible
    try {
      const stats = await stat(this.basePath);
      if (!stats.isDirectory()) {
        throw new Error(`Local filesystem: Path is not a directory: ${this.basePath}`);
      }
    } catch (err) {
      throw new Error(`Local filesystem: Cannot access path: ${String(err)}`);
    }
  }

  /**
   * No OAuth needed for local filesystem.
   */
  getAuthorizationUrl(): string {
    throw new Error("Local filesystem: OAuth not supported");
  }

  /**
   * No token exchange for local filesystem.
   */
  async exchangeCodeForToken(): Promise<CloudCredentials> {
    throw new Error("Local filesystem: Token exchange not supported");
  }

  /**
   * List files from local filesystem with recursive traversal.
   * Async iterable for memory efficiency.
   *
   * Critical: Preserves file creation times from filesystem metadata.
   */
  async *listFiles(folderPath: string, options?: ListOptions): AsyncIterable<CloudFile> {
    const fullPath = join(this.basePath, folderPath);

    // Make this an async generator
    async function* traverse(
      this: LocalFilesystemProvider,
      currentPath: string,
      relativePath: string,
      currentDepth: number,
      options?: ListOptions
    ): AsyncIterable<CloudFile> {
      if (currentDepth > this.depth) return;

      try {
        const entries = await readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(currentPath, entry.name);
          const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

          // Skip hidden files and common exclusions
          if (
            entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === ".git"
          ) {
            continue;
          }

          // Check exclusion patterns
          if (options?.filters?.excludePatterns) {
            if (this.matchesPattern(relPath, options.filters.excludePatterns)) {
              continue;
            }
          }

          if (entry.isDirectory()) {
            if (options?.recursive !== false) {
              yield* traverse.call(this, fullPath, relPath, currentDepth + 1, options);
            }
          } else if (entry.isFile()) {
            // Check inclusion patterns
            if (options?.filters?.includePatterns) {
              if (!this.matchesPattern(relPath, options.filters.includePatterns)) {
                continue;
              }
            }

            const stats = await stat(fullPath);
            const cloudFile = await this.mapLocalFileToCloudFile(
              fullPath,
              entry.name,
              relPath,
              stats
            );

            // Filter by file size if specified
            if (options?.filters?.maxFileSize && cloudFile.size > options.filters.maxFileSize) {
              continue;
            }

            yield cloudFile;
          }
        }
      } catch (err) {
        throw new Error(`Local filesystem: Traverse error at ${currentPath}: ${String(err)}`);
      }
    }

    yield* traverse.call(this, fullPath, "", 0, options);
  }

  /**
   * Get metadata for a specific file.
   * Used for delta sync: check if file has been modified since last sync.
   */
  async getMetadata(fileId: string): Promise<CloudFile> {
    const fullPath = join(this.basePath, fileId);

    try {
      const stats = await stat(fullPath);
      const filename = fileId.split("/").pop() || fileId;

      return this.mapLocalFileToCloudFile(fullPath, filename, fileId, stats);
    } catch (err) {
      throw new Error(`Local filesystem: Get metadata error: ${String(err)}`);
    }
  }

  /**
   * Download file from local filesystem to destination.
   * Simple copy operation (source and destination on same filesystem).
   */
  async downloadFile(
    fileId: string,
    destinationPath: string,
    onProgress?: (bytesDownloaded: number) => void
  ): Promise<void> {
    const sourcePath = join(this.basePath, fileId);

    try {
      const stats = await stat(sourcePath);

      // Stream copy for memory efficiency
      const readStream = createReadStream(sourcePath);
      const writeStream = createWriteStream(destinationPath);

      let downloadedBytes = 0;
      readStream.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        if (onProgress) {
          onProgress(downloadedBytes);
        }
      });

      await pipeline(readStream, writeStream);

      console.log(`Downloaded ${stats.size} bytes to ${destinationPath}`);
    } catch (err) {
      throw new Error(`Local filesystem: Download error: ${String(err)}`);
    }
  }

  /**
   * Check if provider is healthy (path is accessible).
   */
  async checkHealth(): Promise<ProviderHealthStatus> {
    try {
      const stats = await stat(this.basePath);
      if (stats.isDirectory()) {
        return {
          healthy: true,
          provider: "local",
          message: `Path accessible: ${this.basePath}`,
          lastChecked: new Date().toISOString()
        };
      } else {
        return {
          healthy: false,
          provider: "local",
          message: `Path is not a directory: ${this.basePath}`,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (err) {
      return {
        healthy: false,
        provider: "local",
        message: `Cannot access path: ${String(err)}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Private helper: Map local filesystem file to CloudFile.
   * CRUCIAL: Preserves birthtime (creation time) from filesystem stats.
   */
  private async mapLocalFileToCloudFile(
    fullPath: string,
    filename: string,
    relativePath: string,
    stats: Awaited<ReturnType<typeof stat>>
  ): Promise<CloudFile> {
    // Use birthtime (file creation time) if available, else mtime (modification time)
    // Note: birthtime is not available on all filesystems (Linux ext4 doesn't have it)
    const createdTime = stats.birthtime?.toISOString() || stats.mtime.toISOString();

    // Guess MIME type from extension
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeType = this.guessMimeType(ext);

    return {
      fileId: relativePath,
      name: filename,
      path: relativePath,
      mimeType,
      size: Number(stats.size),
      createdTime, // CRUCIAL: File creation time
      modifiedTime: stats.mtime.toISOString(),
      accessedTime: stats.atime.toISOString(),
      checksum: this.hashPath(fullPath) // Simple hash for change detection
    };
  }

  /**
   * Private helper: Simple hash of file path for change detection.
   * In a real implementation, would compute SHA256 of file content.
   */
  private hashPath(path: string): string {
    // TODO: Compute actual SHA256 hash of file content in Phase 3
    return Buffer.from(path).toString("base64").slice(0, 16);
  }

  /**
   * Private helper: Match file path against glob patterns.
   */
  private matchesPattern(path: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      // Simple glob matching
      // TODO: Use proper glob library like 'minimatch' in Phase 2
      if (pattern === "*/**" || pattern === "**" || path.includes(pattern)) {
        return true;
      }

      // Handle simple wildcards
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      if (regex.test(path)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Private helper: Guess MIME type from file extension.
   */
  private guessMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      md: "text/markdown",
      json: "application/json",
      xml: "application/xml",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      m4a: "audio/mp4",
      flac: "audio/flac",
      mp4: "video/mp4",
      mkv: "video/x-matroska",
      mov: "video/quicktime",
      webm: "video/webm"
    };

    return mimeTypes[ext] || "application/octet-stream";
  }
}
