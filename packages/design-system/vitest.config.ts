import { defineConfig } from 'vitest/config';

const isCI = process.env.CI === 'true';
const isCoverage = process.env.COVERAGE === 'true';

export default defineConfig({
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      enabled: isCI || isCoverage,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 20,
        branches: 20,
        functions: 0,
        lines: 20,
      },
    },
  },
});
