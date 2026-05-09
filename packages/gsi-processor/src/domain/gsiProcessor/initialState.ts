import type { GsiProcessorMemory, GsiProcessorState } from "./gsiProcessorTypes";

/** Builds the default state for a fresh processor instance. */
export function createInitialGsiProcessorState(): GsiProcessorState {
  return {
    currentMatch: null,
    lastGameState: null,
    lastSnapshot: null,
    watcherMode: null,
    localClientSteamId: null,
    focusedPlayerSteamId: null,
    isSpectatingOtherPlayer: false,
    playersBySteamId: {},
    streamState: "cold_start",
    streamMetrics: {
      rejectedSnapshots: 0,
      gapCount: 0,
      consecutiveValidSnapshots: 0,
      consecutivePartialSnapshots: 0,
    },
    streamWatermarks: {
      lastReliableTimestamp: null,
      lastReliableRound: null,
      requiresResync: true,
    },
    totalTicks: 0,
    lastProcessedAt: null,
  };
}

/** Builds the default rolling memory for a fresh processor instance. */
export function createInitialGsiProcessorMemory(): GsiProcessorMemory {
  return {
    lastMapPhase: undefined,
    lastRoundPhase: null,
    lastRoundWinningTeam: undefined,
    lastGameRound: 0,
    players: {},
  };
}
