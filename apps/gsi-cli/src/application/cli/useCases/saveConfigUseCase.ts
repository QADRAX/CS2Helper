import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { SaveConfigUseCase } from "../../../domain/cli/useCases.js";

export function createSaveConfigUseCase(context: CliGatewayContext): SaveConfigUseCase {
  return {
    execute: async (partialConfig) => {
      const currentConfig = await context.configStore.getConfig();
      const newConfig = { ...currentConfig, ...partialConfig };
      await context.configStore.saveConfig(newConfig);
      return newConfig;
    },
  };
}
