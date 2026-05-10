import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzle } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import { getCommunityMigrationsFolder } from "./communityMigrationsPath";

export async function runCommunityMigrationsPglite(
  client: PGlite,
  migrationsFolder = getCommunityMigrationsFolder()
): Promise<void> {
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
}
