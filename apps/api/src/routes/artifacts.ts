/**
 * Artifact Routes
 *
 * REST API endpoints for artifact CRUD and approval workflow:
 * - GET /profiles/:profileId/artifacts - List artifacts (with filters)
 * - GET /profiles/:profileId/artifacts/pending - List pending artifacts
 * - GET /profiles/:profileId/artifacts/:artifactId - Get artifact details
 * - PATCH /profiles/:profileId/artifacts/:artifactId - Update metadata
 * - POST /profiles/:profileId/artifacts/:artifactId/approve - Approve artifact
 * - POST /profiles/:profileId/artifacts/:artifactId/reject - Reject artifact
 * - DELETE /profiles/:profileId/artifacts/:artifactId - Delete artifact
 * - POST /profiles/:profileId/artifacts/:artifactId/links - Link to project/publication
 *
 * All endpoints require authentication (user owns the profile).
 */

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { ArtifactSchema, ArtifactStatusSchema } from "@in-midst-my-life/schema";
import { artifactService } from "../services/artifact-service";

/**
 * Register artifact routes.
 *
 * @param fastify Fastify instance
 */
export async function registerArtifactRoutes(fastify: FastifyInstance) {
  /**
   * GET /profiles/:profileId/artifacts
   *
   * List artifacts with optional filtering and pagination.
   *
   * Query parameters:
   * - status: Filter by status (pending, approved, rejected, archived)
   * - type: Filter by artifact type
   * - tags: Filter by tags (comma-separated)
   * - offset: Pagination offset (default: 0)
   * - limit: Pagination limit (default: 20)
   *
   * @example
   * GET /profiles/123/artifacts?status=pending&type=academic_paper&limit=10
   */
  fastify.get(
    "/profiles/:profileId/artifacts",
    async (request, reply) => {
      const { profileId } = request.params as { profileId: string };
      const query = request.query as Record<string, unknown>;

      // Parse filters
      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.type) filters.type = query.type;
      if (query.tags) {
        const tagsStr = String(query.tags);
        filters.tags = tagsStr.split(",").map((t) => t.trim());
      }
      if (query.sourceProvider) filters.sourceProvider = query.sourceProvider;

      // Parse pagination
      const offset = Number(query.offset ?? 0);
      const limit = Math.min(Number(query.limit ?? 20), 100); // Max 100 items per page

      try {
        const result = await artifactService.listArtifacts(profileId, filters, {
          offset,
          limit
        });

        return {
          ok: true,
          data: result.artifacts,
          pagination: {
            offset,
            limit,
            total: result.total
          }
        };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_list_artifacts" };
      }
    }
  );

  /**
   * GET /profiles/:profileId/artifacts/pending
   *
   * List artifacts awaiting approval.
   *
   * @example
   * GET /profiles/123/artifacts/pending
   */
  fastify.get(
    "/profiles/:profileId/artifacts/pending",
    async (request, reply) => {
      const { profileId } = request.params as { profileId: string };
      const query = request.query as Record<string, unknown>;

      const offset = Number(query.offset ?? 0);
      const limit = Math.min(Number(query.limit ?? 20), 100);

      try {
        const result = await artifactService.listArtifacts(
          profileId,
          { status: "pending" },
          { offset, limit }
        );

        return {
          ok: true,
          data: result.artifacts,
          pagination: {
            offset,
            limit,
            total: result.total
          }
        };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_list_pending_artifacts" };
      }
    }
  );

  /**
   * GET /profiles/:profileId/artifacts/:artifactId
   *
   * Get a single artifact's details.
   *
   * @example
   * GET /profiles/123/artifacts/artifact-uuid
   */
  fastify.get(
    "/profiles/:profileId/artifacts/:artifactId",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };

      try {
        const artifact = await artifactService.getArtifact(artifactId, profileId);

        if (!artifact) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        return { ok: true, data: artifact };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_get_artifact" };
      }
    }
  );

  /**
   * PATCH /profiles/:profileId/artifacts/:artifactId
   *
   * Update artifact metadata (manual curation).
   *
   * Allows user to update:
   * - title, descriptionMarkdown
   * - tags, categories
   * - authors, keywords
   *
   * Prevents updating:
   * - source fields (sourceProvider, sourceId, sourcePath)
   * - temporal fields (createdDate, modifiedDate, capturedDate)
   * - approval status (use approve/reject endpoints)
   *
   * @example
   * PATCH /profiles/123/artifacts/artifact-uuid
   * {
   *   "title": "Updated Title",
   *   "tags": ["updated", "research"]
   * }
   */
  fastify.patch(
    "/profiles/:profileId/artifacts/:artifactId",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };
      const updates = request.body as Record<string, unknown>;

      // Prevent updating protected fields
      const protectedFields = [
        "id",
        "profileId",
        "sourceProvider",
        "sourceId",
        "sourcePath",
        "createdDate",
        "modifiedDate",
        "capturedDate",
        "status",
        "integrity",
        "createdAt",
        "updatedAt"
      ];

      const safeUpdates: any = {};
      for (const [key, value] of Object.entries(updates)) {
        if (!protectedFields.includes(key)) {
          safeUpdates[key] = value;
        }
      }

      try {
        const updated = await artifactService.updateArtifact(
          artifactId,
          profileId,
          safeUpdates
        );

        if (!updated) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        return { ok: true, data: updated };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_update_artifact" };
      }
    }
  );

  /**
   * POST /profiles/:profileId/artifacts/:artifactId/approve
   *
   * Approve an artifact for inclusion in CV.
   *
   * Changes status from "pending" to "approved".
   *
   * @example
   * POST /profiles/123/artifacts/artifact-uuid/approve
   */
  fastify.post(
    "/profiles/:profileId/artifacts/:artifactId/approve",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };

      try {
        const approved = await artifactService.approveArtifact(artifactId, profileId);

        if (!approved) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        return { ok: true, data: approved };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_approve_artifact" };
      }
    }
  );

  /**
   * POST /profiles/:profileId/artifacts/:artifactId/reject
   *
   * Reject an artifact (exclude from CV).
   *
   * Changes status from "pending" to "rejected".
   * Optionally stores rejection reason.
   *
   * @example
   * POST /profiles/123/artifacts/artifact-uuid/reject
   * {
   *   "reason": "Not relevant to current focus"
   * }
   */
  fastify.post(
    "/profiles/:profileId/artifacts/:artifactId/reject",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };
      const { reason } = request.body as { reason?: string };

      try {
        const rejected = await artifactService.rejectArtifact(
          artifactId,
          profileId,
          reason
        );

        if (!rejected) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        return { ok: true, data: rejected };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_reject_artifact" };
      }
    }
  );

  /**
   * DELETE /profiles/:profileId/artifacts/:artifactId
   *
   * Delete an artifact (soft delete - archive).
   *
   * Marks the artifact as archived rather than permanently deleting.
   *
   * @example
   * DELETE /profiles/123/artifacts/artifact-uuid
   */
  fastify.delete(
    "/profiles/:profileId/artifacts/:artifactId",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };

      try {
        // Soft delete by archiving
        const archived = await artifactService.updateArtifact(
          artifactId,
          profileId,
          { status: "archived" }
        );

        if (!archived) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        return { ok: true };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_delete_artifact" };
      }
    }
  );

  /**
   * POST /profiles/:profileId/artifacts/:artifactId/links
   *
   * Link artifact to a project or publication.
   *
   * Creates a ContentEdge relationship between artifact and target entity.
   * Useful for connecting discovered work to existing CV entries.
   *
   * TODO: Implement ContentEdge linking in Phase 6+
   *
   * @example
   * POST /profiles/123/artifacts/artifact-uuid/links
   * {
   *   "targetType": "project",
   *   "targetId": "project-uuid",
   *   "relationshipType": "derived_from"
   * }
   */
  fastify.post(
    "/profiles/:profileId/artifacts/:artifactId/links",
    async (request, reply) => {
      const { profileId, artifactId } = request.params as {
        profileId: string;
        artifactId: string;
      };
      const { targetType, targetId, relationshipType } = request.body as any;

      // Validate artifact exists
      try {
        const artifact = await artifactService.getArtifact(artifactId, profileId);
        if (!artifact) {
          reply.code(404);
          return { ok: false, error: "artifact_not_found" };
        }

        // TODO: Create ContentEdge in Phase 6+
        // For now, return success with stub

        return {
          ok: true,
          message: "ContentEdge creation stub - implement in Phase 6+",
          contentEdge: {
            id: randomUUID(),
            sourceId: artifactId,
            targetId,
            sourceType: "artifact",
            targetType,
            relationshipType: relationshipType ?? "related_to",
            context: {}
          }
        };
      } catch (err) {
        reply.code(500);
        return { ok: false, error: "failed_to_create_link" };
      }
    }
  );
}
