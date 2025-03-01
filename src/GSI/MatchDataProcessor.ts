import { CSState, isValidGameState } from "../types/CSState";
import { Observer } from "../utils/Observer";
import { processMatchEvents } from "./processors/matchEvents";
import { processRoundEvents } from "./processors/roundEvents";
import { processKillEvents } from "./processors/killEvents";
import { processDeathEvents } from "./processors/deathEvents";
import { processDamageReceivedEvents } from "./processors/damageReceivedEvents";
import { processWeaponTransactionsEvents } from "./processors/weaponTransactions";

const eventProcessors = [
  processMatchEvents,
  processRoundEvents,
  processKillEvents,
  processDeathEvents,
  processDamageReceivedEvents,
  processWeaponTransactionsEvents,
];

/**
 * Procesa el estado del juego aplicando cada procesador de eventos.
 */
export const matchDataProcessor: Observer<CSState> = (gameState) => {
  if (!isValidGameState(gameState)) return;

  eventProcessors.forEach((processor) => processor(gameState));
};
