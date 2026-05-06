import type { GsiGateway } from "@cs2helper/gsi-gateway";

export interface GatewayPort {
  getGateway: () => GsiGateway | null;
  setGateway: (gateway: GsiGateway | null) => void;
  subscribeRawTicks: (listener: (raw: string) => void) => (() => void) | null;
}
