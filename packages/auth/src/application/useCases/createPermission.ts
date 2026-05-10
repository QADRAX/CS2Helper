import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const createPermission: AsyncUseCase<
  [RbacRepositoryPort],
  [key: string, description?: string | null],
  { id: string }
> = async ([rbac], key, description) => rbac.createPermission(key, description);
