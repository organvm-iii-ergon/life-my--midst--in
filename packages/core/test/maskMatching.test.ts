import { describe, expect, it } from "vitest";
import type { Mask } from "@in-midst-my-life/schema";
import { matchMasksToContext, rankMasksByPriority } from "../src/maskMatching";

const masks: Mask[] = [
  {
    id: "analyst",
    name: "Analyst",
    ontology: "cognitive",
    functional_scope: "analysis",
    stylistic_parameters: {
      tone: "neutral",
      rhetorical_mode: "deductive",
      compression_ratio: 0.5
    },
    activation_rules: {
      contexts: ["analysis", "research"],
      triggers: ["data", "evaluation"]
    },
    filters: {
      include_tags: ["analysis"],
      exclude_tags: [],
      priority_weights: {}
    }
  },
  {
    id: "architect",
    name: "Architect",
    ontology: "expressive",
    functional_scope: "system design",
    stylistic_parameters: {
      tone: "assertive",
      rhetorical_mode: "structured",
      compression_ratio: 0.6
    },
    activation_rules: {
      contexts: ["design", "systems"],
      triggers: ["architecture"]
    },
    filters: {
      include_tags: ["design"],
      exclude_tags: [],
      priority_weights: {}
    }
  }
];

describe("maskMatching", () => {
  it("matches masks based on contexts and triggers", () => {
    const matches = matchMasksToContext(masks, ["analysis", "architecture"]);
    const matchedIds = matches.map((m) => m.mask.id);
    expect(matchedIds).toEqual(["analyst", "architect"]);
  });

  it("ranks matches by score then name", () => {
    const matches = matchMasksToContext(masks, ["analysis", "data", "design"]);
    const ranked = rankMasksByPriority(matches);
    expect(ranked[0].id).toBe("analyst"); // two matches
    expect(ranked[1].id).toBe("architect"); // one match
  });

  it("handles empty context", () => {
    const matches = matchMasksToContext(masks, []);
    expect(matches.length).toBe(0);
  });

  it("handles case-insensitive matching", () => {
    const matches = matchMasksToContext(masks, ["ANALYSIS", "Architecture"]);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map((m) => m.mask.id)).toContain("analyst");
  });

  it("scores contexts and triggers equally", () => {
    const contextMatch = matchMasksToContext(masks, ["analysis"]);
    const triggerMatch = matchMasksToContext(masks, ["data"]);
    
    expect(contextMatch[0].score).toBe(triggerMatch[0].score);
  });

  it("returns empty array for no matches", () => {
    const matches = matchMasksToContext(masks, ["nonexistent"]);
    expect(matches.length).toBe(0);
  });

  it("filters out zero-score masks", () => {
    const matches = matchMasksToContext(masks, ["nonexistent"]);
    const hasZeroScore = matches.some((m) => m.score === 0);
    expect(hasZeroScore).toBe(false);
  });

  describe("rankMasksByPriority", () => {
    it("sorts by score descending", () => {
      const matches = matchMasksToContext(masks, ["analysis", "data", "design"]);
      const ranked = rankMasksByPriority(matches);
      
      for (let i = 1; i < ranked.length; i++) {
        const prevScore = matches.find((m) => m.mask.id === ranked[i - 1].id)?.score || 0;
        const currScore = matches.find((m) => m.mask.id === ranked[i].id)?.score || 0;
        expect(prevScore).toBeGreaterThanOrEqual(currScore);
      }
    });

    it("sorts alphabetically for equal scores", () => {
      const equalMasks = [
        { mask: { ...masks[0], id: "z-mask", name: "Z Mask" }, score: 5 },
        { mask: { ...masks[0], id: "a-mask", name: "A Mask" }, score: 5 }
      ];
      const ranked = rankMasksByPriority(equalMasks);
      expect(ranked[0].id).toBe("a-mask");
      expect(ranked[1].id).toBe("z-mask");
    });

    it("returns masks only", () => {
      const matches = matchMasksToContext(masks, ["analysis"]);
      const ranked = rankMasksByPriority(matches);
      
      ranked.forEach((mask) => {
        expect(mask).toHaveProperty("id");
        expect(mask).toHaveProperty("name");
        expect(mask).toHaveProperty("ontology");
      });
    });
  });

  it("handles single context match", () => {
    const matches = matchMasksToContext(masks, ["analysis"]);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].score).toBe(1);
  });

  it("accumulates multiple context matches", () => {
    const singleMatch = matchMasksToContext(masks, ["analysis"]);
    const doubleMatch = matchMasksToContext(masks, ["analysis", "research"]);
    
    const analystDouble = doubleMatch.find((m) => m.mask.id === "analyst");
    const analystSingle = singleMatch.find((m) => m.mask.id === "analyst");
    
    if (analystDouble && analystSingle) {
      expect(analystDouble.score).toBeGreaterThan(analystSingle.score);
    }
  });
});

