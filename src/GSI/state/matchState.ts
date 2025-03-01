import { MatchData } from '../../types/CSState';
import {
  createStateContainer,
  StateContainer,
} from '../../utils/GenericStateContainer';

export const matchState: StateContainer<MatchData | null> =
  createStateContainer<MatchData | null>(null);
