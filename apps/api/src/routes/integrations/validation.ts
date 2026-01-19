/**
 * Integration Validation Schemas
 *
 * Shared Zod validation schemas for cloud storage integration endpoints.
 */

import { z } from "zod";
import { ArtifactSourceProviderSchema } from "@in-midst-my-life/schema";

/**
 * Schema for initiating OAuth connection
 */
export const ConnectSchema = z.object({
  provider: ArtifactSourceProviderSchema.exclude(["manual"]),
  profileId: z.string().uuid(),
});

/**
 * Schema for updating integration configuration
 */
export const IntegrationUpdateSchema = z.object({
  folderConfig: z
    .object({
      includedFolders: z.array(z.string()).optional(),
      excludedPatterns: z.array(z.string()).optional(),
      maxFileSizeMB: z.number().positive().optional(),
      allowedMimeTypes: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.enum(["active", "expired", "revoked", "error"]).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema for sync operations
 */
export const SyncSchema = z.object({
  mode: z.enum(["full", "incremental"]).default("incremental"),
});

/**
 * OAuth provider configuration interface
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
}

/**
 * Get OAuth configuration for a provider.
 *
 * In production, these are loaded from environment variables.
 */
export function getOAuthConfig(provider: string): OAuthConfig | null {
  switch (provider) {
    case "google_drive":
      return {
        clientId: process.env["GOOGLE_DRIVE_CLIENT_ID"] || "",
        clientSecret: process.env["GOOGLE_DRIVE_CLIENT_SECRET"] || "",
        redirectUri:
          process.env["GOOGLE_DRIVE_REDIRECT_URI"] ||
          "http://localhost:3001/integrations/cloud-storage/callback",
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
      };

    case "dropbox":
      return {
        clientId: process.env["DROPBOX_APP_KEY"] || "",
        clientSecret: process.env["DROPBOX_APP_SECRET"] || "",
        redirectUri:
          process.env["DROPBOX_REDIRECT_URI"] ||
          "http://localhost:3001/integrations/cloud-storage/callback",
        authorizationUrl: "https://www.dropbox.com/oauth2/authorize",
        tokenUrl: "https://api.dropboxapi.com/oauth2/token",
      };

    case "icloud":
      // iCloud requires complex OAuth setup; for MVP, use local filesystem
      return null;

    case "local":
      // Local filesystem doesn't require OAuth
      return null;

    default:
      return null;
  }
}

/**
 * Get OAuth scopes for a provider.
 */
export function getOAuthScopes(provider: string): string[] {
  switch (provider) {
    case "google_drive":
      return [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ];

    case "dropbox":
      return ["files.content.read", "account_info.read"];

    case "icloud":
      return [];

    default:
      return [];
  }
}

/**
 * Get OAuth token revocation URL for a provider.
 */
export function getRevokeTokenUrl(provider: string): string | null {
  switch (provider) {
    case "google_drive":
      return "https://oauth2.googleapis.com/revoke";

    case "dropbox":
      return "https://api.dropboxapi.com/2/auth/token/revoke";

    default:
      return null;
  }
}
