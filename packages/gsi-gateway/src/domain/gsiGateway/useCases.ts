import type {
  CoreEngineEvent,
  CoreEngineState,
  CS2GameState,
} from "@cs2helper/gsi-processor";
import type { EventListener, StateListener } from "./contracts";
import type { UseCase } from "@cs2helper/shared";

/** Use case that ingests one raw CS2 GSI tick payload. */
export type IngestGsiTickUseCase = UseCase<[CS2GameState], void>;
/** Use case that retrieves the current aggregate engine state. */
export type GetStateUseCase = UseCase<[], Readonly<CoreEngineState>>;
/** Use case that subscribes to state changes. */
export type SubscribeStateUseCase = UseCase<[StateListener], () => void>;
/** Use case that subscribes to processor domain events. */
export type SubscribeEventsUseCase = UseCase<[EventListener], () => void>;

/** Use-case map composed by infrastructure into the public service API. */
export interface GsiGatewayUseCasesMap {
  ingestTick: IngestGsiTickUseCase;
  getState: GetStateUseCase;
  subscribeState: SubscribeStateUseCase;
  subscribeEvents: SubscribeEventsUseCase;
}

/** Minimal in-process API exposed by the gateway service. */
export interface GsiGatewayApi {
  getState: () => Readonly<CoreEngineState>;
  subscribeState: (listener: StateListener) => () => void;
  subscribeEvents: (listener: EventListener) => () => void;
}

/** Alias for the event stream type emitted by the wrapped processor. */
export type GsiGatewayEvent = CoreEngineEvent;
