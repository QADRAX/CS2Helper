import { CSState } from "../../../types/CSState";
import { getCurrentMatch } from "./matchEvents";

let lastRoundPhase: string | null = null;

/**
 * Procesa el inicio y fin de rondas.
 */
export const processRoundEvents = (gameState: CSState) => {
  const roundPhase = gameState!.round?.phase ?? "over";
  const gameRound = gameState!.map!.round;
  const currentMatch = getCurrentMatch();

  if (!currentMatch) return;

  // Iniciar una nueva ronda cuando entramos en "freezetime"
  if (roundPhase === "freezetime" && lastRoundPhase !== "freezetime") {
    if (!currentMatch.rounds.some((r) => r.roundNumber === gameRound)) {
      console.log(`🔄 New round detected: ${gameRound}`);
      currentMatch.rounds.push({ roundNumber: gameRound, kills: [], deaths: [] });
      // currentRound = gameRound;
    }
  }

  // Detectar fin de la ronda cuando pasa de "live" a "over"
  if (lastRoundPhase === "live" && roundPhase === "over") {
    console.log(`🔚 Round ${gameRound} ended`);
  }

  lastRoundPhase = roundPhase;
};
