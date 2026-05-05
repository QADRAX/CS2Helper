import type { GsiProcessorEvent, GsiProcessorState } from "@cs2helper/gsi-processor";

/** Optional runtime overrides for the gateway composition root. */
export interface CreateGsiGatewayServiceOptions {
  host?: string;
  port?: number;
  gsiPath?: string;
  maxBodyBytes?: number;
  getTimestamp?: () => number;
}

/** Address metadata returned once the HTTP server starts listening. */
export interface GsiGatewayStartInfo {
  host: string;
  port: number;
  gsiPath: string;
}

/** Public service API exposed by `createGsiGatewayService()`. */
export interface GsiGatewayService {
  start: () => Promise<GsiGatewayStartInfo>;
  stop: () => Promise<void>;
  getState: () => Readonly<GsiProcessorState>;
  subscribeState: (
    listener: (state: Readonly<GsiProcessorState>) => void
  ) => () => void;
  subscribeEvents: (listener: (event: GsiProcessorEvent) => void) => () => void;
}
