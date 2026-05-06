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
export function evaluateSnapshotQuality(snapshot, previousTimestamp) {
    void previousTimestamp;
    if (!snapshot.map || !snapshot.round)
        return "partial";
    if (snapshot.players.length === 0)
        return "partial";
    return "complete";
}
