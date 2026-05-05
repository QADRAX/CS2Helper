import type {
  ClientWatcherPayload,
  DedicatedServerWatcherPayload,
  SpectatorWatcherPayload,
  WatcherPlayer,
} from "../../domain/csgo";
import type { Pistol } from "../../domain/csgo/weaponTypes";

const defaultUsp: Pistol = {
  type: "Pistol",
  name: "weapon_usp_silencer",
  paintkit: "default",
  ammo_clip: 12,
  ammo_clip_max: 12,
  ammo_reserve: 24,
  state: "active",
};

const defaultPlayerBlock: WatcherPlayer = {
  steamid: "self-steamid",
  name: "player",
  observer_slot: 1,
  team: "CT",
  activity: "playing",
  state: {
    health: 100,
    armor: 100,
    helmet: true,
    flashed: 0,
    smoked: 0,
    burning: 0,
    money: 800,
    round_kills: 0,
    round_killhs: 0,
    round_totaldmg: 0,
    equip_value: 1200,
  },
  weapons: {
    weapon_1: defaultUsp,
  },
  match_stats: {
    kills: 0,
    assists: 0,
    deaths: 0,
    mvps: 0,
    score: 0,
  },
};

/** Minimal valid `client_local` tick for tests. */
export function minimalClientTick(
  overrides: Partial<ClientWatcherPayload> = {}
): ClientWatcherPayload {
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
      phase: "warmup",
      round: 0,
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
    round: { phase: "freezetime" },
    player: { ...defaultPlayerBlock },
    ...overrides,
  };
}

function watcherPlayer(id: string, name: string): WatcherPlayer {
  return {
    ...defaultPlayerBlock,
    steamid: id,
    name,
  };
}

/** `dedicated_server` tick with two roster entries (dedup coverage in normalize). */
export function minimalDedicatedTick(): DedicatedServerWatcherPayload {
  return {
    watcherMode: "dedicated_server",
    provider: {
      name: "Counter-Strike 2",
      appid: 730,
      version: 1,
      timestamp: 2,
    },
    map: minimalClientTick().map,
    round: { phase: "live" },
    allplayers: {
      "1": watcherPlayer("steam-a", "A"),
      "2": watcherPlayer("steam-b", "B"),
    },
  };
}

/** `spectator_hltv` tick with focused `player` plus roster (typical observer feed). */
export function minimalSpectatorTick(
  overrides: Partial<SpectatorWatcherPayload> = {}
): SpectatorWatcherPayload {
  const p1 = watcherPlayer("steam-a", "A");
  const p2 = watcherPlayer("steam-b", "B");
  const roster: Record<string, WatcherPlayer> = {
    "1": p1,
    "2": p2,
  };
  return {
    watcherMode: "spectator_hltv",
    provider: {
      name: "Counter-Strike 2",
      appid: 730,
      version: 13795,
      steamid: "steam-a",
      timestamp: 3,
    },
    map: minimalClientTick().map,
    round: { phase: "live" },
    player: { ...p1 },
    allplayers: roster,
    ...overrides,
  };
}
