/** Cross-user profile read (or wildcard `*`). */
export const PROFILE_READ_ANY_PERMISSION = "users.profile.read_any" as const;

/** Cross-user profile update (or wildcard `*`). */
export const PROFILE_UPDATE_ANY_PERMISSION = "users.profile.update_any" as const;

/** RBAC administration via `AuthApp` admin methods (or wildcard `*`). */
export const AUTH_RBAC_MANAGE_PERMISSION = "auth.rbac.manage" as const;

/** Create or revoke user invitations (or wildcard `*`). */
export const AUTH_INVITATIONS_MANAGE_PERMISSION = "users.invitations.manage" as const;
