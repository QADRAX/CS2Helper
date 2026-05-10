import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const assignPermissionToRole: AsyncUseCase<
  [RbacRepositoryPort],
  [roleName: string, permissionKey: string],
  void
> = async ([rbac], roleName, permissionKey) => {
  await rbac.assignPermissionToRoleByNames(roleName, permissionKey);
};
