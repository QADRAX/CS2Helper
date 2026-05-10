import type { Permission, Role } from "../../domain";

export interface RbacRepositoryPort {
  getEffectivePermissionKeysForUser(userId: string): Promise<string[]>;
  getRoleNamesForUser(userId: string): Promise<string[]>;
  assignRoleToUserByRoleName(userId: string, roleName: string): Promise<void>;
  removeRoleFromUserByRoleName(userId: string, roleName: string): Promise<void>;
  createRole(name: string, description?: string | null): Promise<{ id: string }>;
  deleteRoleByName(name: string): Promise<void>;
  createPermission(key: string, description?: string | null): Promise<{ id: string }>;
  assignPermissionToRoleByNames(roleName: string, permissionKey: string): Promise<void>;
  revokePermissionFromRoleByNames(roleName: string, permissionKey: string): Promise<void>;
  listRoles(): Promise<Role[]>;
  listPermissions(): Promise<Permission[]>;
}
