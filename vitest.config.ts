import { defineConfig } from "vitest/config";

const isCI = process.env.CI === "true";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      enabled: isCI,
      provider: "v8",
      reports: ["text", "lcov"],
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 75,
        lines: 75
      }
    }
  }
});
