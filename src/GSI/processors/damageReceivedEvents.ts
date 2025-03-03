import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';

let lastHealth = 0;

export const processDamageReceivedEvents = (gameState: Required<GameState>) => {
  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const { timestamp } = gameState.provider;
  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const { flashed, smoked, health: currentHealth } = gameState.player.state;

  const damage = lastHealth - currentHealth;

  if (damage > 0) {
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.damageReceived.push({
        timestamp,
        roundPhase,
        damage,
        flashed,
        smoked,
        equippedWeapon: getEquippedWeapon(gameState.player.weapons),
      });
    });
    console.log(
      `🔫 Hit detected in round ${gameRound} during phase: ${roundPhase} with ${damage} damage`,
    );
  }

  lastHealth = currentHealth;
};
