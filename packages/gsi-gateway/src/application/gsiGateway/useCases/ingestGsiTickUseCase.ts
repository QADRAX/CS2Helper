import type { GsiGatewayContext } from "../../../domain/gsiGateway/contracts";
import type { IngestGsiTickUseCase } from "../../../domain/gsiGateway/useCases";

/**
 * Creates the use case that forwards raw GSI ticks to the wrapped processor.
 */
export function createIngestGsiTickUseCase(
  context: GsiGatewayContext
): IngestGsiTickUseCase {
  return {
    execute(gameState, rawBody) {
      // 1. Process for domain state
      context.processor.processTick(gameState);

      // 2. Notify raw listeners (for recording/debugging)
      for (const listener of context.rawTickListeners) {
        listener(rawBody);
      }
    },
  };
}
