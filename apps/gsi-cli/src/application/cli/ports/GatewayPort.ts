import type { GsiProcessorState } from "@cs2helper/gsi-processor";

/** Address metadata returned once the gateway starts listening. */
export interface GatewayStartInfo {
  port: number;
}

/**
 * Application-layer abstraction for the GSI Gateway lifecycle.
 * Hides the concrete gateway implementation behind a port contract.
 */
export interface GatewayPort {
  /** Creates and starts a new gateway instance. */
  start: (options: { port?: number }) => Promise<GatewayStartInfo>;

  /** Stops the currently active gateway instance. */
  stop: () => Promise<void>;

  /** Whether a gateway is currently running. */
  isRunning: () => boolean;

  /** Returns the current processor state, or null if not running. */
  getState: () => Readonly<GsiProcessorState> | null;

  /** Subscribes to processor state changes. No-op unsubscribe if not running. */
  subscribeState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;

  /** Subscribes to raw tick payloads. Returns null if not running. */
  subscribeRawTicks: (listener: (raw: string) => void) => (() => void) | null;
}
