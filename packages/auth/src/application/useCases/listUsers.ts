import type { AsyncUseCase } from "@cs2helper/shared";
import type { User } from "../../domain";
import type { UserRepositoryPort } from "../ports";

/** Ports tuple order: `[users]`. */
export const listUsers: AsyncUseCase<[UserRepositoryPort], [], User[]> = async ([users]) =>
  users.listUsers();
