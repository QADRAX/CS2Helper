import type { ReducerContext } from "./reducerTypes";

/**
 * Decides whether the incoming snapshot should open a new match session.
 *
 * Besides the traditional `warmup` edge, the reducer also accepts the first
 * reliable `live` snapshot so the processor can attach to matches already in
 * progress without replaying warmup history.
 */
function shouldStartMatch(ctx: ReducerContext): boolean {
  const { state, memory, snapshot } = ctx;
  if (state.currentMatch || !snapshot.map) return false;

  return (
    (snapshot.map.phase === "warmup" && memory.lastMapPhase !== "warmup") ||
    (snapshot.map.phase === "live" && memory.lastMapPhase !== "live")
  );
}

/** Materializes a new aggregate match record and emits `match_started`. */
function startMatch(ctx: ReducerContext): void {
  const { state, snapshot, timestamp, events } = ctx;
  if (!snapshot.map) return;

  state.currentMatch = {
    mapName: snapshot.map.name,
    mode: snapshot.map.mode,
    timestamp,
    rounds: [],
  };
  events.push({
    type: "match_started",
    timestamp,
    mapName: snapshot.map.name,
    mode: snapshot.map.mode,
  });
}

/** Returns true only on the first `gameover` edge for the current match. */
function shouldEndMatch(ctx: ReducerContext): boolean {
  const { state, memory, snapshot } = ctx;
  return (
    !!state.currentMatch &&
    !!snapshot.map &&
    snapshot.map.phase === "gameover" &&
    memory.lastMapPhase !== "gameover"
  );
}

/** Emits `match_ended` and clears the aggregate match from state. */
function endMatch(ctx: ReducerContext): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  events.push({
    type: "match_ended",
    timestamp,
    mapName: state.currentMatch.mapName,
  });
  state.currentMatch = null;
}

/**
 * Manages match open/close transitions for the aggregate processor.
 *
 * A match can start from either a traditional `warmup` edge or the first
 * consistent `live` snapshot, which enables attaching mid-match without needing
 * to replay the entire warmup sequence first.
 */
export function reduceMatchLifecycle(ctx: ReducerContext): void {
  const { snapshot } = ctx;
  if (!snapshot.map) return;

  if (shouldStartMatch(ctx)) startMatch(ctx);

  if (shouldEndMatch(ctx)) endMatch(ctx);
}
