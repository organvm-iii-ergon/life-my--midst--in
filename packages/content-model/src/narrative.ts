/**
 * Narrative Generation Module
 *
 * This is the main entry point for narrative content generation.
 * It orchestrates the transformation of profile data through masks
 * to create weighted, contextual narrative blocks.
 *
 * The narrative system transforms a static profile into dynamic,
 * context-specific content by:
 * 1. Selecting appropriate masks based on context/tags
 * 2. Filtering and enriching timeline entries
 * 3. Applying templates to generate narrative blocks
 * 4. Weighting blocks for LLM ranking and summarization
 *
 * Related modules:
 * - taxonomy.ts: Static taxonomy definitions (masks, epochs, stages, etc.)
 * - templates.ts: Narrative block templates
 * - timeline.ts: Timeline processing and formatting
 * - mask-selection.ts: Mask scoring and selection
 * - weighting.ts: Block scoring for LLM ranking
 */

import type { Mask, Personality, Setting } from "@in-midst-my-life/schema";
import { generateNarrativeBlock } from "./llm-provider";
import type {
  MaskedProfile,
  NarrativeBlock,
  NarrativeMeta,
  NarrativeOutput,
  NarrativeViewConfig,
  WeightedMask
} from "./types";

// Re-export taxonomy for backward compatibility
export {
  EPOCH_MASK_MODIFIERS,
  EPOCH_TAXONOMY,
  MASK_PERSONALITY_RELATIONS,
  MASK_STAGE_AFFINITIES,
  MASK_TAXONOMY,
  PERSONALITY_TAXONOMY,
  SETTING_TAXONOMY,
  STAGE_SETTING_RELATIONS,
  STAGE_TAXONOMY
} from "./taxonomy";

// Import from modularized files
import {
  EPOCH_MASK_MODIFIERS,
  MASK_PERSONALITY_RELATIONS,
  MASK_STAGE_AFFINITIES,
  PERSONALITY_TAXONOMY,
  SETTING_TAXONOMY,
  STAGE_SETTING_RELATIONS
} from "./taxonomy";

import {
  TEMPLATE_BANK,
  interpolate
} from "./templates";

import {
  buildArc,
  buildEpochMap,
  buildEvidenceLine,
  buildSettingMap,
  buildStageMap,
  formatEpoch,
  formatStage,
  formatTimeline,
  formatTimelineEntry,
  renderTimeline,
  renderTimelineForMask,
  resolveEpochs,
  resolveSettings,
  resolveStages
} from "./timeline";

import {
  maskWeight,
  scoreMaskForView,
  selectMasksForView,
  stageWeight
} from "./mask-selection";

// Re-export timeline and mask-selection functions for backward compatibility
export {
  renderTimeline,
  renderTimelineForMask,
  scoreMaskForView,
  selectMasksForView
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a personality type from a mask ID.
 */
function resolvePersonality(
  maskId: string | undefined,
  personalities?: Personality[]
): Personality | undefined {
  if (!maskId) return undefined;
  const personalityId = MASK_PERSONALITY_RELATIONS[maskId];
  const source = personalities ?? PERSONALITY_TAXONOMY;
  return source.find((entry) => entry.id === personalityId);
}

/**
 * Resolves a setting from a setting ID.
 */
function resolveSetting(
  settingId: string | undefined,
  settings?: Setting[]
): Setting | undefined {
  if (!settingId) return undefined;
  const source = settings ?? SETTING_TAXONOMY;
  return source.find((entry) => entry.id === settingId);
}

/**
 * Resolves the appropriate setting for a stage.
 */
function resolveSettingForStage(
  stageId: string | undefined,
  settings?: Setting[]
): Setting | undefined {
  if (!stageId) return undefined;
  const settingId = STAGE_SETTING_RELATIONS[stageId];
  return resolveSetting(settingId, settings);
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE NARRATIVE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies a mask to a profile and returns an annotated view with optional highlights.
 * This is intentionally lightweight; deeper filtering happens in downstream renderers.
 */
export function applyMask(config: {
  profile: NarrativeViewConfig["profile"];
  mask?: Mask;
  highlights?: string[];
}): MaskedProfile {
  return {
    profile: config.profile,
    mask: config.mask,
    highlights: config.highlights ?? []
  };
}

/**
 * Builds a simple narrative block list from a masked profile.
 * This is the basic building block for more complex narrative generation.
 */
export function buildNarrative(view: NarrativeViewConfig): NarrativeBlock[] {
  const title = view.mask
    ? `${view.profile.displayName} (${view.mask.name})`
    : view.profile.displayName;
  const summary =
    view.summary ??
    view.profile.summaryMarkdown ??
    "Narrative pending implementation of content pipeline.";

  return [
    {
      title,
      body: summary,
      tags: view.tags ?? view.mask?.filters.include_tags ?? [],
      templateId: "profile-summary",
      weight: 3
    }
  ];
}

/**
 * Builds a richer narrative block combining mask, summary, and timeline callouts.
 */
export function buildNarrativeWithTimeline(view: NarrativeViewConfig): NarrativeBlock[] {
  const blocks = buildNarrative(view);
  const stages = resolveStages(undefined, view);
  const settings = resolveSettings(undefined, view);
  const epochs = resolveEpochs(undefined, view);
  const stageMap = buildStageMap(stages);
  const settingMap = buildSettingMap(settings);
  const epochMap = buildEpochMap(epochs);
  const timeline = view.timeline
    ? renderTimelineForMask(view.timeline, view.mask, { order: "desc", limit: 5, stages, epochs, settings })
    : [];

  if (timeline.length > 0) {
    blocks.push({
      title: "Recent Highlights",
      body: timeline
        .map((entry) => `• ${formatTimelineEntry(entry, stageMap, settingMap, epochMap)}`)
        .join("\n"),
      tags: view.mask?.filters.include_tags ?? view.tags,
      templateId: "timeline",
      weight: 2
    });
  }

  return blocks;
}

/**
 * Builds narrative blocks that include epoch/stage context and mask scoring info.
 */
export function buildNarrativeWithEpochs(view: NarrativeViewConfig): NarrativeBlock[] {
  const blocks = buildNarrativeWithTimeline(view);

  if (view.epochs && view.epochs.length > 0) {
    const sorted = [...view.epochs].sort((a, b) => a.order - b.order);
    const settings = resolveSettings(undefined, view);
    const settingMap = buildSettingMap(settings);
    blocks.push({
      title: "Epochs & Stages",
      body: sorted.map((epoch) => formatEpoch(epoch, settingMap)).join("\n\n"),
      tags: ["epochs"],
      templateId: "epochs-stages",
      weight: 2
    });
  }

  if (view.availableMasks && view.availableMasks.length > 0) {
    const selected = selectMasksForView(view);
    blocks.push({
      title: "Suggested Masks",
      body:
        selected
          .slice(0, 3)
          .map((m) => `• ${m.name} (${m.functional_scope})`)
          .join("\n") || "No masks matched this context.",
      templateId: "suggested-masks",
      weight: 1
    });
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────────────────────
// NARRATIVE PLAN BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a comprehensive narrative plan with all blocks and metadata.
 * This is the main orchestration function that:
 * 1. Resolves taxonomies and builds lookup maps
 * 2. Processes timeline to extract arcs
 * 3. Selects and scores masks
 * 4. Generates narrative blocks from templates
 * 5. Optionally calls LLM for enhanced content
 * 6. Assembles metadata about the narrative context
 */
async function buildNarrativePlan(view: NarrativeViewConfig): Promise<NarrativeOutput> {
  // Resolve taxonomies
  const stages = resolveStages(undefined, view);
  const epochs = resolveEpochs(undefined, view);
  const settings = resolveSettings(undefined, view);
  const stageMap = buildStageMap(stages);
  const epochMap = buildEpochMap(epochs);
  const settingMap = buildSettingMap(settings);
  const sortedEpochs = epochs.slice().sort((a, b) => a.order - b.order);

  // Process timeline
  const timelineAll = view.timeline
    ? renderTimelineForMask(view.timeline, undefined, { order: "desc", stages, epochs, settings })
    : [];
  const stageArcIds = buildArc(timelineAll, "stageId");
  const epochArcIds = buildArc(timelineAll, "epochId");
  const settingArcIds = buildArc(timelineAll, "settingId");
  const hasExplicitEpochs = Boolean(view.epochs && view.epochs.length > 0);
  const activeEpochIds =
    epochArcIds.length > 0
      ? epochArcIds
      : hasExplicitEpochs && sortedEpochs[0]
        ? [sortedEpochs[0].id]
        : [];

  // Select masks
  const selectedMasks: WeightedMask[] = (view.availableMasks ?? [])
    .map((mask) => ({ mask, score: maskWeight(mask, view, { activeEpochIds, stageIds: stageArcIds }) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  const chosenMask = view.mask ?? selectedMasks[0]?.mask;
  const timelineForMask = view.timeline
    ? renderTimelineForMask(view.timeline, chosenMask, { order: "desc", stages, epochs, settings })
    : [];
  const timelineHighlights = timelineForMask.slice(0, 5);
  const sequenceTimeline = timelineForMask;

  // Resolve current context
  const currentEntry = timelineForMask[0];
  const currentStage = currentEntry?.stageId ? stageMap.get(currentEntry.stageId) : undefined;
  const currentEpoch = currentEntry?.epochId ? epochMap.get(currentEntry.epochId) : undefined;
  const resolvedEpoch = currentEpoch ?? sortedEpochs[0];
  const stagesForEpoch = (epochId?: string) => {
    if (!epochId) return [];
    const byEpoch = stages.filter((stage) => stage.epochId === epochId);
    if (byEpoch.length > 0) return byEpoch;
    const epoch = epochMap.get(epochId);
    return epoch?.stages ?? [];
  };
  const epochStages = resolvedEpoch ? stagesForEpoch(resolvedEpoch.id) : [];
  const sortedStages = epochStages.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const resolvedStage = currentStage ?? sortedStages[0];
  const nextStage = resolvedStage
    ? sortedStages.find((stage) => (stage.order ?? 0) > (resolvedStage.order ?? 0))
    : undefined;
  const personality = resolvePersonality(chosenMask?.id, view.personalities);
  const currentSetting = resolveSettingForStage(resolvedStage?.id, settings);

  // Build arc labels
  const stageArcLabel =
    stageArcIds.length > 0
      ? stageArcIds.map((id) => stageMap.get(id)?.title ?? id).join(" → ")
      : "No stage arc yet.";
  const epochArcLabel =
    epochArcIds.length > 0
      ? epochArcIds.map((id) => epochMap.get(id)?.name ?? id).join(" → ")
      : "No epoch arc yet.";
  const settingArcLabel =
    settingArcIds.length > 0
      ? settingArcIds.map((id) => settingMap.get(id)?.title ?? id).join(" → ")
      : "No setting arc yet.";

  const timelineStageId = timelineForMask.find((entry) => entry.stageId)?.stageId;
  const timelineTopStage = timelineStageId ? stageMap.get(timelineStageId) : undefined;

  // Build template variables
  const templateVars = {
    summary:
      view.summary ?? view.profile.summaryMarkdown ?? "Narrative pending implementation of content pipeline.",
    mask: chosenMask ? chosenMask.name : "general",
    contexts: (view.contexts ?? []).join(", "),
    tags: (view.tags ?? []).join(", "),
    timeline:
      timelineHighlights.length > 0
        ? formatTimeline(timelineHighlights, stageMap, settingMap, epochMap)
        : "No recent highlights.",
    currentEpoch: resolvedEpoch?.name ?? "Current",
    currentStage: resolvedStage?.title ?? "Execution",
    nextStage: nextStage?.title ?? "Next milestone",
    maskPersonality: personality?.label ?? "Adaptive",
    maskPersonalitySummary: personality?.orientation ?? personality?.summary ?? "",
    currentSetting: currentSetting?.title ?? "Default",
    timelineSequence:
      sequenceTimeline.length > 1
        ? sequenceTimeline.map((entry) => entry.title).join(" → ")
        : sequenceTimeline.map((entry) => entry.title).join(", ") || "No recent highlights.",
    timelineTheme: timelineTopStage?.summary ?? resolvedStage?.summary ?? "Execution cadence",
    stageArc: stageArcLabel,
    epochArc: epochArcLabel,
    settingArc: settingArcLabel
  };

  // Build baseline blocks
  const baseline = buildNarrativeWithEpochs({ ...view, mask: chosenMask, stages, epochs, settings });
  const existingTemplateIds = new Set(baseline.map((block) => block.templateId).filter(Boolean));
  const topScore = selectedMasks[0]?.score ?? 1;
  const weightedTemplates = TEMPLATE_BANK.filter((tpl) => (tpl.minScore ?? 0) <= topScore).sort(
    (a, b) => (b.weight ?? 1) - (a.weight ?? 1)
  );

  // Generate blocks from templates
  for (const tpl of weightedTemplates) {
    if (existingTemplateIds.has(tpl.id)) continue;

    // For key templates, use the LLM provider
    let body = interpolate(tpl.body, templateVars);
    if (["mask-voice", "evidence", "summary"].includes(tpl.id)) {
      const modelMaxTokens = Number(process.env["LLM_CONTEXT_WINDOW"] ?? process.env["LOCAL_LLM_MAX_TOKENS"] ?? 4096);
      body = await generateNarrativeBlock(
        {
          mask: chosenMask ? chosenMask.name : "General",
          personality: personality?.label ?? "Neutral",
          tone: chosenMask?.stylistic_parameters.tone ?? "Professional",
          focusTags: view.tags ?? [],
          recentEvents: timelineHighlights.map(buildEvidenceLine)
        },
        tpl.id,
        { orchestratorUrl: view.orchestratorUrl, modelMaxTokens }
      );
    }

    baseline.push({
      title: tpl.title,
      body,
      tags: view.tags,
      templateId: tpl.id,
      weight: tpl.weight ?? 1
    });
  }

  // Add stage spotlight if available
  if (resolvedEpoch && sortedStages.length > 0) {
    const topStage = sortedStages
      .slice()
      .sort((a, b) => stageWeight(b, view) - stageWeight(a, view))[0];
    if (topStage) {
      baseline.push({
        title: "Stage Spotlight",
        body: formatStage(topStage, settingMap),
        templateId: "stage-spotlight",
        weight: 2
      });
    }
  }

  // Build timeline statistics
  const byStage = timelineForMask.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.stageId) return acc;
    acc[entry.stageId] = (acc[entry.stageId] ?? 0) + 1;
    return acc;
  }, {});
  const byEpoch = timelineForMask.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.epochId) return acc;
    acc[entry.epochId] = (acc[entry.epochId] ?? 0) + 1;
    return acc;
  }, {});

  // Assemble metadata
  const meta: NarrativeMeta = {
    mask: chosenMask,
    personality,
    epoch: resolvedEpoch,
    stage: resolvedStage,
    setting: currentSetting,
    relations: {
      maskPersonalityId: chosenMask ? MASK_PERSONALITY_RELATIONS[chosenMask.id] : undefined,
      stageSettingId: resolvedStage ? STAGE_SETTING_RELATIONS[resolvedStage.id] : undefined,
      epochMaskModifiers: resolvedEpoch ? EPOCH_MASK_MODIFIERS[resolvedEpoch.id] : undefined,
      maskStageAffinities: chosenMask ? MASK_STAGE_AFFINITIES[chosenMask.id] : undefined
    },
    timeline: {
      total: timelineForMask.length,
      byStage,
      byEpoch,
      stageArc: stageArcIds,
      epochArc: epochArcIds
    }
  };

  return { blocks: baseline, meta };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds narrative blocks using template/weighting with masks, contexts, tags, epochs.
 * Returns just the blocks without metadata.
 */
export async function buildWeightedNarrative(view: NarrativeViewConfig): Promise<NarrativeBlock[]> {
  return (await buildNarrativePlan(view)).blocks;
}

/**
 * Builds a complete narrative output including blocks and metadata.
 * This is the main entry point for full narrative generation.
 */
export async function buildNarrativeOutput(view: NarrativeViewConfig): Promise<NarrativeOutput> {
  return buildNarrativePlan(view);
}
