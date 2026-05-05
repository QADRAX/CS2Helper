import type { ClientWatcherPayload, WatcherMode, WatcherPayload } from "../../domain/csgo";
import { withPlayerDelta, withRoundPhase } from "./clientTickBuilders";
import {
  minimalClientTick,
  minimalDedicatedTick,
  minimalSpectatorTick,
} from "./minimalWatcherTick";

/** Round index used across watcher modes to simulate joining an in-progress match. */
export const MID_MATCH_ROUND = 11;

function integrationClientBase(): ClientWatcherPayload {
  const base = minimalClientTick({ auth: { token: "dev" } });
  return {
    ...base,
    player: base.player ? { ...base.player, forward: "0,0,0" } : base.player,
  };
}

function applyMidMatchBoard(tick: WatcherPayload): void {
  if (!tick.map) return;
  tick.map.phase = "live";
  tick.map.round = MID_MATCH_ROUND;
  if (tick.round) tick.round.phase = "live";
}

function setScoreboardKillsDeaths(tick: WatcherPayload, kills: number, deaths: number): void {
  if (tick.watcherMode === "client_local" && tick.player?.match_stats) {
    tick.player.match_stats.kills = kills;
    tick.player.match_stats.deaths = deaths;
    return;
  }
  if (!("allplayers" in tick) || !tick.allplayers) return;
  for (const p of Object.values(tick.allplayers)) {
    if (p.match_stats) {
      p.match_stats.kills = kills;
      p.match_stats.deaths = deaths;
    }
  }
  if (tick.watcherMode === "spectator_hltv" && tick.player?.match_stats) {
    const primary = tick.allplayers["1"];
    if (primary?.match_stats) {
      tick.player.match_stats.kills = primary.match_stats.kills;
      tick.player.match_stats.deaths = primary.match_stats.deaths;
    }
  }
}

/**
 * Warmup-shaped tick so {@link reduceMatchLifecycle} opens `currentMatch` (simulates GSI already
 * running before the processor subscribes). Not required for stream/aggregation checks on raw
 * mid-match JSON, but needed before kill/death inference (guarded on `currentMatch`).
 */
export function warmupBootstrapTick(mode: WatcherMode): WatcherPayload {
  switch (mode) {
    case "client_local":
      return withRoundPhase(integrationClientBase(), {
        mapPhase: "warmup",
        roundPhase: "freezetime",
        round: 0,
      });
    case "dedicated_server": {
      const tick = structuredClone(minimalDedicatedTick());
      if (tick.map) {
        tick.map.phase = "warmup";
        tick.map.round = 0;
      }
      tick.round = { phase: "freezetime" };
      for (const p of Object.values(tick.allplayers ?? {})) {
        if (p.match_stats) {
          p.match_stats = { kills: 0, deaths: 0, assists: 0, mvps: 0, score: 0 };
        }
      }
      return tick;
    }
    case "spectator_hltv": {
      const tick = structuredClone(minimalSpectatorTick());
      if (tick.map) {
        tick.map.phase = "warmup";
        tick.map.round = 0;
      }
      tick.round = { phase: "freezetime" };
      for (const p of Object.values(tick.allplayers ?? {})) {
        if (p.match_stats) {
          p.match_stats = { kills: 0, deaths: 0, assists: 0, mvps: 0, score: 0 };
        }
      }
      if (tick.player?.match_stats) {
        tick.player.match_stats = { kills: 0, deaths: 0, assists: 0, mvps: 0, score: 0 };
      }
      return tick;
    }
  }
}

/**
 * First JSON tick after a cold start: already `live`, mid-scoreboard stats (attach mid-match).
 */
export function midMatchAttachTick(mode: WatcherMode): WatcherPayload {
  switch (mode) {
    case "client_local": {
      const tick = withRoundPhase(integrationClientBase(), {
        mapPhase: "live",
        roundPhase: "live",
        round: MID_MATCH_ROUND,
      });
      return withPlayerDelta(tick, { kills: 5, deaths: 3 });
    }
    case "dedicated_server": {
      const tick = structuredClone(minimalDedicatedTick());
      applyMidMatchBoard(tick);
      setScoreboardKillsDeaths(tick, 5, 3);
      return tick;
    }
    case "spectator_hltv": {
      const tick = structuredClone(minimalSpectatorTick());
      applyMidMatchBoard(tick);
      setScoreboardKillsDeaths(tick, 5, 3);
      return tick;
    }
  }
}

/**
 * Same shape as `previous` but increments primary player's kill count by `delta` (deterministic slot `allplayers["1"]` for roster feeds).
 */
export function bumpPrimaryPlayerKills(previous: WatcherPayload, delta: number): WatcherPayload {
  const next = structuredClone(previous);
  if (next.watcherMode === "client_local") {
    const k = (next.player?.match_stats?.kills ?? 0) + delta;
    if (next.player?.match_stats) next.player.match_stats.kills = k;
    return next;
  }
  const primary = "allplayers" in next && next.allplayers ? next.allplayers["1"] : undefined;
  if (primary?.match_stats) primary.match_stats.kills += delta;
  if (next.watcherMode === "spectator_hltv" && next.player?.match_stats && primary?.match_stats) {
    if (next.player.steamid === primary.steamid) {
      next.player.match_stats.kills = primary.match_stats.kills;
    }
  }
  return next;
}
