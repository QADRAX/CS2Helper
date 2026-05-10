import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/**
 * Ports tuple order: `[rbac]`.
 */
export const getEffectivePermissions: AsyncUseCase<
  [RbacRepositoryPort],
  [userId: string],
  string[]
> = async ([rbac], userId) => rbac.getEffectivePermissionKeysForUser(userId);
