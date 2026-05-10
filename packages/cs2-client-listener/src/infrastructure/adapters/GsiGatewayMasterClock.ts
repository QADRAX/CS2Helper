import type { GsiGateway } from "@cs2helper/gsi-gateway";
import type { MasterClockPort, MasterTickSignal } from "@cs2helper/tick-hub";

/**
 * One {@link MasterTickSignal} per GSI POST (`data.state` / `data.raw` after ingest).
 */
export class GsiGatewayMasterClock implements MasterClockPort {
  constructor(private readonly gateway: GsiGateway) {}

  subscribe(listener: (signal: MasterTickSignal) => void): () => void {
    return this.gateway.subscribeRawTicks((raw) => {
      listener({
        data: {
          state: this.gateway.getState(),
          raw,
          gatewayDiagnostics: this.gateway.getDiagnostics(),
        },
      });
    });
  }
}
