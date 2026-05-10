import type { AsyncUseCase } from "@cs2helper/shared";
import { AuthDomainError, effectiveKeysGrantPermission } from "../../domain";
import type { RbacRepositoryPort } from "../ports";

/**
 * Loads effective permissions from persistence (suitable for critical checks).
 *
 * Ports tuple order: `[rbac]`.
 */
export const assertUserHasPermission: AsyncUseCase<
  [RbacRepositoryPort],
  [userId: string, permissionKey: string],
  void
> = async ([rbac], userId, permissionKey) => {
  const keys = await rbac.getEffectivePermissionKeysForUser(userId);
  if (!effectiveKeysGrantPermission(keys, permissionKey)) {
    throw new AuthDomainError("PERMISSION_DENIED", "Missing required permission");
  }
};
