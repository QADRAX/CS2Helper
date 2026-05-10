import fs from "fs/promises";
import type { RecordReaderPort } from "../../application";
import type { GsiRecordFile, ReadRecordFramesResult } from "../../domain";
import { parseNdjsonRecordContents } from "../../domain/gsiRecordNdjson";

/** Reads raw GSI payload records from disk, including pretty-printed JSON payloads. */
export class NdjsonRecordReaderAdapter implements RecordReaderPort {
  async readFrames(record: GsiRecordFile): Promise<ReadRecordFramesResult> {
    const contents = await fs.readFile(record.path, "utf-8");
    return parseNdjsonRecordContents(contents);
  }
}
