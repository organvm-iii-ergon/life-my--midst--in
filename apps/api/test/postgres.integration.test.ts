/**
 * PostgreSQL Repository Integration Tests
 *
 * Tests core repository operations against a real PostgreSQL database.
 * These tests verify that migrations, seeds, and CRUD operations work correctly.
 *
 * Requires: INTEGRATION_POSTGRES_URL (or DATABASE_URL/POSTGRES_URL fallback)
 */

import { expect, it, beforeAll, afterAll } from "vitest";
import type { Pool } from "pg";
import { runMigrations, runSeeds } from "../src/repositories/migrations";
import { createProfileRepo } from "../src/repositories/profiles";
import { createMaskRepo } from "../src/repositories/masks";
import { createCvRepos } from "../src/repositories/cv";
import {
  integrationDescribe,
  getPostgresPool,
  cleanup,
  testUuid
} from "./integration-utils";

integrationDescribe("postgres")("postgres profile repo integration", () => {
  // Defer pool creation to beforeAll to avoid errors during test collection
  let pool: Pool;
  let repo: ReturnType<typeof createProfileRepo>;
  let maskRepos: ReturnType<typeof createMaskRepo>;
  let cvRepos: ReturnType<typeof createCvRepos>;

  beforeAll(async () => {
    pool = getPostgresPool();
    await runMigrations(pool);
    await runSeeds(pool);
    repo = createProfileRepo({ kind: "postgres", pool });
    maskRepos = createMaskRepo({ kind: "postgres", pool });
    cvRepos = createCvRepos({ kind: "postgres", pool });
  });

  afterAll(async () => {
    if (pool) {
      await cleanup({ pool });
    }
  });

  it("runs migrations and seeds", async () => {
    const seeded = await repo.find("00000000-0000-0000-0000-000000000001");
    expect(seeded?.slug).toBe("seed-demo");
  });

  it("persists and lists profiles", async () => {
    const id = testUuid();
    const profile = {
      id,
      identityId: testUuid(),
      slug: `integration-user-${Date.now()}`,
      displayName: "Integration User",
      isActive: true,
      title: "Engineer",
      headline: "Integration testing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await repo.add(profile);
    const fetched = await repo.find(profile.id);
    expect(fetched?.displayName).toBe("Integration User");

    const list = await repo.list(0, 10);
    expect(list.total).toBeGreaterThan(0);
  });

  it("lists masks with filters and pagination", async () => {
    const result = await maskRepos.masks.list(0, 5, { ontology: "cognitive" });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.data.every((m) => m.ontology === "cognitive")).toBe(true);
  });

  it("lists stages with totals", async () => {
    const result = await maskRepos.stages.list(undefined, 0, 2);
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThan(0);
  });

  it("lists seeded cv entities", async () => {
    const experiences = await cvRepos.experiences.list("00000000-0000-0000-0000-000000000001", 0, 5);
    expect(experiences.total).toBeGreaterThan(0);
    const credentials = await cvRepos.credentials.list("00000000-0000-0000-0000-000000000001", 0, 5);
    expect(credentials.total).toBeGreaterThan(0);
  });
});
