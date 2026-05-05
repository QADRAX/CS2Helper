import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { GetStateUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates the use case that exposes the latest processor aggregate state.
 */
export function createGetStateUseCase(
  context: GsiGatewayContext
): GetStateUseCase {
  return {
    execute() {
      return context.processor.getState();
    },
  };
}
