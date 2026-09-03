import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{spec,test}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "lib/auth/**/*.ts",
        "lib/catalog/**/*.ts",
        "lib/cart/**/*.ts",
        "lib/checkout/**/*.ts",
        "lib/orders/**/*.ts",
        "lib/observability/metrics.ts",
        "lib/payments/**/*.ts",
        "lib/security/**/*.ts",
        "lib/profile/**/*.ts",
        "components/profile/**/*.tsx",
        "app/profile/page.tsx",
        "components/checkout/**/*.tsx",
        "app/checkout/page.tsx",
        "lib/admin/**/*.ts",
        "components/admin/**/*.tsx",
        "app/admin/page.tsx",
      ],
      exclude: ["**/*.{spec,test}.{ts,tsx}", "**/*.d.ts", "**/*-repository.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
    },
  },
})
