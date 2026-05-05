import { describe, expect, it } from "vitest";
import type { NormalizedSnapshot } from "../../../csgo";
import { minimalNormalizedSnapshot } from "../../../../__test__/fixtures/normalizedSnapshot";
import {
  type CoreEngineEvent,
} from "../../gsiProcessorTypes";
import {
  createInitialCoreEngineMemory,
  createInitialCoreEngineState,
} from "../../initialState";
import { reduceRoundLifecycle } from "../reduceRoundLifecycle";
import type { ReducerContext } from "../reducerTypes";

function createSnapshot(
  params: {
    mapPhase?: "warmup" | "live" | "intermission" | "gameover";
    roundPhase?: "freezetime" | "live" | "over";
    round?: number;
    winnerTeam?: "CT" | "T";
  } = {}
): NormalizedSnapshot {
  return minimalNormalizedSnapshot({
    mapPhase: params.mapPhase ?? "live",
    roundPhase: params.roundPhase ?? "freezetime",
    round: params.round ?? 1,
    winnerTeam: params.winnerTeam,
  });
}

function createContext(snapshot: NormalizedSnapshot): ReducerContext {
  const state = createInitialCoreEngineState();
  state.currentMatch = {
    mapName: "de_inferno",
    mode: "competitive",
    timestamp: 1000,
    rounds: [],
  };
  const memory = createInitialCoreEngineMemory();
  const events: CoreEngineEvent[] = [];
  return {
    state,
    memory,
    snapshot,
    timestamp: 1000,
    events,
    criticalReducersEnabled: true,
  };
}

describe("reduceRoundLifecycle", () => {
  it("creates a round and emits round_started in freezetime", () => {
    const ctx = createContext(createSnapshot({ roundPhase: "freezetime", round: 3 }));
    reduceRoundLifecycle(ctx);

    expect(ctx.state.currentMatch?.rounds.length).toBe(1);
    expect(ctx.state.currentMatch?.rounds[0].roundNumber).toBe(3);
    expect(ctx.events.some((event) => event.type === "round_started")).toBe(true);
  });

  it("marks round live transition and emits round_live", () => {
    const ctx = createContext(createSnapshot({ roundPhase: "live", round: 4 }));
    ctx.state.currentMatch?.rounds.push({
      roundNumber: 4,
      timestamp: 900,
      kills: [],
      deaths: [],
      flashes: [],
      damageReceived: [],
      weaponTransactions: [],
      playerTeam: "CT",
    });
    ctx.memory.lastRoundPhase = "freezetime";

    reduceRoundLifecycle(ctx);

    expect(ctx.state.currentMatch?.rounds[0].roundLiveTimestamp).toBe(1000);
    expect(ctx.events.some((event) => event.type === "round_live")).toBe(true);
  });

  it("marks round over and winner for previous live round", () => {
    const ctx = createContext(
      createSnapshot({ roundPhase: "over", round: 8, winnerTeam: "CT" })
    );
    ctx.state.currentMatch?.rounds.push({
      roundNumber: 7,
      timestamp: 900,
      kills: [],
      deaths: [],
      flashes: [],
      damageReceived: [],
      weaponTransactions: [],
      playerTeam: "CT",
    });
    ctx.memory.lastGameRound = 7;
    ctx.memory.lastRoundPhase = "live";
    ctx.memory.lastRoundWinningTeam = "T";

    reduceRoundLifecycle(ctx);

    const previousRound = ctx.state.currentMatch?.rounds[0];
    expect(previousRound?.roundOverTimestamp).toBe(1000);
    expect(previousRound?.winnerTeam).toBe("CT");
    expect(ctx.events.some((event) => event.type === "round_over")).toBe(true);
    expect(ctx.events.some((event) => event.type === "round_winner")).toBe(true);
  });

  it("skips processing and sets skipReason when critical reducers are disabled", () => {
    const ctx = createContext(createSnapshot({ roundPhase: "freezetime", round: 2 }));
    ctx.criticalReducersEnabled = false;

    reduceRoundLifecycle(ctx);

    expect(ctx.skipReason).toBe("stream_not_healthy");
    expect(ctx.events.length).toBe(0);
  });
});
