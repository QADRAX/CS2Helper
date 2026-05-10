import type { UseCase } from "@cs2helper/shared";
import type { GsiRecordFile, ReadRecordFramesResult } from "../../domain";
import type { RecordReaderPort } from "../ports";

/**
 * Reads parsed frames and parse errors for one selected record.
 *
 * Ports tuple order: `[recordReader]`.
 */
export const readRecordFrames: UseCase<
  [RecordReaderPort],
  [record: GsiRecordFile],
  Promise<ReadRecordFramesResult>
> = ([recordReader], record) => recordReader.readFrames(record);
