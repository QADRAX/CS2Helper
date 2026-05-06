import type { GsiGateway } from "@cs2helper/gsi-gateway";
import type { GatewayPort } from "../../../application/cli/ports";

export class InMemoryGatewayAdapter implements GatewayPort {
  private activeGateway: GsiGateway | null = null;

  getGateway(): GsiGateway | null {
    return this.activeGateway;
  }

  setGateway(gateway: GsiGateway | null): void {
    this.activeGateway = gateway;
  }

  subscribeRawTicks(listener: (raw: string) => void): (() => void) | null {
    return this.activeGateway ? this.activeGateway.subscribeRawTicks(listener) : null;
  }
}
