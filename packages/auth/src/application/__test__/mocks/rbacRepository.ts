import { vi } from "vitest";
import type { RbacRepositoryPort } from "../../ports";

export function createRbacRepositoryFake(
  overrides: Partial<RbacRepositoryPort> = {}
): RbacRepositoryPort {
  return {
    getEffectivePermissionKeysForUser: vi.fn(async () => []),
    getRoleNamesForUser: vi.fn(async () => []),
    assignRoleToUserByRoleName: vi.fn(async () => {}),
    removeRoleFromUserByRoleName: vi.fn(async () => {}),
    createRole: vi.fn(async () => ({ id: "role-1" })),
    deleteRoleByName: vi.fn(async () => {}),
    createPermission: vi.fn(async () => ({ id: "perm-1" })),
    assignPermissionToRoleByNames: vi.fn(async () => {}),
    revokePermissionFromRoleByNames: vi.fn(async () => {}),
    listRoles: vi.fn(async () => []),
    listPermissions: vi.fn(async () => []),
    existsUserWithRole: vi.fn(async () => false),
    ...overrides,
  };
}
