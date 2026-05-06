import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { GetConfigUseCase } from "../../../domain/cli/useCases.js";

export function createGetConfigUseCase(context: CliGatewayContext): GetConfigUseCase {
  return {
    execute: async () => {
      return await context.configStore.getConfig();
    },
  };
}
