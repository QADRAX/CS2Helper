import { describe, expect, it } from "vitest";
import { createInitialGsiProcessorState } from "../../initialState";
import { cloneState, findRound } from "../helpers";

describe("reducer helpers", () => {
  it("cloneState deep-clones rounds and player map", () => {
    const state = createInitialGsiProcessorState();
    state.playersBySteamId["x"] = {
      steamid: "x",
      name: "n",
      team: "CT",
      health: 1,
      money: 2,
      kills: 3,
      deaths: 4,
      lastSeenAt: 9,
    };
    state.currentMatch = {
      mapName: "m",
      mode: "comp",
      timestamp: 1,
      rounds: [
        {
          roundNumber: 1,
          timestamp: 1,
          kills: [{ timestamp: 1, roundPhase: "live", weapon: "w", flashed: 0, smoked: 0 }],
          deaths: [],
          flashes: [],
          damageReceived: [],
          weaponTransactions: [],
          playerTeam: "CT",
        },
      ],
    };
    const copy = cloneState(state);
    copy.currentMatch!.rounds[0].kills.push({
      timestamp: 2,
      roundPhase: "live",
      weapon: "w2",
      flashed: 0,
      smoked: 0,
    });
    expect(state.currentMatch!.rounds[0].kills.length).toBe(1);
  });

  it("findRound returns the round with matching number", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = {
      mapName: "m",
      mode: "comp",
      timestamp: 1,
      rounds: [
        {
          roundNumber: 2,
          timestamp: 1,
          kills: [],
          deaths: [],
          flashes: [],
          damageReceived: [],
          weaponTransactions: [],
          playerTeam: "CT",
        },
      ],
    };
    const round = findRound(state.currentMatch!, 2);
    expect(round?.roundNumber).toBe(2);
    expect(findRound(state.currentMatch!, 99)).toBeUndefined();
  });
});
