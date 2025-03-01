import { GameState } from '../../types/CSGO';
import { updateIfExists } from '../../utils/GenericStateContainer';
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
    updateIfExists(matchState, (match) => {
      const currentRound = match.rounds.find(round => round.roundNumber === gameRound);
      if(currentRound){
        currentRound.deaths.push({
          timestamp: gameTimestamp,
          roundPhase,
          equippedWeapon: getEquippedWeapon(gameState.player.weapons),
          flashed: gameState.player.state.flashed,
          smoked: gameState.player.state.smoked,
        },);
      }
      console.log(
        `☠️ Player died in round ${gameRound} during phase: ${roundPhase}`,
      );
      return match;
    });
  }

  lastDeaths = currentDeaths;
};
