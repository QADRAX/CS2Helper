import type { NormalizedSnapshot } from "../../csgo";
import type { GsiProcessorEvent, GsiProcessorMemory, GsiProcessorState } from "../gsiProcessorTypes";
/**
 * Mutable reducer bag shared across all domain reducer slices for a single tick.
 *
 * Reducers are expected to mutate `state`, `memory` and `events` in place.
 * The surrounding orchestrator owns cloning and decides whether critical reducers
 * are allowed to run for the current stream-health window.
 */
export interface ReducerContext {
    /** Next aggregate state being built for the current tick. */
    state: GsiProcessorState;
    /** Next rolling memory snapshot used for delta-based inference. */
    memory: GsiProcessorMemory;
    /** Canonical watcher snapshot produced by payload normalization. */
    snapshot: NormalizedSnapshot;
    /** Event-time attached to all mutations emitted from this tick. */
    timestamp: number;
    /** Event sink populated by reducers in processing order. */
    events: GsiProcessorEvent[];
    /** Guard for reducers that infer sensitive/retroactive events. */
    criticalReducersEnabled: boolean;
    /** Optional explanation recorded when a reducer intentionally skips work. */
    skipReason?: "stream_not_healthy";
}
