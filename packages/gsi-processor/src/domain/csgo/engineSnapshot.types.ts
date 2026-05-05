import type { TeamType } from "./phases";
import type {
  WatcherMap,
  WatcherPayload,
  WatcherProvider,
  WatcherRound,
} from "./rawWatcherPayload.types";
import type { WatcherMode } from "./watcherMode.types";

/**
 * Player shape after normalization.
 *
 * This is intentionally compact and stable for reducers.
 */
export interface SnapshotPlayer {
  steamid: string;
  name: string;
  team: TeamType;
  health: number;
  money: number;
  kills: number;
  deaths: number;
  flashed: number;
  smoked: number;
  equippedWeapon: string;
  weapons: string[];
}

/**
 * Canonical snapshot consumed by domain reducers.
 *
 * Any watcher-specific payload must be converted to this shape first.
 */
export interface NormalizedSnapshot {
  /** Source watcher profile that produced this snapshot. */
  watcherMode: WatcherMode;
  /** Provider metadata from GSI payload. */
  provider: WatcherProvider;
  /** Map slice normalized to null when absent. */
  map: WatcherMap | null;
  /** Round slice normalized to null when absent. */
  round: WatcherRound | null;
  /** Multi-player list normalized from `player` and/or `allplayers`. */
  players: SnapshotPlayer[];
  /** Original raw payload for diagnostics and traceability. */
  source: WatcherPayload;
}
