import type { GsiProcessorEvent, GsiProcessorState } from "@cs2helper/gsi-processor";

/** Optional runtime overrides for the gateway. */
export interface GsiGatewayOptions {
  port?: number;
  getTimestamp?: () => number;
}

/** Address metadata returned once the HTTP server starts listening. */
export interface GsiGatewayStartInfo {
  port: number;
}

/** Public service API contract for the GSI Gateway. */
export interface GsiGateway {
  start: () => Promise<GsiGatewayStartInfo>;
  stop: () => Promise<void>;
  getState: () => Readonly<GsiProcessorState>;
  subscribeState: (
    listener: (state: Readonly<GsiProcessorState>) => void
  ) => () => void;
  subscribeEvents: (listener: (event: GsiProcessorEvent) => void) => () => void;
  subscribeRawTicks: (listener: (raw: string) => void) => () => void;
}
