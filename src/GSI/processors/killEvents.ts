import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { matchState } from '../matchState';

let lastKills = 0;

/**
 * Procesa las kills del jugador.
 */
export const processKillEvents = (gameState: Required<GameState>) => {
  if (gameState.provider.steamid !== gameState.player.steamid) {
    console.log(
      '🚫 Ignoring death event due to spectating another player (deathcam detected).',
    );
    return;
  }

  const currentMatch = matchState.get();

  if (!currentMatch) return;

  const currentKills = gameState.player.match_stats?.kills ?? 0;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);
  const gameTimestamp = gameState.provider.timestamp;
  const gameRound = gameState.map.round;

  if (currentKills > lastKills) {
    matchState.update((match) => {
      if (!match) return match; // Si no hay partido activo, no se actualiza.
      const updatedRounds = match.rounds.map((round) =>
        round.roundNumber === gameRound
          ? {
              ...round,
              kills: [
                ...round.kills,
                { weapon: equippedWeapon, timestamp: gameTimestamp },
              ],
            }
          : round,
      );
      return { ...match, rounds: updatedRounds };
    });
    console.log(
      `💀 Kill detected in round ${gameRound} with: ${equippedWeapon}`,
    );
  }

  lastKills = currentKills;
};
