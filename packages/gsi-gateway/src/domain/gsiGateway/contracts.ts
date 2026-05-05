import type {
  CoreEngineEvent,
  CoreEngineState,
  MatchEngineAPI,
} from "@cs2helper/gsi-processor";

/** Narrow port used by the gateway use cases to interact with the processor. */
export interface GsiProcessorPort {
  processTick: MatchEngineAPI["processTick"];
  getState: MatchEngineAPI["getState"];
  subscribeState: MatchEngineAPI["subscribeState"];
  subscribeEvents: MatchEngineAPI["subscribeEvents"];
}

/** Shared application context injected into gateway use-case factories. */
export interface GsiGatewayContext {
  processor: GsiProcessorPort;
}

/** Listener signature for aggregate state updates. */
export type StateListener = (state: Readonly<CoreEngineState>) => void;
/** Listener signature for domain events produced by the processor. */
export type EventListener = (event: CoreEngineEvent) => void;
