import type { GsiProcessorStatePort, GsiProcessorState } from "../../../domain/gsiProcessor";
/**
 * Creates an in-memory state store for aggregate processor state.
 *
 * Stored snapshots are frozen on write so consumers cannot accidentally mutate
 * the shared state object outside the reducer pipeline.
 */
export declare function createInMemoryGsiProcessorStateStore(initialState: GsiProcessorState): GsiProcessorStatePort;
