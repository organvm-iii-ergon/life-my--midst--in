/**
 * Admin Service Status Routes
 *
 * Exposes a single endpoint that reports the health and configuration
 * status of every external service the API depends on. Useful for the
 * admin dashboard to show which integrations are live vs mock.
 *
 * Requires admin role.
 *
 * GET /admin/service-status - Get status of all external services
 */

import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { createPermissionMiddleware } from '../middleware/auth';
import { Permission } from '../services/auth';

type ServiceHealth = 'healthy' | 'degraded' | 'unavailable' | 'mock';

interface ServiceStatus {
  name: string;
  status: ServiceHealth;
  mode: 'live' | 'mock' | 'unconfigured';
  latencyMs?: number;
  details?: string;
}

export function registerAdminServiceStatusRoutes(
  fastify: FastifyInstance,
  _opts: Record<string, unknown>,
  done: (err?: Error) => void,
): void {
  const adminAuth = createPermissionMiddleware(Permission.ADMIN_ACCESS);

  /**
   * GET /admin/service-status
   * Returns per-service connectivity and configuration status.
   */
  fastify.get('/admin/service-status', { onRequest: [adminAuth] }, async (_request, reply) => {
    const services: ServiceStatus[] = await Promise.all([
      checkPostgres(),
      checkRedis(),
      checkStripe(),
      checkOpenAI(),
      checkSentry(),
      checkJwt(),
    ]);

    const overall: ServiceHealth = services.some((s) => s.status === 'unavailable')
      ? 'degraded'
      : services.every((s) => s.status === 'healthy' || s.status === 'mock')
        ? 'healthy'
        : 'degraded';

    return reply.code(200).send({
      ok: true,
      overall,
      services,
      checkedAt: new Date().toISOString(),
    });
  });

  done();
}

async function checkPostgres(): Promise<ServiceStatus> {
  const connStr = process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'];
  if (!connStr) {
    return {
      name: 'PostgreSQL',
      status: 'unavailable',
      mode: 'unconfigured',
      details: 'No DATABASE_URL or POSTGRES_URL set',
    };
  }

  const pool = new Pool({ connectionString: connStr, connectionTimeoutMillis: 3000 });
  const start = Date.now();
  try {
    const res = await pool.query('SELECT 1 AS ok');
    const latencyMs = Date.now() - start;
    const ok = Array.isArray(res.rows) && res.rows.length > 0;
    return { name: 'PostgreSQL', status: ok ? 'healthy' : 'degraded', mode: 'live', latencyMs };
  } catch (err) {
    return {
      name: 'PostgreSQL',
      status: 'unavailable',
      mode: 'live',
      latencyMs: Date.now() - start,
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const redisUrl = process.env['REDIS_URL'];
  if (!redisUrl) {
    return {
      name: 'Redis',
      status: 'unavailable',
      mode: 'unconfigured',
      details: 'No REDIS_URL set — using in-memory cache fallback',
    };
  }

  const start = Date.now();
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: redisUrl, socket: { connectTimeout: 3000 } });
    await client.connect();
    await client.ping();
    const latencyMs = Date.now() - start;
    await client.quit();
    return { name: 'Redis', status: 'healthy', mode: 'live', latencyMs };
  } catch (err) {
    return {
      name: 'Redis',
      status: 'unavailable',
      mode: 'live',
      latencyMs: Date.now() - start,
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function checkStripe(): Promise<ServiceStatus> {
  const key = process.env['STRIPE_SECRET_KEY'] || '';
  if (!key || key === 'sk_test_mock') {
    return Promise.resolve({
      name: 'Stripe',
      status: 'mock',
      mode: 'mock',
      details: 'Using mock Stripe key',
    });
  }
  if (key.startsWith('sk_test_')) {
    return Promise.resolve({
      name: 'Stripe',
      status: 'healthy',
      mode: 'live',
      details: 'Test mode key configured',
    });
  }
  if (key.startsWith('sk_live_')) {
    return Promise.resolve({
      name: 'Stripe',
      status: 'healthy',
      mode: 'live',
      details: 'Live mode key configured',
    });
  }
  return Promise.resolve({
    name: 'Stripe',
    status: 'degraded',
    mode: 'live',
    details: 'Key format unrecognised',
  });
}

function checkOpenAI(): Promise<ServiceStatus> {
  const key = process.env['OPENAI_API_KEY'] || '';
  if (!key || key === 'sk-test-mock' || key.includes('test')) {
    return Promise.resolve({
      name: 'OpenAI',
      status: 'mock',
      mode: 'mock',
      details: 'Using mock embeddings',
    });
  }
  return Promise.resolve({
    name: 'OpenAI',
    status: 'healthy',
    mode: 'live',
    details: 'API key configured',
  });
}

function checkSentry(): Promise<ServiceStatus> {
  const dsn = process.env['SENTRY_DSN'] || '';
  if (!dsn) {
    return Promise.resolve({
      name: 'Sentry',
      status: 'mock',
      mode: 'unconfigured',
      details: 'No SENTRY_DSN — errors logged locally only',
    });
  }
  return Promise.resolve({
    name: 'Sentry',
    status: 'healthy',
    mode: 'live',
    details: 'DSN configured',
  });
}

function checkJwt(): Promise<ServiceStatus> {
  const secret = process.env['JWT_SECRET'] || '';
  if (!secret) {
    const isProduction = process.env['NODE_ENV'] === 'production';
    if (isProduction) {
      return Promise.resolve({
        name: 'JWT Auth',
        status: 'unavailable',
        mode: 'unconfigured',
        details: 'No JWT_SECRET in production!',
      });
    }
    return Promise.resolve({
      name: 'JWT Auth',
      status: 'healthy',
      mode: 'mock',
      details: 'Using development secret',
    });
  }
  return Promise.resolve({
    name: 'JWT Auth',
    status: 'healthy',
    mode: 'live',
    details: 'Secret configured',
  });
}
