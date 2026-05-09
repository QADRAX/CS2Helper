import type { WatcherMode } from "./watcherMode.types";
import type { WatcherPayload } from "./rawWatcherPayload.types";

/**
 * Returns the declared watcher profile when the payload includes a valid
 * `watcherMode` field (e.g. CS2Helper-enriched or custom cfg).
 *
 * When the field is missing — common for stock Valve `gamestate_integration`
 * JSON, which only ships `provider` + `player` / `allplayers` — infers the
 * profile from payload shape:
 *
 * - `player` only (or `player` + empty `allplayers`) → `client_local`
 * - non-empty `allplayers` without `player` → `dedicated_server`
 * - non-empty `allplayers` with `player` → `spectator_hltv`
 */
export function resolveWatcherMode(payload: WatcherPayload): WatcherMode {
  const declared = (payload as { watcherMode?: unknown }).watcherMode;
  if (declared === "client_local" || declared === "spectator_hltv" || declared === "dedicated_server") {
    return declared;
  }
  return inferWatcherModeFromShape(payload as unknown as Record<string, unknown>);
}

/** Shape-based inference for raw GSI objects that omit `watcherMode`. */
export function inferWatcherModeFromShape(value: Record<string, unknown>): WatcherMode {
  const player = value.player;
  const allplayers = value.allplayers;
  const hasPlayer = player !== null && player !== undefined && typeof player === "object";
  const allplayersIsRecord =
    allplayers !== null && allplayers !== undefined && typeof allplayers === "object" && !Array.isArray(allplayers);
  const allplayersCount = allplayersIsRecord ? Object.keys(allplayers as Record<string, unknown>).length : 0;

  if (allplayersCount > 0 && hasPlayer) {
    return "spectator_hltv";
  }
  if (allplayersCount > 0) {
    return "dedicated_server";
  }
  if (hasPlayer) {
    return "client_local";
  }
  return "client_local";
}
