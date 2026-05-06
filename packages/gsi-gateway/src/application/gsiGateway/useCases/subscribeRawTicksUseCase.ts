import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { SubscribeRawTicksUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates a use case that allows subscribing to raw GSI JSON payloads.
 */
export function createSubscribeRawTicksUseCase(
  context: GsiGatewayContext
): SubscribeRawTicksUseCase {
  return {
    execute(listener) {
      context.rawTickListeners.add(listener);
      return () => {
        context.rawTickListeners.delete(listener);
      };
    },
  };
}
