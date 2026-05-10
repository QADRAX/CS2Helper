import { and, eq } from "drizzle-orm";
import type { Permission, Role } from "../../domain";
import { AuthDomainError } from "../../domain";
import type { RbacRepositoryPort } from "../../application/ports";
import type { AuthDb } from "../db/createAuthDb";
import { permissions, rolePermissions, roles, userRoles } from "../db/schema";

export class DrizzleRbacRepository implements RbacRepositoryPort {
  constructor(private readonly db: AuthDb) {}

  async getEffectivePermissionKeysForUser(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ key: permissions.key })
      .from(permissions)
      .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
      .innerJoin(roles, eq(roles.id, rolePermissions.roleId))
      .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => r.key).sort();
  }

  async getRoleNamesForUser(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ name: roles.name })
      .from(roles)
      .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => r.name).sort();
  }

  async assignRoleToUserByRoleName(userId: string, roleName: string): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new AuthDomainError("ROLE_NOT_FOUND", `Role not found: ${roleName}`);
    }
    await this.db
      .insert(userRoles)
      .values({ userId, roleId: role.id })
      .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] });
  }

  async removeRoleFromUserByRoleName(userId: string, roleName: string): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new AuthDomainError("ROLE_NOT_FOUND", `Role not found: ${roleName}`);
    }
    await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)));
  }

  async createRole(name: string, description?: string | null): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(roles)
      .values({ name, description: description ?? null })
      .returning();
    if (!row) {
      throw new Error("Failed to create role");
    }
    return { id: row.id };
  }

  async deleteRoleByName(name: string): Promise<void> {
    const role = await this.findRoleByName(name);
    if (!role) {
      throw new AuthDomainError("ROLE_NOT_FOUND", `Role not found: ${name}`);
    }
    await this.db.delete(roles).where(eq(roles.id, role.id));
  }

  async createPermission(key: string, description?: string | null): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(permissions)
      .values({ key, description: description ?? null })
      .returning();
    if (!row) {
      throw new Error("Failed to create permission");
    }
    return { id: row.id };
  }

  async assignPermissionToRoleByNames(
    roleName: string,
    permissionKey: string
  ): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new AuthDomainError("ROLE_NOT_FOUND", `Role not found: ${roleName}`);
    }
    const permission = await this.findPermissionByKey(permissionKey);
    if (!permission) {
      throw new AuthDomainError("PERMISSION_NOT_FOUND", `Permission not found: ${permissionKey}`);
    }
    await this.db
      .insert(rolePermissions)
      .values({ roleId: role.id, permissionId: permission.id })
      .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionId] });
  }

  async revokePermissionFromRoleByNames(
    roleName: string,
    permissionKey: string
  ): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new AuthDomainError("ROLE_NOT_FOUND", `Role not found: ${roleName}`);
    }
    const permission = await this.findPermissionByKey(permissionKey);
    if (!permission) {
      throw new AuthDomainError("PERMISSION_NOT_FOUND", `Permission not found: ${permissionKey}`);
    }
    await this.db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, role.id),
          eq(rolePermissions.permissionId, permission.id)
        )
      );
  }

  async listRoles(): Promise<Role[]> {
    const rows = await this.db.select().from(roles);
    return rows
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        createdAt: r.createdAt,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async listPermissions(): Promise<Permission[]> {
    const rows = await this.db.select().from(permissions);
    return rows
      .map((p) => ({
        id: p.id,
        key: p.key,
        description: p.description,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async existsUserWithRole(roleName: string): Promise<boolean> {
    const rows = await this.db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(roles.name, roleName))
      .limit(1);
    return rows.length > 0;
  }

  private async findRoleByName(name: string): Promise<{ id: string } | null> {
    const [row] = await this.db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);
    return row ?? null;
  }

  private async findPermissionByKey(key: string): Promise<{ id: string } | null> {
    const [row] = await this.db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.key, key))
      .limit(1);
    return row ?? null;
  }
}
