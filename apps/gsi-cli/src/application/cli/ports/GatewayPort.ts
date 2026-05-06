import type { GsiGatewayService } from "@cs2helper/gsi-gateway";

export interface GatewayPort {
  getGateway: () => GsiGatewayService | null;
  setGateway: (gateway: GsiGatewayService | null) => void;
  subscribeRawTicks: (listener: (raw: string) => void) => (() => void) | null;
}
