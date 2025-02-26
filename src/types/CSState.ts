import { GameState, GameStateMenu } from './CSGO';

export type CSState = GameStateMenu | GameState | null;

export function isGameStatePlaying(state: CSState): state is GameState {
  if(!state) return false;

  return (state as GameState).map !== undefined;
}

export function isGameStateMenu(state: CSState): state is GameStateMenu {
  if(!state) return false;

  return (state as any).player?.state === undefined;
}
