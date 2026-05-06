/** Builds the default state for a fresh processor instance. */
export function createInitialGsiProcessorState() {
    return {
        currentMatch: null,
        lastGameState: null,
        lastSnapshot: null,
        watcherMode: null,
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
export function createInitialGsiProcessorMemory() {
    return {
        lastMapPhase: undefined,
        lastRoundPhase: null,
        lastRoundWinningTeam: undefined,
        lastGameRound: 0,
        players: {},
    };
}
