/**
 * Mask Selection Module
 *
 * This module handles context-based mask selection and scoring.
 * Given a view configuration with contexts, tags, and timeline,
 * it determines which masks are most appropriate.
 *
 * The selection algorithm considers:
 * - Context activation: Does the mask's activation_rules match the view's contexts?
 * - Tag affinity: Do the view's tags align with the mask's include/exclude filters?
 * - Stage affinity: How well does the mask fit the current stage context?
 * - Epoch modifiers: Does the current epoch boost or suppress certain masks?
 */

import type { Mask, Stage } from "@in-midst-my-life/schema";
import type { NarrativeViewConfig, WeightedMask } from "./types";
import { EPOCH_MASK_MODIFIERS, MASK_STAGE_AFFINITIES } from "./taxonomy";

// ─────────────────────────────────────────────────────────────────────────────
// MODIFIER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the cumulative epoch modifier for a mask across multiple epochs.
 * Epochs can boost or suppress certain masks based on career phase.
 *
 * @param maskId - ID of the mask to evaluate
 * @param epochIds - Array of active epoch IDs
 * @returns Cumulative epoch modifier score
 */
export function epochMaskModifier(maskId: string, epochIds: string[]): number {
  if (!epochIds.length) return 0;
  return epochIds.reduce((acc, id) => acc + (EPOCH_MASK_MODIFIERS[id]?.[maskId] ?? 0), 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates a comprehensive weight for a mask against a narrative view.
 * This is the main scoring function used during mask selection.
 *
 * Scoring components:
 * - +2 points for each matching context in activation_rules.contexts
 * - +1 point for each matching trigger in activation_rules.triggers
 * - +2 points for each matching tag in filters.include_tags
 * - -1 point for each matching tag in filters.exclude_tags
 * - +weight for each matching priority_weight tag
 * - Stage affinity scores from MASK_STAGE_AFFINITIES
 * - Epoch boost from EPOCH_MASK_MODIFIERS
 *
 * @param mask - The mask to score
 * @param view - The narrative view configuration
 * @param options - Optional stage and epoch context
 * @returns Numeric score (higher = better match)
 */
export function maskWeight(
  mask: Mask,
  view: NarrativeViewConfig,
  options?: { activeEpochIds?: string[]; stageIds?: string[] }
): number {
  const contexts = new Set((view.contexts ?? []).map((c) => c.toLowerCase()));
  const tags = new Set((view.tags ?? []).map((t) => t.toLowerCase()));
  let score = 0;

  // Context matching (+2 per match)
  mask.activation_rules.contexts.forEach((c) => {
    if (contexts.has(c.toLowerCase())) score += 2;
  });

  // Trigger matching (+1 per match)
  mask.activation_rules.triggers.forEach((t) => {
    if (contexts.has(t.toLowerCase())) score += 1;
  });

  // Include tag matching (+2 per match)
  mask.filters.include_tags.forEach((t) => {
    if (tags.has(t.toLowerCase())) score += 2;
  });

  // Exclude tag penalty (-1 per match)
  mask.filters.exclude_tags.forEach((t) => {
    if (tags.has(t.toLowerCase())) score -= 1;
  });

  // Priority weight bonus
  Object.entries(mask.filters.priority_weights ?? {}).forEach(([tag, weight]) => {
    if (tags.has(tag.toLowerCase())) score += weight;
  });

  // Stage affinity bonus
  const stageAffinity = (options?.stageIds ?? []).reduce((acc, stageId) => {
    return acc + (MASK_STAGE_AFFINITIES[mask.id]?.[stageId] ?? 0);
  }, 0);

  // Epoch boost
  const epochBoost = epochMaskModifier(mask.id, options?.activeEpochIds ?? []);

  return score + stageAffinity + epochBoost;
}

/**
 * Calculates a stage's relevance weight based on tag overlap with the view.
 *
 * @param stage - The stage to score
 * @param view - The narrative view configuration
 * @returns Number of matching tags
 */
export function stageWeight(stage: Stage, view: NarrativeViewConfig): number {
  const tags = new Set((view.tags ?? []).map((t) => t.toLowerCase()));
  const stageTags = (stage.tags ?? []).map((t) => t.toLowerCase());
  return stageTags.filter((t) => tags.has(t)).length;
}

/**
 * Scores a mask against view contexts and tags using simple overlap counts.
 * This is a simpler scoring function compared to maskWeight, used for
 * quick mask selection without full context analysis.
 *
 * @param mask - The mask to score
 * @param view - The narrative view configuration
 * @returns Score (0 if excluded by tags, positive otherwise)
 */
export function scoreMaskForView(mask: Mask, view: NarrativeViewConfig): number {
  const contexts = new Set((view.contexts ?? []).map((c) => c.toLowerCase()));
  const tags = new Set((view.tags ?? []).map((t) => t.toLowerCase()));
  const includes = new Set((mask.filters.include_tags ?? []).map((t) => t.toLowerCase()));
  const excludes = new Set((mask.filters.exclude_tags ?? []).map((t) => t.toLowerCase()));

  // Penalize if required tags excluded
  if ([...tags].some((t) => excludes.has(t))) return 0;

  const contextScore = mask.activation_rules.contexts.filter((c) => contexts.has(c.toLowerCase())).length;
  const triggerScore = mask.activation_rules.triggers.filter((t) => contexts.has(t.toLowerCase())).length;
  const tagScore = [...tags].filter((t) => includes.has(t)).length;

  return contextScore + triggerScore + tagScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Selects masks for a view, sorted by score then alphabetically by name.
 * Filters out masks with zero or negative scores.
 *
 * @param view - The narrative view configuration
 * @returns Array of masks ordered by relevance (best first)
 */
export function selectMasksForView(view: NarrativeViewConfig): Mask[] {
  const masks = view.availableMasks ?? (view.mask ? [view.mask] : []);
  const scored = masks
    .map((mask) => ({ mask, score: scoreMaskForView(mask, view) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.mask.name.localeCompare(b.mask.name);
    });
  return scored.map((entry) => entry.mask);
}

/**
 * Selects masks with full scoring including epoch and stage context.
 * Returns weighted mask objects for more detailed analysis.
 *
 * @param view - The narrative view configuration
 * @param options - Optional epoch and stage context
 * @returns Array of weighted masks with scores
 */
export function selectWeightedMasks(
  view: NarrativeViewConfig,
  options?: { activeEpochIds?: string[]; stageIds?: string[] }
): WeightedMask[] {
  const masks = view.availableMasks ?? (view.mask ? [view.mask] : []);
  return masks
    .map((mask) => ({ mask, score: maskWeight(mask, view, options) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Selects the single best mask for a view context.
 * Falls back to the view's explicit mask if no better match is found.
 *
 * @param view - The narrative view configuration
 * @param options - Optional epoch and stage context
 * @returns The best matching mask, or undefined if none match
 */
export function selectBestMask(
  view: NarrativeViewConfig,
  options?: { activeEpochIds?: string[]; stageIds?: string[] }
): Mask | undefined {
  const weighted = selectWeightedMasks(view, options);
  return weighted[0]?.mask ?? view.mask;
}
