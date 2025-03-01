import { MatchData, RoundData } from '../../types/CSState';
import {
  createStateContainer,
  StateContainer,
  updateIfExists,
} from '../../utils/GenericStateContainer';

export const matchState: StateContainer<MatchData | null> =
  createStateContainer<MatchData | null>(null);

export function updateRoundIfExists(
  roundNumber: number,
  updater: (round: RoundData) => void,
) {
  updateIfExists(matchState, (draft) => {
    const currentRound = draft.rounds.find(
      (round) => round.roundNumber === roundNumber,
    );
    if (currentRound) {
      updater(currentRound);
    }
    return draft;
  });
}
