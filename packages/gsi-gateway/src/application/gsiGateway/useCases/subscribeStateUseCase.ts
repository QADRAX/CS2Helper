import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { SubscribeStateUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates the use case that subscribes listeners to processor state updates.
 */
export function createSubscribeStateUseCase(
  context: GsiGatewayContext
): SubscribeStateUseCase {
  return {
    execute(listener) {
      return context.processor.subscribeState(listener);
    },
  };
}
