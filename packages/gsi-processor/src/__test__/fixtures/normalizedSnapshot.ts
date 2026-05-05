import type { NormalizedSnapshot } from "../../domain/csgo";
import type { PhaseMap, PhaseRound, TeamType } from "../../domain/csgo/phases";
import { minimalClientTick } from "./minimalWatcherTick";

export interface MinimalNormalizedSnapshotParams {
  mapPhase?: PhaseMap;
  roundPhase?: PhaseRound;
  round?: number;
  winnerTeam?: TeamType;
}

/**
 * Canonical {@link NormalizedSnapshot} for reducer / quality tests (aligned with {@link minimalClientTick} source).
 */
export function minimalNormalizedSnapshot(
  params: MinimalNormalizedSnapshotParams = {},
  overrides: Partial<NormalizedSnapshot> = {}
): NormalizedSnapshot {
  const {
    mapPhase = "live",
    roundPhase = "freezetime",
    round = 1,
    winnerTeam,
  } = params;

  return {
    watcherMode: "client_local",
    provider: {
      name: "Counter-Strike 2",
      appid: 730,
      version: 13795,
      steamid: "self-steamid",
      timestamp: 1,
    },
    map: {
      mode: "competitive",
      name: "de_inferno",
      phase: mapPhase,
      round,
      team_ct: {
        score: 0,
        consecutive_round_losses: 0,
        timeouts_remaining: 4,
        matches_won_this_series: 0,
      },
      team_t: {
        score: 0,
        consecutive_round_losses: 0,
        timeouts_remaining: 4,
        matches_won_this_series: 0,
      },
      num_matches_to_win_series: 1,
    },
    round: {
      phase: roundPhase,
      win_team: winnerTeam,
    },
    players: [
      {
        steamid: "self-steamid",
        name: "player",
        team: "CT",
        health: 100,
        money: 800,
        kills: 0,
        deaths: 0,
        flashed: 0,
        smoked: 0,
        equippedWeapon: "weapon_usp_silencer",
        weapons: ["weapon_usp_silencer"],
      },
    ],
    source: minimalClientTick(),
    ...overrides,
  };
}
