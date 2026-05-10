import type { ReducerContext } from "./reducerTypes";

/**
 * Projects the latest normalized player snapshot into the aggregate state view.
 *
 * Unlike event reducers, this slice is always safe to run because it mirrors the
 * current observed roster instead of inferring historical facts.
 */
export function reducePlayersState(ctx: ReducerContext): void {
  const { state, snapshot, timestamp } = ctx;

  state.localClientSteamId = snapshot.provider.steamid ?? null;
  const primary = snapshot.players[0];
  state.focusedPlayerSteamId = primary?.steamid ?? null;
  const local = state.localClientSteamId;
  const focused = state.focusedPlayerSteamId;
  state.isSpectatingOtherPlayer =
    snapshot.watcherMode === "client_local" && !!local && !!focused && local !== focused;

  for (const player of snapshot.players) {
    state.playersBySteamId[player.steamid] = {
      steamid: player.steamid,
      name: player.name,
      team: player.team,
      health: player.health,
      money: player.money,
      kills: player.kills,
      deaths: player.deaths,
      lastSeenAt: timestamp,
    };
  }
}
