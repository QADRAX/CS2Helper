import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { CliConfig } from "../../domain/cli/config";

/**
 * Persists application configuration changes.
 *
 * Ports tuple order: `[config]`.
 */
export const saveConfig: AsyncUseCase<
  [ConfigPort],
  [configChanges: Partial<CliConfig>],
  CliConfig
> = async ([config], configChanges) => {
  const current = await config.getConfig();
  const next = { ...current, ...configChanges };
  await config.saveConfig(next);
  return next;
};
