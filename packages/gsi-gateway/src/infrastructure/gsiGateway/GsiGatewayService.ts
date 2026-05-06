import { GsiProcessorService } from "@cs2helper/gsi-processor";
import {
  getState,
  ingestGsiTick,
  subscribeEvents,
  subscribeRawTicks,
  subscribeState,
} from "../../application/gsiGateway";
import {
  type GsiGateway,
  type GsiGatewayOptions,
  parseIncomingTick,
} from "../../domain/gsiGateway";
import { InMemoryRawTicksAdapter } from "./adapters/InMemoryRawTicksAdapter";
import { NodeHttpServerAdapter } from "./adapters/NodeHttpServerAdapter";
import { createDefaultHttpConfig } from "./adapters/createDefaultHttpConfig";

/**
 * Service implementation that hosts an HTTP server to ingest CS2 GSI payloads.
 */
export class GsiGatewayService implements GsiGateway {
  private readonly processor: GsiProcessorService;
  private readonly httpServer: NodeHttpServerAdapter;
  private readonly rawTickHub = new InMemoryRawTicksAdapter();

  constructor(options: GsiGatewayOptions = {}) {
    const config = createDefaultHttpConfig(options);
    
    this.processor = new GsiProcessorService({
      getTimestamp: options.getTimestamp,
    });

    this.httpServer = new NodeHttpServerAdapter({
      config,
      onGsiRequest: async (rawBody) => {
        try {
          const tick = parseIncomingTick(rawBody);
          ingestGsiTick(
            { processor: this.processor, rawTickHub: this.rawTickHub },
            tick,
            rawBody
          );
        } catch (err) {
          throw err;
        }
      },
    });
  }

  async start() {
    const address = await this.httpServer.start();
    return { port: address.port };
  }

  async stop() {
    await this.httpServer.stop();
  }

  getState() {
    return getState({ processor: this.processor });
  }

  subscribeState(listener: (state: any) => void) {
    return subscribeState({ processor: this.processor }, listener);
  }

  subscribeEvents(listener: (event: any) => void) {
    return subscribeEvents({ processor: this.processor }, listener);
  }

  subscribeRawTicks(listener: (raw: string) => void) {
    return subscribeRawTicks({ rawTickHub: this.rawTickHub }, listener);
  }
}
