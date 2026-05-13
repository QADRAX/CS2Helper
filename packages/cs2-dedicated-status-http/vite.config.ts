import { builtinModules } from "node:module";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { defineConfig } from "vite";

/**
 * Node bundle for Docker (workspace deps inlined; only `node:` builtins external).
 * Emits `dist/infrastructure/run.bundle.js` + writes `dist/package.json` with `"type":"module"`
 * so Node treats `.js` under `dist/` as ESM when run from any cwd.
 * Declarations: `tsc --emitDeclarationOnly` (see package.json `build`).
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/infrastructure/main.ts"),
      formats: ["es"],
      fileName: "infrastructure/run.bundle",
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((name) => `node:${name}`),
      ],
    },
    outDir: "dist",
    target: "node22",
    emptyOutDir: true,
  },
  plugins: [
    {
      name: "write-dist-package-type-module",
      closeBundle() {
        writeFileSync(
          resolve(__dirname, "dist/package.json"),
          `${JSON.stringify({ type: "module" }, null, 2)}\n`
        );
      },
    },
  ],
});
