import type { AuthService, PGlite } from "@cs2helper/auth";
import { Pool } from "pg";
import { loadConfig } from "../config";

declare global {
  var __cs2h_pg_pool: Pool | undefined;
  var __cs2h_pglite: PGlite | undefined;
  var __cs2h_auth: AuthService | undefined;
}

export function wireAuthInfrastructure(state: {
  auth: AuthService;
  pool?: Pool;
  pglite?: PGlite;
}): void {
  globalThis.__cs2h_auth = state.auth;
  if (state.pool) {
    globalThis.__cs2h_pg_pool = state.pool;
  }
  if (state.pglite) {
    globalThis.__cs2h_pglite = state.pglite;
  }
}

export function getAuthPool(): Pool {
  if (!globalThis.__cs2h_pg_pool) {
    const c = loadConfig();
    if (c.databaseDriver !== "postgres") {
      throw new Error("getAuthPool() solo aplica con CS2H_DATABASE_DRIVER=postgres");
    }
    const url = c.databaseUrl || "postgresql://127.0.0.1:5432/postgres";
    globalThis.__cs2h_pg_pool = new Pool({ connectionString: url });
  }
  return globalThis.__cs2h_pg_pool;
}

export function getAuthService(): AuthService {
  if (!globalThis.__cs2h_auth) {
    throw new Error(
      "AuthService no inicializado: en runtime el servidor debe cargar `instrumentation.ts`, que llama a `initAuthFromConfig()` (ver `lib/auth/init-runtime.ts`)."
    );
  }
  return globalThis.__cs2h_auth;
}
