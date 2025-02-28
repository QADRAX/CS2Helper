import { GameState } from "../../types/CSGO";
import { matchState } from "../matchState";

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
  const currentMatch = matchState.get();

  // Iniciar nueva partida si entramos en "warmup"
  if (!currentMatch || (mapPhase === "warmup" && lastMapPhase !== "warmup")) {
    const matchId = generateMatchId(mapName);
    matchState.update(() => {
      return { matchId, rounds: [] }
    });
    console.log(`🆕 New match detected: ${matchId}`);
  }

  // Terminar la partida si entramos en "gameover"
  if (mapPhase === "gameover" && lastMapPhase !== "gameover") {
    if (currentMatch) {
      console.log(`🏁 Match ended: ${currentMatch.matchId}`);
      // saveMatchData(currentMatch);
    }
    matchState.update(() => {
      return null;
    });  }

  lastMapPhase = mapPhase;
};

