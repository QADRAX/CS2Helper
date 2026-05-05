import type { ClientWatcherPayload } from "../../../../domain/csgo";
import {
  withDisconnectGap,
  withPlayerDelta,
  withRoundPhase,
} from "../../../../__test__/fixtures/clientTickBuilders";
import { minimalClientTick } from "../../../../__test__/fixtures/minimalWatcherTick";

/** Integration-oriented tick (auth + forward) built from shared test fixtures. */
export function createBaseTick(): ClientWatcherPayload {
  const base = minimalClientTick({ auth: { token: "dev" } });
  return {
    ...base,
    player: base.player ? { ...base.player, forward: "0,0,0" } : base.player,
  };
}

export { withRoundPhase, withPlayerDelta, withDisconnectGap };
