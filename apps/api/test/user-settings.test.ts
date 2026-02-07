/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from './app-builder';

describe('user settings routes', () => {
  let app: FastifyInstance;
  const profileId = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    app = await buildTestApp();
  });

  it('lists user settings (initially empty)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/profiles/${profileId}/settings`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([]);
    expect(body.count).toBe(0);
  });

  it('saves and retrieves a user setting', async () => {
    const putRes = await app.inject({
      method: 'PUT',
      url: `/profiles/${profileId}/settings/profile.visibility`,
      payload: { value: 'public' },
    });
    expect(putRes.statusCode).toBe(200);
    const putBody = putRes.json();
    expect(putBody.ok).toBe(true);
    expect(putBody.key).toBe('profile.visibility');
    expect(putBody.value).toBe('public');

    const getRes = await app.inject({
      method: 'GET',
      url: `/profiles/${profileId}/settings/profile.visibility`,
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = getRes.json();
    expect(getBody.ok).toBe(true);
    expect(getBody.value).toBe('public');
  });

  it('returns 404 for non-existent setting key', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/profiles/${profileId}/settings/nonexistent.key`,
    });
    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('setting_not_found');
  });

  it('returns 400 when value is missing from PUT', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/profiles/${profileId}/settings/some.key`,
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toBe('value_required');
  });

  it('denies access for non-owner user', async () => {
    const otherProfileId = '00000000-0000-0000-0000-000000000099';
    const res = await app.inject({
      method: 'GET',
      url: `/profiles/${otherProfileId}/settings`,
      headers: {
        'x-mock-user-id': profileId,
        'x-mock-roles': 'user',
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it('allows admin access to any profile settings', async () => {
    const otherProfileId = '00000000-0000-0000-0000-000000000099';
    const res = await app.inject({
      method: 'GET',
      url: `/profiles/${otherProfileId}/settings`,
      headers: {
        'x-mock-user-id': profileId,
        'x-mock-roles': 'admin',
      },
    });
    expect(res.statusCode).toBe(200);
  });

  it('lists settings after saving multiple keys', async () => {
    // Save two settings
    await app.inject({
      method: 'PUT',
      url: `/profiles/${profileId}/settings/notifications.email`,
      payload: { value: true },
    });
    await app.inject({
      method: 'PUT',
      url: `/profiles/${profileId}/settings/interview.tonePreference`,
      payload: { value: 'formal' },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/profiles/${profileId}/settings`,
    });
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(2);
    const keys = body.data.map((s: { key: string }) => s.key);
    expect(keys).toContain('notifications.email');
    expect(keys).toContain('interview.tonePreference');
  });
});
