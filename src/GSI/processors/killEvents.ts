import { GameState } from '../../types/CSGO';
import { updateIfExists } from '../../utils/GenericStateContainer';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { matchState } from '../state/matchState';

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
    updateIfExists(matchState, (draft) => {
      const currentRound = draft.rounds.find(round => round.roundNumber === gameRound);
      if (currentRound) {
        currentRound.kills.push({
          timestamp: gameTimestamp,
          roundPhase: gameState.round.phase,
          weapon: getEquippedWeapon(gameState.player.weapons),
          flashed: gameState.player.state.flashed,
          smoked: gameState.player.state.smoked,
        });
      }
      return draft;
    });
    console.log(
      `💀 Kill detected in round ${gameRound} with: ${equippedWeapon}`,
    );
  }

  lastKills = currentKills;
};
