import { GameState } from '../../types/CSGO';
import { MatchData } from '../../types/CSState';
import { matchState } from '../state/matchState';

let lastMapPhase: string | null = null;

/**
 * Procesa el inicio y fin de una partida.
 */
export const processMatchEvents = (gameState: Required<GameState>) => {
  const mapPhase = gameState.map.phase;
  const mapName = gameState.map.name;
  const currentMatch = matchState.get();

  // Iniciar nueva partida si entramos en "warmup"
  if (!currentMatch || (mapPhase === 'warmup' && lastMapPhase !== 'warmup')) {
    matchState.update(() => {
      const newMatch: MatchData = {
        mapName,
        timestamp: gameState.provider.timestamp,
        mode: gameState.map.mode,
        rounds: [],
      }
      return newMatch;
    });
    console.log(`🆕 New match detected`);
  }

  // Terminar la partida si entramos en "gameover"
  if (mapPhase === 'gameover' && lastMapPhase !== 'gameover') {
    if (currentMatch) {
      console.log(`🏁 Match ended`);
      // saveMatchData(currentMatch);
    }
    matchState.update(() => {
      return null;
    });
  }

  lastMapPhase = mapPhase;
};
