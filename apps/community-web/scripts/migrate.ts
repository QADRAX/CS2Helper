import "dotenv/config";
import { Pool } from "pg";
import path from "node:path";
import { createRequire } from "node:module";
import { PGlite, runAuthMigrations, runAuthMigrationsPglite } from "@cs2helper/auth";

function parseDriver(v: string | undefined): "postgres" | "pglite" {
  const t = v?.trim().toLowerCase();
  if (t === "pglite" || t === "file") return "pglite";
  return "postgres";
}

function authMigrationsDir(): string {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve("@cs2helper/auth/package.json")), "drizzle");
}

async function main() {
  const driver = parseDriver(process.env.CS2H_DATABASE_DRIVER);
  const migrationsFolder = authMigrationsDir();

  if (driver === "pglite") {
    const rel = process.env.CS2H_PGLITE_DATA_DIR?.trim() || ".data/pglite";
    const dataDir = path.resolve(process.cwd(), rel);
    const client = new PGlite(dataDir);
    await runAuthMigrationsPglite(client, migrationsFolder);
    console.log("Auth migrations applied (PGlite).");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is required when CS2H_DATABASE_DRIVER is postgres (default).");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await runAuthMigrations(pool, migrationsFolder);
    console.log("Auth migrations applied (PostgreSQL).");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
