import { PhaseMap } from '../../types/CSGO';
import { CSState, isGameStatePlaying } from '../../types/CSState';
import { Observer } from '../Observer';

/** Observer that detects when a game ends */
export function createGameEndObserver(onGameEnd: (state: CSState) => void): Observer<CSState> {
  let lastPhase: PhaseMap | null = null;

  return (state: CSState) => {
    if (!isGameStatePlaying(state)) return;

    const currentPhase = state.map?.phase ?? null; // Estado actual de la partida

    // Detectar fin de la partida cuando pasamos de cualquier otra fase a 'gameover'
    if (lastPhase !== 'gameover' && currentPhase === 'gameover') {
      onGameEnd(state);
    }

    // Actualizamos la última fase
    lastPhase = currentPhase;
  };
}
