import { GameState } from '../../types/CSGO';
import { WeaponTransactionRecord } from '../../types/CSState';
import { getWeaponNames } from '../../utils/getEquipedWeapon';
import { updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from '../../types/EventProcessor';

let lastMoney = 0;
let lastWeapons: string[] = [];
let lastGameRound = 0;

export const processWeaponTransactionsEvents: EventProcessor<GameState> = (
  gameState,
  timestamp,
) => {
  if (!gameState.player || !gameState.round || !gameState.map) return;

  if (gameState.provider.steamid !== gameState.player.steamid) {
    return;
  }

  const currentMoney = gameState.player.state.money;
  const currentWeapons: string[] = getWeaponNames(gameState.player.weapons);

  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;

  // Si es una nueva ronda, reiniciamos los valores base y actualizamos el estado de la ronda.
  if (gameRound !== lastGameRound) {
    lastWeapons = currentWeapons;
    lastMoney = currentMoney;
    lastGameRound = gameRound;
    return;
  }

  // Calculamos la diferencia de dinero desde la última actualización.
  const moneyDelta = lastMoney - currentMoney;

  // Solo registramos transacciones si hay un cambio en el dinero.
  const transactions: WeaponTransactionRecord[] = [];

  // Armas nuevas: aparecen en currentWeapons y no estaban en lastWeapons.
  const purchasedWeapons = currentWeapons.filter(
    (weapon) => !lastWeapons.includes(weapon),
  );
  // Armas desaparecidas: estaban en lastWeapons y ya no están en currentWeapons.
  const soldWeapons = lastWeapons.filter(
    (weapon) => !currentWeapons.includes(weapon),
  );

  // Registro de compra: dinero disminuye (moneyDelta > 0) y se han añadido armas.
  if (purchasedWeapons.length > 0 && moneyDelta > 0) {
    const costPerWeapon = moneyDelta / purchasedWeapons.length;
    purchasedWeapons.forEach((weapon) => {
      transactions.push({
        timestamp,
        roundPhase,
        transactionType: 'purchase',
        weaponName: weapon,
        cost: costPerWeapon,
      });
    });
  }

  // Registro de venta: dinero aumenta (moneyDelta < 0) y se han quitado armas.
  if (soldWeapons.length > 0 && moneyDelta < 0) {
    const saleDelta = currentMoney - lastMoney; // valor positivo
    const costPerWeapon = saleDelta / soldWeapons.length;
    soldWeapons.forEach((weapon) => {
      transactions.push({
        timestamp,
        roundPhase,
        transactionType: 'refund',
        weaponName: weapon,
        cost: costPerWeapon,
      });
    });
  }

  if (transactions.length > 0) {
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.weaponTransactions.push(...transactions);
    });
    for (const transaccion of transactions) {
      console.log(
        `💰 Weapon '${transaccion.weaponName}' ${transaccion.transactionType} detected in round ${gameRound} during phase ${roundPhase}: ${transaccion.transactionType === 'purchase' ? '-' : '+'} ${transaccion.cost}$`,
      );
    }
  }

  // Actualizamos los valores previos para la siguiente comparación.
  lastWeapons = currentWeapons;
  lastMoney = currentMoney;
  lastGameRound = gameRound;
};
