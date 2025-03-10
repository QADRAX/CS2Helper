/* eslint-disable no-use-before-define */
export interface GameState {
  provider: Provider;
  auth: Auth;
  player?: Player;
  round?: Round;
  map?: Map;
}

export interface Round {
  phase: PhaseRound;
  bomb?: 'planted' | 'defused' | 'exploded';
  win_team?: TeamType;
}

export interface Provider {
  name: string;
  appid: number;
  version: number;
  steamid: string;
  timestamp: number;
}

export interface Auth {
  token: string;
}

export interface Player {
  clan?: string;
  steamid: string;
  name: string;
  observer_slot: ObservatorSlotType;
  team: TeamType;
  activity: PlayerActivityType;
  state: PlayerState;
  forward: string;
  spectarget?: string;
  weapons?: Weapons;
  match_stats?: PlayerStats;
}

export interface PlayerMenu {
  steamid: string;
  name: string;
  activity: 'menu';
}

export type Weapons = {
  [key in WeaponSlotType]?: Weapon;
};

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

export type WeaponState = 'holstered' | 'active';

export interface Knife {
  type: 'Knife';
  name: 'weapon_knife_t' | 'weapon_knife';
  paintkit: string;
  state: WeaponState;
}

export interface Bomb {
  type: 'C4';
  name: 'weapon_c4';
  paintkit: string;
  state: WeaponState;
}

export interface Pistol {
  type: 'Pistol';
  name:
    | 'weapon_deagle'
    | 'weapon_elite'
    | 'weapon_fiveseven'
    | 'weapon_glock'
    | 'weapon_cz75a'
    | 'weapon_hkp2000'
    | 'weapon_p250'
    | 'weapon_revolver'
    | 'weapon_tec9'
    | 'weapon_usp_silencer';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface Shotgun {
  type: 'Shotgun';
  name: 'weapon_xm1014' | 'weapon_nova' | 'weapon_mag7' | 'weapon_sawedoff';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface MachineGun {
  type: 'Machine Gun';
  name: 'weapon_m249' | 'weapon_negev';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface SubmachineGun {
  type: 'Submachine Gun';
  name:
    | 'weapon_mac10'
    | 'weapon_bizon'
    | 'weapon_mp5sd'
    | 'weapon_mp7'
    | 'weapon_mp9'
    | 'weapon_p90'
    | 'weapon_ump45';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface Rifle {
  type: 'Rifle';
  name:
    | 'weapon_ak47'
    | 'weapon_aug'
    | 'weapon_famas'
    | 'weapon_galilar'
    | 'weapon_m4a1'
    | 'weapon_m4a1_silencer'
    | 'weapon_sg556';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface SniperRifle {
  type: 'SniperRifle';
  name: 'weapon_awp' | 'weapon_g3sg1' | 'weapon_scar20' | 'weapon_ssg08';
  paintkit: string;
  ammo_clip: number;
  ammo_clip_max: number;
  ammo_reserve: number;
  state: WeaponState;
}

export interface Grenade {
  type: 'Grenade';
  name:
    | 'weapon_smokegrenade'
    | 'weapon_decoy'
    | 'weapon_hegrenade'
    | 'weapon_incgrenade'
    | 'weapon_molotov';
  paintkit: string;
  ammo_reserve: number;
  state: WeaponState;
}

export interface PlayerStats {
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  score: number;
}

export interface Map {
  mode: string;
  name: string;
  phase: PhaseMap;
  round: number;
  team_ct: Team;
  team_t: Team;
  num_matches_to_win_series: number;
  round_wins?: { [key: string]: RoundWinningType };
}

export interface Team {
  name?: string;
  score: number;
  consecutive_round_losses: number;
  timeouts_remaining: number;
  matches_won_this_series: number;
}

export interface PlayerState {
  health: number;
  armor: number;
  helmet: boolean;
  flashed: number;
  smoked: number;
  burning: number;
  money: number;
  round_kills: number;
  round_killhs: number;
  round_totaldmg: number;
  equip_value: number;
  defusekit?: boolean;
}

export type WeaponSlotType =
  | 'weapon_0'
  | 'weapon_1'
  | 'weapon_2'
  | 'weapon_3'
  | 'weapon_4'
  | 'weapon_5'
  | 'weapon_6'
  | 'weapon_7'
  | 'weapon_8'
  | 'weapon_9';

export type RoundWinningType =
  | 'ct_win_time'
  | 'ct_win_elimination'
  | 't_win_elimination'
  | 't_win_bomb'
  | 'ct_win_defuse';

export type GrenadeType = 'inferno' | 'smoke' | 'flashbang' | 'frag' | 'decoy';

export type PlayerActivityType = 'playing' | 'free' | 'textinput' | 'menu';

export type GameModeType = 'casual' | 'competitive';

export type ObservatorSlotType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TeamType = 'CT' | 'T';

export type PhaseRound = 'live' | 'freezetime' | 'over';

export type PhaseMap = 'live' | 'intermission' | 'gameover' | 'warmup';

export type PhaseExt =
  | 'freezetime'
  | 'bomb'
  | 'warmup'
  | 'live'
  | 'over'
  | 'defuse'
  | 'paused'
  | 'timeout_ct'
  | 'timeout_t';
