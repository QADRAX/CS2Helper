import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const removeRoleFromUser: AsyncUseCase<
  [RbacRepositoryPort],
  [userId: string, roleName: string],
  void
> = async ([rbac], userId, roleName) => {
  await rbac.removeRoleFromUserByRoleName(userId, roleName);
};
