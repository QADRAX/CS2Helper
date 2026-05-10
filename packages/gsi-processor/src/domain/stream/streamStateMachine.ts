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
export function transitionStreamState(input: StreamTransitionInput): StreamTransitionOutput {
  const { current, quality, recoveryWindow, consecutiveValidSnapshots, consecutivePartialSnapshots } =
    input;

  if (quality === "invalid" || quality === "stale") {
    return {
      next: "degraded",
      startedGap: current !== "gap" && current !== "degraded",
      endedGap: false,
      recovered: false,
      rejected: true,
    };
  }

  if (quality === "partial") {
    return {
      next: consecutivePartialSnapshots >= recoveryWindow ? "degraded" : "gap",
      startedGap: current === "healthy" || current === "cold_start",
      endedGap: false,
      recovered: false,
      rejected: false,
    };
  }

  // A complete snapshot during cold start still needs to satisfy the recovery
  // window before the processor is considered fully healthy.
  if (current === "cold_start") {
    return {
      next: consecutiveValidSnapshots >= recoveryWindow ? "healthy" : "recovering",
      startedGap: false,
      endedGap: false,
      recovered: consecutiveValidSnapshots >= recoveryWindow,
      rejected: false,
    };
  }

  // After a gap/degraded period, complete snapshots first pass through
  // `recovering` until the valid streak is long enough to mark recovery.
  if (current === "gap" || current === "degraded" || current === "recovering") {
    const recovered = consecutiveValidSnapshots >= recoveryWindow;
    return {
      next: recovered ? "healthy" : "recovering",
      startedGap: false,
      endedGap: recovered,
      recovered,
      rejected: false,
    };
  }

  return {
    next: "healthy",
    startedGap: false,
    endedGap: false,
    recovered: false,
    rejected: false,
  };
}
