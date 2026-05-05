import type { NormalizedSnapshot, SnapshotPlayer, WatcherPayload } from "../csgo";
import type { WatcherPlayer } from "../csgo/rawWatcherPayload.types";

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
  const players: SnapshotPlayer[] = [];

  if ("player" in payload && payload.player) {
    players.push(toSnapshotPlayer(payload.player));
  }

  if ("allplayers" in payload && payload.allplayers) {
    for (const player of Object.values(payload.allplayers)) {
      if (!players.some((entry) => entry.steamid === player.steamid)) {
        players.push(toSnapshotPlayer(player));
      }
    }
  }

  return {
    watcherMode: payload.watcherMode,
    provider: payload.provider,
    map: payload.map ?? null,
    round: payload.round ?? null,
    players,
    source: payload,
  };
}
