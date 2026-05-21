import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@agenthub/contracts": fileURLToPath(new URL("../../packages/contracts/src/index.ts", import.meta.url)),
      "@agenthub/ui": fileURLToPath(new URL("../../packages/ui/src/index.tsx", import.meta.url)),
    },
  },
});

