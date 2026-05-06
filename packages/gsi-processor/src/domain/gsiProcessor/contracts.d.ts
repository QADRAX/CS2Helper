import type { GsiProcessorEvent, GsiProcessorMemory, GsiProcessorState } from "./gsiProcessorTypes";
/** State persistence port used by application use cases. */
export interface GsiProcessorStatePort {
    getState: () => Readonly<GsiProcessorState>;
    setState: (state: GsiProcessorState) => void;
    subscribeState: (listener: (state: Readonly<GsiProcessorState>) => void) => () => void;
}
/** Memory persistence port used for rolling delta context. */
export interface GsiProcessorMemoryPort {
    getMemory: () => Readonly<GsiProcessorMemory>;
    setMemory: (memory: GsiProcessorMemory) => void;
}
/** Event publication/subscription port. */
export interface GsiProcessorEventsPort {
    publish: (event: GsiProcessorEvent) => void;
    subscribe: (listener: (event: GsiProcessorEvent) => void) => () => void;
}
/** Clock abstraction to inject deterministic timestamps in tests. */
export interface GsiProcessorClockPort {
    now: () => number;
}
