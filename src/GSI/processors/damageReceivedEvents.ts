import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from '../../types/EventProcessor';

let lastHealth = 0;

export const processDamageReceivedEvents: EventProcessor<GameState> = (gameState, timestamp) => {
  if (!gameState.player || !gameState.round || !gameState.map) return;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const { flashed, smoked, health: currentHealth } = gameState.player.state;
  const equippedWeapon = getEquippedWeapon(gameState.player.weapons);

  const damage = lastHealth - currentHealth;

  if (damage > 0) {
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.damageReceived.push({
        timestamp,
        roundPhase,
        damage,
        flashed,
        smoked,
        equippedWeapon,
      });
    });
    console.log(
      `🔫 Hit detected in round ${gameRound} during phase: ${roundPhase} with ${damage} damage`,
    );
  }

  lastHealth = currentHealth;
};
