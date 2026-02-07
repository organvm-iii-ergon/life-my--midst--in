import { z } from 'zod';

/**
 * Schema for a work environment setting.
 *
 * Settings describe the environmental context where professional activities
 * take place. They complement scaenae (theatrical stages) by providing the
 * physical/operational dimension rather than the theatrical one.
 *
 * The eight canonical settings are:
 * - **Research Lab**: Exploration, inquiry, and synthesis
 * - **Studio**: Ideation, design, and composition
 * - **Production Floor**: Execution, delivery, and build
 * - **Calibration Lab**: Testing, refinement, verification
 * - **Public Stage**: Publishing, presentation, transmission
 * - **Reflection Space**: Retrospective analysis and synthesis
 * - **Negotiation Table**: Alignment, negotiation, stakeholder work
 * - **Archive**: Documentation, preservation, record-keeping
 */
export const FormalityLevel = z.enum(['formal', 'semi-formal', 'informal', 'creative']);

export type FormalityLevel = z.infer<typeof FormalityLevel>;

export const SettingSchema = z.object({
  id: z.string().describe('Unique identifier for this setting'),
  title: z.string().describe("Display name (e.g., 'Research Lab', 'Studio')"),
  summary: z.string().optional().describe("Brief description of this setting's purpose"),
  tags: z.array(z.string()).optional().describe('Categorization tags for filtering and search'),
  atmosphere: z
    .string()
    .optional()
    .describe("Emotional tone of the setting (e.g., 'focused', 'energetic', 'contemplative')"),
  constraints: z
    .array(z.string())
    .optional()
    .describe("Environmental constraints (e.g., 'time-boxed', 'resource-limited')"),
  opportunities: z
    .array(z.string())
    .optional()
    .describe("What this setting enables (e.g., 'deep focus', 'rapid iteration')"),
  audienceType: z
    .string()
    .optional()
    .describe("Who is typically present (e.g., 'peers', 'stakeholders', 'public')"),
  formality: FormalityLevel.optional().describe('Formality level of the setting'),
});

export type Setting = z.infer<typeof SettingSchema>;
