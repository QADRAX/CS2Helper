import { Weapons } from '../types/CSGO';

export function getEquippedWeapon(weapons?: Weapons): string {
  if (!weapons) return 'Unknown';
  const activeWeapon = Object.values(weapons).find(
    (weapon) => weapon.state === 'active',
  );
  return activeWeapon ? activeWeapon.name : 'Unknown';
}
