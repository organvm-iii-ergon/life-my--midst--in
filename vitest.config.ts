import { defineConfig } from 'vitest/config';

const isCI = process.env.CI === 'true';
const isCoverage = process.env.COVERAGE === 'true';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- vitest/config defineConfig type resolves at runtime
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      enabled: isCI || isCoverage,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 75,
        branches: 75,
        functions: 75,
        lines: 75,
      },
    },
  },
});
