import type { GsiProcessorEvent, GsiProcessorState } from "@cs2helper/gsi-processor";
import type { GsiRecordFile, GsiRecordParseError } from "./recordTypes";

/** Projection of processor state that makes timeline rows easy to inspect. */
export interface ReplayStateSummary {
  totalTicks: number;
  streamState: GsiProcessorState["streamState"];
  watcherMode: GsiProcessorState["watcherMode"];
  mapRound: number | null;
  roundPhase: string | null;
  playersCount: number;
}

/** One processed frame and the observable state transition it produced. */
export interface ReplayStep {
  tickIndex: number;
  lineNumber: number;
  timestamp: number;
  before: ReplayStateSummary;
  after: ReplayStateSummary;
  events: readonly GsiProcessorEvent[];
}

/** Full replay result for a selected record. */
export interface ReplayResult {
  record: GsiRecordFile;
  processedTicks: number;
  parseErrors: readonly GsiRecordParseError[];
  steps: readonly ReplayStep[];
  events: readonly GsiProcessorEvent[];
  finalState: Readonly<GsiProcessorState>;
}
