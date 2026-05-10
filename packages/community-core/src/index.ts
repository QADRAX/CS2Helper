/**
 * @packageDocumentation
 * Instance and community product data (PostgreSQL / PGlite), framework-agnostic.
 */

export * from "./domain";
export { CommunityCoreApplication } from "./infrastructure/CommunityCoreApplication";
export { createCommunityDb, createCommunityDbFromPglite, type CommunityDb } from "./infrastructure/db/createCommunityDb";
export { getCommunityMigrationsFolder } from "./infrastructure/db/communityMigrationsPath";
export { runCommunityMigrations } from "./infrastructure/db/runCommunityMigrations";
export { runCommunityMigrationsPglite } from "./infrastructure/db/runCommunityMigrationsPglite";
export { communitySchema } from "./infrastructure/db/schema";

export type { InstanceSettingsRepositoryPort } from "./application/ports/InstanceSettingsRepositoryPort";
