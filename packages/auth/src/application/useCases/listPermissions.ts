import type { AsyncUseCase } from "@cs2helper/shared";
import type { Permission } from "../../domain";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const listPermissions: AsyncUseCase<[RbacRepositoryPort], [], Permission[]> = async (
  [rbac]
) => rbac.listPermissions();
