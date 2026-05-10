/**
 * Operational health state of the incoming watcher stream.
 *
 * - `cold_start`: no reliable snapshot has been accepted yet
 * - `healthy`: snapshots are complete enough to drive critical reducers
 * - `gap`: transient period with missing / partial data
 * - `recovering`: valid snapshots are returning but recovery window is not yet satisfied
 * - `degraded`: stream quality is currently too poor for reliable inference
 */
export type StreamState =
  | "cold_start"
  | "healthy"
  | "gap"
  | "recovering"
  | "degraded";

/**
 * Reliability markers updated when the stream is considered healthy.
 *
 * These watermarks let the processor know how far it can trust inferred events
 * and whether consumers should assume a resynchronization pass is still needed.
 */
export interface StreamWatermarks {
  /** Last timestamp processed while the stream was healthy. */
  lastReliableTimestamp: number | null;
  /** Last round number observed while the stream was healthy. */
  lastReliableRound: number | null;
  /** Signals that the stream crossed an unreliable window and needs resync. */
  requiresResync: boolean;
}

/**
 * Counters used by the stream state machine to decide transitions.
 */
export interface StreamMetrics {
  /** Number of snapshots rejected as stale/invalid. */
  rejectedSnapshots: number;
  /** Number of times the processor entered a gap/degraded zone. */
  gapCount: number;
  /** Current streak of complete snapshots. */
  consecutiveValidSnapshots: number;
  /** Current streak of partial snapshots. */
  consecutivePartialSnapshots: number;
}
