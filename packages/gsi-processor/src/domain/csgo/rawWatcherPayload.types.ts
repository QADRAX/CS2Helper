import type {
  ObservatorSlotType,
  PhaseMap,
  PhaseRound,
  PlayerActivityType,
  RoundWinningType,
  TeamType,
} from "./phases";
import type { Weapons } from "./weaponTypes";
import type { WatcherMode } from "./watcherMode.types";

/**
 * Provider metadata from CS2 GSI payloads.
 *
 * Source reference:
 * https://github.com/Sonic853/CS2-Gamestate-Integration-Data
 */
export interface WatcherProvider {
  /** Game name reported by GSI (e.g. Counter-Strike 2). */
  name: string;
  /** Steam app id (CS2/CSGO uses 730). */
  appid: number;
  /** Game build/version reported by the client. */
  version: number;
  /** Local player SteamID in client watcher mode. */
  steamid?: string;
  /** Unix-like timestamp emitted by GSI provider. */
  timestamp: number;
}

/** Auth block configured in `gamestate_integration_*.cfg`. */
export interface WatcherAuth {
  token: string;
}

/** Round-level state from GSI payloads. */
export interface WatcherRound {
  /** Current round phase. */
  phase: PhaseRound;
  /** Bomb state when available. */
  bomb?: "planted" | "defused" | "exploded";
  /** Winner side once round is decided. */
  win_team?: TeamType;
}

/** Team aggregate data as reported under `map.team_ct/team_t`. */
export interface WatcherTeam {
  /** Optional display team name from game config. */
  name?: string;
  /** Current score. */
  score: number;
  /** Consecutive lost rounds. */
  consecutive_round_losses: number;
  /** Remaining tactical timeouts. */
  timeouts_remaining: number;
  /** Series wins for this team. */
  matches_won_this_series: number;
}

/** Map-level aggregate state. */
export interface WatcherMap {
  /** Match/game mode. */
  mode: string;
  /** Map id/name (e.g. `de_dust2`). */
  name: string;
  /** Map lifecycle phase. */
  phase: PhaseMap;
  /** Current round number. */
  round: number;
  /** Counter-Terrorist team aggregate. */
  team_ct: WatcherTeam;
  /** Terrorist team aggregate. */
  team_t: WatcherTeam;
  /** Wins needed to win the series. */
  num_matches_to_win_series: number;
  /** Present in some configurations/modes (spectator). */
  current_spectators?: number;
  /** Present in some configurations/modes (spectator). */
  souvenirs_total?: number;
  /** Round-end win reason map when available. */
  round_wins?: { [key: string]: RoundWinningType };
}

/** Per-player live state section (`player.state`, `allplayers.*.state`). */
export interface WatcherPlayerState {
  /** Health points (0-100). */
  health: number;
  /** Armor points. */
  armor: number;
  /** Whether a helmet is equipped. */
  helmet: boolean;
  /** Flash intensity (0-255). */
  flashed: number;
  /** Smoke intensity (0-255). */
  smoked: number;
  /** Burn intensity (0-255). */
  burning: number;
  /** Current money amount. */
  money: number;
  /** Kills in current round. */
  round_kills: number;
  /** Headshot kills in current round. */
  round_killhs: number;
  /** Total damage dealt in current round. */
  round_totaldmg?: number;
  /** Total equipment value carried. */
  equip_value: number;
  /** Defuse kit flag (CT only when equipped). */
  defusekit?: boolean;
}

/** Per-player match scoreboard counters. */
export interface WatcherPlayerStats {
  /** Total kills. */
  kills: number;
  /** Total assists. */
  assists: number;
  /** Total deaths. */
  deaths: number;
  /** Total MVP stars. */
  mvps: number;
  /** Total score. */
  score: number;
}

/** Player snapshot for local `player` and `allplayers` entries. */
export interface WatcherPlayer {
  /** Team tag/clan label. */
  clan?: string;
  /** Player SteamID64. */
  steamid: string;
  /** Player display name. */
  name: string;
  /** Observer slot id. */
  observer_slot: ObservatorSlotType;
  /** Team side (may be absent on partial payloads). */
  team?: TeamType;
  /** Player activity state. */
  activity: PlayerActivityType;
  /** Nested player state block. */
  state?: WatcherPlayerState;
  /** Aim/forward vector (when included by config). */
  forward?: string;
  /** Current spectated target (observer feeds). */
  spectarget?: string;
  /** Inventory keyed by weapon slots. */
  weapons?: Weapons;
  /** Match score counters. */
  match_stats?: WatcherPlayerStats;
}

/** Common payload envelope across watcher modes. */
interface WatcherPayloadBase {
  /** Declared watcher profile for this payload. */
  watcherMode: WatcherMode;
  /** Provider block from CS2 GSI. */
  provider: WatcherProvider;
  /** Optional auth block from integration config. */
  auth?: WatcherAuth;
  /** Optional map block. */
  map?: WatcherMap;
  /** Optional round block. */
  round?: WatcherRound;
}

/** Local client watcher payload (`player`-centric). */
export interface ClientWatcherPayload extends WatcherPayloadBase {
  watcherMode: "client_local";
  /** Local player block. */
  player?: WatcherPlayer;
}

/** Spectator/HLTV watcher payload (`allplayers` capable). */
export interface SpectatorWatcherPayload extends WatcherPayloadBase {
  watcherMode: "spectator_hltv";
  /** Current focused player (if present). */
  player?: WatcherPlayer;
  /** Multi-player dictionary by player id. */
  allplayers?: Record<string, WatcherPlayer>;
}

/** Dedicated-server watcher payload (`allplayers` as primary source). */
export interface DedicatedServerWatcherPayload extends WatcherPayloadBase {
  watcherMode: "dedicated_server";
  /** Multi-player dictionary by player id. */
  allplayers?: Record<string, WatcherPlayer>;
}

/** Unified raw payload union for all supported watcher profiles. */
export type WatcherPayload =
  | ClientWatcherPayload
  | SpectatorWatcherPayload
  | DedicatedServerWatcherPayload;
