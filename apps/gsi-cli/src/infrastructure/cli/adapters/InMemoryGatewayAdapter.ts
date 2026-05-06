import { GsiGatewayService } from "@cs2helper/gsi-gateway";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GatewayPort, GatewayStartInfo } from "../../../application/cli/ports/GatewayPort";

/**
 * Infrastructure adapter that manages the GsiGatewayService lifecycle.
 * This is the only place in the CLI app that imports the concrete gateway class.
 */
export class InMemoryGatewayAdapter implements GatewayPort {
  private activeGateway: GsiGatewayService | null = null;

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
