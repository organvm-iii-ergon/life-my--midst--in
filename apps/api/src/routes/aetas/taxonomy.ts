/**
 * Aetas Taxonomy Routes
 *
 * Canonical aetas definitions - the 8 standard life-stages.
 * These are immutable archetypal stages in the theatrical/developmental arc.
 *
 * - GET /taxonomy/aetas - List canonical aetas definitions
 */

import type { FastifyInstance } from "fastify";
import type { Aetas } from "@in-midst-my-life/schema";

/**
 * Canonical aetas definitions.
 * These represent the 8 theatrical life-stages:
 * Initiation → Emergence → Consolidation → Expansion → Mastery → Integration → Transmission → Stewardship
 */
export const canonicalAetas: Record<string, Aetas> = {
  aetas_01: {
    id: "aetas_01",
    name: "Initiation",
    latin_name: "Initiatio",
    order: 1,
    description:
      "Entry into a domain; learning fundamentals, establishing identity",
    capability_profile: {
      theory: "foundational",
      practice: "novice",
      self_awareness: "emerging",
    },
    markers: [
      "First formal training",
      "Establish foundational skills",
      "Identity with domain",
    ],
    transitions_to: ["aetas_02"],
  },
  aetas_02: {
    id: "aetas_02",
    name: "Emergence",
    latin_name: "Emergentia",
    order: 2,
    description: "Early independent work; developing competence and voice",
    capability_profile: {
      theory: "intermediate",
      practice: "advanced_beginner",
      self_awareness: "developing",
    },
    markers: [
      "First solo projects",
      "Recognition from peers",
      "Voice begins to form",
    ],
    transitions_to: ["aetas_03"],
  },
  aetas_03: {
    id: "aetas_03",
    name: "Consolidation",
    latin_name: "Consolidatio",
    order: 3,
    description: "Deepening expertise; mastering core competencies",
    capability_profile: {
      theory: "advanced",
      practice: "competent",
      self_awareness: "strong",
    },
    markers: [
      "Demonstrated expertise",
      "Mentorship of juniors begins",
      "Methodological clarity",
    ],
    transitions_to: ["aetas_04"],
  },
  aetas_04: {
    id: "aetas_04",
    name: "Expansion",
    latin_name: "Expansio",
    order: 4,
    description:
      "Applying expertise across domains; increasing scope and impact",
    capability_profile: {
      theory: "expert",
      practice: "proficient",
      self_awareness: "reflective",
    },
    markers: [
      "Cross-domain contributions",
      "Leadership emerging",
      "Thought leadership",
    ],
    transitions_to: ["aetas_05"],
  },
  aetas_05: {
    id: "aetas_05",
    name: "Mastery",
    latin_name: "Magistralitas",
    order: 5,
    description:
      "Peak capability; deep expertise combined with breadth and wisdom",
    capability_profile: {
      theory: "visionary",
      practice: "expert",
      self_awareness: "integrated",
    },
    markers: [
      "Recognized mastery",
      "Significant contributions",
      "Mentoring at scale",
    ],
    transitions_to: ["aetas_06"],
  },
  aetas_06: {
    id: "aetas_06",
    name: "Integration",
    latin_name: "Integratio",
    order: 6,
    description:
      "Synthesizing experience; integrating multiple perspectives into coherent vision",
    capability_profile: {
      theory: "integrative",
      practice: "generative",
      self_awareness: "philosophical",
    },
    markers: [
      "Integrative thinking",
      "Mentorship deepens",
      "Legacy consciousness",
    ],
    transitions_to: ["aetas_07"],
  },
  aetas_07: {
    id: "aetas_07",
    name: "Transmission",
    latin_name: "Transmissio",
    order: 7,
    description:
      "Actively passing knowledge and wisdom to next generations",
    capability_profile: {
      theory: "meta-theoretical",
      practice: "teaching",
      self_awareness: "universal",
    },
    markers: [
      "Major teaching/writing",
      "Institution building",
      "Legacy articulation",
    ],
    transitions_to: ["aetas_08"],
  },
  aetas_08: {
    id: "aetas_08",
    name: "Stewardship",
    latin_name: "Custodia",
    order: 8,
    description:
      "Stewarding accumulated wisdom; ensuring continuity and evolution",
    capability_profile: {
      theory: "custodial",
      practice: "directional",
      self_awareness: "transcendent",
    },
    markers: [
      "Guidance and vision",
      "Legacy protection",
      "Supporting next generation",
    ],
    transitions_to: [],
  },
};

/**
 * Register taxonomy route for canonical aetas.
 */
export async function registerAetasTaxonomyRoutes(
  fastify: FastifyInstance
): Promise<void> {
  /**
   * GET /taxonomy/aetas
   *
   * Retrieve canonical aetas definitions (the 8 standard life-stages).
   * These are immutable archetypal stages in the theatrical/developmental arc.
   *
   * Query Parameters:
   * - sort?: 'order' | 'name' (default: 'order')
   */
  fastify.get<{
    Querystring: { sort?: "order" | "name" };
  }>("/taxonomy/aetas", async (request, reply) => {
    let aetas = Object.values(canonicalAetas);

    if (request.query.sort === "name") {
      aetas.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      aetas.sort((a, b) => a.order - b.order);
    }

    return reply.send({
      ok: true,
      aetas,
      aetas_count: aetas.length,
      canonical: true,
      description:
        "The 8 canonical life-stages in the theatrical human arc: Initiation → Emergence → Consolidation → Expansion → Mastery → Integration → Transmission → Stewardship",
    });
  });
}
