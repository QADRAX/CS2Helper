import { describe, expect, it } from "vitest";
import type { NormalizedSnapshot } from "../../csgo";
import { minimalClientTick } from "../../../__test__/fixtures/minimalWatcherTick";
import { createInitialGsiProcessorMemory, createInitialGsiProcessorState } from "../../initialState";
import { normalizeWatcherPayload } from "../../normalizeWatcherPayload";
import { reducePlayerEvents } from "../reducePlayerEvents";
import type { ReducerContext } from "../reducerTypes";

function liveMatchWithRound(roundNumber: number) {
  return {
    mapName: "de_inferno",
    mode: "competitive",
    timestamp: 1,
    rounds: [
      {
        roundNumber,
        timestamp: 1,
        kills: [],
        deaths: [],
        flashes: [],
        damageReceived: [],
        weaponTransactions: [],
        playerTeam: "CT" as const,
      },
    ],
  };
}

function baseSnapshotPlayer(overrides: Partial<NormalizedSnapshot["players"][0]> = {}) {
  return {
    steamid: "self-steamid",
    name: "player",
    team: "CT" as const,
    health: 100,
    money: 800,
    kills: 0,
    deaths: 0,
    flashed: 0,
    smoked: 0,
    equippedWeapon: "weapon_ak47",
    weapons: ["weapon_ak47"] as string[],
    ...overrides,
  };
}

function snapshotWithPlayer(player: ReturnType<typeof baseSnapshotPlayer>): NormalizedSnapshot {
  const tick = minimalClientTick({
    map: { ...minimalClientTick().map!, phase: "live", round: 1 },
    round: { phase: "live" },
  });
  const snap = normalizeWatcherPayload(tick);
  return { ...snap, players: [player] };
}

describe("reducePlayerEvents", () => {
  it("sets skipReason when critical reducers are disabled", () => {
    const ctx: ReducerContext = {
      state: createInitialGsiProcessorState(),
      memory: createInitialGsiProcessorMemory(),
      snapshot: snapshotWithPlayer(baseSnapshotPlayer()),
      timestamp: 2000,
      events: [],
      criticalReducersEnabled: false,
    };
    reducePlayerEvents(ctx);
    expect(ctx.skipReason).toBe("stream_not_healthy");
  });

  it("returns early when there is no current match", () => {
    const ctx: ReducerContext = {
      state: createInitialGsiProcessorState(),
      memory: createInitialGsiProcessorMemory(),
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ kills: 1 })),
      timestamp: 2000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events.length).toBe(0);
  });

  it("emits kill and appends to round when kills increase", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_ak47"],
      flashStartTimestamp: null,
    };
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ kills: 1 })),
      timestamp: 3000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events.some((e) => e.type === "kill")).toBe(true);
    expect(state.currentMatch?.rounds[0].kills.length).toBe(1);
  });

  it("emits death when deaths increase", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_ak47"],
      flashStartTimestamp: null,
    };
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ deaths: 1 })),
      timestamp: 3000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events.some((e) => e.type === "death")).toBe(true);
  });

  it("emits damage_received when health drops", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_ak47"],
      flashStartTimestamp: null,
    };
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ health: 70 })),
      timestamp: 3000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events.some((e) => e.type === "damage_received")).toBe(true);
    expect(state.currentMatch?.rounds[0].damageReceived.length).toBe(1);
  });

  it("tracks flash start and end", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_ak47"],
      flashStartTimestamp: null,
    };
    const startCtx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ flashed: 50 })),
      timestamp: 3000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(startCtx);
    expect(startCtx.events.some((e) => e.type === "flash_started")).toBe(true);

    const endCtx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(baseSnapshotPlayer({ flashed: 0 })),
      timestamp: 3100,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(endCtx);
    expect(endCtx.events.some((e) => e.type === "flash_ended")).toBe(true);
    expect(state.currentMatch?.rounds[0].flashes.length).toBe(1);
  });

  it("records weapon refund transaction when money increases and a weapon disappears", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_usp_silencer", "weapon_ak47"],
      flashStartTimestamp: null,
    };
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(
        baseSnapshotPlayer({
          money: 2000,
          weapons: ["weapon_usp_silencer"],
        })
      ),
      timestamp: 5000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    const refunds = ctx.events.filter(
      (e) => e.type === "weapon_transaction" && e.transactionType === "refund"
    );
    expect(refunds.length).toBeGreaterThan(0);
  });

  it("records weapon purchase transaction when money drops and new weapon appears", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["self-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_usp_silencer"],
      flashStartTimestamp: null,
    };
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snapshotWithPlayer(
        baseSnapshotPlayer({
          money: 300,
          weapons: ["weapon_usp_silencer", "weapon_ak47"],
        })
      ),
      timestamp: 4000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events.some((e) => e.type === "weapon_transaction")).toBe(true);
    expect(state.currentMatch?.rounds[0].weaponTransactions.length).toBeGreaterThan(0);
  });

  it("does not emit inferred events for a spectated teammate on client_local", () => {
    const state = createInitialGsiProcessorState();
    state.currentMatch = liveMatchWithRound(1);
    const memory = createInitialGsiProcessorMemory();
    memory.lastGameRound = 1;
    memory.players["mate-steamid"] = {
      health: 100,
      kills: 0,
      deaths: 0,
      flashed: 0,
      money: 800,
      weapons: ["weapon_ak47"],
      flashStartTimestamp: null,
    };
    const tick = minimalClientTick({
      map: { ...minimalClientTick().map!, phase: "live", round: 1 },
      round: { phase: "live" },
      player: {
        ...minimalClientTick().player!,
        steamid: "mate-steamid",
        name: "Mate",
        match_stats: { kills: 1, assists: 0, deaths: 0, mvps: 0, score: 0 },
      },
    });
    const snap = normalizeWatcherPayload(tick);
    const ctx: ReducerContext = {
      state,
      memory,
      snapshot: snap,
      timestamp: 5000,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayerEvents(ctx);
    expect(ctx.events).toHaveLength(0);
    expect(memory.players["mate-steamid"]?.kills).toBe(1);
  });
});
