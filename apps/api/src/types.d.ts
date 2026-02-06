import type { UserClaims } from './services/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserClaims;
  }
}
