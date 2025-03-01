// processDeathEvents.ts
import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { matchState } from '../state/matchState';

let lastDeaths = 0;

/**
 * Procesa las muertes del jugador.
 */
export const processDeathEvents = (gameState: Required<GameState>) => {
  if (gameState.provider.steamid !== gameState.player.steamid) {
    console.log(
      '🚫 Ignoring death event due to spectating another player (deathcam detected).',
    );
    return;
  }

  const currentDeaths = gameState.player.match_stats?.deaths ?? 0;
  const gameTimestamp = gameState.provider.timestamp * 1000;
  const roundPhase = gameState.round?.phase ?? 'over';
  const gameRound = gameState.map.round;

  if (currentDeaths > lastDeaths) {
    // Actualizamos el estado de forma inmutable a través del contenedor.
    matchState.update((match) => {
      if (!match) return match;
      return {
        ...match,
        rounds: match.rounds.map((round) =>
          round.roundNumber === gameRound
            ? {
                ...round,
                deaths: [
                  ...round.deaths,
                  {
                    timestamp: gameTimestamp,
                    roundPhase,
                    equippedWeapon: getEquippedWeapon(gameState.player.weapons),
                  },
                ],
              }
            : round,
        ),
      };
    });

    console.log(
      `☠️ Player died in round ${gameRound} during phase: ${roundPhase}`,
    );
  }

  lastDeaths = currentDeaths;
};
