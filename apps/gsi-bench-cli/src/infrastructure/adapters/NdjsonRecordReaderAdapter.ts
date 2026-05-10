import fs from "fs/promises";
import type { RecordReaderPort } from "../../application";
import type { GsiRecordFile, ReadRecordFramesResult } from "../../domain";
import { parseClientTickRecordContents } from "../../domain/parseClientTickRecordJsonl";

/** Reads client-listener TickFrame JSONL records from disk (incl. pretty-printed JSON lines). */
export class NdjsonRecordReaderAdapter implements RecordReaderPort {
  async readFrames(record: GsiRecordFile): Promise<ReadRecordFramesResult> {
    const contents = await fs.readFile(record.path, "utf-8");
    return parseClientTickRecordContents(contents);
  }
}
