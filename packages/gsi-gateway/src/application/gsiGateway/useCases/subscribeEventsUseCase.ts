import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { SubscribeEventsUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates the use case that subscribes listeners to processor event emissions.
 */
export function createSubscribeEventsUseCase(
  context: GsiGatewayContext
): SubscribeEventsUseCase {
  return {
    execute(listener) {
      return context.processor.subscribeEvents(listener);
    },
  };
}
