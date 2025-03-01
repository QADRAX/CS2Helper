import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';

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
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.deaths.push({
        timestamp: gameTimestamp,
        roundPhase,
        equippedWeapon: getEquippedWeapon(gameState.player.weapons),
        flashed: gameState.player.state.flashed,
        smoked: gameState.player.state.smoked,
      });
    });
  }

  lastDeaths = currentDeaths;
};
