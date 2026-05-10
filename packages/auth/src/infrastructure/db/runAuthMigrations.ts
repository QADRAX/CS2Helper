import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { getAuthMigrationsFolder } from "./authMigrationsPath";

/**
 * Applies SQL migrations shipped under `packages/auth/drizzle`.
 * Default folder resolves from this package's `dist` layout.
 */
export async function runAuthMigrations(
  pool: Pool,
  migrationsFolder = getAuthMigrationsFolder()
): Promise<void> {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
}
