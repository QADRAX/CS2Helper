import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // Keep workspace packages external so Node-only transitive deps (gateway, performance, etc.)
      // are not walked for a "browser" bundle — avoids rolldown externalized-for-browser noise.
      external: [/^@cs2helper\//, "ink", "react", "react/jsx-runtime"],
    },
    outDir: "dist",
    target: "node22",
  },
});
