/**
 * Aetas Validation Schemas
 *
 * Shared Zod validation schemas and storage for aetas (life-stage) endpoints.
 */

import { z } from "zod";
import type { Aetas } from "@in-midst-my-life/schema";

/**
 * Schema for creating a new aetas entry
 */
export const AetasCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Name of life stage (e.g., 'Mastery')"),
  latin_name: z
    .string()
    .min(1)
    .max(100)
    .describe("Latin theatrical name (e.g., 'Magistralitas')"),
  description: z
    .string()
    .min(1)
    .describe("What characterizes this life-stage"),
  order: z
    .number()
    .int()
    .min(1)
    .describe("Sequential order in life arc (1-8)"),
  capability_profile: z
    .record(z.string())
    .optional()
    .describe("Key capabilities/competencies at this stage"),
  typical_age_range: z
    .object({
      min: z.number().int().optional(),
      max: z.number().int().optional(),
    })
    .optional()
    .describe("Typical age range (informational, not prescriptive)"),
  duration_months: z
    .number()
    .int()
    .optional()
    .describe("Typical duration in months"),
  transitions_to: z
    .array(z.string())
    .optional()
    .describe("IDs of aetas that typically follow"),
  markers: z
    .array(z.string())
    .optional()
    .describe("Milestones or achievements typical at this stage"),
});

/**
 * Schema for updating an existing aetas entry
 */
export const AetasUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  latin_name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  order: z.number().int().min(1).optional(),
  capability_profile: z.record(z.string()).optional(),
  typical_age_range: z
    .object({
      min: z.number().int().optional(),
      max: z.number().int().optional(),
    })
    .optional(),
  duration_months: z.number().int().optional(),
  transitions_to: z.array(z.string()).optional(),
  markers: z.array(z.string()).optional(),
});

/**
 * Schema for aetas list query parameters
 */
export const AetasQuerySchema = z.object({
  sort: z
    .enum(["order", "name"])
    .default("order")
    .describe("Sort order"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Pagination offset"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Pagination limit"),
});

/**
 * In-memory storage for profile-specific aetas assignments.
 * In production, this would be backed by PostgreSQL.
 */
export const profileAetas: Map<string, Aetas[]> = new Map();

/**
 * Simple UUID validation helper
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
