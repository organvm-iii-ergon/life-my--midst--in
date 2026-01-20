/**
 * Aetas CRUD Routes
 *
 * Profile-specific CRUD operations for aetas (life-stage) entries:
 * - GET /profiles/:id/aetas - List aetas for profile
 * - POST /profiles/:id/aetas - Create new aetas entry
 * - GET /profiles/:id/aetas/:aetasId - Get specific aetas
 * - PATCH /profiles/:id/aetas/:aetasId - Update aetas
 * - DELETE /profiles/:id/aetas/:aetasId - Remove aetas
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Aetas } from "@in-midst-my-life/schema";
import {
  AetasCreateSchema,
  AetasUpdateSchema,
  AetasQuerySchema,
  profileAetas,
  isValidUUID,
} from "./validation";

/**
 * Register profile-specific aetas CRUD routes.
 */
export async function registerAetasCrudRoutes(
  fastify: FastifyInstance
): Promise<void> {
  /**
   * GET /profiles/:id/aetas
   *
   * List all aetas (life-stage assignments) for a profile.
   * Returns the sequence of life-stages the profile has progressed through.
   */
  fastify.get<{
    Params: { id: string };
    Querystring: Partial<z.infer<typeof AetasQuerySchema>>;
  }>("/profiles/:id/aetas", async (request, reply) => {
    const { id } = request.params;

    if (!isValidUUID(id)) {
      return reply.status(400).send({
        error: "Invalid profile ID format",
        code: "INVALID_PROFILE_ID",
      });
    }

    let query: z.infer<typeof AetasQuerySchema>;
    try {
      query = AetasQuerySchema.parse({
        sort: request.query.sort,
        offset:
          request.query.offset !== undefined
            ? parseInt(request.query.offset as unknown as string, 10)
            : 0,
        limit:
          request.query.limit !== undefined
            ? Math.min(
                parseInt(request.query.limit as unknown as string, 10),
                100
              )
            : 50,
      });
    } catch (err) {
      return reply.status(400).send({
        error: "Invalid query parameters",
        code: "INVALID_QUERY",
        details: err instanceof z.ZodError ? err.errors : undefined,
      });
    }

    // Fetch profile's aetas or return empty (in production, from database)
    let aetas = profileAetas.get(id) || [];

    // Sort
    if (query.sort === "name") {
      aetas = [...aetas].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      aetas = [...aetas].sort((a, b) => a.order - b.order);
    }

    // Paginate
    const total = aetas.length;
    aetas = aetas.slice(query.offset, query.offset + query.limit);

    // Current aetas = last one in order
    const allProfileAetas = profileAetas.get(id) || [];
    const currentAetas =
      allProfileAetas.length > 0
        ? [...allProfileAetas].sort((a, b) => b.order - a.order)[0].name
        : undefined;

    const sequence = [...(profileAetas.get(id) || [])]
      .sort((a, b) => a.order - b.order)
      .map((a) => a.name);

    return reply.send({
      ok: true,
      profile_id: id,
      aetas,
      current_aetas: currentAetas,
      aetas_count: total,
      sequence,
      generated_at: new Date().toISOString(),
    });
  });

  /**
   * POST /profiles/:id/aetas
   *
   * Create a new aetas assignment for a profile.
   * Typically called when a person transitions into a new life-stage.
   */
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof AetasCreateSchema>;
  }>("/profiles/:id/aetas", async (request, reply) => {
    const { id } = request.params;

    if (!isValidUUID(id)) {
      return reply.status(400).send({
        error: "Invalid profile ID format",
        code: "INVALID_PROFILE_ID",
      });
    }

    let payload: z.infer<typeof AetasCreateSchema>;
    try {
      payload = AetasCreateSchema.parse(request.body);
    } catch (err) {
      return reply.status(400).send({
        error: "Invalid request body",
        code: "INVALID_PAYLOAD",
        details: err instanceof z.ZodError ? err.errors : undefined,
      });
    }

    // Create new aetas (in production, save to database)
    const newAetas: Aetas = {
      id: `aetas_${Date.now()}`,
      name: payload.name,
      latin_name: payload.latin_name,
      description: payload.description,
      order: payload.order,
      capability_profile: payload.capability_profile,
      typical_age_range: payload.typical_age_range,
      duration_months: payload.duration_months,
      transitions_to: payload.transitions_to,
      markers: payload.markers,
    };

    // Add to profile's aetas list
    const profileAetasList = profileAetas.get(id) || [];
    profileAetasList.push(newAetas);
    profileAetas.set(id, profileAetasList);

    return reply.status(201).send({
      ok: true,
      aetas: newAetas,
      profile_id: id,
      sequence_position: profileAetasList.length,
    });
  });

  /**
   * GET /profiles/:id/aetas/:aetasId
   *
   * Retrieve details of a specific aetas.
   */
  fastify.get<{
    Params: { id: string; aetasId: string };
  }>("/profiles/:id/aetas/:aetasId", async (request, reply) => {
    const { id, aetasId } = request.params;

    if (!isValidUUID(id)) {
      return reply.status(400).send({
        error: "Invalid profile ID format",
        code: "INVALID_PROFILE_ID",
      });
    }

    const profileAetasList = profileAetas.get(id) || [];
    const aetas = profileAetasList.find((a) => a.id === aetasId);

    if (!aetas) {
      return reply.status(404).send({
        error: "Aetas not found",
        code: "AETAS_NOT_FOUND",
      });
    }

    return reply.send({
      ok: true,
      aetas,
      profile_id: id,
    });
  });

  /**
   * PATCH /profiles/:id/aetas/:aetasId
   *
   * Update an existing aetas entry.
   */
  fastify.patch<{
    Params: { id: string; aetasId: string };
    Body: z.infer<typeof AetasUpdateSchema>;
  }>("/profiles/:id/aetas/:aetasId", async (request, reply) => {
    const { id, aetasId } = request.params;

    if (!isValidUUID(id)) {
      return reply.status(400).send({
        error: "Invalid profile ID format",
        code: "INVALID_PROFILE_ID",
      });
    }

    let payload: z.infer<typeof AetasUpdateSchema>;
    try {
      payload = AetasUpdateSchema.parse(request.body);
    } catch (err) {
      return reply.status(400).send({
        error: "Invalid request body",
        code: "INVALID_PAYLOAD",
        details: err instanceof z.ZodError ? err.errors : undefined,
      });
    }

    const profileAetasList = profileAetas.get(id) || [];
    const index = profileAetasList.findIndex((a) => a.id === aetasId);

    if (index === -1) {
      return reply.status(404).send({
        error: "Aetas not found",
        code: "AETAS_NOT_FOUND",
      });
    }

    // Update aetas (in-memory for now)
    const updated = { ...profileAetasList[index], ...payload };
    profileAetasList[index] = updated;

    return reply.send({
      ok: true,
      aetas: updated,
      profile_id: id,
    });
  });

  /**
   * DELETE /profiles/:id/aetas/:aetasId
   *
   * Remove an aetas assignment from profile.
   */
  fastify.delete<{
    Params: { id: string; aetasId: string };
  }>("/profiles/:id/aetas/:aetasId", async (request, reply) => {
    const { id, aetasId } = request.params;

    if (!isValidUUID(id)) {
      return reply.status(400).send({
        error: "Invalid profile ID format",
        code: "INVALID_PROFILE_ID",
      });
    }

    const profileAetasList = profileAetas.get(id) || [];
    const index = profileAetasList.findIndex((a) => a.id === aetasId);

    if (index === -1) {
      return reply.status(404).send({
        error: "Aetas not found",
        code: "AETAS_NOT_FOUND",
      });
    }

    const deleted = profileAetasList[index];
    profileAetasList.splice(index, 1);
    profileAetas.set(id, profileAetasList);

    return reply.send({
      ok: true,
      deleted_id: deleted.id,
      profile_id: id,
    });
  });
}
