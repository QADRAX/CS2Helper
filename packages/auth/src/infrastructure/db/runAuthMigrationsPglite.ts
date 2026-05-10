import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Applies SQL migrations under `packages/auth/drizzle` to a PGlite instance.
 */
export async function runAuthMigrationsPglite(
  client: PGlite,
  migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../drizzle")
): Promise<void> {
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
}
