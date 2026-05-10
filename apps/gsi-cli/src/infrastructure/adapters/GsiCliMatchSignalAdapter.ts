import type { MatchSignal, MatchSignalPort } from "@cs2helper/cs2-scoreboard-screenshot";
import type { CliApp } from "../../application/CliApp";

/** Maps live GSI processor state into {@link MatchSignal} for scoreboard capture gates. */
export class GsiCliMatchSignalAdapter implements MatchSignalPort {
  constructor(private readonly cliApp: CliApp) {}

  getMatchSignal(): MatchSignal {
    const s = this.cliApp.getGsiProcessorState();
    if (!s) {
      return { hasActiveMatch: false };
    }
    return {
      hasActiveMatch: s.currentMatch != null,
      mapPhase: s.lastSnapshot?.map?.phase,
    };
  }
}
