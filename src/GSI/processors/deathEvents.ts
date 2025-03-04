import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from '../../types/EventProcessor';

let lastDeaths: number = 0;
let lastGameRound: number = 0;


/**
 * Procesa las muertes del jugador.
 */
export const processDeathEvents: EventProcessor<GameState> = (gameState, timestamp) => {
  if (!gameState.player || !gameState.round || !gameState.map) return;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const currentDeaths = gameState.player.match_stats?.deaths ?? 0;
  const roundPhase = gameState.round?.phase ?? 'over';
  const gameRound = gameState.map.round;
  const { flashed, smoked } = gameState.player.state;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);

  if (currentDeaths > lastDeaths) {
    const deathRound = roundPhase === 'over' ? lastGameRound : gameRound;
    updateRoundIfExists(deathRound, (currentRound) => {
      currentRound.deaths.push({
        timestamp,
        roundPhase,
        equippedWeapon,
        flashed,
        smoked,
      });
      console.log(
        `☠️ Death detected in round ${deathRound} with: ${equippedWeapon}`,
      );
    });
  }

  lastDeaths = currentDeaths;
  lastGameRound = gameRound;
};
