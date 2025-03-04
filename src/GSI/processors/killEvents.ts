import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { matchState, updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from './EventProcessor';

let lastKills = 0;
let lastGameRound: number = 0;

/**
 * Procesa las kills del jugador.
 */
export const processKillEvents: EventProcessor<GameState> = (gameState, timestamp) => {
  if (!gameState.player || !gameState.round || !gameState.map) return;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const currentMatch = matchState.get();

  if (!currentMatch) return;

  const currentKills = gameState.player.match_stats?.kills ?? 0;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);
  const gameRound = gameState.map.round;
  const roundPhase = gameState.round.phase;
  const { flashed, smoked } = gameState.player.state;

  if (currentKills > lastKills) {
    // CS2 actualiza la ronda despues de la ultima baja si ganas la ronda por bajas
    const killRound = roundPhase === 'over' ? lastGameRound : gameRound;

    updateRoundIfExists(killRound, (currentRound) => {
      currentRound.kills.push({
        timestamp,
        roundPhase,
        weapon: equippedWeapon,
        flashed,
        smoked,
      });
    });
    console.log(
      `💀 Kill detected in round ${killRound} with: ${equippedWeapon}`,
    );
  }

  lastKills = currentKills;
  lastGameRound = gameRound;
};
