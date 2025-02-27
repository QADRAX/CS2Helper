import { Weapon, Weapons } from "../../types/CSGO";
import { CSState } from "../../types/CSState";
import { Observer } from "../Observer";

export const gameStateLogger: Observer<CSState> = (state) => {
  console.log('New game state received:', state);
};


function logWeapons(weapons: Weapons): void {
  console.log('==== Weapons Loadout ====');

  for (const [slot, weapon] of Object.entries(weapons)) {
    if (weapon) {
      console.log(`\n[Slot: ${slot}]`);
      logWeapon(weapon); // Reutilizamos la función anterior
    } else {
      console.log(`\n[Slot: ${slot}] Empty`);
    }
  }

  console.log('========================\n');
}


function logWeapon(weapon: Weapon): void {
  console.log('==== Weapon Details ====');
  console.log(`Type: ${weapon.type}`);
  console.log(`Name: ${weapon.name}`);
  console.log(`State: ${weapon.state}`);
  console.log(`Paintkit: ${weapon.paintkit}`);

  if ('ammo_clip' in weapon) {
    console.log(`Ammo: ${weapon.ammo_clip}/${weapon.ammo_clip_max} (Reserve: ${weapon.ammo_reserve})`);
  } else if ('ammo_reserve' in weapon) {
    console.log(`Ammo Reserve: ${weapon.ammo_reserve}`);
  }

  console.log('========================');
}
