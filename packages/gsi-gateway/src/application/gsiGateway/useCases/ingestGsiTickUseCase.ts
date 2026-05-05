import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { IngestGsiTickUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates the use case that forwards raw GSI ticks to the wrapped processor.
 */
export function createIngestGsiTickUseCase(
  context: GsiGatewayContext
): IngestGsiTickUseCase {
  return {
    execute(gameState) {
      context.processor.processTick(gameState);
    },
  };
}
