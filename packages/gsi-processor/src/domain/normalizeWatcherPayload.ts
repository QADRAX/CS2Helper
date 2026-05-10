import { resolveWatcherMode, type NormalizedSnapshot, type SnapshotPlayer, type WatcherPayload } from "./csgo";
import type { WatcherPlayer } from "./csgo/rawWatcherPayload.types";

/**
 * Resolves the active/equipped weapon name from a raw player payload.
 *
 * Returns `"Unknown"` when no active weapon can be determined.
 */
function getEquippedWeapon(player: { weapons?: Record<string, { name: string; state: string }> }): string {
  const weapons = player.weapons;
  if (!weapons) return "Unknown";
  const active = Object.values(weapons).find((weapon) => weapon.state === "active");
  return active?.name ?? "Unknown";
}

/** Extracts all weapon names currently present in player inventory slots. */
function getWeaponNames(player: { weapons?: Record<string, { name: string }> }): string[] {
  const weapons = player.weapons;
  if (!weapons) return [];
  return Object.values(weapons).map((weapon) => weapon.name);
}

/** Maps one raw watcher player object into the reducer-friendly snapshot shape. */
function toSnapshotPlayer(player: WatcherPlayer): SnapshotPlayer {
  const state = player.state;
  return {
    steamid: player.steamid,
    name: player.name,
    team: player.team ?? "CT",
    health: state?.health ?? 0,
    money: state?.money ?? 0,
    kills: player.match_stats?.kills ?? 0,
    deaths: player.match_stats?.deaths ?? 0,
    flashed: state?.flashed ?? 0,
    smoked: state?.smoked ?? 0,
    equippedWeapon: getEquippedWeapon(player),
    weapons: getWeaponNames(player),
  };
}

/**
 * Normalizes watcher payloads (`client_local`, `spectator_hltv`, `dedicated_server`)
 * into a single canonical snapshot consumed by domain reducers.
 */
export function normalizeWatcherPayload(payload: WatcherPayload): NormalizedSnapshot {
  const watcherMode = resolveWatcherMode(payload);
  const declared = (payload as { watcherMode?: typeof watcherMode }).watcherMode;
  const source =
    declared === watcherMode
      ? payload
      : ({ ...(payload as object), watcherMode } as WatcherPayload);

  const players: SnapshotPlayer[] = [];

  if ("player" in source && source.player) {
    players.push(toSnapshotPlayer(source.player));
  }

  if ("allplayers" in source && source.allplayers) {
    for (const player of Object.values(source.allplayers)) {
      if (!players.some((entry) => entry.steamid === player.steamid)) {
        players.push(toSnapshotPlayer(player));
      }
    }
  }

  return {
    watcherMode,
    provider: source.provider,
    map: source.map ?? null,
    round: source.round ?? null,
    players,
    source,
  };
}
