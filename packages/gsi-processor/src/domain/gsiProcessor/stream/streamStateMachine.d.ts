import type { SnapshotQuality } from "./snapshotQuality";
import type { StreamState } from "./streamState.types";
/**
 * Inputs required to compute the next stream-health transition.
 */
export interface StreamTransitionInput {
    /** Current operational state before applying the new snapshot. */
    current: StreamState;
    /** Quality classification for the incoming snapshot. */
    quality: SnapshotQuality;
    /** Number of consecutive valid/partial snapshots required to transition. */
    recoveryWindow: number;
    /** Current streak of complete snapshots. */
    consecutiveValidSnapshots: number;
    /** Current streak of partial snapshots. */
    consecutivePartialSnapshots: number;
}
/**
 * Transition decision emitted by the stream state machine.
 *
 * The boolean flags allow the orchestrator to emit operational events without
 * encoding event logic directly into the state machine.
 */
export interface StreamTransitionOutput {
    /** Next operational state after applying the snapshot. */
    next: StreamState;
    /** Whether the processor just entered a gap/degraded zone. */
    startedGap: boolean;
    /** Whether the processor just exited a gap/degraded zone. */
    endedGap: boolean;
    /** Whether the processor has fully recovered to healthy. */
    recovered: boolean;
    /** Whether the snapshot should count as rejected. */
    rejected: boolean;
}
/**
 * Computes the next stream state from snapshot quality and recent quality streaks.
 *
 * High-level behavior:
 * - `invalid` / `stale` snapshots immediately degrade the stream
 * - `partial` snapshots move the stream into `gap` and eventually `degraded`
 * - `complete` snapshots move the stream toward `healthy`, honoring the
 *   configured recovery window after gaps/cold start
 */
export declare function transitionStreamState(input: StreamTransitionInput): StreamTransitionOutput;
