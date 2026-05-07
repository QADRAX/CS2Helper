import { GsiGatewayService } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type {
  GatewayDiagnostics,
  GatewayPort,
  GatewayStartInfo,
} from "../../../application/cli/ports/GatewayPort";

interface ActiveGateway {
  start: () => Promise<GatewayStartInfo>;
  stop: () => Promise<void>;
  getState: () => Readonly<GsiProcessorState>;
  subscribeState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
  subscribeRawTicks: (listener: (raw: string) => void) => () => void;
  getDiagnostics?: () => GatewayDiagnostics;
}

/**
 * Infrastructure adapter that manages the GsiGatewayService lifecycle.
 * This is the only place in the CLI app that imports the concrete gateway class.
 */
export class InMemoryGatewayAdapter implements GatewayPort {
  private activeGateway: ActiveGateway | null = null;

  async start(options: { port?: number }): Promise<GatewayStartInfo> {
    this.activeGateway = new GsiGatewayService({
      port: options.port,
    });

    const info = await this.activeGateway.start();
    return info;
  }

  async stop(): Promise<void> {
    if (this.activeGateway) {
      await this.activeGateway.stop();
      this.activeGateway = null;
    }
  }

  isRunning(): boolean {
    return this.activeGateway !== null;
  }

  getState(): Readonly<GsiProcessorState> | null {
    return this.activeGateway ? this.activeGateway.getState() : null;
  }

  getDiagnostics(): Readonly<GatewayDiagnostics> {
    if (!this.activeGateway) {
      return { receivedRequests: 0, rejectedRequests: 0 };
    }
    return this.activeGateway.getDiagnostics?.() ?? { receivedRequests: 0, rejectedRequests: 0 };
  }

  subscribeState(listener: (state: Readonly<GsiProcessorState>) => void): () => void {
    if (this.activeGateway) {
      return this.activeGateway.subscribeState(listener);
    }
    return () => {};
  }

  subscribeRawTicks(listener: (raw: string) => void): (() => void) | null {
    return this.activeGateway ? this.activeGateway.subscribeRawTicks(listener) : null;
  }
}
