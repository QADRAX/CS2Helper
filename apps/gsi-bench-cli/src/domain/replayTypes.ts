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

/** Navigation metadata for second-based playback and seek. */
export interface ReplayTimelineMetadata {
  durationSeconds: number;
  tickIndexBySecond: readonly number[];
}

export type ReplaySeekMode = "rebuild" | "coldStart";
export type ReplaySpeed = 1 | 2;

/** Runtime playback session state for the interactive bench player. */
export interface ReplayPlaybackSession {
  replay: ReplayResult;
  isPlaying: boolean;
  speed: ReplaySpeed;
  seekMode: ReplaySeekMode;
  currentSecond: number;
  currentTickIndex: number;
  elapsedMs: number;
  state: Readonly<GsiProcessorState>;
}

/** Full replay result for a selected record. */
export interface ReplayResult {
  record: GsiRecordFile;
  processedTicks: number;
  parseErrors: readonly GsiRecordParseError[];
  steps: readonly ReplayStep[];
  events: readonly GsiProcessorEvent[];
  initialState: Readonly<GsiProcessorState>;
  stateByTick: readonly Readonly<GsiProcessorState>[];
  coldStartStateBySecond: Readonly<Record<number, Readonly<GsiProcessorState>>>;
  timeline: ReplayTimelineMetadata;
  finalState: Readonly<GsiProcessorState>;
}
