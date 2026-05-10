import type { GsiRecordFile, ReadRecordFramesResult, ReplayResult } from "../../domain";

/** Replays parsed record frames through a GSI processor instance. */
export interface ProcessorReplayPort {
  replay: (record: GsiRecordFile, framesResult: ReadRecordFramesResult) => Promise<ReplayResult>;
}
