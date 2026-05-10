import type { TickFrame } from "@cs2helper/tick-hub";

/** Raw GSI record file discovered in the shared recordings folder. */
export interface GsiRecordFile {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  modifiedAt: number;
}

/** Parsed JSONL line: one {@link TickFrame} from cs2-client-listener recording. */
export interface GsiRecordFrame {
  lineNumber: number;
  raw: string;
  tick: TickFrame;
}

/** Parse error for one invalid record line. */
export interface GsiRecordParseError {
  lineNumber: number;
  raw: string;
  message: string;
}

/** Result of reading and parsing one record file. */
export interface ReadRecordFramesResult {
  frames: readonly GsiRecordFrame[];
  errors: readonly GsiRecordParseError[];
}
