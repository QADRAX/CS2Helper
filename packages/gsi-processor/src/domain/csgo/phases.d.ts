/**
 * Weapon slot keys as reported by GSI.
 */
export type WeaponSlotType = "weapon_0" | "weapon_1" | "weapon_2" | "weapon_3" | "weapon_4" | "weapon_5" | "weapon_6" | "weapon_7" | "weapon_8" | "weapon_9";
/**
 * How a round was resolved (scoreboard hint).
 */
export type RoundWinningType = "ct_win_time" | "ct_win_elimination" | "t_win_elimination" | "t_win_bomb" | "ct_win_defuse";
/**
 * Grenade entity kinds in the world (not the inventory item type).
 */
export type GrenadeType = "inferno" | "smoke" | "flashbang" | "frag" | "decoy";
/**
 * Player activity from GSI.
 */
export type PlayerActivityType = "playing" | "free" | "textinput" | "menu";
/**
 * High-level game mode bucket.
 */
export type GameModeType = "casual" | "competitive";
/**
 * Observer slot index when spectating.
 */
export type ObservatorSlotType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/**
 * Counter-Terrorist or Terrorist side.
 */
export type TeamType = "CT" | "T";
/**
 * Round phase from GSI.
 */
export type PhaseRound = "live" | "freezetime" | "over";
/**
 * Map-level phase from GSI.
 */
export type PhaseMap = "live" | "intermission" | "gameover" | "warmup";
/**
 * Extended phase labels used in some payloads.
 */
export type PhaseExt = "freezetime" | "bomb" | "warmup" | "live" | "over" | "defuse" | "paused" | "timeout_ct" | "timeout_t";
