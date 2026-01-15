/**
 * Feature Gate Middleware for Fastify
 * Enforces subscription tier entitlements and rate limits
 *
 * Usage:
 *   fastify.post("/profiles/:id/hunter/search",
 *     { onRequest: [createFeatureGateMiddleware(licensing, "hunter_job_searches")] },
 *     handler
 *   )
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import type { FeatureKey } from "@in-midst-my-life/schema";
import type { LicensingService } from "@in-midst-my-life/core";

/**
 * Extend FastifyRequest to include feature gate info
 */
declare module "fastify" {
  interface FastifyRequest {
    featureGate?: {
      feature: FeatureKey;
      allowed: boolean;
      remaining: number;
      limitInfo?: string;
    };
  }
}

/**
 * Factory function to create a feature gate middleware
 *
 * @param licensing - The licensing service instance
 * @param feature - The feature key to check
 * @param amount - Amount of quota to consume (default: 1)
 * @returns Middleware function
 */
export function createFeatureGateMiddleware(
  licensing: LicensingService,
  feature: FeatureKey,
  amount: number = 1
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Ensure user is authenticated
    if (!request.user) {
      return reply.code(401).send({
        ok: false,
        error: "unauthorized",
        message: "Authentication required"
      });
    }

    // Extract profile ID from request (comes from params or user context)
    const profileId = (request.params as any).id || request.user.profileId;

    if (!profileId) {
      return reply.code(400).send({
        ok: false,
        error: "invalid_request",
        message: "Profile ID is required"
      });
    }

    try {
      // Check entitlement and consume quota
      const [allowed, remaining] = await licensing.checkAndConsume(
        profileId,
        feature,
        amount
      );

      // Attach feature gate info to request for logging/response
      request.featureGate = {
        feature,
        allowed,
        remaining,
        limitInfo: remaining === -1 ? "unlimited" : `${remaining} remaining`
      };

      // If not allowed, return 403
      if (!allowed) {
        const entitlements = await licensing.getEntitlements(profileId);
        const tierName = entitlements.tier;
        const featureLimit = entitlements.features[feature];

        return reply.code(403).send({
          ok: false,
          error: "quota_exceeded",
          message: `You have reached your monthly limit for ${feature}`,
          tier: tierName,
          feature,
          limit: featureLimit?.value === -1 ? "unlimited" : featureLimit?.value,
          used: featureLimit?.used,
          remaining: Math.max(0, (featureLimit?.value ?? 0) - (featureLimit?.used ?? 0)),
          resetPeriod: featureLimit?.resetPeriod,
          upgradeAvailable: tierName === "FREE" || tierName === "PRO"
        });
      }

      // Feature is allowed, continue to handler
    } catch (error) {
      // Log error and return 500
      console.error(`Feature gate check failed for ${feature}:`, error);
      return reply.code(500).send({
        ok: false,
        error: "internal_server_error",
        message: "Failed to check feature entitlements"
      });
    }
  };
}

/**
 * Optional feature gate middleware - doesn't fail if quota exceeded,
 * just logs the usage. Useful for tracking usage without enforcing limits.
 *
 * @param licensing - The licensing service instance
 * @param feature - The feature key to track
 * @param amount - Amount of quota to consume (default: 1)
 * @returns Middleware function
 */
export function createOptionalFeatureGateMiddleware(
  licensing: LicensingService,
  feature: FeatureKey,
  amount: number = 1
) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      return; // Skip if not authenticated
    }

    const profileId = (request.params as any).id || request.user.profileId;

    if (!profileId) {
      return; // Skip if no profile ID
    }

    try {
      const [allowed, remaining] = await licensing.checkAndConsume(
        profileId,
        feature,
        amount
      );

      request.featureGate = {
        feature,
        allowed,
        remaining,
        limitInfo: remaining === -1 ? "unlimited" : `${remaining} remaining`
      };

      // Don't fail, just track the usage
    } catch (error) {
      // Log but don't fail
      console.error(`Optional feature gate tracking failed for ${feature}:`, error);
    }
  };
}

/**
 * Helper to check if user can use feature without consuming quota
 * (useful for preflighting)
 */
export function createFeatureCheckMiddleware(licensing: LicensingService, feature: FeatureKey) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        ok: false,
        error: "unauthorized",
        message: "Authentication required"
      });
    }

    const profileId = (request.params as any).id || request.user.profileId;

    if (!profileId) {
      return reply.code(400).send({
        ok: false,
        error: "invalid_request",
        message: "Profile ID is required"
      });
    }

    try {
      const canUse = await licensing.canUse(profileId, feature);
      const entitlements = await licensing.getEntitlements(profileId);
      const featureLimit = entitlements.features[feature];

      request.featureGate = {
        feature,
        allowed: canUse,
        remaining: featureLimit?.value === -1 ? -1 : (featureLimit?.value ?? 0) - (featureLimit?.used ?? 0),
        limitInfo: featureLimit?.value === -1 ? "unlimited" : `${(featureLimit?.value ?? 0) - (featureLimit?.used ?? 0)} remaining`
      };
    } catch (error) {
      console.error(`Feature check failed for ${feature}:`, error);
      return reply.code(500).send({
        ok: false,
        error: "internal_server_error",
        message: "Failed to check feature entitlements"
      });
    }
  };
}
