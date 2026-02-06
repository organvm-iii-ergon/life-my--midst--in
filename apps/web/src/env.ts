/**
 * Environment Variable Validation
 *
 * Validates public (NEXT_PUBLIC_*) and server-only env vars at startup.
 * Fails fast with clear error messages if required vars are missing.
 *
 * Note: NEXT_PUBLIC_* vars are inlined at build time by Next.js.
 * Server-only vars are only available in Server Components / Route Handlers.
 */
import { z } from 'zod';

/**
 * Public env vars (available in browser and server).
 * Next.js inlines these at build time.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_ORCH_BASE_URL: z.string().url().default('http://localhost:3002'),
  NEXT_PUBLIC_GRAPH_LAYOUT: z.string().default('radial'),
  NEXT_PUBLIC_DASHBOARD_TOKEN: z.string().optional(),
});

/**
 * Server-only env vars (only available in Server Components / Route Handlers).
 */
const serverEnvSchema = z.object({
  API_URL: z.string().url().default('http://localhost:3001'),
  ORCHESTRATOR_URL: z.string().url().default('http://localhost:3002'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _publicEnv: PublicEnv | undefined;
let _serverEnv: ServerEnv | undefined;

/**
 * Validate and return public environment variables.
 * Safe to call from both client and server code.
 */
export function getPublicEnv(): PublicEnv {
  if (_publicEnv) return _publicEnv;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env['NEXT_PUBLIC_API_BASE_URL'],
    NEXT_PUBLIC_ORCH_BASE_URL: process.env['NEXT_PUBLIC_ORCH_BASE_URL'],
    NEXT_PUBLIC_GRAPH_LAYOUT: process.env['NEXT_PUBLIC_GRAPH_LAYOUT'],
    NEXT_PUBLIC_DASHBOARD_TOKEN: process.env['NEXT_PUBLIC_DASHBOARD_TOKEN'],
  });

  if (!result.success) {
    console.error('Public env validation failed:', result.error.flatten().fieldErrors);
    throw new Error('Invalid public environment configuration');
  }

  _publicEnv = result.data;
  return _publicEnv;
}

/**
 * Validate and return server-only environment variables.
 * Only call from Server Components, Route Handlers, or middleware.
 */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Server env validation failed:', result.error.flatten().fieldErrors);
    throw new Error('Invalid server environment configuration');
  }

  _serverEnv = result.data;
  return _serverEnv;
}
