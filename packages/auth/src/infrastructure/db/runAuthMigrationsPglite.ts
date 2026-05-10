import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import { getAuthMigrationsFolder } from "./authMigrationsPath";

/**
 * Applies SQL migrations under `packages/auth/drizzle` to a PGlite instance.
 */
export async function runAuthMigrationsPglite(
  client: PGlite,
  migrationsFolder = getAuthMigrationsFolder()
): Promise<void> {
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
}
