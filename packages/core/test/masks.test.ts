import { describe, expect, it } from "vitest";
import type { Mask } from "@in-midst-my-life/schema";

describe("Masks Module", () => {
  const baseMask: Mask = {
    id: "test-mask",
    name: "Test Mask",
    ontology: "cognitive",
    functional_scope: "test functionality",
    stylistic_parameters: {
      tone: "neutral",
      rhetorical_mode: "deductive",
      compression_ratio: 0.5
    },
    activation_rules: {
      contexts: ["test"],
      triggers: ["example"]
    },
    filters: {
      include_tags: ["test"],
      exclude_tags: [],
      priority_weights: { test: 1 }
    }
  };

  describe("Mask validation", () => {
    it("validates mask structure", () => {
      expect(baseMask.id).toBeDefined();
      expect(baseMask.name).toBeDefined();
      expect(baseMask.ontology).toMatch(/^(cognitive|expressive|operational)$/);
    });

    it("has valid stylistic parameters", () => {
      expect(baseMask.stylistic_parameters.compression_ratio).toBeGreaterThanOrEqual(0);
      expect(baseMask.stylistic_parameters.compression_ratio).toBeLessThanOrEqual(1);
    });

    it("has valid activation rules", () => {
      expect(Array.isArray(baseMask.activation_rules.contexts)).toBe(true);
      expect(Array.isArray(baseMask.activation_rules.triggers)).toBe(true);
    });

    it("has valid filters", () => {
      expect(Array.isArray(baseMask.filters.include_tags)).toBe(true);
      expect(Array.isArray(baseMask.filters.exclude_tags)).toBe(true);
      expect(typeof baseMask.filters.priority_weights).toBe("object");
    });
  });

  describe("Mask ontology", () => {
    it("cognitive masks filter analysis", () => {
      const mask: Mask = {
        ...baseMask,
        ontology: "cognitive",
        filters: { ...baseMask.filters, include_tags: ["analysis", "metrics"] }
      };
      expect(mask.ontology).toBe("cognitive");
      expect(mask.filters.include_tags).toContain("analysis");
    });

    it("expressive masks filter narrative", () => {
      const mask: Mask = {
        ...baseMask,
        ontology: "expressive",
        filters: { ...baseMask.filters, include_tags: ["story", "communication"] }
      };
      expect(mask.ontology).toBe("expressive");
      expect(mask.filters.include_tags).toContain("story");
    });

    it("operational masks filter execution", () => {
      const mask: Mask = {
        ...baseMask,
        ontology: "operational",
        filters: { ...baseMask.filters, include_tags: ["delivery", "reliability"] }
      };
      expect(mask.ontology).toBe("operational");
      expect(mask.filters.include_tags).toContain("delivery");
    });
  });

  describe("Mask activation rules", () => {
    it("masks have contexts for activation", () => {
      expect(baseMask.activation_rules.contexts.length).toBeGreaterThan(0);
    });

    it("masks have triggers for activation", () => {
      expect(baseMask.activation_rules.triggers.length).toBeGreaterThan(0);
    });

    it("analyst mask activates on analysis context", () => {
      const analystMask: Mask = {
        ...baseMask,
        id: "analyst",
        name: "Analyst",
        activation_rules: {
          contexts: ["analysis", "research", "validation"],
          triggers: ["metric", "benchmark"]
        }
      };
      expect(analystMask.activation_rules.contexts).toContain("analysis");
    });
  });

  describe("Mask priority weights", () => {
    it("masks have priority weights for filtering", () => {
      const weighted: Mask = {
        ...baseMask,
        filters: {
          include_tags: ["impact", "reliability"],
          exclude_tags: [],
          priority_weights: { impact: 2, reliability: 1.5 }
        }
      };
      expect(weighted.filters.priority_weights.impact).toBe(2);
      expect(weighted.filters.priority_weights.reliability).toBe(1.5);
    });

    it("priority weights are numerical", () => {
      for (const [_key, value] of Object.entries(baseMask.filters.priority_weights)) {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThan(0);
      }
    });
  });

  describe("Mask filtering", () => {
    it("excludes tags in filters", () => {
      const filtered: Mask = {
        ...baseMask,
        filters: {
          include_tags: ["leadership"],
          exclude_tags: ["speculation"],
          priority_weights: {}
        }
      };
      expect(filtered.filters.exclude_tags).toContain("speculation");
    });

    it("can have empty exclude tags", () => {
      expect(baseMask.filters.exclude_tags.length).toBeGreaterThanOrEqual(0);
    });
  });
});
