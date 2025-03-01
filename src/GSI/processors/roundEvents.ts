import { GameState } from '../../types/CSGO';
import { matchState } from '../state/matchState';

let lastRoundPhase: string | null = null;

export const processRoundEvents = (gameState: Required<GameState>) => {
  const roundPhase = gameState.round.phase ?? 'over';
  const gameRound = gameState.map.round;
  const currentMatch = matchState.get();

  if (!currentMatch) return;

  // Iniciar una nueva ronda cuando entramos en "freezetime"
  if (roundPhase === 'freezetime' && lastRoundPhase !== 'freezetime') {
    if (!currentMatch.rounds.some((r) => r.roundNumber === gameRound)) {
      console.log(`🔄 New round detected: ${gameRound}`);

      matchState.update((match) => {
        if (!match) return match;
        return {
          ...match,
          rounds: [
            ...match.rounds,
            {
              timestamp: gameState.provider.timestamp,
              roundNumber: gameRound,
              kills: [],
              deaths: [],
            },
          ],
        };
      });
    }
  }

  // Detectar fin de la ronda cuando pasa de "live" a "over"
  if (lastRoundPhase === 'live' && roundPhase === 'over') {
    console.log(`🔚 Round ${gameRound} ended`);
  }

  lastRoundPhase = roundPhase;
};
