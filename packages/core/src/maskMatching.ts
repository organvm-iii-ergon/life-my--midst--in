import type { Mask } from "@in-midst-my-life/schema";

export interface MaskMatch {
  mask: Mask;
  score: number;
}

/**
 * Filters masks whose activation contexts or triggers intersect with requested contexts.
 * Returns matches with a simple score (count of matched contexts/triggers).
 */
export function matchMasksToContext(
  masks: Mask[],
  contexts: string[]
): MaskMatch[] {
  const contextSet = new Set(contexts.map((c) => c.toLowerCase()));
  return masks
    .map((mask) => {
      const matches =
        mask.activation_rules.contexts.filter((c) => contextSet.has(c.toLowerCase()))
          .length +
        mask.activation_rules.triggers.filter((t) => contextSet.has(t.toLowerCase()))
          .length;
      return { mask, score: matches };
    })
    .filter((entry) => entry.score > 0);
}

/**
 * Sorts mask matches by score (desc) and then by mask name.
 */
export function rankMasksByPriority(matches: MaskMatch[]): Mask[] {
  return [...matches]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.mask.name.localeCompare(b.mask.name);
    })
    .map((entry) => entry.mask);
}

