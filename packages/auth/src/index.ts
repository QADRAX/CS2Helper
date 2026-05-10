/**
 * @packageDocumentation
 * PostgreSQL-backed authentication, JWT sessions, RBAC, and user profiles for CS2Helper apps.
 */

export { AuthService, type AuthServiceOptions } from "./infrastructure/AuthService";
export { createAuthDb, createAuthDbFromPglite, type AuthDb } from "./infrastructure/db/createAuthDb";
export { runAuthMigrations } from "./infrastructure/db/runAuthMigrations";
export { runAuthMigrationsPglite } from "./infrastructure/db/runAuthMigrationsPglite";
export { getAuthMigrationsFolder } from "./infrastructure/db/authMigrationsPath";
export { PGlite } from "@electric-sql/pglite";
export { authSchema } from "./infrastructure/db/schema";

export type { AuthApp } from "./application/AuthApp";

export * from "./domain";
