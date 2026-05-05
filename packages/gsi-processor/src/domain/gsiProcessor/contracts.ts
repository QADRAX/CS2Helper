import type { CoreEngineEvent, CoreEngineMemory, CoreEngineState } from "./gsiProcessorTypes";

/** State persistence port used by application use cases. */
export interface CoreEngineStatePort {
  getState: () => Readonly<CoreEngineState>;
  setState: (state: CoreEngineState) => void;
  subscribeState: (listener: (state: Readonly<CoreEngineState>) => void) => () => void;
}

/** Memory persistence port used for rolling delta context. */
export interface CoreEngineMemoryPort {
  getMemory: () => Readonly<CoreEngineMemory>;
  setMemory: (memory: CoreEngineMemory) => void;
}

/** Event publication/subscription port. */
export interface CoreEngineEventsPort {
  publish: (event: CoreEngineEvent) => void;
  subscribe: (listener: (event: CoreEngineEvent) => void) => () => void;
}

/** Clock abstraction to inject deterministic timestamps in tests. */
export interface CoreEngineClockPort {
  now: () => number;
}
