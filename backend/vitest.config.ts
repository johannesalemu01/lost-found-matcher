import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // tests/ mirrors src/: tests/matching, tests/services, tests/validators
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    environment: "node",
  },
});
