import type {
  GsiProcessorEvent,
  GsiProcessorState,
  GSIProcessor,
} from "@cs2helper/gsi-processor";

/** Narrow port used by the gateway use cases to interact with the processor. */
export interface GsiProcessorPort {
  processTick: GSIProcessor["processTick"];
  getState: GSIProcessor["getState"];
  subscribeState: GSIProcessor["subscribeState"];
  subscribeEvents: GSIProcessor["subscribeEvents"];
}

/** Shared application context injected into gateway use-case factories. */
export interface GsiGatewayContext {
  processor: GsiProcessorPort;
  rawTickListeners: Set<(raw: string) => void>;
}

/** Listener signature for aggregate state updates. */
export type StateListener = (state: Readonly<GsiProcessorState>) => void;
/** Listener signature for domain events produced by the processor. */
export type EventListener = (event: GsiProcessorEvent) => void;
