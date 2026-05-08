import type { CS2GameState } from "@cs2helper/gsi-processor";

/** Raw GSI record file discovered in the shared recordings folder. */
export interface GsiRecordFile {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  modifiedAt: number;
}

/** Parsed NDJSON frame from one recorded raw GSI payload line. */
export interface GsiRecordFrame {
  lineNumber: number;
  raw: string;
  tick: CS2GameState;
}

/** Parse error for one invalid NDJSON record line. */
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
