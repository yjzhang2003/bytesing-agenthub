import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@agenthub/contracts": fileURLToPath(new URL("./packages/contracts/src/index.ts", import.meta.url)),
      "@agenthub/desktop-runtime": fileURLToPath(
        new URL("./runtimes/desktop/src/index.ts", import.meta.url),
      ),
      "@agenthub/ui": fileURLToPath(new URL("./packages/ui/src/index.tsx", import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: "v8",
    },
    globals: false,
    include: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
  },
});
