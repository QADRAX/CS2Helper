import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Applies SQL migrations shipped under `packages/auth/drizzle`.
 * Default folder resolves to `../../../drizzle` from this file in `dist/infrastructure/db`.
 */
export async function runAuthMigrations(
  pool: Pool,
  migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../drizzle")
): Promise<void> {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
}
