import type { CommunityCoreSdk } from "@cs2helper/community-core";
import type { PGlite } from "@cs2helper/auth";
import { CommunityCoreApplication, createCommunityDbFromPglite, createCommunityDb } from "@cs2helper/community-core";
import type { Pool } from "pg";

declare global {
  var __cs2h_community_sdk: CommunityCoreSdk | undefined;
}

export function wireCommunityCoreFromPglite(client: PGlite): void {
  const db = createCommunityDbFromPglite(client);
  globalThis.__cs2h_community_sdk = new CommunityCoreApplication(db);
}

export function wireCommunityCoreFromPool(pool: Pool): void {
  const db = createCommunityDb(pool);
  globalThis.__cs2h_community_sdk = new CommunityCoreApplication(db);
}

export function getCommunityCoreSdk(): CommunityCoreSdk {
  if (!globalThis.__cs2h_community_sdk) {
    throw new Error(
      "CommunityCore no inicializado: el servidor debe ejecutar `initAuthFromConfig` (incluye migraciones y cableado de community-core)."
    );
  }
  return globalThis.__cs2h_community_sdk;
}
