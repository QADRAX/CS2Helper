import type { ReducerContext } from "./reducerTypes";
/**
 * Tracks round boundaries and round-result metadata inside the active match.
 *
 * This reducer is considered critical because it establishes the temporal frame
 * used by kill/death/damage inference. When stream health is degraded, it skips
 * work rather than guessing round boundaries from incomplete data.
 */
export declare function reduceRoundLifecycle(ctx: ReducerContext): void;
