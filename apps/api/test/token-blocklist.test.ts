/**
 * JWT Token Revocation Blocklist Tests (ADR-010)
 *
 * Tests the InMemoryTokenBlocklist service and the
 * POST /auth/revoke endpoint integration.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { InMemoryTokenBlocklist } from '../src/services/token-blocklist';

describe('InMemoryTokenBlocklist', () => {
  const instances: InMemoryTokenBlocklist[] = [];

  function create(cleanupMs = 60_000) {
    const bl = new InMemoryTokenBlocklist(cleanupMs);
    instances.push(bl);
    return bl;
  }

  afterEach(() => {
    for (const bl of instances) bl.destroy();
    instances.length = 0;
  });

  it('should report non-blocked jti as not blocked', async () => {
    const bl = create();
    expect(await bl.isBlocked('unknown-jti')).toBe(false);
  });

  it('should block a jti after adding it', async () => {
    const bl = create();
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    await bl.add('revoked-jti', futureExp);
    expect(await bl.isBlocked('revoked-jti')).toBe(true);
  });

  it('should not block a jti whose token has already expired', async () => {
    const bl = create();
    const pastExp = Math.floor(Date.now() / 1000) - 10;
    await bl.add('expired-jti', pastExp);
    expect(await bl.isBlocked('expired-jti')).toBe(false);
  });

  it('should handle multiple blocked jtis independently', async () => {
    const bl = create();
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    await bl.add('jti-a', futureExp);
    await bl.add('jti-b', futureExp);

    expect(await bl.isBlocked('jti-a')).toBe(true);
    expect(await bl.isBlocked('jti-b')).toBe(true);
    expect(await bl.isBlocked('jti-c')).toBe(false);
  });

  it('should clean up after destroy()', async () => {
    const bl = create(100);
    bl.destroy();
    // Should not throw even after destroy
    expect(await bl.isBlocked('any')).toBe(false);
  });
});
