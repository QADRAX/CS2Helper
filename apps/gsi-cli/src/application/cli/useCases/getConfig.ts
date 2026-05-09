import type { AsyncUseCase } from "@cs2helper/shared";
import type { ConfigPort } from "../ports/ConfigPort";
import type { CliConfig } from "../../../domain/cli/config";

/**
 * Loads the current application configuration.
 *
 * Ports tuple order: `[config]`.
 */
export const getConfig: AsyncUseCase<[ConfigPort], [], CliConfig> = async ([config]) => {
  return config.getConfig();
};
