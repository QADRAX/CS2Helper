/**
 * Union of permission keys granted by any of the given roles.
 */
export function effectivePermissionKeys(
  rolePermissionSets: readonly (readonly string[])[]
): string[] {
  const set = new Set<string>();
  for (const keys of rolePermissionSets) {
    for (const k of keys) {
      set.add(k);
    }
  }
  return [...set].sort();
}
