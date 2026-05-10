import type { AsyncUseCase } from "@cs2helper/shared";
import { DEFAULT_INSTANCE_DISPLAY_NAME } from "../../domain/instanceDisplayName";
import type { InstanceSettingsRepositoryPort } from "../ports/InstanceSettingsRepositoryPort";

/**
 * Ports tuple order: `[instanceSettings]`.
 */
export const getInstanceDisplayName: AsyncUseCase<
  [InstanceSettingsRepositoryPort],
  [],
  string
> = async ([repo]) => {
  const name = await repo.getDisplayName();
  return name.trim() || DEFAULT_INSTANCE_DISPLAY_NAME;
};
