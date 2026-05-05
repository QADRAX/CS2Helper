import { describe, expect, it } from "vitest";
import { minimalDedicatedTick } from "../../../../__test__/fixtures/minimalWatcherTick";
import { createInitialCoreEngineMemory, createInitialCoreEngineState } from "../../initialState";
import { normalizeWatcherPayload } from "../../normalizeWatcherPayload";
import { reducePlayersState } from "../reducePlayersState";
import type { ReducerContext } from "../reducerTypes";

describe("reducePlayersState", () => {
  it("projects each snapshot player into playersBySteamId", () => {
    const snap = normalizeWatcherPayload(minimalDedicatedTick());
    const ctx: ReducerContext = {
      state: createInitialCoreEngineState(),
      memory: createInitialCoreEngineMemory(),
      snapshot: snap,
      timestamp: 4242,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayersState(ctx);
    expect(Object.keys(ctx.state.playersBySteamId).sort()).toEqual(["steam-a", "steam-b"]);
    expect(ctx.state.playersBySteamId["steam-a"].lastSeenAt).toBe(4242);
  });
});
