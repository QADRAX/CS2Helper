import type { MatchData, RoundData } from "../../match/matchTypes";
import type { GsiProcessorState } from "../gsiProcessorTypes";

export function cloneState(state: GsiProcessorState): GsiProcessorState {
  return {
    ...state,
    streamMetrics: { ...state.streamMetrics },
    streamWatermarks: { ...state.streamWatermarks },
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

export function findRound(match: MatchData, roundNumber: number): RoundData | undefined {
  return match.rounds.find((round) => round.roundNumber === roundNumber);
}
