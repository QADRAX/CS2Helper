import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { SubscribeGatewayStateUseCase } from "../../../domain/cli/useCases.js";

export function createSubscribeGatewayStateUseCase(context: CliGatewayContext): SubscribeGatewayStateUseCase {
  return {
    execute: (listener) => {
      const gateway = context.gatewayManager.getGateway();
      if (!gateway) return () => {};
      return gateway.subscribeState(listener);
    },
  };
}
