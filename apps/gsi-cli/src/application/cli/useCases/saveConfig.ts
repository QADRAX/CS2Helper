import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { CliConfig } from "../../../domain/cli/config";

export interface SaveConfigPorts {
  config: ConfigPort;
}

/**
 * Persists application configuration changes.
 */
export const saveConfig: AsyncUseCase<
  SaveConfigPorts,
  [configChanges: Partial<CliConfig>],
  CliConfig
> = async ({ config }, configChanges) => {
  const current = await config.getConfig();
  const next = { ...current, ...configChanges };
  await config.saveConfig(next);
  return next;
};
