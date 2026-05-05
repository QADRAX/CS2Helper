import type { WeaponSlotType } from "./phases";

/**
 * Holstered vs currently held weapon.
 */
export type WeaponState = "holstered" | "active";

/** Knife inventory item. */
export interface Knife {
  /** Broad CS2 weapon category. */
  type: "Knife";
  /** Weapon entity name from GSI. */
  name: "weapon_knife_t" | "weapon_knife";
  /** Cosmetic paintkit id/string. */
  paintkit: string;
  /** Current equip state in inventory. */
  state: WeaponState;
}

/** C4 inventory item. */
export interface Bomb {
  type: "C4";
  name: "weapon_c4";
  paintkit: string;
  state: WeaponState;
}

/** Pistol inventory item. */
export interface Pistol {
  type: "Pistol";
  name:
    | "weapon_deagle"
    | "weapon_elite"
    | "weapon_fiveseven"
    | "weapon_glock"
    | "weapon_cz75a"
    | "weapon_hkp2000"
    | "weapon_p250"
    | "weapon_revolver"
    | "weapon_tec9"
    | "weapon_usp_silencer";
  paintkit: string;
  /** Ammo currently loaded in clip. */
  ammo_clip: number;
  /** Maximum clip capacity. */
  ammo_clip_max: number;
  /** Ammo left in reserve. */
  ammo_reserve: number;
  state: WeaponState;
}

/** Shotgun inventory item. */
export interface Shotgun {
  type: "Shotgun";
  name: "weapon_xm1014" | "weapon_nova" | "weapon_mag7" | "weapon_sawedoff";
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

/** Machine gun inventory item. */
export interface MachineGun {
  type: "Machine Gun";
  name: "weapon_m249" | "weapon_negev";
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

/** Submachine gun inventory item. */
export interface SubmachineGun {
  type: "Submachine Gun";
  name:
    | "weapon_mac10"
    | "weapon_bizon"
    | "weapon_mp5sd"
    | "weapon_mp7"
    | "weapon_mp9"
    | "weapon_p90"
    | "weapon_ump45";
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

/** Rifle inventory item. */
export interface Rifle {
  type: "Rifle";
  name:
    | "weapon_ak47"
    | "weapon_aug"
    | "weapon_famas"
    | "weapon_galilar"
    | "weapon_m4a1"
    | "weapon_m4a1_silencer"
    | "weapon_sg556";
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

/** Sniper rifle inventory item. */
export interface SniperRifle {
  type: "SniperRifle";
  name: "weapon_awp" | "weapon_g3sg1" | "weapon_scar20" | "weapon_ssg08";
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

/** Grenade inventory item. */
export interface Grenade {
  type: "Grenade";
  name:
    | "weapon_smokegrenade"
    | "weapon_decoy"
    | "weapon_hegrenade"
    | "weapon_incgrenade"
    | "weapon_molotov";
  paintkit: string;
  ammo_reserve: number;
  state: WeaponState;
}

/** Any supported weapon shape from GSI inventory. */
export type Weapon =
  | Knife
  | Pistol
  | Bomb
  | Grenade
  | MachineGun
  | Rifle
  | Shotgun
  | SniperRifle
  | SubmachineGun;

/**
 * GSI weapon inventory keyed by slot names (`weapon_0..weapon_9`).
 * Slots may be missing depending on player loadout.
 */
export type Weapons = {
  [key in WeaponSlotType]?: Weapon;
};
