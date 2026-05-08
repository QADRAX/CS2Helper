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
      external: ["@cs2helper/gsi-processor", "ink", "react", "react/jsx-runtime"],
    },
    outDir: "dist",
    target: "node22",
  },
});
