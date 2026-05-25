import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Next.js の "server-only" を test 環境では noop モジュールに差し替え.
      // Phase Ε (2026-05) で content-store / data wrappers が "server-only" を
      // 宣言したので必要になった.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
});
