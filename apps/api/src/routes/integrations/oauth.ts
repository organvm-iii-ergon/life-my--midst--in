/**
 * Integration OAuth Routes
 *
 * OAuth flow orchestration for cloud storage providers:
 * - POST /integrations/cloud-storage/connect - Initiate OAuth flow
 * - GET /integrations/cloud-storage/callback - OAuth callback handler
 */

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { artifactService } from "../../services/artifact-service";
import {
  ConnectSchema,
  getOAuthConfig,
  getOAuthScopes,
} from "./validation";

/**
 * Generate OAuth state token for CSRF protection.
 * State is stored in session or short-lived cache.
 */
function generateOAuthState(profileId: string, provider: string): string {
  const timestamp = Date.now();
  const random = randomUUID();
  return Buffer.from(`${profileId}:${provider}:${timestamp}:${random}`).toString(
    "base64"
  );
}

/**
 * Register OAuth flow routes.
 */
export async function registerOAuthRoutes(fastify: FastifyInstance) {
  /**
   * POST /integrations/cloud-storage/connect
   *
   * Initiate OAuth flow for a cloud storage provider.
   */
  fastify.post("/integrations/cloud-storage/connect", async (request, reply) => {
    try {
      const { provider, profileId } = ConnectSchema.parse(request.body);

      const config = getOAuthConfig(provider);
      if (!config || !config.clientId) {
        reply.code(400);
        return {
          ok: false,
          error: `provider_not_configured: ${provider}`,
          message: `OAuth credentials not configured for ${provider}. Check environment variables.`,
        };
      }

      // Generate OAuth state for CSRF protection
      const state = generateOAuthState(profileId, provider);

      // Build authorization URL with scopes
      const scopes = getOAuthScopes(provider);
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: scopes.join(" "),
        state,
        access_type: "offline", // Request refresh token
      });

      const authorizationUrl = `${config.authorizationUrl}?${params.toString()}`;

      return {
        ok: true,
        authorizationUrl,
        state,
        provider,
        profileId,
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        reply.code(400);
        return { ok: false, error: "validation_error", details: err.errors };
      }
      request.log.error(err);
      reply.code(500);
      return { ok: false, error: "failed_to_generate_auth_url" };
    }
  });

  /**
   * GET /integrations/cloud-storage/callback
   *
   * OAuth callback handler.
   */
  fastify.get("/integrations/cloud-storage/callback", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const { code, state, error } = query;

    // Check for user denial
    if (error) {
      reply.code(400);
      return {
        ok: false,
        error: `oauth_denied: ${error}`,
        message: "User denied permission or OAuth provider returned an error",
      };
    }

    if (!code || !state) {
      reply.code(400);
      return { ok: false, error: "missing_code_or_state" };
    }

    try {
      // Decode state to extract profileId and provider
      const stateDecoded = Buffer.from(state, "base64").toString("utf-8");
      const [profileId, provider] = stateDecoded.split(":").slice(0, 2);

      if (!profileId || !provider) {
        reply.code(400);
        return { ok: false, error: "invalid_state_format" };
      }

      const config = getOAuthConfig(provider);
      if (!config) {
        reply.code(400);
        return { ok: false, error: "invalid_provider" };
      }

      // Exchange authorization code for tokens
      try {
        const tokenResponse = await fetch(config.tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: config.clientId,
            client_secret: config.clientSecret, // allow-secret
            redirect_uri: config.redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          reply.code(502);
          return {
            ok: false,
            error: "token_exchange_failed",
            message: `Failed to exchange authorization code: ${errorData.error || tokenResponse.statusText}`,
          };
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token, expires_in, token_type } = tokens;

        if (!access_token) {
          reply.code(502);
          return {
            ok: false,
            error: "invalid_token_response",
            message: "Provider did not return an access token",
          };
        }

        // Encrypt tokens before storage
        const { encrypt } = await import("@in-midst-my-life/core");
        const accessTokenEncrypted = encrypt(access_token);
        const refreshTokenEncrypted = refresh_token
          ? encrypt(refresh_token)
          : undefined;

        // Calculate expiration timestamp
        const expiresAt = expires_in
          ? new Date(Date.now() + expires_in * 1000).toISOString()
          : undefined;

        const integrationId = randomUUID();
        const integration = await artifactService.createIntegration(
          {
            id: integrationId,
            profileId,
            provider: provider as any,
            status: "active",
            accessTokenEncrypted,
            refreshTokenEncrypted,
            tokenExpiresAt: expiresAt,
            metadata: {
              token_type: token_type || "Bearer",
              scope: tokens.scope,
              connected_at: new Date().toISOString(),
            },
            folderConfig: {
              includedFolders: [""],
              excludedPatterns: [],
              maxFileSizeMB: 100,
            },
          },
          profileId
        );

        return {
          ok: true,
          message: "Integration connected successfully",
          integration: {
            id: integration.id,
            provider: integration.provider,
            status: integration.status,
            connected_at: integration.metadata?.["connected_at"],
          },
          nextSteps:
            "User can now configure folder settings and initiate sync",
        };
      } catch (fetchError: unknown) {
        request.log.error({ err: fetchError }, "Token exchange error:");
        reply.code(502);
        return {
          ok: false,
          error: "token_exchange_failed",
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to communicate with OAuth provider",
        };
      }
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { ok: false, error: "failed_to_process_callback" };
    }
  });
}
