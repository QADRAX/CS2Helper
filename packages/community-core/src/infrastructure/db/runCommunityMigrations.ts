import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { getCommunityMigrationsFolder } from "./communityMigrationsPath";

export async function runCommunityMigrations(
  pool: Pool,
  migrationsFolder = getCommunityMigrationsFolder()
): Promise<void> {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
}
