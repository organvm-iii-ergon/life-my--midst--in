import { describe, expect, it } from "vitest";
import * as Core from "../src";

describe("core package exports", () => {
  it("exposes mask matching helpers", () => {
    expect(Core.matchMasksToContext).toBeTypeOf("function");
    expect(Core.rankMasksByPriority).toBeTypeOf("function");
  });
});
