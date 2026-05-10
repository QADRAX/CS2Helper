import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Carpeta `drizzle` publicada con el paquete (SQL + `meta/_journal.json`).
 * Debe resolverse solo desde módulos **dentro de `@cs2helper/auth`/dist** (`import.meta.url` real);
 * no uses `require.resolve('@cs2helper/auth/package.json')` desde Next/Turbopack (lo inlines mal).
 */
export function getAuthMigrationsFolder(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../drizzle");
}
