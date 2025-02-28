import { GameState } from "../../../types/CSGO";
import { getCurrentMatch } from "./matchEvents";

let lastDeaths = 0;

/**
 * Procesa las muertes del jugador.
 */
export const processDeathEvents = (gameState: Required<GameState>) => {
  const currentMatch = getCurrentMatch();

  if (!currentMatch) return;

  const currentDeaths = gameState.player.match_stats?.deaths ?? 0;
  const gameTimestamp = gameState.provider.timestamp * 1000;
  const roundPhase = gameState.round?.phase ?? "over";
  const gameRound = gameState.map.round;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    console.log("🚫 Ignoring death event due to spectating another player (deathcam detected).");
    return;
  }

  if (currentDeaths > lastDeaths) {
    const roundData = currentMatch.rounds.find((r) => r.roundNumber === gameRound);
    if (roundData) {
      roundData.deaths.push({ timestamp: gameTimestamp, roundPhase });
    }
    console.log(`☠️ Player died in round ${gameRound} during phase: ${roundPhase}`);
  }

  lastDeaths = currentDeaths;
};
