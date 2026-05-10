import type { AsyncUseCase } from "@cs2helper/shared";
import type { Role } from "../../domain";
import type { RbacRepositoryPort } from "../ports";

/** Ports tuple order: `[rbac]`. */
export const listRoles: AsyncUseCase<[RbacRepositoryPort], [], Role[]> = async ([rbac]) =>
  rbac.listRoles();
