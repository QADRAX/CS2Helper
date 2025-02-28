import { GameState } from "../../../types/CSGO";
import { getEquippedWeapon } from "../../../utils/getEquipedWeapon";
import { getCurrentMatch } from "./matchEvents";

let lastKills = 0;

/**
 * Procesa las kills del jugador.
 */
export const processKillEvents = (gameState: Required<GameState>) => {
  const currentMatch = getCurrentMatch();

  if (!currentMatch) return;

  const currentKills = gameState.player.match_stats?.kills ?? 0;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);
  const gameTimestamp = gameState.provider.timestamp * 1000;
  const gameRound = gameState.map.round;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    console.log("🚫 Ignoring death event due to spectating another player (deathcam detected).");
    return;
  }

  if (currentKills > lastKills) {
    const roundData = currentMatch.rounds.find((r) => r.roundNumber === gameRound);
    if (roundData) {
      roundData.kills.push({ weapon: equippedWeapon, timestamp: gameTimestamp });
    }
    console.log(`💀 Kill detected in round ${gameRound} with: ${equippedWeapon}`);
  }

  lastKills = currentKills;
};
