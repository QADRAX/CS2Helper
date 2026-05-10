import { describe, expect, it, vi } from "vitest";
import { assertUserHasPermission } from "../useCases/assertUserHasPermission";
import type { RbacRepositoryPort } from "../ports";

describe("assertUserHasPermission", () => {
  it("resolves when permission is present", async () => {
    const rbac: RbacRepositoryPort = {
      getEffectivePermissionKeysForUser: vi.fn(async () => ["a", "b"]),
      getRoleNamesForUser: vi.fn(),
      assignRoleToUserByRoleName: vi.fn(),
      removeRoleFromUserByRoleName: vi.fn(),
      createRole: vi.fn(),
      deleteRoleByName: vi.fn(),
      createPermission: vi.fn(),
      assignPermissionToRoleByNames: vi.fn(),
      revokePermissionFromRoleByNames: vi.fn(),
      listRoles: vi.fn(),
      listPermissions: vi.fn(),
    };
    await expect(assertUserHasPermission([rbac], "u1", "b")).resolves.toBeUndefined();
  });

  it("throws when permission is missing", async () => {
    const rbac: RbacRepositoryPort = {
      getEffectivePermissionKeysForUser: vi.fn(async () => ["a"]),
      getRoleNamesForUser: vi.fn(),
      assignRoleToUserByRoleName: vi.fn(),
      removeRoleFromUserByRoleName: vi.fn(),
      createRole: vi.fn(),
      deleteRoleByName: vi.fn(),
      createPermission: vi.fn(),
      assignPermissionToRoleByNames: vi.fn(),
      revokePermissionFromRoleByNames: vi.fn(),
      listRoles: vi.fn(),
      listPermissions: vi.fn(),
    };
    await expect(assertUserHasPermission([rbac], "u1", "b")).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });
});
