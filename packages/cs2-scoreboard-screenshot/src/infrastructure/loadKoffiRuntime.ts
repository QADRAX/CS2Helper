import { createRequire } from "node:module";

type KoffiRoot = typeof import("koffi");

let koffiCached: KoffiRoot | undefined;

/**
 * Returns the real Koffi module via `createRequire`. Use this at call sites (or assign to a
 * local `const k = getKoffi()` inside a function) so vite-node SSR does not wrap a static
 * `import`/`export const koffi` and break `koffi.out()` tokens for `lib.func(...)`.
 */
export function getKoffi(): KoffiRoot {
  if (!koffiCached) {
    const requireKoffi = createRequire(import.meta.url);
    koffiCached = requireKoffi("koffi") as KoffiRoot;
  }
  return koffiCached;
}
