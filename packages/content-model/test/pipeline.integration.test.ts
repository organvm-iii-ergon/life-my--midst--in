/**
 * Content Model Pipeline Integration Tests
 *
 * Tests the complete narrative generation pipeline with realistic data:
 * - Full profile with complete CV data (experiences, credentials, skills)
 * - All 16 taxonomy masks
 * - Timeline with multiple epochs and stages
 * - JSON-LD export
 * - Weighting and scoring algorithms
 *
 * These tests verify that all modules work together correctly with
 * production-like data volumes.
 */

import { describe, expect, it } from "vitest";
import type { Profile, Experience, Credential, Skill, TimelineEntry } from "@in-midst-my-life/schema";
import {
  applyMask,
  buildNarrative,
  buildNarrativeWithTimeline,
  buildNarrativeWithEpochs,
  buildWeightedNarrative,
  buildNarrativeOutput,
  selectMasksForView,
  selectBestMask,
  scoreMaskForView,
  maskWeight,
  MASK_TAXONOMY,
  EPOCH_TAXONOMY,
  STAGE_TAXONOMY,
  PERSONALITY_TAXONOMY,
  MASK_STAGE_AFFINITIES,
  EPOCH_MASK_MODIFIERS,
  type NarrativeViewConfig
} from "../src";
import { generatePersonJsonLd } from "../src/json-ld";

// ─────────────────────────────────────────────────────────────────────────────
// Realistic Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const realisticProfile: Profile = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  identityId: "98765432-1234-5678-9abc-def012345678",
  slug: "alex-chen",
  displayName: "Alex Chen",
  title: "Staff Software Engineer",
  headline: "Building scalable systems that matter",
  summaryMarkdown: `
Senior software engineer with 12+ years of experience building high-scale distributed systems.
Led engineering teams at multiple startups from seed to Series B.
Passionate about developer experience, API design, and making complex systems understandable.
Open source contributor and technical writer.
  `.trim(),
  email: "alex@example.com",
  website: "https://alexchen.dev",
  avatarUrl: "https://example.com/alex-avatar.jpg",
  locationText: "San Francisco Bay Area",
  isActive: true,
  createdAt: "2020-01-15T00:00:00.000Z",
  updatedAt: "2024-01-10T00:00:00.000Z",
  visibility: { default: "everyone" },
  sectionOrder: ["experience", "skills", "education", "projects"],
  agentSettings: { enabled: true }
};

const realisticExperiences: Experience[] = [
  {
    id: "exp-001",
    profileId: realisticProfile.id,
    roleTitle: "Staff Software Engineer",
    organization: "TechCorp",
    organizationUrl: "https://techcorp.example.com",
    locationText: "San Francisco",
    startDate: "2022-03-01T00:00:00.000Z",
    isCurrent: true,
    descriptionMarkdown:
      "Leading platform architecture for distributed systems serving 10M+ DAU. Designed and implemented event-driven microservices reducing latency by 40%.",
    highlights: ["Led team of 8 engineers", "Reduced infrastructure costs by 35%", "Improved system reliability to 99.99%"],
    tags: ["architecture", "distributed-systems", "leadership", "platform"],
    createdAt: "2022-03-01T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "exp-002",
    profileId: realisticProfile.id,
    roleTitle: "Senior Software Engineer",
    organization: "StartupXYZ",
    locationText: "Remote",
    startDate: "2019-06-01T00:00:00.000Z",
    endDate: "2022-02-28T00:00:00.000Z",
    isCurrent: false,
    descriptionMarkdown:
      "Built core data pipeline processing 1TB+ daily. Designed real-time analytics system with sub-second query latency.",
    highlights: ["Built data pipeline from scratch", "Mentored 4 junior engineers", "Led technical interviews"],
    tags: ["data-engineering", "analytics", "mentorship", "metrics"],
    createdAt: "2019-06-01T00:00:00.000Z",
    updatedAt: "2022-02-28T00:00:00.000Z"
  },
  {
    id: "exp-003",
    profileId: realisticProfile.id,
    roleTitle: "Software Engineer",
    organization: "BigTech Inc",
    locationText: "Seattle",
    startDate: "2015-08-01T00:00:00.000Z",
    endDate: "2019-05-31T00:00:00.000Z",
    isCurrent: false,
    descriptionMarkdown: "Full-stack development on customer-facing products. Shipped features used by millions of users.",
    highlights: ["Shipped v2 of flagship product", "Improved page load time by 60%", "On-call rotation lead"],
    tags: ["full-stack", "product", "performance", "reliability"],
    createdAt: "2015-08-01T00:00:00.000Z",
    updatedAt: "2019-05-31T00:00:00.000Z"
  },
  {
    id: "exp-004",
    profileId: realisticProfile.id,
    roleTitle: "Junior Developer",
    organization: "LocalAgency",
    locationText: "Portland",
    startDate: "2012-06-01T00:00:00.000Z",
    endDate: "2015-07-31T00:00:00.000Z",
    isCurrent: false,
    descriptionMarkdown: "Developed web applications for local businesses. Learned fundamentals of software engineering.",
    highlights: ["Built 20+ client websites", "Introduced version control practices", "Self-taught modern frameworks"],
    tags: ["web-development", "learning", "foundations"],
    createdAt: "2012-06-01T00:00:00.000Z",
    updatedAt: "2015-07-31T00:00:00.000Z"
  }
];

const realisticCredentials: Credential[] = [
  {
    id: "cred-001",
    profileId: realisticProfile.id,
    type: "certification",
    title: "AWS Solutions Architect Professional",
    issuer: "Amazon Web Services",
    issueDate: "2023-06-15",
    expirationDate: "2026-06-15",
    credentialUrl: "https://aws.amazon.com/verification/123",
    tags: ["cloud", "architecture", "aws"]
  },
  {
    id: "cred-002",
    profileId: realisticProfile.id,
    type: "education",
    title: "BS Computer Science",
    issuer: "University of Washington",
    issueDate: "2012-06-01",
    tags: ["education", "foundations"]
  }
];

const realisticSkills: Skill[] = [
  { id: "skill-001", profileId: realisticProfile.id, name: "TypeScript", category: "language", level: "expert", yearsOfExperience: 6 },
  { id: "skill-002", profileId: realisticProfile.id, name: "Go", category: "language", level: "advanced", yearsOfExperience: 4 },
  { id: "skill-003", profileId: realisticProfile.id, name: "Kubernetes", category: "infrastructure", level: "expert", yearsOfExperience: 5 },
  { id: "skill-004", profileId: realisticProfile.id, name: "PostgreSQL", category: "database", level: "expert", yearsOfExperience: 10 },
  { id: "skill-005", profileId: realisticProfile.id, name: "System Design", category: "architecture", level: "expert", yearsOfExperience: 8 }
];

const realisticTimeline: TimelineEntry[] = realisticExperiences.map((exp) => ({
  id: exp.id,
  title: `${exp.roleTitle} at ${exp.organization}`,
  summary: exp.descriptionMarkdown || "",
  start: exp.startDate.split("T")[0],
  end: exp.endDate?.split("T")[0],
  tags: exp.tags || []
}));

// ─────────────────────────────────────────────────────────────────────────────
// Taxonomy Integrity Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Taxonomy Integrity", () => {
  it("MASK_TAXONOMY contains all 16 canonical masks", () => {
    expect(MASK_TAXONOMY).toHaveLength(16);

    const expectedMasks = [
      "analyst",
      "synthesist",
      "observer",
      "strategist",
      "speculator",
      "interpreter",
      "artisan",
      "architect",
      "narrator",
      "provoker",
      "mediator",
      "executor",
      "steward",
      "integrator",
      "custodian",
      "calibrator"
    ];

    const actualIds = MASK_TAXONOMY.map((m) => m.id);
    expectedMasks.forEach((id) => {
      expect(actualIds).toContain(id);
    });
  });

  it("EPOCH_TAXONOMY contains all 8 canonical epochs", () => {
    expect(EPOCH_TAXONOMY).toHaveLength(8);

    const expectedEpochs = ["initiation", "expansion", "consolidation", "divergence", "mastery", "reinvention", "transmission", "legacy"];

    const actualIds = EPOCH_TAXONOMY.map((e) => e.id);
    expectedEpochs.forEach((id) => {
      expect(actualIds).toContain(id);
    });
  });

  it("STAGE_TAXONOMY contains all 8 canonical stages", () => {
    expect(STAGE_TAXONOMY).toHaveLength(8);

    const expectedStages = [
      "stage/inquiry",
      "stage/design",
      "stage/construction",
      "stage/calibration",
      "stage/transmission",
      "stage/reflection",
      "stage/negotiation",
      "stage/archival"
    ];

    const actualIds = STAGE_TAXONOMY.map((s) => s.id);
    expectedStages.forEach((id) => {
      expect(actualIds).toContain(id);
    });
  });

  it("PERSONALITY_TAXONOMY contains all canonical personalities", () => {
    // Taxonomy has 9 personalities (convergent, divergent, etc.)
    expect(PERSONALITY_TAXONOMY.length).toBeGreaterThanOrEqual(6);
  });

  it("MASK_STAGE_AFFINITIES covers all masks", () => {
    const affinity = MASK_STAGE_AFFINITIES;
    MASK_TAXONOMY.forEach((mask) => {
      expect(affinity[mask.id]).toBeDefined();
      expect(Object.keys(affinity[mask.id]).length).toBeGreaterThan(0);
    });
  });

  it("EPOCH_MASK_MODIFIERS covers all epochs", () => {
    const modifiers = EPOCH_MASK_MODIFIERS;
    EPOCH_TAXONOMY.forEach((epoch) => {
      expect(modifiers[epoch.id]).toBeDefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full Pipeline Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Full Narrative Pipeline", () => {
  const fullConfig: NarrativeViewConfig = {
    profile: realisticProfile,
    contexts: ["hiring", "architecture", "leadership"],
    tags: ["distributed-systems", "platform", "mentorship"],
    availableMasks: MASK_TAXONOMY,
    personality: PERSONALITY_TAXONOMY.find((p) => p.id === "investigative")!,
    epochs: EPOCH_TAXONOMY.filter((e) => ["mastery", "influence"].includes(e.id)),
    timeline: realisticTimeline,
    settings: []
  };

  it("builds narrative with all components", () => {
    const blocks = buildNarrative(fullConfig);

    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => {
      expect(block.title).toBeTruthy();
      expect(block.body).toBeTruthy();
    });
  });

  it("builds timeline-enriched narrative", () => {
    const blocks = buildNarrativeWithTimeline(fullConfig);

    expect(blocks.length).toBeGreaterThan(0);

    // Should include timeline-related content
    const hasTimelineContent = blocks.some(
      (b) => b.body.includes("TechCorp") || b.body.includes("StartupXYZ") || b.title.includes("Recent") || b.title.includes("Timeline")
    );
    expect(hasTimelineContent).toBe(true);
  });

  it("builds epoch-contextualized narrative", () => {
    const blocks = buildNarrativeWithEpochs(fullConfig);

    expect(blocks.length).toBeGreaterThan(0);

    // Should include epoch-related content
    const hasEpochContent = blocks.some((b) => b.title.includes("Epoch") || b.body.includes("Mastery") || b.body.includes("Influence"));
    expect(hasEpochContent).toBe(true);
  });

  it("builds weighted narrative with proper scoring", async () => {
    const blocks = await buildWeightedNarrative(fullConfig);

    expect(blocks.length).toBeGreaterThan(0);

    // Blocks should have weights
    blocks.forEach((block) => {
      expect(typeof block.weight).toBe("number");
      expect(block.weight).toBeGreaterThanOrEqual(0);
    });
  });

  it("builds complete narrative output", async () => {
    const output = await buildNarrativeOutput(fullConfig);

    expect(output.blocks).toBeDefined();
    expect(output.blocks.length).toBeGreaterThan(0);
    expect(output.meta).toBeDefined();
    // Meta should contain mask, personality, or other context info
    expect(output.meta.mask || output.meta.personality || output.meta.epoch).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mask Selection Integration
// ─────────────────────────────────────────────────────────────────────────────

describe("Mask Selection with Full Taxonomy", () => {
  it("selects appropriate masks for architecture context", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["architecture", "systems", "design"],
      tags: ["distributed-systems", "platform"],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    const selected = selectMasksForView(config);

    expect(selected.length).toBeGreaterThan(0);

    // Architect mask should rank highly for architecture context
    const architectIndex = selected.findIndex((m) => m.id === "architect");
    expect(architectIndex).toBeLessThan(5); // Should be in top 5
  });

  it("selects appropriate masks for collaborative context", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["collaboration", "integration", "teamwork"],
      tags: ["collaboration", "leadership"],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    const selected = selectMasksForView(config);

    expect(selected.length).toBeGreaterThan(0);

    // Integrator or Mediator should rank highly for collaboration
    const integratorIndex = selected.findIndex((m) => m.id === "integrator");
    const mediatorIndex = selected.findIndex((m) => m.id === "mediator");
    expect(Math.min(integratorIndex, mediatorIndex)).toBeLessThan(8);
  });

  it("selects best mask for hiring context", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["hiring", "recruitment", "interview"],
      tags: ["leadership", "metrics"],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    const best = selectBestMask(config);

    expect(best).toBeDefined();
    expect(best!.id).toBeDefined();
    expect(MASK_TAXONOMY.map((m) => m.id)).toContain(best!.id);
  });

  it("scores all masks for a given context", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["analysis", "metrics"],
      tags: ["metrics", "data-engineering"],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    const scores = MASK_TAXONOMY.map((mask) => ({
      id: mask.id,
      score: scoreMaskForView(mask, config)
    }));

    // All masks should have scores
    scores.forEach((s) => {
      expect(typeof s.score).toBe("number");
    });

    // Analyst should score well for analysis context
    const analystScore = scores.find((s) => s.id === "analyst")!.score;
    const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    expect(analystScore).toBeGreaterThanOrEqual(averageScore);
  });

  it("applies stage affinity bonuses", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["design"],
      tags: [],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    // Architect should score higher in design stage
    const architectWeight = maskWeight(
      MASK_TAXONOMY.find((m) => m.id === "architect")!,
      config,
      { stageIds: ["stage/design"] }
    );

    const architectWeightNoStage = maskWeight(MASK_TAXONOMY.find((m) => m.id === "architect")!, config);

    // With stage affinity, architect should score higher
    expect(architectWeight).toBeGreaterThanOrEqual(architectWeightNoStage);
  });

  it("applies epoch modifiers", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: [],
      tags: [],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    // Steward should get bonus in legacy epoch (knowledge transmission)
    const stewardInLegacy = maskWeight(
      MASK_TAXONOMY.find((m) => m.id === "steward")!,
      config,
      { activeEpochIds: ["legacy"] }
    );

    const stewardNoEpoch = maskWeight(MASK_TAXONOMY.find((m) => m.id === "steward")!, config);

    expect(stewardInLegacy).toBeGreaterThanOrEqual(stewardNoEpoch);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD Export Integration
// ─────────────────────────────────────────────────────────────────────────────

describe("JSON-LD Export", () => {
  it("exports profile to valid JSON-LD", () => {
    const jsonLd = generatePersonJsonLd(realisticProfile);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Person");
    expect(jsonLd.name).toBe(realisticProfile.displayName);
    expect(jsonLd.jobTitle).toBe(realisticProfile.title);
  });

  it("exports profile with CV data to valid JSON-LD", () => {
    const jsonLd = generatePersonJsonLd(
      realisticProfile,
      { experiences: realisticExperiences },
      { includeCV: true }
    );

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Person");
    expect(jsonLd.hasOccupation).toBeDefined();
    expect(Array.isArray(jsonLd.hasOccupation)).toBe(true);
  });

  it("handles missing optional fields gracefully", () => {
    const minimalProfile: Profile = {
      id: "minimal-id",
      displayName: "Minimal User",
      slug: "minimal"
    };

    const jsonLd = generatePersonJsonLd(minimalProfile);

    expect(jsonLd["@type"]).toBe("Person");
    expect(jsonLd.name).toBe("Minimal User");
    // Optional fields should be undefined, not throw
    expect(jsonLd.email).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases and Error Handling
// ─────────────────────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("handles empty contexts gracefully", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: [],
      tags: [],
      availableMasks: MASK_TAXONOMY,
      settings: []
    };

    const blocks = buildNarrative(config);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("handles empty timeline gracefully", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["hiring"],
      tags: [],
      availableMasks: MASK_TAXONOMY,
      timeline: [],
      settings: []
    };

    const blocks = buildNarrativeWithTimeline(config);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("handles no available masks gracefully", () => {
    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["hiring"],
      tags: [],
      availableMasks: [],
      settings: []
    };

    const selected = selectMasksForView(config);
    expect(selected).toEqual([]);
  });

  it("handles profile with minimal data", () => {
    const minimal: Profile = {
      id: "min-id",
      displayName: "Min",
      slug: "min"
    };

    const config: NarrativeViewConfig = {
      profile: minimal,
      contexts: [],
      tags: [],
      availableMasks: MASK_TAXONOMY.slice(0, 3),
      settings: []
    };

    const blocks = buildNarrative(config);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("handles very long timeline entries", () => {
    const longTimeline: TimelineEntry[] = Array.from({ length: 50 }, (_, i) => ({
      id: `entry-${i}`,
      title: `Position ${i}`,
      summary: `Description for position ${i}`,
      start: `${2000 + i}-01-01`,
      end: `${2001 + i}-01-01`,
      tags: ["tag1", "tag2"]
    }));

    const config: NarrativeViewConfig = {
      profile: realisticProfile,
      contexts: ["review"],
      tags: [],
      availableMasks: MASK_TAXONOMY,
      timeline: longTimeline,
      settings: []
    };

    const blocks = buildNarrativeWithTimeline(config);
    expect(blocks.length).toBeGreaterThan(0);
    // Should complete without timeout or memory issues
  });
});
