import { GsiProcessorService } from "@cs2helper/gsi-processor";
import {
  getState,
  ingestGsiTick,
  subscribeEvents,
  subscribeRawTicks,
  subscribeState,
} from "../application";
import {
  type GsiGateway,
  type GsiGatewayDiagnostics,
  type GsiGatewayOptions,
  parseIncomingTick,
} from "../domain";
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
  private diagnostics: GsiGatewayDiagnostics = {
    receivedRequests: 0,
    rejectedRequests: 0,
  };

  constructor(options: GsiGatewayOptions = {}) {
    const config = createDefaultHttpConfig(options);

    this.processor = new GsiProcessorService({
      getTimestamp: options.getTimestamp,
    });

    this.httpServer = new NodeHttpServerAdapter({
      config,
      onGsiRequest: async (rawBody) => {
        this.diagnostics.receivedRequests += 1;
        try {
          const tick = parseIncomingTick(rawBody);
          ingestGsiTick([this.processor, this.rawTickHub], tick, rawBody);
        } catch (err) {
          this.diagnostics.rejectedRequests += 1;
          this.diagnostics.lastRejectReason =
            err instanceof Error ? err.message : "Unknown request error";
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
    return getState([this.processor]);
  }

  getDiagnostics() {
    return { ...this.diagnostics };
  }

  subscribeState(listener: (state: any) => void) {
    return subscribeState([this.processor], listener);
  }

  subscribeEvents(listener: (event: any) => void) {
    return subscribeEvents([this.processor], listener);
  }

  subscribeRawTicks(listener: (raw: string) => void) {
    return subscribeRawTicks([this.rawTickHub], listener);
  }
}
