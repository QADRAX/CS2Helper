export function cloneState(state) {
    return {
        ...state,
        playersBySteamId: { ...state.playersBySteamId },
        currentMatch: state.currentMatch
            ? {
                ...state.currentMatch,
                rounds: state.currentMatch.rounds.map((round) => ({
                    ...round,
                    kills: [...round.kills],
                    deaths: [...round.deaths],
                    flashes: [...round.flashes],
                    damageReceived: [...round.damageReceived],
                    weaponTransactions: [...round.weaponTransactions],
                })),
            }
            : null,
    };
}
export function findRound(match, roundNumber) {
    return match.rounds.find((round) => round.roundNumber === roundNumber);
}
