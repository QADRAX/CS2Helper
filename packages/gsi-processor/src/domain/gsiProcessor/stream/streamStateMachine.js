/**
 * Computes the next stream state from snapshot quality and recent quality streaks.
 *
 * High-level behavior:
 * - `invalid` / `stale` snapshots immediately degrade the stream
 * - `partial` snapshots move the stream into `gap` and eventually `degraded`
 * - `complete` snapshots move the stream toward `healthy`, honoring the
 *   configured recovery window after gaps/cold start
 */
export function transitionStreamState(input) {
    const { current, quality, recoveryWindow, consecutiveValidSnapshots, consecutivePartialSnapshots } = input;
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
