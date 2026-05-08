import { defineConfig } from "vite";
import { resolve } from "path";
import { builtinModules } from "module";

export default defineConfig({
  resolve: {
    dedupe: ["react", "ink"],
  },
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((moduleName) => `node:${moduleName}`),
        "@cs2helper/cli-common",
        "@cs2helper/gsi-processor",
        "@cs2helper/shared",
        "ink",
        "react",
        "react/jsx-runtime",
      ],
    },
    outDir: "dist",
    target: "node22",
  },
});
