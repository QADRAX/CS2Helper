import { GameState } from '../../types/CSGO';
import { MatchData } from '../../types/CSState';
import { matchState } from '../state/matchState';
import { EventProcessor } from './EventProcessor';

let lastMapPhase: string | undefined;

/**
 * Procesa el inicio y fin de una partida.
 */
export const processMatchEvents: EventProcessor<GameState> = (gameState, timestamp) => {
  if(!gameState.map) return;

  const mapPhase = gameState.map.phase;
  const mapName = gameState.map.name;
  const currentMatch = matchState.get();

  // Iniciar nueva partida si entramos en "warmup"
  if (!currentMatch && mapPhase === 'warmup' && lastMapPhase !== 'warmup') {
    matchState.update(() => {
      const newMatch: MatchData = {
        mapName,
        timestamp,
        mode: gameState.map!.mode,
        rounds: [],
      };
      return newMatch;
    });
    console.log(`🆕 New match detected`);
  }

  // Terminar la partida si entramos en "gameover"
  if (currentMatch && mapPhase === 'gameover' && lastMapPhase !== 'gameover') {
    console.log(`🏁 Match ended`);
    // saveMatchData(currentMatch);
    matchState.update(() => {
      return null;
    });
  }

  lastMapPhase = mapPhase;
};
