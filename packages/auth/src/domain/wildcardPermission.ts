/**
 * When present in a user's effective permission keys (JWT `permissions` claim or DB),
 * grants every concrete permission check performed by this package.
 */
export const WILDCARD_PERMISSION_KEY = "*" as const;

/**
 * Returns whether `effectiveKeys` authorizes `requiredPermissionKey`.
 * A key equal to {@link WILDCARD_PERMISSION_KEY} satisfies any required permission.
 */
export function effectiveKeysGrantPermission(
  effectiveKeys: readonly string[],
  requiredPermissionKey: string
): boolean {
  if (effectiveKeys.includes(WILDCARD_PERMISSION_KEY)) {
    return true;
  }
  return effectiveKeys.includes(requiredPermissionKey);
}
