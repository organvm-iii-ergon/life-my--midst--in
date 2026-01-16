import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthorizationError } from '@in-midst-my-life/core';

/**
 * Middleware: Requires admin role for protected endpoints
 * Protects: /admin/* routes from non-admin users
 * Usage:
 *   fastify.get('/admin/endpoint',
 *     { onRequest: [createAdminMiddleware()] },
 *     handler
 *   );
 */
export function createAdminMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Check if user is authenticated and has admin role
    const user = request.user; // From auth middleware

    if (!user) {
      return reply.code(401).send({
        ok: false,
        error: 'unauthorized',
        message: 'Authentication required'
      });
    }

    if (!user.roles?.includes('admin')) {
      throw AuthorizationError.adminOnly('access this resource');
    }

    // Continue to handler
  };
}
