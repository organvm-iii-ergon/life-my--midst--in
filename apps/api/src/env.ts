/**
 * Environment Variable Validation
 *
 * Validates required and optional env vars at startup using Zod.
 * Fails fast with clear error messages if required vars are missing.
 */
import { z } from 'zod';

const envSchema = z
  .object({
    // Required: at least one database connection string
    DATABASE_URL: z.string().url().optional(),
    POSTGRES_URL: z.string().url().optional(),

    // Server
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),

    // CORS
    ALLOWED_ORIGINS: z.string().optional(),

    // Monitoring (optional)
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
    METRICS_PORT: z.coerce.number().int().positive().default(9464),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),

    // Stripe billing (optional, has mock defaults in index.ts)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRO_MONTHLY: z.string().optional(),
    STRIPE_PRO_YEARLY: z.string().optional(),
    STRIPE_ENTERPRISE_MONTHLY: z.string().optional(),
    STRIPE_ENTERPRISE_YEARLY: z.string().optional(),

    // Authentication
    JWT_SECRET: z.string().min(32).optional(),

    // Encryption (optional, generates ephemeral key if missing)
    PROFILE_KEY_ENC_KEY: z.string().optional(),
  })
  .refine((data) => data.NODE_ENV === 'test' || data.DATABASE_URL || data.POSTGRES_URL, {
    message:
      'DATABASE_URL or POSTGRES_URL is required outside of test mode. ' +
      'Set one of these to a PostgreSQL connection string.',
    path: ['DATABASE_URL'],
  });

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

/**
 * Parse and validate environment variables.
 * Caches the result for subsequent calls.
 * Throws with a clear message listing all validation errors.
 */
export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten();
    const messages = [
      'Environment validation failed:',
      ...Object.entries(errors.fieldErrors).map(
        ([field, msgs]) => `  ${field}: ${(msgs ?? []).join(', ')}`,
      ),
      ...(errors.formErrors.length > 0 ? ['  ' + errors.formErrors.join(', ')] : []),
    ];
    console.error(messages.join('\n'));
    process.exit(1);
  }

  _env = result.data;
  return _env;
}
