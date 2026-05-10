import path from "node:path";
import { createRequire } from "node:module";
import { Pool } from "pg";
import {
  AuthService,
  PGlite,
  runAuthMigrationsPglite,
  type AuthServiceOptions,
} from "@cs2helper/auth";
import type { AppConfig } from "../config";
import { wireAuthInfrastructure } from "./service";

declare global {
  var __cs2h_auth_init_promise: Promise<void> | undefined;
}

function authMigrationsDir(): string {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve("@cs2helper/auth/package.json")), "drizzle");
}

function buildAuthOptions(c: AppConfig): AuthServiceOptions {
  return {
    jwtSecret: c.jwtSecret || "development-only-change-me",
    jwtIssuer: c.jwtIssuer,
    jwtAudience: c.jwtAudience,
    accessTokenTtlSec: c.accessTokenTtlSec,
    refreshTokenTtlSec: c.refreshTokenTtlSec,
    defaultRegistrationRoleName: c.defaultRegistrationRoleName,
    requireInvitationForRegister: c.requireInvitationForRegister,
  };
}

async function doInitAuth(config: AppConfig): Promise<void> {
  const opts = buildAuthOptions(config);
  if (config.databaseDriver === "pglite") {
    const dataDir = path.resolve(process.cwd(), config.pgliteDataDir);
    const client = new PGlite(dataDir);
    await runAuthMigrationsPglite(client, authMigrationsDir());
    wireAuthInfrastructure({ auth: new AuthService(client, opts), pglite: client });
  } else {
    const url = config.databaseUrl || "postgresql://127.0.0.1:5432/postgres";
    const pool = new Pool({ connectionString: url });
    wireAuthInfrastructure({ auth: new AuthService(pool, opts), pool });
  }
}

/**
 * Crea pool/PGlite, aplica migraciones (PGlite) y construye `AuthService`.
 * Debe ejecutarse en el arranque del servidor (p. ej. `instrumentation.ts`).
 */
export async function initAuthFromConfig(config: AppConfig): Promise<void> {
  if (globalThis.__cs2h_auth) return;
  globalThis.__cs2h_auth_init_promise ??= doInitAuth(config);
  try {
    await globalThis.__cs2h_auth_init_promise;
  } finally {
    globalThis.__cs2h_auth_init_promise = undefined;
  }
}
