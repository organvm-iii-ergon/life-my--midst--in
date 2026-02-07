/**
 * JWT Token Revocation Blocklist (ADR-010)
 *
 * Tracks revoked JWTs by their `jti` (JWT ID) claim.
 * Two implementations:
 *   - InMemoryTokenBlocklist: for development/testing
 *   - RedisTokenBlocklist: for production (entries auto-expire via TTL)
 */

export interface TokenBlocklist {
  /** Add a token to the blocklist. expiresAt = Unix seconds when token naturally expires. */
  add(jti: string, expiresAt: number): Promise<void>;

  /** Check whether a jti is currently blocked. */
  isBlocked(jti: string): Promise<boolean>;
}

/**
 * In-memory blocklist with periodic cleanup of expired entries.
 * Suitable for single-process dev/test environments.
 */
export class InMemoryTokenBlocklist implements TokenBlocklist {
  private blocked = new Map<string, number>(); // jti → expiresAt (Unix seconds)
  private cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(cleanupIntervalMs = 60_000) {
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs);
    // Allow the process to exit without waiting for this timer
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  add(jti: string, expiresAt: number): Promise<void> {
    this.blocked.set(jti, expiresAt);
    return Promise.resolve();
  }

  isBlocked(jti: string): Promise<boolean> {
    const expiresAt = this.blocked.get(jti);
    if (expiresAt === undefined) return Promise.resolve(false);

    // If the token has naturally expired, remove it from the blocklist
    const now = Math.floor(Date.now() / 1000);
    if (now >= expiresAt) {
      this.blocked.delete(jti);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  /** Remove entries whose tokens have expired. */
  private cleanup(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, expiresAt] of this.blocked) {
      if (now >= expiresAt) {
        this.blocked.delete(jti);
      }
    }
  }

  /** Stop the cleanup timer (for graceful shutdown in tests). */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

/**
 * Redis-backed blocklist. Each revoked jti is stored as a key with TTL
 * equal to the remaining token lifetime, so entries auto-expire.
 */
export class RedisTokenBlocklist implements TokenBlocklist {
  private redis: {
    set(key: string, value: string, options?: { EX?: number }): Promise<unknown>;
    get(key: string): Promise<string | null>;
  };
  private prefix: string;

  constructor(
    redisClient: {
      set(key: string, value: string, options?: { EX?: number }): Promise<unknown>;
      get(key: string): Promise<string | null>;
    },
    prefix = 'jwt:blocked:',
  ) {
    this.redis = redisClient;
    this.prefix = prefix;
  }

  async add(jti: string, expiresAt: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const ttl = expiresAt - now;
    if (ttl <= 0) return; // Token already expired, no need to block

    await this.redis.set(this.prefix + jti, '1', { EX: ttl });
  }

  async isBlocked(jti: string): Promise<boolean> {
    const result = await this.redis.get(this.prefix + jti);
    return result !== null;
  }
}

/**
 * Factory: create appropriate blocklist based on environment.
 */
export function createTokenBlocklist(redisClient?: {
  set(key: string, value: string, options?: { EX?: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
}): TokenBlocklist {
  if (redisClient) {
    return new RedisTokenBlocklist(redisClient);
  }
  return new InMemoryTokenBlocklist();
}
