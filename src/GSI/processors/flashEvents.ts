import { GameState } from '../../types/CSGO';
import { matchState, updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from '../../types/EventProcessor';

let wasFlashed = false;
let flashStartTimestamp: number | null = null;
let lastGameRound: number = 0;

/**
 * Procesa los eventos de flash del jugador.
 */
export const processFlashEvents: EventProcessor<GameState> = (
  gameState,
  timestamp,
) => {
  if (!gameState.player || !gameState.round || !gameState.map) return;

  // Nos aseguramos de que el evento sea del jugador principal
  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const currentMatch = matchState.get();
  if (!currentMatch) return;

  const flashedValue = gameState.player.state.flashed;
  const gameRound = gameState.map.round;
  const roundPhase = gameState.round.phase;

  const eventRound = roundPhase === 'over' ? lastGameRound : gameRound;

  // Si el valor de flashed es mayor a 0 y no estábamos en estado flash, iniciamos el evento.
  if (flashedValue > 0 && !wasFlashed) {
    wasFlashed = true;
    flashStartTimestamp = timestamp;
    console.log(`🔆 Flash iniciado en la ronda ${eventRound}`);
  }

  // Cuando flashed vuelve a 0 y habíamos iniciado el flash, termina el evento.
  if (flashedValue === 0 && wasFlashed) {
    wasFlashed = false;
    if (flashStartTimestamp !== null) {
      const flashDuration = timestamp - flashStartTimestamp;
      updateRoundIfExists(eventRound, (currentRound) => {
        currentRound.flashes.push({
          timestamp: flashStartTimestamp!,
          duration: flashDuration,
        });
      });
      console.log(
        `🔆 Flash finalizado en la ronda ${eventRound}. Duración: ${flashDuration / 1000}`,
      );
      flashStartTimestamp = null;
    }
  }

  lastGameRound = gameRound;
};
