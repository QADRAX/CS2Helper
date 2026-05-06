/**
 * Processes match-wide events that are not tied to a single player stream.
 *
 * This reducer is intentionally empty for now. Keeping the slice explicit makes
 * it easier to grow server / LAN features without bloating player reducers.
 */
export function reduceGlobalEvents(ctx) {
    void ctx;
}
