import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,ts,vue}"],
      exclude: [
        "node_modules/**",
        "src/main.ts",
        "src/setupTests.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/plugins/**",
        "src/router.options.ts",
        "nuxt.config.ts",
        ".nuxt/**",
        ".output/**",
        "dist/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});