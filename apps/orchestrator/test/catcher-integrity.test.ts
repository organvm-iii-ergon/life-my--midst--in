import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { CatcherAgent } from "../src/agents/catcher";
import type { Artifact } from "@in-midst-my-life/schema";
import { createArtifactRepo } from "../src/repositories/artifacts";
import { createCloudIntegrationRepo } from "../src/repositories/cloud-integrations";
import { createSyncStateRepo } from "../src/repositories/sync-state";
import { createProfileKeyRepo } from "../src/repositories/profile-keys";
import { createVerificationLogRepo } from "../src/repositories/verification-logs";
import { verifyIntegrity } from "@in-midst-my-life/core";

describe("CatcherAgent Integrity Proof Generation", () => {
  let agent: CatcherAgent;
  let profileId: string;
  let profileKeyRepo: ReturnType<typeof createProfileKeyRepo>;
  let verificationLogRepo: ReturnType<typeof createVerificationLogRepo>;

  beforeEach(async () => {
    profileId = randomUUID();
    const artifactRepo = createArtifactRepo();
    const cloudIntegrationRepo = createCloudIntegrationRepo();
    const syncStateRepo = createSyncStateRepo();
    profileKeyRepo = createProfileKeyRepo();
    verificationLogRepo = createVerificationLogRepo();

    agent = new CatcherAgent(
      artifactRepo,
      cloudIntegrationRepo,
      syncStateRepo,
      profileKeyRepo,
      verificationLogRepo
    );
  });

  it("should generate integrity proof with DID signature", async () => {
    // Create a test artifact
    const artifact: Artifact = {
      id: randomUUID(),
      profileId,
      sourceProvider: "google_drive",
      sourceId: "test-file-123",
      sourcePath: "/My Drive/Documents/test.pdf",
      name: "test.pdf",
      artifactType: "academic_paper",
      mimeType: "application/pdf",
      fileSize: 1024000,
      capturedDate: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Access private method via type assertion
    const proof = await (agent as any).generateIntegrityProof(artifact, profileId);

    // Verify proof structure
    expect(proof).toBeDefined();
    expect(proof?.hash).toBeDefined();
    expect(proof?.signature).toBeDefined();
    expect(proof?.did).toBeDefined();
    expect(proof?.timestamp).toBeDefined();
    expect(typeof proof?.hash).toBe("string");
    expect(typeof proof?.signature).toBe("string");
    expect(typeof proof?.did).toBe("string");
    expect(proof?.did).toMatch(/^did:key:/);

    // Verify that a key pair was created
    const keyPair = await profileKeyRepo.getKeyPair(profileId);
    expect(keyPair).toBeDefined();
    expect(keyPair?.did).toBe(proof?.did);

    // Verify that a verification log was created
    const logs = await verificationLogRepo.findByEntity(artifact.id);
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log).toBeDefined();
    expect(log?.entityType).toBe("artifact");
    expect(log?.entityId).toBe(artifact.id);
    expect(log?.status).toBe("verified");
    expect(log?.source).toBe("automated");
    expect(log?.verifierLabel).toBe("Self-attestation (DID signature)");
  });

  it("should generate deterministic hash for same artifact properties", async () => {
    // Create two artifacts with identical immutable properties
    const artifact1: Artifact = {
      id: randomUUID(),
      profileId,
      sourceProvider: "google_drive",
      sourceId: "test-file-456",
      sourcePath: "/My Drive/test.pdf",
      name: "test.pdf",
      artifactType: "academic_paper",
      mimeType: "application/pdf",
      fileSize: 2048000,
      capturedDate: "2024-01-15T10:00:00.000Z",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const artifact2: Artifact = {
      ...artifact1,
      id: randomUUID(), // Different ID
      title: "Different Title", // Different metadata
      keywords: ["test"], // Different metadata
      status: "approved", // Different status
      createdAt: new Date().toISOString(), // Different timestamp
      updatedAt: new Date().toISOString() // Different timestamp
    };

    // Generate proofs for both
    const proof1 = await (agent as any).generateIntegrityProof(artifact1, profileId);
    const proof2 = await (agent as any).generateIntegrityProof(artifact2, profileId);

    // Hashes should be identical (only immutable properties are hashed)
    expect(proof1.hash).toBe(proof2.hash);

    // Signatures will be different due to different timestamps
    // but they should both be valid
    expect(proof1.signature).toBeDefined();
    expect(proof2.signature).toBeDefined();
  });

  it("should generate unique hashes for different artifact properties", async () => {
    const artifact1: Artifact = {
      id: randomUUID(),
      profileId,
      sourceProvider: "google_drive",
      sourceId: "file-1",
      sourcePath: "/path1",
      name: "file1.pdf",
      artifactType: "academic_paper",
      mimeType: "application/pdf",
      fileSize: 1000,
      capturedDate: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const artifact2: Artifact = {
      ...artifact1,
      id: randomUUID(),
      sourceId: "file-2", // Different sourceId
      fileSize: 2000 // Different fileSize
    };

    const proof1 = await (agent as any).generateIntegrityProof(artifact1, profileId);
    const proof2 = await (agent as any).generateIntegrityProof(artifact2, profileId);

    // Hashes should be different
    expect(proof1.hash).not.toBe(proof2.hash);
  });

  it("should verify signature with public key", async () => {
    const artifact: Artifact = {
      id: randomUUID(),
      profileId,
      sourceProvider: "dropbox",
      sourceId: "test-789",
      sourcePath: "/Documents/paper.pdf",
      name: "paper.pdf",
      artifactType: "academic_paper",
      mimeType: "application/pdf",
      fileSize: 500000,
      capturedDate: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const proof = await (agent as any).generateIntegrityProof(artifact, profileId);
    const keyPair = await profileKeyRepo.getKeyPair(profileId);

    expect(keyPair).toBeDefined();

    // Verify the signature using the public key
    const canonicalPayload = {
      sourceProvider: artifact.sourceProvider,
      sourceId: artifact.sourceId,
      sourcePath: artifact.sourcePath,
      fileSize: artifact.fileSize,
      capturedDate: artifact.capturedDate,
      mimeType: artifact.mimeType
    };

    const isValid = await verifyIntegrity(canonicalPayload, proof, keyPair!.publicKey);
    expect(isValid).toBe(true);
  });

  it("should reuse existing DID key pair for same profile", async () => {
    // Generate first proof
    const artifact1: Artifact = {
      id: randomUUID(),
      profileId,
      sourceProvider: "google_drive",
      sourceId: "file-1",
      sourcePath: "/path1",
      name: "file1.pdf",
      artifactType: "academic_paper",
      mimeType: "application/pdf",
      fileSize: 1000,
      capturedDate: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const proof1 = await (agent as any).generateIntegrityProof(artifact1, profileId);

    // Generate second proof
    const artifact2: Artifact = {
      ...artifact1,
      id: randomUUID(),
      sourceId: "file-2"
    };

    const proof2 = await (agent as any).generateIntegrityProof(artifact2, profileId);

    // Both proofs should use the same DID
    expect(proof1.did).toBe(proof2.did);
  });
});
