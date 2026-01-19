/**
 * Narrative Template Definitions
 *
 * This module contains template structures for generating narrative blocks.
 * Templates use Mustache-style placeholders ({{variable}}) for interpolation.
 *
 * Template categories:
 * - BASE_TEMPLATES: Core narrative blocks (summary, mask angle, timeline)
 * - MASK_TEMPLATES: Mask-specific narrative blocks
 * - EPOCH_TEMPLATES: Career arc and setting context
 * - TIMELINE_TEMPLATES: Dense timeline renderings
 * - SPEC_TEMPLATES: Detailed specification blocks for rich narratives
 */

import type { Template } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// BASE TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core narrative templates that form the foundation of any narrative output.
 */
export const BASE_TEMPLATES: Template[] = [
  {
    id: "summary",
    title: "Summary",
    body: "{{summary}}",
    minScore: 0,
    weight: 3
  },
  {
    id: "mask-angle",
    title: "Mask Focus",
    body: "This narrative emphasizes {{mask}} across {{contexts}} with tags {{tags}}.",
    minScore: 1,
    weight: 2
  },
  {
    id: "timeline",
    title: "Recent Highlights",
    body: "{{timeline}}",
    minScore: 0,
    weight: 2
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// MASK TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Templates that emphasize the active mask's perspective and personality.
 */
export const MASK_TEMPLATES: Template[] = [
  {
    id: "mask-voice",
    title: "Voice & Emphasis",
    body: "Using the {{mask}} lens to emphasize {{contexts}} with priority on {{tags}}.",
    minScore: 1,
    weight: 2
  },
  {
    id: "mask-personality",
    title: "Mask Personality",
    body: "Personality signal: {{maskPersonality}}. {{maskPersonalitySummary}}",
    minScore: 1,
    weight: 2
  },
  {
    id: "evidence",
    title: "Evidence Trail",
    body: "Key evidence aligned to {{mask}}: {{timeline}}",
    minScore: 2,
    weight: 2
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EPOCH TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Templates for career arc and temporal context.
 */
export const EPOCH_TEMPLATES: Template[] = [
  {
    id: "epoch-arc",
    title: "Career Arc",
    body: "Currently in {{currentEpoch}} with focus on {{currentStage}}; next move: {{nextStage}}.",
    minScore: 1,
    weight: 2
  },
  {
    id: "setting-context",
    title: "Setting Context",
    body: "Current setting: {{currentSetting}} ({{currentStage}} / {{currentEpoch}}).",
    minScore: 1,
    weight: 2
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Templates for dense timeline rendering.
 */
export const TIMELINE_TEMPLATES: Template[] = [
  {
    id: "timeline-dense",
    title: "Recent Milestones",
    body: "{{timeline}}",
    minScore: 0,
    weight: 1
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFICATION TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detailed specification templates for rich narrative generation.
 * These provide more granular blocks for comprehensive narratives.
 */
export const SPEC_TEMPLATES: Template[] = [
  {
    id: "identity-mode",
    title: "Identity Mode",
    body: "Operating in the {{mask}} mode ({{maskPersonality}}) across {{contexts}}.",
    minScore: 1,
    weight: 3
  },
  {
    id: "stage-context",
    title: "Stage Context",
    body: "Stage: {{currentStage}} within {{currentEpoch}}; focus: {{timelineTheme}}.",
    minScore: 1,
    weight: 3
  },
  {
    id: "sequence",
    title: "Timeline Sequence",
    body: "Sequence highlights: {{timelineSequence}}",
    minScore: 0,
    weight: 2
  },
  {
    id: "stage-arc",
    title: "Stage Arc",
    body: "{{stageArc}}",
    minScore: 1,
    weight: 2
  },
  {
    id: "epoch-arc",
    title: "Epoch Arc",
    body: "{{epochArc}}",
    minScore: 1,
    weight: 2
  },
  {
    id: "setting-arc",
    title: "Setting Arc",
    body: "{{settingArc}}",
    minScore: 1,
    weight: 1
  },
  {
    id: "next-move",
    title: "Next Move",
    body: "Next milestone: {{nextStage}} with emphasis on {{tags}}.",
    minScore: 1,
    weight: 2
  },
  {
    id: "mask-triggers",
    title: "Triggers & Signals",
    body: "Signals activating this mask: {{contexts}}; priority tags: {{tags}}.",
    minScore: 1,
    weight: 1
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED TEMPLATE BANK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete bank of all available templates, ordered by category.
 * Used for iterating through templates during narrative generation.
 */
export const TEMPLATE_BANK: Template[] = [
  ...BASE_TEMPLATES,
  ...MASK_TEMPLATES,
  ...EPOCH_TEMPLATES,
  ...TIMELINE_TEMPLATES,
  ...SPEC_TEMPLATES
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interpolates template variables using Mustache-style syntax.
 *
 * @param template - Template string with {{variable}} placeholders
 * @param vars - Key-value pairs for variable substitution
 * @returns Interpolated string with variables replaced
 *
 * @example
 * interpolate("Hello {{name}}, you are {{role}}.", { name: "Alex", role: "Architect" })
 * // => "Hello Alex, you are Architect."
 */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

/**
 * Filters templates by minimum score requirement.
 *
 * @param templates - Array of templates to filter
 * @param score - Minimum score threshold
 * @returns Templates that meet the minimum score requirement
 */
export function filterTemplatesByScore(templates: Template[], score: number): Template[] {
  return templates.filter((tpl) => (tpl.minScore ?? 0) <= score);
}

/**
 * Sorts templates by weight (highest first).
 *
 * @param templates - Array of templates to sort
 * @returns Templates sorted by descending weight
 */
export function sortTemplatesByWeight(templates: Template[]): Template[] {
  return [...templates].sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1));
}
