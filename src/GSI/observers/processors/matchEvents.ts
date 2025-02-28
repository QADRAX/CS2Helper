import { GameState } from "../../../types/CSGO";
import { MatchData } from "../../../types/CSState";

let currentMatch: MatchData | null = null;
let lastMapPhase: string | null = null;

/**
 * Genera un ID único basado en el mapa.
 */
const generateMatchId = (mapName: string): string => {
  return `${mapName}-${Date.now()}`;
};

/**
 * Procesa el inicio y fin de una partida.
 */
export const processMatchEvents = (gameState: Required<GameState>) => {
  const mapPhase = gameState.map.phase;
  const mapName = gameState.map.name;

  // Iniciar nueva partida si entramos en "warmup"
  if (!currentMatch || (mapPhase === "warmup" && lastMapPhase !== "warmup")) {
    currentMatch = { matchId: generateMatchId(mapName), rounds: [] };
    console.log(`🆕 New match detected: ${currentMatch.matchId}`);
  }

  // Terminar la partida si entramos en "gameover"
  if (mapPhase === "gameover" && lastMapPhase !== "gameover") {
    if (currentMatch) {
      console.log(`🏁 Match ended: ${currentMatch.matchId}`);
      // saveMatchData(currentMatch);
    }
    currentMatch = null;
  }

  lastMapPhase = mapPhase;
};

export const getCurrentMatch = () => currentMatch;
