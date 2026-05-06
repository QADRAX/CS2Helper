import type {
  GSIProcessor,
} from "@cs2helper/gsi-processor";
import { createGsiProcessor } from "@cs2helper/gsi-processor";
import {
  createGetStateUseCase,
  createIngestGsiTickUseCase,
  createSubscribeEventsUseCase,
  createSubscribeStateUseCase,
  createSubscribeRawTicksUseCase,
} from "../../application/gsiGateway";
import {
  type CreateGsiGatewayServiceOptions,
  type GsiGatewayService,
  parseIncomingTick,
} from "../../domain/gsiGateway";
import { createNodeHttpServer } from "./internal/createNodeHttpServer";
import { createDefaultHttpConfig } from "./internal/createDefaultHttpConfig";

/**
 * Composes a gateway service that:
 * - hosts a local HTTP endpoint for incoming CS2 GSI ticks
 * - delegates tick processing to `@cs2helper/gsi-processor`
 * - exposes in-process `getState` and subscription APIs
 */
export function createGsiGatewayService(
  options: CreateGsiGatewayServiceOptions = {}
): GsiGatewayService {
  const config = createDefaultHttpConfig(options);
  const processor: GSIProcessor = createGsiProcessor({
    getTimestamp: options.getTimestamp,
  });

  const useCaseContext: any = { 
    processor,
    rawTickListeners: new Set(),
  };
  const ingestTickUseCase = createIngestGsiTickUseCase(useCaseContext);
  const getStateUseCase = createGetStateUseCase(useCaseContext);
  const subscribeStateUseCase = createSubscribeStateUseCase(useCaseContext);
  const subscribeEventsUseCase = createSubscribeEventsUseCase(useCaseContext);
  const subscribeRawTicksUseCase = createSubscribeRawTicksUseCase(useCaseContext);

  const httpServer = createNodeHttpServer({
    config,
    onGsiRequest: async (rawBody) => {
      try {
        const tick = parseIncomingTick(rawBody);
        ingestTickUseCase.execute(tick, rawBody);
      } catch (err) {
        // Fallback for malformed but readable JSON if needed
        // For now, only ingest valid ticks
      }
    },
  });

  return {
    getState: getStateUseCase.execute,
    subscribeState: subscribeStateUseCase.execute,
    subscribeEvents: subscribeEventsUseCase.execute,
    subscribeRawTicks: subscribeRawTicksUseCase.execute,
    async start() {
      const address = await httpServer.start();
      return {
        port: address.port,
      };
    },
    async stop() {
      await httpServer.stop();
    },
  };
}
