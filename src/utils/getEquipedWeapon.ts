import { Weapons } from '../types/CSGO';

export function getEquippedWeapon(weapons?: Weapons): string {
  if (!weapons) return 'Unknown';
  const activeWeapon = Object.values(weapons).find(
    (weapon) => weapon.state === 'active',
  );
  return activeWeapon ? activeWeapon.name : 'Unknown';
}

export function getWeaponNames(weapons?: Weapons): string[] {
  if (!weapons) return [];

  return Object.values(weapons).map(value => value.name);
}
