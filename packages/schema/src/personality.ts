import { z } from 'zod';

/**
 * Schema for a personality orientation.
 *
 * Personalities describe cognitive and behavioral tendencies that shape how
 * an individual processes information, makes decisions, communicates, and
 * handles conflict. Each mask maps to a primary personality via
 * MASK_PERSONALITY_RELATIONS in the content-model taxonomy.
 *
 * The nine canonical personalities are:
 * - **Convergent**: Narrowing, selecting, filtering
 * - **Divergent**: Expanding and proliferating possibilities
 * - **Reflective**: Deliberation and meta-cognition
 * - **Assertive**: Decisive action and high agency
 * - **Adaptive**: Real-time morphing and situational intelligence
 * - **Investigative**: Probing, evidence-seeking, validation
 * - **Constructive**: Building, assembling, iterating
 * - **Disruptive**: Challenging structures and norms
 * - **Harmonic**: Balancing opposing forces and viewpoints
 */
export const PersonalitySchema = z.object({
  id: z.string().describe('Unique identifier for this personality'),
  label: z.string().describe("Display name (e.g., 'Convergent', 'Divergent')"),
  orientation: z
    .string()
    .optional()
    .describe('Core behavioral orientation — a sentence describing the tendency'),
  summary: z.string().optional().describe('Extended description of this personality type'),
  cognitiveStyle: z
    .string()
    .optional()
    .describe(
      "How this personality processes information (e.g., 'analytical', 'intuitive', 'systematic')",
    ),
  communicationMode: z
    .string()
    .optional()
    .describe("Preferred interaction pattern (e.g., 'direct', 'socratic', 'narrative')"),
  decisionFramework: z
    .string()
    .optional()
    .describe("How decisions are made (e.g., 'data-driven', 'consensus-seeking', 'gut-instinct')"),
  conflictApproach: z
    .string()
    .optional()
    .describe("How tension is handled (e.g., 'confrontational', 'diplomatic', 'avoidant')"),
  creativityExpression: z
    .string()
    .optional()
    .describe("How creativity manifests (e.g., 'combinatorial', 'generative', 'reductive')"),
  leadershipStyle: z
    .string()
    .optional()
    .describe("Leadership characteristics (e.g., 'servant-leader', 'visionary', 'hands-off')"),
  learningPreference: z
    .string()
    .optional()
    .describe(
      "How new information is absorbed (e.g., 'experiential', 'theoretical', 'observational')",
    ),
});

export type Personality = z.infer<typeof PersonalitySchema>;
