import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { CliConfig } from "../../../domain/cli/config";

export interface GetConfigPorts {
  config: ConfigPort;
}

/**
 * Loads the current application configuration.
 */
export const getConfig: AsyncUseCase<GetConfigPorts, [], CliConfig> = async ({
  config,
}) => {
  return config.getConfig();
};
