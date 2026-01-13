import { describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { buildGraphNodes, buildNodePositionMap, type CvData } from "../src/app/ui/graph-utils";

const now = new Date().toISOString();
const profileId = "99999999-9999-9999-9999-999999999999";

const makeUuid = (seed: number) => `00000000-0000-0000-0000-${seed.toString().padStart(12, "0")}`;

const buildCvData = (): CvData => ({
  experiences: Array.from({ length: 100 }, (_, idx) => ({
    id: makeUuid(idx),
    profileId,
    roleTitle: `Role ${idx}`,
    organization: `Org ${idx}`,
    startDate: "2024-01-01",
    isCurrent: false,
    createdAt: now,
    updatedAt: now
  })),
  educations: Array.from({ length: 30 }, (_, idx) => ({
    id: makeUuid(idx + 1000),
    profileId,
    institution: `School ${idx}`,
    isCurrent: false,
    createdAt: now,
    updatedAt: now
  })),
  projects: Array.from({ length: 80 }, (_, idx) => ({
    id: makeUuid(idx + 2000),
    profileId,
    name: `Project ${idx}`,
    isOngoing: false,
    createdAt: now,
    updatedAt: now
  })),
  skills: Array.from({ length: 60 }, (_, idx) => ({
    id: makeUuid(idx + 3000),
    profileId,
    name: `Skill ${idx}`,
    isPrimary: false,
    createdAt: now,
    updatedAt: now
  })),
  publications: Array.from({ length: 20 }, (_, idx) => ({
    id: makeUuid(idx + 4000),
    profileId,
    title: `Publication ${idx}`,
    createdAt: now,
    updatedAt: now
  })),
  awards: Array.from({ length: 10 }, (_, idx) => ({
    id: makeUuid(idx + 5000),
    profileId,
    title: `Award ${idx}`,
    createdAt: now,
    updatedAt: now
  })),
  certifications: [],
  socialLinks: []
});

describe("graph rendering budget", () => {
  it("builds nodes and positions within budget", () => {
    const cvData = buildCvData();
    const start = performance.now();
    const nodes = buildGraphNodes(cvData);
    const positions = buildNodePositionMap(nodes);
    const elapsed = performance.now() - start;

    expect(nodes.length).toBe(300);
    expect(positions.size).toBe(nodes.length);
    expect(elapsed).toBeLessThan(120);
  });
});
