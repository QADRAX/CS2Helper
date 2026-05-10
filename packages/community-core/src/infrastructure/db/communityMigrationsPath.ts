import path from "node:path";
import { fileURLToPath } from "node:url";

/** `packages/community-core/drizzle` (SQL + `meta/_journal.json`). */
export function getCommunityMigrationsFolder(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../drizzle");
}
