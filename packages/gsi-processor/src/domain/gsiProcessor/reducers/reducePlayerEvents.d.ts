import type { ReducerContext } from "./reducerTypes";
/**
 * Infers per-player tactical events from deltas between the current snapshot and
 * rolling player memory.
 *
 * This reducer is intentionally conservative: it only runs when critical
 * reducers are enabled and an active match exists, which prevents retroactive
 * event emission on cold starts, gaps or partial snapshots.
 */
export declare function reducePlayerEvents(ctx: ReducerContext): void;
