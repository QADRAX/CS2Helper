import {
  createGsiProcessor,
} from "@cs2helper/gsi-processor";
import {
  getState,
  ingestGsiTick,
  subscribeEvents,
  subscribeState,
  subscribeRawTicks,
} from "../../application/gsiGateway";
import {
  type CreateGsiGatewayServiceOptions,
  type GsiGatewayService,
  parseIncomingTick,
} from "../../domain/gsiGateway";
import { NodeHttpServerAdapter } from "./adapters/NodeHttpServerAdapter";
import { createDefaultHttpConfig } from "./adapters/createDefaultHttpConfig";

/**
 * Composes a gateway service using class-based infrastructure adapters.
 */
export function createGsiGatewayService(
  options: CreateGsiGatewayServiceOptions = {}
): GsiGatewayService {
  const config = createDefaultHttpConfig(options);
  const processor = createGsiProcessor({
    getTimestamp: options.getTimestamp,
  });

  const rawTickListeners = new Set<(raw: string) => void>();

  const httpServer = new NodeHttpServerAdapter({
    config,
    onGsiRequest: async (rawBody) => {
      const tick = parseIncomingTick(rawBody);
      ingestGsiTick(processor, rawTickListeners, tick, rawBody);
    },
  });

  return {
    getState: () => getState(processor),
    subscribeState: (listener) => subscribeState(processor, listener),
    subscribeEvents: (listener) => subscribeEvents(processor, listener),
    subscribeRawTicks: (listener) => subscribeRawTicks(rawTickListeners, listener),
    async start() {
      const address = await httpServer.start();
      return { port: address.port };
    },
    async stop() {
      await httpServer.stop();
    },
  };
}
