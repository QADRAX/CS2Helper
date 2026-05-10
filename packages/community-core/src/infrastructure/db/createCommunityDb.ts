import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { communitySchema } from "./schema";

export type CommunityDb = NodePgDatabase<typeof communitySchema> | PgliteDatabase<typeof communitySchema>;

export function createCommunityDb(pool: Pool): CommunityDb {
  return drizzlePg(pool, { schema: communitySchema });
}

export function createCommunityDbFromPglite(client: PGlite): CommunityDb {
  return drizzlePglite(client, { schema: communitySchema });
}
