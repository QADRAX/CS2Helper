/**
 * @packageDocumentation
 * PostgreSQL-backed authentication, JWT sessions, RBAC, and user profiles for CS2Helper apps.
 */

export { AuthService, type AuthServiceOptions } from "./infrastructure/AuthService";
export { createAuthDb, type AuthDb } from "./infrastructure/db/createAuthDb";
export { runAuthMigrations } from "./infrastructure/db/runAuthMigrations";
export { authSchema } from "./infrastructure/db/schema";

export type { AuthApp } from "./application/AuthApp";
export { AUTH_RBAC_MANAGE_PERMISSION } from "./application/AuthApp";

export type { RegisterUserInput } from "./application/useCases/registerUser";
export { PROFILE_READ_ANY_PERMISSION } from "./application/useCases/getUserProfile";
export { PROFILE_UPDATE_ANY_PERMISSION } from "./application/useCases/updateUserProfile";

export * from "./domain";
