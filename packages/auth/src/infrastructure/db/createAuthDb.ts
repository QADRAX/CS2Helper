import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { authSchema } from "./schema";

/** Drizzle DB over Postgres (pool) or PGlite (archivos locales, dev). */
export type AuthDb = NodePgDatabase<typeof authSchema> | PgliteDatabase<typeof authSchema>;

export function createAuthDb(pool: Pool): AuthDb {
  return drizzlePg(pool, { schema: authSchema });
}

export function createAuthDbFromPglite(client: PGlite): AuthDb {
  return drizzlePglite(client, { schema: authSchema });
}
