import type { ClientWatcherPayload } from "../../domain/csgo";

export function withRoundPhase(
  tick: ClientWatcherPayload,
  params: {
    mapPhase?: "warmup" | "live" | "intermission" | "gameover";
    roundPhase?: "freezetime" | "live" | "over";
    round?: number;
    winnerTeam?: "CT" | "T";
  }
): ClientWatcherPayload {
  const next = structuredClone(tick);
  if (params.mapPhase && next.map) next.map.phase = params.mapPhase;
  if (params.roundPhase && next.round) next.round.phase = params.roundPhase;
  if (typeof params.round === "number" && next.map) next.map.round = params.round;
  if (params.winnerTeam && next.round) next.round.win_team = params.winnerTeam;
  return next;
}

export function withPlayerDelta(
  tick: ClientWatcherPayload,
  params: { kills?: number; deaths?: number; health?: number }
): ClientWatcherPayload {
  const next = structuredClone(tick);
  if (!next.player) return next;
  if (typeof params.kills === "number" && next.player.match_stats) {
    next.player.match_stats.kills = params.kills;
  }
  if (typeof params.deaths === "number" && next.player.match_stats) {
    next.player.match_stats.deaths = params.deaths;
  }
  if (typeof params.health === "number" && next.player.state) {
    next.player.state.health = params.health;
  }
  return next;
}

export function withDisconnectGap(): null {
  return null;
}
