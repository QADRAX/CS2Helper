import type { TeamType } from "../csgo/phases";
import { findRound } from "./helpers";
import type { ReducerContext } from "./reducerTypes";

/** Picks the best available team label for rounds created from sparse snapshots. */
function getFallbackTeam(ctx: ReducerContext): TeamType {
  return ctx.snapshot.players[0]?.team ?? "CT";
}

/** Creates the aggregate round container and emits `round_started`. */
function createRound(ctx: ReducerContext, roundNumber: number): void {
  const { state, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const playerTeam = getFallbackTeam(ctx);
  state.currentMatch.rounds.push({
    timestamp,
    roundNumber,
    kills: [],
    deaths: [],
    damageReceived: [],
    weaponTransactions: [],
    flashes: [],
    playerTeam,
  });
  events.push({
    type: "round_started",
    timestamp,
    roundNumber,
    playerTeam,
  });
}

/** Detects the freezetime edge that means a new round has begun. */
function shouldCreateRound(ctx: ReducerContext, currentRoundExists: boolean): boolean {
  const { memory, snapshot } = ctx;
  if (!snapshot.round) return false;

  return (
    !currentRoundExists &&
    snapshot.round.phase === "freezetime" &&
    memory.lastRoundPhase !== "freezetime"
  );
}

/** Marks the current round as live on the `freezetime -> live` transition. */
function markRoundLive(ctx: ReducerContext, roundNumber: number): void {
  const currentRound = ctx.state.currentMatch && findRound(ctx.state.currentMatch, roundNumber);
  if (!currentRound) return;

  currentRound.roundLiveTimestamp = ctx.timestamp;
  ctx.events.push({
    type: "round_live",
    timestamp: ctx.timestamp,
    roundNumber,
  });
}

/** Closes the previously active round once the snapshot transitions into `over`. */
function markPreviousRoundOver(ctx: ReducerContext): void {
  const { state, memory, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const lastRound = findRound(state.currentMatch, memory.lastGameRound);
  if (!lastRound) return;

  lastRound.roundOverTimestamp = timestamp;
  events.push({
    type: "round_over",
    timestamp,
    roundNumber: memory.lastGameRound,
  });
}

/** Stores the winner for the last completed round and emits `round_winner`. */
function assignRoundWinner(ctx: ReducerContext, winnerTeam: TeamType): void {
  const { state, memory, timestamp, events } = ctx;
  if (!state.currentMatch) return;

  const lastRound = findRound(state.currentMatch, memory.lastGameRound);
  if (!lastRound) return;

  lastRound.winnerTeam = winnerTeam;
  events.push({
    type: "round_winner",
    timestamp,
    roundNumber: memory.lastGameRound,
    winnerTeam,
  });
}

/**
 * Tracks round boundaries and round-result metadata inside the active match.
 *
 * This reducer is considered critical because it establishes the temporal frame
 * used by kill/death/damage inference. When stream health is degraded, it skips
 * work rather than guessing round boundaries from incomplete data.
 */
export function reduceRoundLifecycle(ctx: ReducerContext): void {
  const { state, memory, snapshot } = ctx;
  if (!ctx.criticalReducersEnabled) {
    ctx.skipReason = "stream_not_healthy";
    return;
  }
  if (!state.currentMatch || !snapshot.map || !snapshot.round) return;

  const roundPhase = snapshot.round.phase;
  const gameRound = snapshot.map.round;
  const roundWinningTeam = snapshot.round.win_team;

  const hasCurrentRound = !!findRound(state.currentMatch, gameRound);

  if (shouldCreateRound(ctx, hasCurrentRound)) createRound(ctx, gameRound);

  // `round_live` belongs to the current round number, not the previous one.
  if (
    findRound(state.currentMatch, gameRound) &&
    memory.lastRoundPhase === "freezetime" &&
    roundPhase === "live"
  ) {
    markRoundLive(ctx, gameRound);
  }

  if (
    findRound(state.currentMatch, memory.lastGameRound) &&
    memory.lastRoundPhase === "live" &&
    roundPhase === "over"
  ) {
    markPreviousRoundOver(ctx);
  }

  // Winner assignment is tracked independently because some feeds report the
  // winner after the phase transition rather than exactly on the `over` edge.
  if (
    findRound(state.currentMatch, memory.lastGameRound) &&
    roundWinningTeam &&
    memory.lastRoundWinningTeam !== roundWinningTeam
  ) {
    assignRoundWinner(ctx, roundWinningTeam);
  }
}
