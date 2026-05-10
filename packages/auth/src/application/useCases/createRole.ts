import type { AsyncUseCase } from "@cs2helper/shared";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const createRole: AsyncUseCase<
  [RbacRepositoryPort],
  [name: string, description?: string | null],
  { id: string }
> = async ([rbac], name, description) => rbac.createRole(name, description);
