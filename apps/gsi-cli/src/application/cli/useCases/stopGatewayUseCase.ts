import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { StopGatewayUseCase } from "../../../domain/cli/useCases.js";

export function createStopGatewayUseCase(context: CliGatewayContext): StopGatewayUseCase {
  return {
    execute: async () => {
      const gateway = context.gatewayManager.getGateway();
      if (gateway) {
        await gateway.stop();
        context.gatewayManager.setGateway(null);
      }
    },
  };
}
