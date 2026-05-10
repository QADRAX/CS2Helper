/**
 * Central env for community-web (home server / CasaOS style deploy).
 * Fail fast in production when critical vars are missing.
 */

import path from "node:path";

export type DatabaseDriver = "postgres" | "pglite";

function required(name: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) {
    const msg = `Missing required environment variable: ${name}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(msg);
    }
    console.warn(`[config] ${msg} (non-production: continuing with placeholder)`);
    return "";
  }
  return v;
}

export type AppConfig = {
  databaseDriver: DatabaseDriver;
  /** Connection string when `databaseDriver` is `postgres`. */
  databaseUrl: string;
  /**
   * Directory for PGlite persistence (Postgres en WASM, datos en disco).
   * Relativo a `process.cwd()` (normalmente la raíz de `apps/community-web`).
   */
  pgliteDataDir: string;
  jwtSecret: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  appUrl: string;
  siteName: string;
  trustProxy: boolean;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
  defaultRegistrationRoleName: string;
  requireInvitationForRegister: boolean;
  /** When true and env credentials set, creates first admin if none exists. */
  bootstrapRootEnabled: boolean;
  bootstrapRootEmail: string;
  bootstrapRootPassword: string;
  /** Dangerous: resets password for existing admin matching email. */
  bootstrapRootUpdatePassword: boolean;
  rateLimitLoginPerMinute: number;
  rateLimitAdminPerMinute: number;
};

function parseBool(v: string | undefined, defaultValue: boolean): boolean {
  if (v === undefined || v === "") return defaultValue;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

function parseIntEnv(v: string | undefined, fallback: number): number {
  if (!v?.trim()) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseDatabaseDriver(v: string | undefined): DatabaseDriver {
  const t = v?.trim().toLowerCase();
  if (t === "pglite" || t === "file") return "pglite";
  return "postgres";
}

export function loadConfig(): AppConfig {
  const databaseDriver = parseDatabaseDriver(process.env.CS2H_DATABASE_DRIVER);
  const pgliteRel = process.env.CS2H_PGLITE_DATA_DIR?.trim() || ".data/pglite";
  const pgliteDataDir = path.normalize(pgliteRel);

  const databaseUrl =
    databaseDriver === "postgres"
      ? required("DATABASE_URL", process.env.DATABASE_URL)
      : (process.env.DATABASE_URL?.trim() ?? "");

  return {
    databaseDriver,
    databaseUrl,
    pgliteDataDir,
    jwtSecret: required("JWT_SECRET", process.env.JWT_SECRET),
    jwtIssuer: process.env.JWT_ISSUER?.trim() || undefined,
    jwtAudience: process.env.JWT_AUDIENCE?.trim() || undefined,
    appUrl: (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, ""),
    siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "CS2 Community",
    trustProxy: parseBool(process.env.TRUST_PROXY, false),
    accessTokenTtlSec: parseIntEnv(process.env.CS2H_ACCESS_TOKEN_TTL_SEC, 900),
    refreshTokenTtlSec: parseIntEnv(process.env.CS2H_REFRESH_TOKEN_TTL_SEC, 60 * 60 * 24 * 14),
    defaultRegistrationRoleName:
      process.env.CS2H_DEFAULT_REGISTRATION_ROLE?.trim() || "member",
    requireInvitationForRegister: parseBool(
      process.env.CS2H_REQUIRE_INVITATION_FOR_REGISTER,
      false
    ),
    bootstrapRootEnabled: parseBool(process.env.CS2H_BOOTSTRAP_ROOT_ENABLED, false),
    bootstrapRootEmail: process.env.CS2H_BOOTSTRAP_ROOT_EMAIL?.trim() ?? "",
    bootstrapRootPassword: process.env.CS2H_BOOTSTRAP_ROOT_PASSWORD ?? "",
    bootstrapRootUpdatePassword: parseBool(
      process.env.CS2H_BOOTSTRAP_ROOT_UPDATE_PASSWORD,
      false
    ),
    rateLimitLoginPerMinute: parseIntEnv(process.env.CS2H_RATE_LIMIT_LOGIN_PER_MIN, 30),
    rateLimitAdminPerMinute: parseIntEnv(process.env.CS2H_RATE_LIMIT_ADMIN_PER_MIN, 120),
  };
}

/** True when APP_URL is missing in production (invalid deploy). */
export function assertProductionConfig(config: AppConfig): void {
  if (process.env.NODE_ENV !== "production") return;
  if (config.databaseDriver === "pglite") {
    throw new Error(
      "CS2H_DATABASE_DRIVER=pglite is only for desarrollo local; en producción usa postgres y DATABASE_URL."
    );
  }
  if (!config.appUrl) {
    throw new Error("APP_URL (or NEXT_PUBLIC_APP_URL) is required in production");
  }
  if (!config.databaseUrl || !config.jwtSecret) {
    throw new Error("DATABASE_URL and JWT_SECRET are required in production");
  }
}
