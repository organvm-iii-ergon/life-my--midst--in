/**
 * Type declarations for @in-midst-my-life/core/server subpath
 *
 * This declaration file enables TypeScript to resolve the /server subpath
 * under "moduleResolution": "node" which doesn't natively support package exports.
 *
 * The actual runtime implementation is at packages/core/src/server.ts
 * At runtime, pnpm's node_modules linking resolves this correctly.
 */
declare module "@in-midst-my-life/core/server" {
  import type {
    CloudStorageProvider,
    CloudFile,
    CloudCredentials,
    ListOptions,
    ExtractedFileMetadata,
    ProviderHealthStatus
  } from "@in-midst-my-life/core";

  // Re-export types for consumers
  export type {
    CloudStorageProvider,
    CloudFile,
    CloudCredentials,
    ListOptions,
    ExtractedFileMetadata,
    ProviderHealthStatus
  };

  // Cloud Storage Providers
  export class LocalFilesystemProvider implements CloudStorageProvider {
    constructor(basePath?: string);
    listFiles(options?: ListOptions): Promise<{ files: CloudFile[]; nextCursor?: string }>;
    downloadFile(fileId: string, destination: string, onProgress?: (bytes: number) => void): Promise<void>;
    getFileMetadata(fileId: string): Promise<CloudFile>;
    healthCheck(): Promise<ProviderHealthStatus>;
  }

  export class GoogleDriveProvider implements CloudStorageProvider {
    constructor(credentials: CloudCredentials);
    listFiles(options?: ListOptions): Promise<{ files: CloudFile[]; nextCursor?: string }>;
    downloadFile(fileId: string, destination: string, onProgress?: (bytes: number) => void): Promise<void>;
    getFileMetadata(fileId: string): Promise<CloudFile>;
    healthCheck(): Promise<ProviderHealthStatus>;
    refreshAccessToken?(): Promise<string>;
  }

  export class DropboxProvider implements CloudStorageProvider {
    constructor(credentials: CloudCredentials);
    listFiles(options?: ListOptions): Promise<{ files: CloudFile[]; nextCursor?: string }>;
    downloadFile(fileId: string, destination: string, onProgress?: (bytes: number) => void): Promise<void>;
    getFileMetadata(fileId: string): Promise<CloudFile>;
    healthCheck(): Promise<ProviderHealthStatus>;
    refreshAccessToken?(): Promise<string>;
  }

  export class iCloudProvider implements CloudStorageProvider {
    constructor(credentials: CloudCredentials);
    listFiles(options?: ListOptions): Promise<{ files: CloudFile[]; nextCursor?: string }>;
    downloadFile(fileId: string, destination: string, onProgress?: (bytes: number) => void): Promise<void>;
    getFileMetadata(fileId: string): Promise<CloudFile>;
    healthCheck(): Promise<ProviderHealthStatus>;
  }

  // Factory function to create the appropriate provider
  export function createCloudStorageProvider(
    provider: string,
    credentials: CloudCredentials
  ): CloudStorageProvider;
}
