import type { NormalizedSnapshot } from "../../csgo";
/**
 * Coarse quality classification for one normalized watcher snapshot.
 *
 * The stream state machine uses this value to decide whether critical reducers
 * may run and whether the processor should stay healthy, enter a gap or degrade.
 */
export type SnapshotQuality = "complete" | "partial" | "stale" | "invalid";
/**
 * Evaluates whether a normalized snapshot is sufficiently complete for reliable
 * domain inference.
 *
 * Current rules are intentionally conservative and minimal:
 * - snapshots missing `map` or `round` are `partial`
 * - snapshots with no players are `partial`
 * - everything else is `complete`
 *
 * `previousTimestamp` is kept in the signature for future freshness/staleness
 * checks even though the current implementation does not use it yet.
 */
export declare function evaluateSnapshotQuality(snapshot: NormalizedSnapshot, previousTimestamp: number | null): SnapshotQuality;
