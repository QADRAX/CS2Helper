import { GameState } from '../../types/CSGO';
import { getEquippedWeapon } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';

let lastHealth = 0;

export const processDamageReceivedEvents = (gameState: Required<GameState>) => {
  if (!gameState.player) return;

  const currentHealth = gameState.player.state.health;
  const damage = lastHealth - currentHealth;

  const { timestamp } = gameState.provider;
  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const { flashed, smoked } = gameState.player.state;

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
