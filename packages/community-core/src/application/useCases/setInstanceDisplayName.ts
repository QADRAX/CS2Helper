import type { AsyncUseCase } from "@cs2helper/shared";
import { parseInstanceDisplayName } from "../../domain/instanceDisplayName";
import type { InstanceSettingsRepositoryPort } from "../ports/InstanceSettingsRepositoryPort";

/**
 * Ports tuple order: `[instanceSettings]`.
 */
export const setInstanceDisplayName: AsyncUseCase<
  [InstanceSettingsRepositoryPort],
  [name: string],
  void
> = async ([repo], name) => {
  const normalized = parseInstanceDisplayName(name);
  await repo.setDisplayName(normalized);
};
