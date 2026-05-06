import type { ReducerContext } from "./reducerTypes";
/**
 * Manages match open/close transitions for the aggregate processor.
 *
 * A match can start from either a traditional `warmup` edge or the first
 * consistent `live` snapshot, which enables attaching mid-match without needing
 * to replay the entire warmup sequence first.
 */
export declare function reduceMatchLifecycle(ctx: ReducerContext): void;
