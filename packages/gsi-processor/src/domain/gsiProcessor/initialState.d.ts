import type { GsiProcessorMemory, GsiProcessorState } from "./gsiProcessorTypes";
/** Builds the default state for a fresh processor instance. */
export declare function createInitialGsiProcessorState(): GsiProcessorState;
/** Builds the default rolling memory for a fresh processor instance. */
export declare function createInitialGsiProcessorMemory(): GsiProcessorMemory;
