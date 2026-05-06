import type { ReducerContext } from "./reducerTypes";
/**
 * Projects the latest normalized player snapshot into the aggregate state view.
 *
 * Unlike event reducers, this slice is always safe to run because it mirrors the
 * current observed roster instead of inferring historical facts.
 */
export declare function reducePlayersState(ctx: ReducerContext): void;
