import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { GetGatewayStateUseCase } from "../../../domain/cli/useCases.js";

export function createGetGatewayStateUseCase(context: CliGatewayContext): GetGatewayStateUseCase {
  return {
    execute: () => {
      const gateway = context.gatewayManager.getGateway();
      return gateway ? gateway.getState() : null;
    },
  };
}
