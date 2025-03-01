import { GameState } from '../../types/CSGO';
import {
  createStateContainer,
  StateContainer,
} from '../../utils/GenericStateContainer';

export const gameState: StateContainer<GameState | null> =
  createStateContainer<GameState | null>(null);
