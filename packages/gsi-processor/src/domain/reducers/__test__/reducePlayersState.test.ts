import { describe, expect, it } from "vitest";
import { minimalClientTick, minimalDedicatedTick } from "../../../__test__/fixtures/minimalWatcherTick";
import { createInitialGsiProcessorMemory, createInitialGsiProcessorState } from "../../initialState";
import { normalizeWatcherPayload } from "../../normalizeWatcherPayload";
import { reducePlayersState } from "../reducePlayersState";
import type { ReducerContext } from "../reducerTypes";

describe("reducePlayersState", () => {
  it("projects each snapshot player into playersBySteamId", () => {
    const snap = normalizeWatcherPayload(minimalDedicatedTick());
    const ctx: ReducerContext = {
      state: createInitialGsiProcessorState(),
      memory: createInitialGsiProcessorMemory(),
      snapshot: snap,
      timestamp: 4242,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayersState(ctx);
    expect(Object.keys(ctx.state.playersBySteamId).sort()).toEqual(["steam-a", "steam-b"]);
    expect(ctx.state.playersBySteamId["steam-a"].lastSeenAt).toBe(4242);
  });

  it("tracks local vs focused steam ids for client_local spectating", () => {
    const tick = minimalClientTick({
      player: {
        ...minimalClientTick().player!,
        steamid: "mate-steamid",
        name: "Mate",
      },
    });
    const snap = normalizeWatcherPayload(tick);
    const ctx: ReducerContext = {
      state: createInitialGsiProcessorState(),
      memory: createInitialGsiProcessorMemory(),
      snapshot: snap,
      timestamp: 1,
      events: [],
      criticalReducersEnabled: true,
    };
    reducePlayersState(ctx);
    expect(ctx.state.localClientSteamId).toBe("self-steamid");
    expect(ctx.state.focusedPlayerSteamId).toBe("mate-steamid");
    expect(ctx.state.isSpectatingOtherPlayer).toBe(true);
  });
});
