/**
 * Artifact Service
 *
 * Business logic layer for artifact management including:
 * - CRUD operations (create, read, update, delete)
 * - Approval workflow (pending → approved/rejected)
 * - Filtering and pagination
 * - Cloud storage integration management
 *
 * Follows repository pattern for data access.
 */

import { randomUUID } from "node:crypto";
import type {
  Artifact,
  CloudStorageIntegration,
  ArtifactSyncState,
  ArtifactType,
  ArtifactStatus
} from "@in-midst-my-life/schema";

/**
 * Artifact service interface.
 *
 * Defines contract for artifact operations.
 */
export interface IArtifactService {
  // Artifact CRUD
  getArtifact(artifactId: string, profileId: string): Promise<Artifact | null>;
  listArtifacts(
    profileId: string,
    filters?: ArtifactListFilters,
    pagination?: { offset: number; limit: number }
  ): Promise<{ artifacts: Artifact[]; total: number }>;
  createArtifact(artifact: Partial<Artifact>, profileId: string): Promise<Artifact>;
  updateArtifact(
    artifactId: string,
    profileId: string,
    updates: Partial<Artifact>
  ): Promise<Artifact | null>;
  deleteArtifact(artifactId: string, profileId: string): Promise<boolean>;

  // Approval workflow
  approveArtifact(artifactId: string, profileId: string): Promise<Artifact | null>;
  rejectArtifact(
    artifactId: string,
    profileId: string,
    reason?: string
  ): Promise<Artifact | null>;

  // Cloud integrations
  createIntegration(
    integration: Partial<CloudStorageIntegration>,
    profileId: string
  ): Promise<CloudStorageIntegration>;
  getIntegration(integrationId: string, profileId: string): Promise<CloudStorageIntegration | null>;
  listIntegrations(profileId: string): Promise<CloudStorageIntegration[]>;
  updateIntegration(
    integrationId: string,
    profileId: string,
    updates: Partial<CloudStorageIntegration>
  ): Promise<CloudStorageIntegration | null>;
  deleteIntegration(integrationId: string, profileId: string): Promise<boolean>;

  // Sync state tracking
  getSyncState(
    integrationId: string,
    sourceFileId: string
  ): Promise<ArtifactSyncState | null>;
  upsertSyncState(syncState: Partial<ArtifactSyncState>): Promise<ArtifactSyncState>;
}

/**
 * Artifact list filter options.
 */
export interface ArtifactListFilters {
  status?: ArtifactStatus;
  type?: ArtifactType;
  tags?: string[];
  categories?: string[];
  sourceProvider?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Mock artifact service implementation.
 *
 * In production, this would be backed by a real database repository.
 * For now, we provide a mock implementation for testing/development.
 */
export class MockArtifactService implements IArtifactService {
  private artifacts: Map<string, Artifact> = new Map();
  private integrations: Map<string, CloudStorageIntegration> = new Map();
  private syncStates: Map<string, ArtifactSyncState> = new Map();

  // Artifact CRUD
  async getArtifact(artifactId: string, profileId: string): Promise<Artifact | null> {
    const artifact = this.artifacts.get(artifactId);
    return artifact && artifact.profileId === profileId ? artifact : null;
  }

  async listArtifacts(
    profileId: string,
    filters?: ArtifactListFilters,
    pagination?: { offset: number; limit: number }
  ): Promise<{ artifacts: Artifact[]; total: number }> {
    let artifacts = Array.from(this.artifacts.values()).filter(
      (a) => a.profileId === profileId
    );

    // Apply filters
    if (filters) {
      if (filters.status) {
        artifacts = artifacts.filter((a) => a.status === filters.status);
      }
      if (filters.type) {
        artifacts = artifacts.filter((a) => a.artifactType === filters.type);
      }
      if (filters.tags && filters.tags.length > 0) {
        artifacts = artifacts.filter((a) =>
          filters.tags?.some((tag) => a.tags?.includes(tag))
        );
      }
      if (filters.sourceProvider) {
        artifacts = artifacts.filter((a) => a.sourceProvider === filters.sourceProvider);
      }
    }

    // Apply pagination
    const offset = pagination?.offset ?? 0;
    const limit = pagination?.limit ?? 20;
    const paginated = artifacts.slice(offset, offset + limit);

    return { artifacts: paginated, total: artifacts.length };
  }

  async createArtifact(
    artifact: Partial<Artifact>,
    profileId: string
  ): Promise<Artifact> {
    const now = new Date().toISOString();
    const fullArtifact: Artifact = {
      id: artifact.id ?? randomUUID(),
      profileId,
      sourceProvider: artifact.sourceProvider ?? "manual",
      sourceId: artifact.sourceId ?? "",
      sourcePath: artifact.sourcePath ?? "",
      name: artifact.name ?? "Untitled",
      artifactType: artifact.artifactType ?? "other",
      mimeType: artifact.mimeType ?? "application/octet-stream",
      fileSize: artifact.fileSize ?? 0,
      capturedDate: artifact.capturedDate ?? now,
      status: artifact.status ?? "pending",
      createdAt: artifact.createdAt ?? now,
      updatedAt: artifact.updatedAt ?? now,
      ...artifact
    };

    this.artifacts.set(fullArtifact.id, fullArtifact);
    return fullArtifact;
  }

  async updateArtifact(
    artifactId: string,
    profileId: string,
    updates: Partial<Artifact>
  ): Promise<Artifact | null> {
    const existing = await this.getArtifact(artifactId, profileId);
    if (!existing) return null;

    const updated: Artifact = {
      ...existing,
      ...updates,
      id: existing.id,
      profileId: existing.profileId,
      updatedAt: new Date().toISOString()
    };

    this.artifacts.set(artifactId, updated);
    return updated;
  }

  async deleteArtifact(artifactId: string, profileId: string): Promise<boolean> {
    const artifact = await this.getArtifact(artifactId, profileId);
    if (!artifact) return false;
    this.artifacts.delete(artifactId);
    return true;
  }

  // Approval workflow
  async approveArtifact(artifactId: string, profileId: string): Promise<Artifact | null> {
    return this.updateArtifact(artifactId, profileId, {
      status: "approved"
    });
  }

  async rejectArtifact(
    artifactId: string,
    profileId: string,
    reason?: string
  ): Promise<Artifact | null> {
    return this.updateArtifact(artifactId, profileId, {
      status: "rejected",
      descriptionMarkdown: reason ? `Rejected: ${reason}` : undefined
    });
  }

  // Cloud integrations
  async createIntegration(
    integration: Partial<CloudStorageIntegration>,
    profileId: string
  ): Promise<CloudStorageIntegration> {
    const now = new Date().toISOString();
    const fullIntegration: CloudStorageIntegration = {
      id: integration.id ?? randomUUID(),
      profileId,
      provider: integration.provider ?? "google_drive",
      status: integration.status ?? "active",
      createdAt: integration.createdAt ?? now,
      updatedAt: integration.updatedAt ?? now,
      ...integration
    };

    this.integrations.set(fullIntegration.id, fullIntegration);
    return fullIntegration;
  }

  async getIntegration(
    integrationId: string,
    profileId: string
  ): Promise<CloudStorageIntegration | null> {
    const integration = this.integrations.get(integrationId);
    return integration && integration.profileId === profileId ? integration : null;
  }

  async listIntegrations(profileId: string): Promise<CloudStorageIntegration[]> {
    return Array.from(this.integrations.values()).filter(
      (i) => i.profileId === profileId
    );
  }

  async updateIntegration(
    integrationId: string,
    profileId: string,
    updates: Partial<CloudStorageIntegration>
  ): Promise<CloudStorageIntegration | null> {
    const existing = await this.getIntegration(integrationId, profileId);
    if (!existing) return null;

    const updated: CloudStorageIntegration = {
      ...existing,
      ...updates,
      id: existing.id,
      profileId: existing.profileId,
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(integrationId, updated);
    return updated;
  }

  async deleteIntegration(integrationId: string, profileId: string): Promise<boolean> {
    const integration = await this.getIntegration(integrationId, profileId);
    if (!integration) return false;
    this.integrations.delete(integrationId);
    return true;
  }

  // Sync state tracking
  async getSyncState(
    integrationId: string,
    sourceFileId: string
  ): Promise<ArtifactSyncState | null> {
    const key = `${integrationId}:${sourceFileId}`;
    return this.syncStates.get(key) ?? null;
  }

  async upsertSyncState(syncState: Partial<ArtifactSyncState>): Promise<ArtifactSyncState> {
    const now = new Date().toISOString();
    const fullSyncState: ArtifactSyncState = {
      id: syncState.id ?? randomUUID(),
      integrationId: syncState.integrationId ?? "",
      sourceFileId: syncState.sourceFileId ?? "",
      lastModified: syncState.lastModified ?? now,
      syncedAt: syncState.syncedAt ?? now,
      ...syncState
    };

    const key = `${fullSyncState.integrationId}:${fullSyncState.sourceFileId}`;
    this.syncStates.set(key, fullSyncState);
    return fullSyncState;
  }
}

/**
 * Singleton instance of artifact service.
 *
 * In production, this would be injected with real database repositories.
 */
export const artifactService = new MockArtifactService();
