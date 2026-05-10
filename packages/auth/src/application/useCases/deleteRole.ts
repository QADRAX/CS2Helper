import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const deleteRole: AsyncUseCase<[RbacRepositoryPort], [roleName: string], void> = async (
  [rbac],
  roleName
) => {
  await rbac.deleteRoleByName(roleName);
};
