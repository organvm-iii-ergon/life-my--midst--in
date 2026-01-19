import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
      moduleResolution: "bundler",
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["zod"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
