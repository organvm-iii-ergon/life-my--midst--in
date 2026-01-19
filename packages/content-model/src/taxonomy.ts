/**
 * Taxonomy Definitions for Identity System
 *
 * This module contains all static taxonomy data used throughout the content model:
 * - Personality types and their orientations
 * - Mask definitions with activation rules and filters
 * - Stage definitions for career phases
 * - Epoch definitions for temporal career periods
 * - Settings for contextual work environments
 * - Relationship maps connecting these taxonomies
 *
 * These are the "lookup tables" of the identity system — static data that
 * defines the vocabulary for describing professional identity.
 */

import type { Epoch, Mask, Stage, Personality, Setting } from "@in-midst-my-life/schema";

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALITY TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nine personality orientations that describe cognitive/behavioral tendencies.
 * Each mask maps to a primary personality via MASK_PERSONALITY_RELATIONS.
 */
export const PERSONALITY_TAXONOMY: Personality[] = [
  { id: "convergent", label: "Convergent", orientation: "Narrowing, selecting, filtering." },
  { id: "divergent", label: "Divergent", orientation: "Expanding and proliferating possibilities." },
  { id: "reflective", label: "Reflective", orientation: "Deliberation and meta-cognition." },
  { id: "assertive", label: "Assertive", orientation: "Decisive action and high agency." },
  { id: "adaptive", label: "Adaptive", orientation: "Real-time morphing and situational intelligence." },
  { id: "investigative", label: "Investigative", orientation: "Probing, evidence-seeking, validation." },
  { id: "constructive", label: "Constructive", orientation: "Building, assembling, iterating." },
  { id: "disruptive", label: "Disruptive", orientation: "Challenging structures and norms." },
  { id: "harmonic", label: "Harmonic", orientation: "Balancing opposing forces and viewpoints." }
];

/**
 * Maps each mask ID to its primary personality orientation.
 * Used to derive personality context when a mask is selected.
 */
export const MASK_PERSONALITY_RELATIONS: Record<string, string> = {
  analyst: "investigative",
  synthesist: "divergent",
  observer: "reflective",
  strategist: "assertive",
  speculator: "adaptive",
  interpreter: "constructive",
  artisan: "constructive",
  architect: "assertive",
  narrator: "harmonic",
  provoker: "disruptive",
  mediator: "harmonic",
  executor: "assertive",
  steward: "reflective",
  integrator: "adaptive",
  custodian: "harmonic",
  calibrator: "convergent"
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTING TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eight work environment settings that provide context for professional activities.
 * Stages map to settings via STAGE_SETTING_RELATIONS.
 */
export const SETTING_TAXONOMY: Setting[] = [
  { id: "setting/research", title: "Research Lab", summary: "Exploration, inquiry, and synthesis.", tags: ["research", "analysis"] },
  { id: "setting/studio", title: "Studio", summary: "Ideation, design, and composition.", tags: ["design", "ideation"] },
  { id: "setting/production", title: "Production Floor", summary: "Execution, delivery, and build.", tags: ["delivery", "build"] },
  { id: "setting/lab", title: "Calibration Lab", summary: "Testing, refinement, verification.", tags: ["testing", "quality"] },
  { id: "setting/public", title: "Public Stage", summary: "Publishing, presentation, transmission.", tags: ["communication", "presentation"] },
  { id: "setting/retreat", title: "Reflection Space", summary: "Retrospective analysis and synthesis.", tags: ["reflection", "retrospective"] },
  { id: "setting/arena", title: "Negotiation Table", summary: "Alignment, negotiation, and stakeholder work.", tags: ["alignment", "collaboration"] },
  { id: "setting/archive", title: "Archive", summary: "Documentation, preservation, record-keeping.", tags: ["documentation", "records"] }
];

/**
 * Maps each stage ID to its natural setting environment.
 */
export const STAGE_SETTING_RELATIONS: Record<string, string> = {
  "stage/inquiry": "setting/research",
  "stage/design": "setting/studio",
  "stage/construction": "setting/production",
  "stage/calibration": "setting/lab",
  "stage/transmission": "setting/public",
  "stage/reflection": "setting/retreat",
  "stage/negotiation": "setting/arena",
  "stage/archival": "setting/archive"
};

// ─────────────────────────────────────────────────────────────────────────────
// MASK-STAGE AFFINITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Defines how well each mask aligns with each stage (0-1 scale).
 * Used for scoring mask relevance in timeline-driven contexts.
 * Higher values indicate stronger natural affinity.
 */
export const MASK_STAGE_AFFINITIES: Record<string, Record<string, number>> = {
  analyst: { "stage/inquiry": 1, "stage/calibration": 0.75, "stage/archival": 0.5 },
  synthesist: { "stage/design": 1, "stage/reflection": 0.75, "stage/inquiry": 0.5 },
  observer: { "stage/reflection": 1, "stage/inquiry": 0.75, "stage/archival": 0.5 },
  strategist: { "stage/design": 1, "stage/negotiation": 0.75, "stage/transmission": 0.5 },
  speculator: { "stage/inquiry": 0.75, "stage/design": 0.5, "stage/reflection": 0.5 },
  interpreter: { "stage/transmission": 1, "stage/negotiation": 0.75 },
  artisan: { "stage/construction": 1, "stage/design": 0.75 },
  architect: { "stage/design": 1, "stage/construction": 0.75, "stage/calibration": 0.5 },
  narrator: { "stage/transmission": 1, "stage/reflection": 0.75 },
  provoker: { "stage/negotiation": 0.75, "stage/design": 0.5, "stage/construction": 0.5 },
  mediator: { "stage/negotiation": 1, "stage/reflection": 0.5 },
  executor: { "stage/construction": 1, "stage/transmission": 0.5 },
  steward: { "stage/archival": 1, "stage/calibration": 0.75 },
  integrator: { "stage/construction": 0.75, "stage/negotiation": 0.5, "stage/transmission": 0.5 },
  custodian: { "stage/archival": 1, "stage/calibration": 0.5 },
  calibrator: { "stage/calibration": 1, "stage/inquiry": 0.5 }
};

// ─────────────────────────────────────────────────────────────────────────────
// EPOCH-MASK MODIFIERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Defines which masks are most relevant during each career epoch (0-1 scale).
 * Provides epoch-based boosting for mask selection.
 */
export const EPOCH_MASK_MODIFIERS: Record<string, Record<string, number>> = {
  initiation: { observer: 1, analyst: 0.75, artisan: 0.5, synthesist: 0.5 },
  expansion: { strategist: 1, integrator: 0.75, mediator: 0.5, executor: 0.5 },
  consolidation: { steward: 0.75, custodian: 0.5, calibrator: 0.5, architect: 0.5 },
  divergence: { speculator: 1, provoker: 0.75, synthesist: 0.5 },
  mastery: { architect: 1, calibrator: 0.75, custodian: 0.5, narrator: 0.5 },
  reinvention: { speculator: 0.75, narrator: 0.5, artisan: 0.5, strategist: 0.5 },
  transmission: { narrator: 1, interpreter: 0.75, mediator: 0.5 },
  legacy: { custodian: 1, steward: 0.75, narrator: 0.5 }
};

// ─────────────────────────────────────────────────────────────────────────────
// MASK TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The 16 identity masks organized by ontology (cognitive, expressive, operational).
 *
 * Each mask defines:
 * - functional_scope: What the mask emphasizes
 * - stylistic_parameters: Tone, rhetorical mode, compression ratio
 * - activation_rules: Contexts and triggers that activate the mask
 * - filters: Include/exclude tags and priority weights for content filtering
 */
export const MASK_TAXONOMY: Mask[] = [
  // ───────────────── COGNITIVE MASKS ─────────────────
  {
    id: "analyst",
    name: "Analyst",
    ontology: "cognitive",
    functional_scope: "precision reasoning, decomposition, structure",
    stylistic_parameters: { tone: "neutral", rhetorical_mode: "deductive", compression_ratio: 0.55 },
    activation_rules: { contexts: ["analysis", "research", "validation"], triggers: ["metric", "benchmark"] },
    filters: { include_tags: ["analysis", "metrics", "impact"], exclude_tags: ["speculation"], priority_weights: { impact: 2, metrics: 2 } }
  },
  {
    id: "synthesist",
    name: "Synthesist",
    ontology: "cognitive",
    functional_scope: "pattern merging and integrative creativity",
    stylistic_parameters: { tone: "expansive", rhetorical_mode: "comparative", compression_ratio: 0.65 },
    activation_rules: { contexts: ["strategy", "research", "exploration"], triggers: ["pattern", "signal"] },
    filters: { include_tags: ["research", "vision", "integration"], exclude_tags: ["narrow"], priority_weights: { vision: 2 } }
  },
  {
    id: "observer",
    name: "Observer",
    ontology: "cognitive",
    functional_scope: "detached perception and data intake",
    stylistic_parameters: { tone: "measured", rhetorical_mode: "expository", compression_ratio: 0.6 },
    activation_rules: { contexts: ["audit", "discovery"], triggers: ["anomaly", "trend"] },
    filters: { include_tags: ["observability", "research"], exclude_tags: [], priority_weights: { reliability: 1 } }
  },
  {
    id: "strategist",
    name: "Strategist",
    ontology: "cognitive",
    functional_scope: "long-horizon planning and prioritization",
    stylistic_parameters: { tone: "persuasive", rhetorical_mode: "comparative", compression_ratio: 0.65 },
    activation_rules: { contexts: ["roadmap", "product", "portfolio"], triggers: ["tradeoff", "priority"] },
    filters: { include_tags: ["roadmap", "vision"], exclude_tags: [], priority_weights: { vision: 2, priority: 2 } }
  },
  {
    id: "speculator",
    name: "Speculator",
    ontology: "cognitive",
    functional_scope: "scenario projection and hypothesis generation",
    stylistic_parameters: { tone: "exploratory", rhetorical_mode: "hypothetical", compression_ratio: 0.7 },
    activation_rules: { contexts: ["futures", "exploration"], triggers: ["what-if", "risk"] },
    filters: { include_tags: ["hypothesis", "risk"], exclude_tags: ["certainty"], priority_weights: { risk: 1 } }
  },
  // ───────────────── EXPRESSIVE MASKS ─────────────────
  {
    id: "interpreter",
    name: "Interpreter",
    ontology: "expressive",
    functional_scope: "translation across media and audiences",
    stylistic_parameters: { tone: "clarifying", rhetorical_mode: "dialogic", compression_ratio: 0.6 },
    activation_rules: { contexts: ["communication", "handoff"], triggers: ["bridge", "translate"] },
    filters: { include_tags: ["communication", "handoff"], exclude_tags: [], priority_weights: { clarity: 2, bridge: 1 } }
  },
  {
    id: "artisan",
    name: "Artisan",
    ontology: "expressive",
    functional_scope: "craft, quality, and detail obsession",
    stylistic_parameters: { tone: "precise", rhetorical_mode: "procedural", compression_ratio: 0.5 },
    activation_rules: { contexts: ["implementation", "quality"], triggers: ["craft", "polish"] },
    filters: { include_tags: ["quality", "craft", "detail"], exclude_tags: ["rushed"], priority_weights: { quality: 3 } }
  },
  {
    id: "architect",
    name: "Architect",
    ontology: "expressive",
    functional_scope: "design, abstraction, system structure",
    stylistic_parameters: { tone: "authoritative", rhetorical_mode: "expository", compression_ratio: 0.55 },
    activation_rules: { contexts: ["design", "architecture", "platform"], triggers: ["blueprint", "model"] },
    filters: { include_tags: ["architecture", "design", "system"], exclude_tags: ["tactical"], priority_weights: { architecture: 3, system: 2 } }
  },
  {
    id: "narrator",
    name: "Narrator",
    ontology: "expressive",
    functional_scope: "storytelling, context, explanation",
    stylistic_parameters: { tone: "engaging", rhetorical_mode: "narrative", compression_ratio: 0.7 },
    activation_rules: { contexts: ["presentation", "documentation", "onboarding"], triggers: ["story", "context"] },
    filters: { include_tags: ["narrative", "story", "context"], exclude_tags: [], priority_weights: { narrative: 2 } }
  },
  {
    id: "provoker",
    name: "Provoker",
    ontology: "expressive",
    functional_scope: "challenge, disruption, provocation",
    stylistic_parameters: { tone: "provocative", rhetorical_mode: "dialectic", compression_ratio: 0.65 },
    activation_rules: { contexts: ["innovation", "brainstorm"], triggers: ["challenge", "assumption"] },
    filters: { include_tags: ["innovation", "challenge"], exclude_tags: ["safe"], priority_weights: { challenge: 2 } }
  },
  {
    id: "mediator",
    name: "Mediator",
    ontology: "expressive",
    functional_scope: "consensus, diplomacy, bridge-building",
    stylistic_parameters: { tone: "diplomatic", rhetorical_mode: "dialogic", compression_ratio: 0.6 },
    activation_rules: { contexts: ["negotiation", "stakeholder"], triggers: ["alignment", "consensus"] },
    filters: { include_tags: ["alignment", "stakeholder"], exclude_tags: ["adversarial"], priority_weights: { alignment: 2 } }
  },
  // ───────────────── OPERATIONAL MASKS ─────────────────
  {
    id: "executor",
    name: "Executor",
    ontology: "operational",
    functional_scope: "action, throughput, closure",
    stylistic_parameters: { tone: "decisive", rhetorical_mode: "procedural", compression_ratio: 0.5 },
    activation_rules: { contexts: ["delivery", "launch"], triggers: ["deadline", "rollout"] },
    filters: { include_tags: ["delivery", "release"], exclude_tags: ["blocked"], priority_weights: { delivery: 2, reliability: 1 } }
  },
  {
    id: "steward",
    name: "Steward",
    ontology: "operational",
    functional_scope: "maintenance, governance, oversight",
    stylistic_parameters: { tone: "measured", rhetorical_mode: "forensic", compression_ratio: 0.5 },
    activation_rules: { contexts: ["maintenance", "governance"], triggers: ["runbook", "audit"] },
    filters: { include_tags: ["reliability", "observability"], exclude_tags: [], priority_weights: { reliability: 3 } }
  },
  {
    id: "integrator",
    name: "Integrator",
    ontology: "operational",
    functional_scope: "cross-team assembly and interoperability",
    stylistic_parameters: { tone: "technical", rhetorical_mode: "expository", compression_ratio: 0.55 },
    activation_rules: { contexts: ["integration", "platform"], triggers: ["contract", "interface"] },
    filters: { include_tags: ["integration", "api"], exclude_tags: ["silo"], priority_weights: { integration: 2, api: 1 } }
  },
  {
    id: "custodian",
    name: "Custodian",
    ontology: "operational",
    functional_scope: "record-keeping, curation, historical fidelity",
    stylistic_parameters: { tone: "measured", rhetorical_mode: "forensic", compression_ratio: 0.5 },
    activation_rules: { contexts: ["operations", "compliance"], triggers: ["audit", "incident"] },
    filters: { include_tags: ["reliability", "governance"], exclude_tags: [], priority_weights: { reliability: 3 } }
  },
  {
    id: "calibrator",
    name: "Calibrator",
    ontology: "operational",
    functional_scope: "evaluation, metrics, standards alignment",
    stylistic_parameters: { tone: "precise", rhetorical_mode: "evaluative", compression_ratio: 0.5 },
    activation_rules: { contexts: ["quality", "testing"], triggers: ["benchmark", "defect"] },
    filters: { include_tags: ["quality", "testing"], exclude_tags: ["speculative"], priority_weights: { quality: 3 } }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// STAGE TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eight stages representing phases of work within a project or career arc.
 * Stages are ordered 1-8 and have associated tags for matching.
 */
export const STAGE_TAXONOMY: Stage[] = [
  { id: "stage/inquiry", title: "Inquiry", summary: "Research, exploration, question formation", tags: ["research", "exploration"], order: 1 },
  { id: "stage/design", title: "Design", summary: "Ideation, architectural thinking, structuring", tags: ["design", "architecture"], order: 2 },
  { id: "stage/construction", title: "Construction", summary: "Production and implementation", tags: ["build", "delivery"], order: 3 },
  { id: "stage/calibration", title: "Calibration", summary: "Testing, refinement, verification", tags: ["testing", "quality"], order: 4 },
  { id: "stage/transmission", title: "Transmission", summary: "Publishing and presentation", tags: ["communication", "docs"], order: 5 },
  { id: "stage/reflection", title: "Reflection", summary: "Retrospective analysis, synthesis", tags: ["retro", "synthesis"], order: 6 },
  { id: "stage/negotiation", title: "Negotiation", summary: "Alignment and stakeholder engagement", tags: ["stakeholder", "collaboration"], order: 7 },
  { id: "stage/archival", title: "Archival", summary: "Documentation and record-setting", tags: ["documentation", "records"], order: 8 }
];

/**
 * Helper to pick stages by ID and assign order based on position in the array.
 */
function pickStages(stageIds: string[]): Stage[] {
  const byId = new Map(STAGE_TAXONOMY.map((stage) => [stage.id, stage]));
  return stageIds.map((id, idx) => ({ ...byId.get(id)!, order: idx + 1 }));
}

// ─────────────────────────────────────────────────────────────────────────────
// EPOCH TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eight epochs representing major periods in professional evolution.
 * Each epoch has associated stages that are typical during that period.
 */
export const EPOCH_TAXONOMY: Epoch[] = [
  {
    id: "initiation",
    name: "Initiation",
    order: 1,
    summary: "Entry and foundational skill building",
    stages: pickStages(["stage/inquiry", "stage/design"])
  },
  {
    id: "expansion",
    name: "Expansion",
    order: 2,
    summary: "Diversification and scope scaling",
    stages: pickStages(["stage/construction", "stage/negotiation"])
  },
  {
    id: "consolidation",
    name: "Consolidation",
    order: 3,
    summary: "Integration and coherence building",
    stages: pickStages(["stage/calibration", "stage/reflection"])
  },
  {
    id: "divergence",
    name: "Divergence",
    order: 4,
    summary: "Branching experimentation and exploration",
    stages: pickStages(["stage/inquiry", "stage/construction"])
  },
  {
    id: "mastery",
    name: "Mastery",
    order: 5,
    summary: "System-level thinking and innovation",
    stages: pickStages(["stage/design", "stage/transmission"])
  },
  {
    id: "reinvention",
    name: "Reinvention",
    order: 6,
    summary: "Reboot and reframing for new arcs",
    stages: pickStages(["stage/inquiry", "stage/construction"])
  },
  {
    id: "transmission",
    name: "Transmission",
    order: 7,
    summary: "Teaching, sharing, and institutionalizing knowledge",
    stages: pickStages(["stage/transmission", "stage/archival"])
  },
  {
    id: "legacy",
    name: "Legacy",
    order: 8,
    summary: "Long-term impact and codification",
    stages: pickStages(["stage/archival", "stage/reflection"])
  }
];
