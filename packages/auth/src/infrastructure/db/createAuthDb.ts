import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { authSchema } from "./schema";

export type AuthDb = NodePgDatabase<typeof authSchema>;

export function createAuthDb(pool: Pool): AuthDb {
  return drizzle(pool, { schema: authSchema });
}
