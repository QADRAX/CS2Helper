import type { GsiRecordFile, ReadRecordFramesResult } from "../../../domain/bench";

/** Reads and parses frames from a raw GSI record file. */
export interface RecordReaderPort {
  readFrames: (record: GsiRecordFile) => Promise<ReadRecordFramesResult>;
}
